import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSettings } from "@/lib/settings";
import { env } from "@/lib/env";

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
- URGENCE ABSOLUE (Schmitt-Thompson) : Si le patient mentionne une douleur thoracique, un AVC (faiblesse/paralysie soudaine), une hémorragie grave, une perte de conscience, ou une difficulté respiratoire sévère, tu DOIS conseiller d'appeler les urgences et ajouter à la fin de ta réponse le tag : [EMERGENCY_TRIAGE_112]

## Ton et style
- Réponds toujours en français
- Sois chaleureux, professionnel et rassurant
- Utilise le vouvoiement
- Sois concis (2-4 phrases max par réponse)
- Ne mentionne jamais les tags [BOOKING_INTENT] ou [EMERGENCY_TRIAGE_112] à l'utilisateur`;

export interface AIResponse {
  displayMessage: string;
  bookingIntent: boolean;
  suggestedCareType: string | null;
  isEmergency: boolean;
  provider: string;
}

type Provider = "anthropic" | "openai" | "google";

// Exported for testing purposes
export const AI_PROVIDERS = {
  async anthropic(
    model: string,
    system: string,
    messages: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    if (!env.ANTHROPIC_API_KEY) throw new Error("Clé Anthropic manquante");
    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: model || "claude-3-5-sonnet-latest",
      max_tokens: 512,
      system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  },

  async openai(
    model: string,
    system: string,
    messages: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    if (!env.OPENAI_API_KEY) throw new Error("Clé OpenAI manquante");
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 512,
    });
    return response.choices[0].message.content || "";
  },

  async google(
    model: string,
    system: string,
    messages: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    if (!env.GEMINI_API_KEY) throw new Error("Clé Gemini manquante");
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const gemini = genAI.getGenerativeModel({ 
      model: model || "gemini-1.5-flash",
      systemInstruction: system,
    });
    
    const chat = gemini.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
  }
};

export async function generateAIResponse(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<AIResponse> {
  const settings = await getSettings();
  const systemPrompt = settings.chatbot_system_prompt ?? SYSTEM_PROMPT;
  
  const providers: Provider[] = ["anthropic", "openai", "google"];
  const preferred = (settings.chatbot_provider as Provider) || "anthropic";
  const orderedProviders = [preferred, ...providers.filter(p => p !== preferred)];

  const errors: string[] = [];
  
  for (const provider of orderedProviders) {
    try {
      let rawText = "";
      let model = settings.chatbot_model;

      // Default models if the settings model doesn't match the provider
      if (provider === "anthropic" && (!model || !model.includes("claude"))) model = "claude-3-5-sonnet-latest";
      if (provider === "openai" && (!model || !model.includes("gpt"))) model = "gpt-4o";
      if (provider === "google" && (!model || !model.includes("gemini"))) model = "gemini-1.5-flash";

      rawText = await AI_PROVIDERS[provider](model, systemPrompt, messages);

      const intentMatch = rawText.match(/\[BOOKING_INTENT:(\w+)\]/);
      const suggestedCareType = intentMatch ? intentMatch[1] : null;
      const bookingIntent = !!intentMatch;
      const isEmergency = rawText.includes("[EMERGENCY_TRIAGE_112]");
      const displayMessage = rawText
        .replace(/\[BOOKING_INTENT:\w+\]/g, "")
        .replace(/\[EMERGENCY_TRIAGE_112\]/g, "")
        .trim();

      return { displayMessage, bookingIntent, suggestedCareType, isEmergency, provider };
    } catch (err: any) {
      const msg = err.message || String(err);
      console.error(`AI Provider ${provider} failed:`, msg);
      errors.push(`${provider}: ${msg}`);
      continue;
    }
  }

  throw new Error(`Tous les services IA ont échoué. Détails: ${errors.join(" | ")}`);
}
