import { escapeHtml } from "@/lib/utils";
import { CARE_TYPE_LABELS, type CareType } from "@/types/database";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type PatientNotificationEvent =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_modified";

export interface MessageContext {
  event: PatientNotificationEvent;
  patientName: string;
  careType: CareType;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:MM or HH:MM:SS
  timeEnd: string;
  adminNotes?: string | null;
  previousDate?: string;
  previousTimeStart?: string;
  previousTimeEnd?: string;
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr + "T00:00:00"), "EEEE d MMMM yyyy", {
    locale: fr,
  });
}

function hhmm(t: string): string {
  return t.slice(0, 5);
}

function careLabel(ct: CareType): string {
  return CARE_TYPE_LABELS[ct] ?? ct;
}

/* ── Email subjects ─────────────────────────────────── */

const SUBJECTS: Record<PatientNotificationEvent, string> = {
  booking_created: "Demande de rendez-vous reçue — Edem-Care",
  booking_confirmed: "Votre rendez-vous est confirmé — Edem-Care",
  booking_cancelled: "Rendez-vous annulé — Edem-Care",
  booking_modified: "Modification de votre rendez-vous — Edem-Care",
};

export function buildEmailSubject(event: PatientNotificationEvent): string {
  return SUBJECTS[event];
}

/* ── Email HTML ─────────────────────────────────────── */

function wrapHtml(title: string, body: string): string {
  return `<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC; padding: 32px;">
  <div style="background: #0B4DA2; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; font-family: 'Garamond', serif; margin: 0; font-size: 24px;">Edem-Care</h1>
  </div>
  <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #0F172A; margin-top: 0;">${title}</h2>
    ${body}
    <p style="margin-top: 24px; color: #64748B; font-size: 12px;">
      Cet email a été envoyé automatiquement par Edem-Care.
    </p>
  </div>
</div>`;
}

function detailsBox(rows: [string, string][]): string {
  const trs = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding: 4px 0; color: #64748B; width: 140px;">${label}</td><td style="padding: 4px 0; color: #0F172A; font-weight: 500;">${value}</td></tr>`
    )
    .join("");
  return `<div style="background: #0B4DA210; border-left: 4px solid #0B4DA2; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse;">${trs}</table>
  </div>`;
}

export function buildEmailHtml(ctx: MessageContext): string {
  const name = escapeHtml(ctx.patientName);
  const care = escapeHtml(careLabel(ctx.careType));
  const dateFormatted = escapeHtml(formatDate(ctx.date));
  const time = `${hhmm(ctx.timeStart)} – ${hhmm(ctx.timeEnd)}`;

  switch (ctx.event) {
    case "booking_created":
      return wrapHtml(
        "Demande de rendez-vous reçue",
        `<p style="color: #64748B;">Bonjour ${name},</p>
        <p style="color: #64748B;">Nous avons bien reçu votre demande de rendez-vous. Voici un récapitulatif :</p>
        ${detailsBox([
          ["Date", dateFormatted],
          ["Créneau", time],
          ["Type de soins", care],
        ])}
        <p style="color: #64748B;">Nous vous confirmerons votre rendez-vous dans les plus brefs délais.</p>
        <p style="color: #64748B;">Cordialement,<br/>Edem-Care</p>`
      );

    case "booking_confirmed":
      return wrapHtml(
        "Rendez-vous confirmé",
        `<p style="color: #64748B;">Bonjour ${name},</p>
        <p style="color: #64748B;">Votre rendez-vous a été confirmé.</p>
        ${detailsBox([
          ["Date", dateFormatted],
          ["Créneau", time],
          ["Type de soins", care],
        ])}
        ${ctx.adminNotes ? `<p style="color: #64748B;"><em>Note : ${escapeHtml(ctx.adminNotes)}</em></p>` : ""}
        <p style="color: #64748B;">En cas d'empêchement, merci de nous prévenir le plus tôt possible.</p>
        <p style="color: #64748B;">À bientôt,<br/>Edem-Care</p>`
      );

    case "booking_cancelled":
      return wrapHtml(
        "Rendez-vous annulé",
        `<p style="color: #64748B;">Bonjour ${name},</p>
        <p style="color: #64748B;">Votre rendez-vous du ${dateFormatted} à ${hhmm(ctx.timeStart)} a été annulé.</p>
        ${ctx.adminNotes ? `<p style="color: #64748B;"><strong>Raison :</strong> ${escapeHtml(ctx.adminNotes)}</p>` : ""}
        <p style="color: #64748B;">N'hésitez pas à prendre un nouveau rendez-vous sur notre site.</p>
        <p style="color: #64748B;">Cordialement,<br/>Edem-Care</p>`
      );

    case "booking_modified": {
      const prevDate = ctx.previousDate
        ? escapeHtml(formatDate(ctx.previousDate))
        : "—";
      const prevTime =
        ctx.previousTimeStart && ctx.previousTimeEnd
          ? `${hhmm(ctx.previousTimeStart)} – ${hhmm(ctx.previousTimeEnd)}`
          : "—";
      return wrapHtml(
        "Modification de votre rendez-vous",
        `<p style="color: #64748B;">Bonjour ${name},</p>
        <p style="color: #64748B;">Votre rendez-vous a été modifié. Voici les nouvelles informations :</p>
        ${detailsBox([
          ["Ancienne date", prevDate],
          ["Ancien créneau", prevTime],
          ["Nouvelle date", dateFormatted],
          ["Nouveau créneau", time],
          ["Type de soins", care],
        ])}
        <p style="color: #64748B;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p style="color: #64748B;">Cordialement,<br/>Edem-Care</p>`
      );
    }
  }
}

