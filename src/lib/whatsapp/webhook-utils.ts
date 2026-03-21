import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { env } from "@/lib/env";

export function validateWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expectedSignature = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  const receivedSignature = signatureHeader.replace("sha256=", "");

  try {
    return timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(receivedSignature, "hex")
    );
  } catch {
    return false;
  }
}

const webhookMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  text: z
    .object({
      body: z.string(),
    })
    .optional(),
});

const webhookContactSchema = z.object({
  profile: z.object({
    name: z.string(),
  }),
  wa_id: z.string(),
});

const webhookPayloadSchema = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal("whatsapp"),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            contacts: z.array(webhookContactSchema).optional(),
            messages: z.array(webhookMessageSchema).optional(),
            statuses: z.array(z.unknown()).optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export function parseWebhookPayload(body: unknown) {
  return webhookPayloadSchema.safeParse(body);
}

export interface ExtractedMessage {
  messageId: string;
  from: string;
  contactName: string;
  text: string;
  timestamp: string;
}

export function extractTextMessages(
  payload: WebhookPayload
): ExtractedMessage[] {
  const messages: ExtractedMessage[] = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;
      if (!value.messages) continue;

      const contacts = value.contacts ?? [];

      for (const msg of value.messages) {
        if (msg.type !== "text" || !msg.text) continue;

        const contact = contacts.find((c) => c.wa_id === msg.from);

        messages.push({
          messageId: msg.id,
          from: msg.from,
          contactName: contact?.profile.name ?? msg.from,
          text: msg.text.body,
          timestamp: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
        });
      }
    }
  }

  return messages;
}
