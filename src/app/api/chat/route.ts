import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
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

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Edem-Care, un service de soins infirmiers à domicile à Bruxelles. Tu t'appelles "Assistant Edem-Care".

## À propos d'Edem-Care
- Soins infirmiers professionnels à domicile à Bruxelles et communes avoisinantes
- Fondé par un infirmier diplômé avec expérience hospitalière
- Horaires : du lundi au samedi, de 7h à 20h
- Contact : via le site web edem-care.be ou par téléphone

## Services proposés
- **Soins généraux** (soins_generaux) : surveillance des paramètres vitaux, administration de médicaments
- **Prises de sang** (prise_de_sang) : prélèvements sanguins à domicile
- **Injections** (injections) : sous-cutanées et intramusculaires
- **Pansements** (pansements) : soins de plaies simples et complexes, post-opératoires
- **Perfusions** (perfusions) : mise en place et surveillance de perfusions IV
- **Suivi diabète** (suivi_diabete) : contrôle glycémique, insulinothérapie
- **Soins palliatifs** (soins_palliatifs) : accompagnement en fin de vie, gestion de la douleur

## Règles de triage
- Si le patient décrit des symptômes ou besoins correspondant à un service, suggère le type de soins approprié
- Quand tu identifies un besoin de soins, ajoute à la FIN de ta réponse (sur une nouvelle ligne, invisible pour l'utilisateur) : [BOOKING_INTENT:type_de_soin]
  Exemple : [BOOKING_INTENT:pansements]
- Les types valides sont : soins_generaux, prise_de_sang, injections, pansements, perfusions, suivi_diabete, soins_palliatifs
- Ne pose JAMAIS de diagnostic médical
- Pour toute urgence vitale (douleur thoracique, AVC, hémorragie grave, difficulté respiratoire sévère), redirige IMMÉDIATEMENT vers le 112

## Ton et style
- Réponds toujours en français
- Sois chaleureux, professionnel et rassurant
- Utilise le vouvoiement
- Sois concis (2-4 phrases max par réponse)
- Ne mentionne jamais le tag [BOOKING_INTENT] à l'utilisateur`;

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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse booking intent tag
    const intentMatch = rawText.match(
      /\[BOOKING_INTENT:(\w+)\]/
    );
    const suggestedCareType = intentMatch ? intentMatch[1] : null;
    const bookingIntent = !!intentMatch;

    // Strip the tag from the display message
    const displayMessage = rawText
      .replace(/\[BOOKING_INTENT:\w+\]/g, "")
      .trim();

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
