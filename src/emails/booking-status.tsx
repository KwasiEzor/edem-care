import {
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface BookingStatusEmailProps {
  patientName: string;
  careType: string;
  date: string;
  timeSlot: string;
  status: "updated" | "cancelled";
  reason?: string | null;
}

export const BookingStatusEmail = ({
  patientName,
  careType,
  date,
  timeSlot,
  status,
  reason,
}: BookingStatusEmailProps) => {
  const isCancelled = status === "cancelled";
  const preview = isCancelled 
    ? `Annulation de votre rendez-vous du ${date}` 
    : `Modification de votre rendez-vous du ${date}`;

  return (
    <EmailLayout preview={preview}>
      <Heading style={h1}>Bonjour {patientName},</Heading>
      
      <Text style={text}>
        {isCancelled 
          ? "Nous vous informons que votre rendez-vous a été annulé." 
          : "Les détails de votre rendez-vous ont été mis à jour par notre équipe."}
      </Text>

      <Section style={statusBadge(isCancelled)}>
        <Text style={statusText}>
          Statut : {isCancelled ? "ANNULÉ" : "MODIFIÉ / À JOUR"}
        </Text>
      </Section>

      <Section style={infoBox}>
        <Heading style={h2}>Récapitulatif</Heading>
        <Hr style={hr} />
        
        <Text style={infoRow}>
          <span style={label}>Soin :</span> <strong>{careType}</strong>
        </Text>
        <Text style={infoRow}>
          <span style={label}>Date :</span> <strong>{date}</strong>
        </Text>
        <Text style={infoRow}>
          <span style={label}>Horaire :</span> <strong>{timeSlot}</strong>
        </Text>
      </Section>

      {reason && (
        <Section style={reasonBox}>
          <Text style={reasonLabel}>Note de l&apos;infirmier :</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}

      {!isCancelled && (
        <Section style={btnContainer}>
          <Link href="https://edem-care.be/mon-espace" style={button}>
            Voir mon rendez-vous
          </Link>
        </Section>
      )}

      {isCancelled && (
        <Text style={text}>
          Si vous souhaitez planifier un nouveau rendez-vous, vous pouvez le faire directement sur notre site.
        </Text>
      )}

      <Hr style={hr} />

      <Text style={footerNote}>
        Pour toute question, nous restons à votre écoute au +32 489 34 31 34.
      </Text>
    </EmailLayout>
  );
};

export default BookingStatusEmail;

const h1 = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 20px",
};

const h2 = {
  color: "#334155",
  fontSize: "16px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 12px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const statusBadge = (cancelled: boolean) => ({
  backgroundColor: cancelled ? "#fef2f2" : "#f0f9ff",
  borderRadius: "8px",
  padding: "4px 16px",
  border: `1px solid ${cancelled ? "#ef4444" : "#0ea5e9"}`,
  margin: "24px 0",
});

const statusText = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "700",
  margin: "8px 0",
  textAlign: "center" as const,
};

const infoBox = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  margin: "24px 0",
};

const infoRow = {
  fontSize: "16px",
  margin: "8px 0",
  color: "#1e293b",
};

const label = {
  color: "#64748b",
  width: "80px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const reasonBox = {
  backgroundColor: "#f1f5f9",
  padding: "20px",
  borderRadius: "8px",
  margin: "24px 0",
};

const reasonLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
};

const reasonText = {
  color: "#0f172a",
  margin: "0",
  fontSize: "15px",
  lineHeight: "22px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0B4DA2",
  borderRadius: "32px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const footerNote = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "22px",
};
