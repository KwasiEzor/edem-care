import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { z } from "zod";
import type { WhatsAppMessage } from "@/types/database";

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(4096),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { conversationId, message } = parsed.data;
    const admin = createAdminClient();

    // Fetch conversation
    const { data: conversation, error } = await admin
      .from("whatsapp_conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    // Send via WhatsApp
    await sendWhatsAppMessage({
      to: conversation.phone_number,
      text: message,
    });

    const now = new Date().toISOString();
    const adminMessage: WhatsAppMessage = {
      role: "admin",
      content: message,
      timestamp: now,
    };

    const updatedMessages = [
      ...(conversation.messages as WhatsAppMessage[]),
      adminMessage,
    ];

    await admin
      .from("whatsapp_conversations")
      .update({
        messages: updatedMessages,
        last_message_at: now,
        updated_at: now,
      })
      .eq("id", conversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
