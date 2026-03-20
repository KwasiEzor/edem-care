import { createAdminClient } from "@/lib/supabase/admin";
import { generateAIResponse } from "@/lib/ai/chat-service";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(50),
  sessionId: z.string().min(1).max(64),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { allowed } = rateLimit(ip, "chat", 20, 3_600_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Trop de messages. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { messages, sessionId } = parsed.data;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Service de chat indisponible" },
        { status: 503 }
      );
    }

    const settings = await getSettings();
    if (!settings.chatbot_enabled) {
      return NextResponse.json(
        { error: "Le chatbot est temporairement désactivé." },
        { status: 503 }
      );
    }

    const { displayMessage, bookingIntent, suggestedCareType } =
      await generateAIResponse(messages);

    // Upsert conversation to chat_transcripts
    try {
      const supabase = createAdminClient();
      const now = new Date().toISOString();

      const allMessages = [
        ...messages,
        { role: "assistant" as const, content: displayMessage, timestamp: now },
      ];

      // Check if session exists
      const { data: existing } = await supabase
        .from("chat_transcripts")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (existing) {
        await supabase
          .from("chat_transcripts")
          .update({
            messages: allMessages,
            care_type_suggested: suggestedCareType,
            booking_intent: bookingIntent,
            updated_at: now,
          })
          .eq("session_id", sessionId);
      } else {
        await supabase.from("chat_transcripts").insert({
          session_id: sessionId,
          messages: allMessages,
          care_type_suggested: suggestedCareType,
          booking_intent: bookingIntent,
        });
      }
    } catch {
      // Don't fail the response if logging fails
    }

    return NextResponse.json({
      message: displayMessage,
      metadata: {
        booking_intent: bookingIntent,
        suggested_care_type: suggestedCareType,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
