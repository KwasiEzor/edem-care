import { getSettings } from "@/lib/settings";
import type { Booking } from "@/types/database";
import type { PatientNotificationEvent } from "./messages";
import {
  buildEmailSubject,
  buildEmailHtml,
  buildPlainTextMessage,
  type MessageContext,
} from "./messages";

export interface NotificationContext {
  event: PatientNotificationEvent;
  booking: Booking;
  adminNotes?: string | null;
  previousDate?: string;
  previousTimeStart?: string;
  previousTimeEnd?: string;
}

/**
 * Normalize a Belgian phone number for WhatsApp.
 * Strips spaces/dashes, converts leading 0 to +32.
 */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-().]/g, "");
  // Belgian local → international
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = "+32" + cleaned.slice(1);
  }
  // 00-prefix → +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  // Ensure leading +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  // WhatsApp expects no + prefix in the `to` field
  return cleaned.replace(/^\+/, "");
}

function toMessageContext(ctx: NotificationContext): MessageContext {
  return {
    event: ctx.event,
    patientName: ctx.booking.patient_name,
    careType: ctx.booking.care_type,
    date: ctx.booking.date,
    timeStart: ctx.booking.time_slot_start,
    timeEnd: ctx.booking.time_slot_end,
    adminNotes: ctx.adminNotes,
    previousDate: ctx.previousDate,
    previousTimeStart: ctx.previousTimeStart,
    previousTimeEnd: ctx.previousTimeEnd,
  };
}

async function sendPatientEmail(msgCtx: MessageContext, email: string) {
  if (!process.env.RESEND_API_KEY) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Edem-Care <notifications@edem-care.be>",
    to: email,
    subject: buildEmailSubject(msgCtx.event),
    html: buildEmailHtml(msgCtx),
  });
}

async function sendPatientWhatsApp(msgCtx: MessageContext, phone: string) {
  const { sendWhatsAppMessage } = await import("@/lib/whatsapp/client");
  const to = normalizePhone(phone);
  const text = buildPlainTextMessage(msgCtx);
  await sendWhatsAppMessage({ to, text });
}

/**
 * Send patient notifications via enabled channels.
 * Never throws — errors are logged but won't break the caller.
 */
export async function notifyPatient(ctx: NotificationContext): Promise<void> {
  try {
    const settings = await getSettings();
    const msgCtx = toMessageContext(ctx);
    const tasks: Promise<void>[] = [];

    if (settings.patient_notify_email && ctx.booking.patient_email) {
      tasks.push(
        sendPatientEmail(msgCtx, ctx.booking.patient_email).catch((e) =>
          console.error("Patient email notification error:", e)
        )
      );
    }

    if (settings.patient_notify_whatsapp && ctx.booking.patient_phone) {
      tasks.push(
        sendPatientWhatsApp(msgCtx, ctx.booking.patient_phone).catch((e) =>
          console.error("Patient WhatsApp notification error:", e)
        )
      );
    }

    await Promise.allSettled(tasks);
  } catch (e) {
    console.error("Patient notification dispatch error:", e);
  }
}
