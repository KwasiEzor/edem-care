import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAIResponse } from "@/lib/ai/chat-service";
import {
  sendWhatsAppMessage,
  markMessageAsRead,
} from "@/lib/whatsapp/client";
import {
  validateWebhookSignature,
  parseWebhookPayload,
  extractTextMessages,
  type ExtractedMessage,
} from "@/lib/whatsapp/webhook-utils";
import type { WhatsAppMessage } from "@/types/database";

// GET — Meta webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// POST — Incoming messages
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseWebhookPayload(body);
  if (!parsed.success) {
    // Return 200 anyway — Meta sends status updates too
    return NextResponse.json({ status: "ok" });
  }

  const textMessages = extractTextMessages(parsed.data);

  // Return 200 immediately (Meta requires < 5s response)
  after(async () => {
    for (const msg of textMessages) {
      await processIncomingMessage(msg);
    }
  });

  return NextResponse.json({ status: "ok" });
}

async function processIncomingMessage(msg: ExtractedMessage) {
  const supabase = createAdminClient();

  try {
    // Dedup check
    const { data: existing } = await supabase
      .from("whatsapp_message_ids")
      .select("message_id")
      .eq("message_id", msg.messageId)
      .single();

    if (existing) return;

    // Record message ID for dedup
    await supabase
      .from("whatsapp_message_ids")
      .insert({ message_id: msg.messageId });

    // Send read receipt
    await markMessageAsRead(msg.messageId).catch(() => {});

    const now = new Date().toISOString();

    // Find or create conversation
    const { data: conversation } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .eq("phone_number", msg.from)
      .single();

    const patientMessage: WhatsAppMessage = {
      role: "patient",
      content: msg.text,
      timestamp: msg.timestamp,
      whatsapp_message_id: msg.messageId,
    };

    if (conversation) {
      const messages = [...(conversation.messages as WhatsAppMessage[]), patientMessage];

      await supabase
        .from("whatsapp_conversations")
        .update({
          messages,
          contact_name: msg.contactName,
          last_message_at: now,
          updated_at: now,
        })
        .eq("id", conversation.id);

      // Generate AI response if AI is active
      if (conversation.is_ai_active) {
        await generateAndSendAIReply(conversation.id, messages, msg.from);
      }
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("whatsapp_conversations")
        .insert({
          phone_number: msg.from,
          contact_name: msg.contactName,
          messages: [patientMessage],
          last_message_at: now,
        })
        .select("id")
        .single();

      if (newConv) {
        await generateAndSendAIReply(newConv.id, [patientMessage], msg.from);
      }
    }
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
  }
}

async function generateAndSendAIReply(
  conversationId: string,
  messages: WhatsAppMessage[],
  phoneNumber: string
) {
  const supabase = createAdminClient();

  try {
    // Convert to Anthropic message format
    const aiMessages = messages.map((m) => ({
      role: (m.role === "patient" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: m.content,
    }));

    const { displayMessage, bookingIntent, suggestedCareType } =
      await generateAIResponse(aiMessages);

    // Send via WhatsApp
    await sendWhatsAppMessage({ to: phoneNumber, text: displayMessage });

    const now = new Date().toISOString();
    const aiMessage: WhatsAppMessage = {
      role: "ai",
      content: displayMessage,
      timestamp: now,
    };

    const updatedMessages = [...messages, aiMessage];

    await supabase
      .from("whatsapp_conversations")
      .update({
        messages: updatedMessages,
        care_type_suggested: suggestedCareType,
        booking_intent: bookingIntent,
        last_message_at: now,
        updated_at: now,
      })
      .eq("id", conversationId);
  } catch (error) {
    console.error("Error generating AI reply:", error);
  }
}