/* ── WhatsApp plain text ────────────────────────────── */

export function buildPlainTextMessage(ctx: MessageContext): string {
  const name = ctx.patientName;
  const care = careLabel(ctx.careType);
  const dateFormatted = formatDate(ctx.date);
  const time = `${hhmm(ctx.timeStart)} – ${hhmm(ctx.timeEnd)}`;

  switch (ctx.event) {
    case "booking_created":
      return [
        `Bonjour ${name},`,
        `Votre demande de rendez-vous a bien été reçue.`,
        ``,
        `📅 ${dateFormatted}`,
        `🕐 ${time}`,
        `🩺 ${care}`,
        ``,
        `Nous confirmerons sous peu. Merci de votre confiance !`,
        `— Edem-Care`,
      ].join("\n");

    case "booking_confirmed":
      return [
        `Bonjour ${name},`,
        `Votre rendez-vous est confirmé !`,
        ``,
        `📅 ${dateFormatted}`,
        `🕐 ${time}`,
        `🩺 ${care}`,
        ...(ctx.adminNotes ? [``, `📝 ${ctx.adminNotes}`] : []),
        ``,
        `En cas d'empêchement, prévenez-nous dès que possible.`,
        `— Edem-Care`,
      ].join("\n");

    case "booking_cancelled":
      return [
        `Bonjour ${name},`,
        `Votre rendez-vous du ${dateFormatted} à ${hhmm(ctx.timeStart)} a été annulé.`,
        ...(ctx.adminNotes ? [``, `Raison : ${ctx.adminNotes}`] : []),
        ``,
        `N'hésitez pas à reprendre rendez-vous sur notre site.`,
        `— Edem-Care`,
      ].join("\n");

    case "booking_modified": {
      const prevDate = ctx.previousDate
        ? formatDate(ctx.previousDate)
        : "—";
      const prevTime =
        ctx.previousTimeStart && ctx.previousTimeEnd
          ? `${hhmm(ctx.previousTimeStart)} – ${hhmm(ctx.previousTimeEnd)}`
          : "—";
      return [
        `Bonjour ${name},`,
        `Votre rendez-vous a été modifié.`,
        ``,
        `Avant : ${prevDate}, ${prevTime}`,
        `Maintenant : ${dateFormatted}, ${time}`,
        `🩺 ${care}`,
        ``,
        `Contactez-nous si besoin.`,
        `— Edem-Care`,
      ].join("\n");
    }
  }
}
