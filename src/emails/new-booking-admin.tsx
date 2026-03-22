import {
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface NewBookingAdminEmailProps {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  careType: string;
  date: string;
  timeSlot: string;
  patientNotes?: string | null;
}

export const NewBookingAdminEmail = ({
  patientName,
  patientEmail,
  patientPhone,
  careType,
  date,
  timeSlot,
  patientNotes,
}: NewBookingAdminEmailProps) => {
  return (
    <EmailLayout preview={`Nouveau RDV : ${patientName} - ${careType}`}>
      <Heading style={h1}>Nouvelle demande de rendez-vous</Heading>
      
      <Section style={badge}>
        <Text style={badgeText}>ACTION REQUISE</Text>
      </Section>

      <Text style={text}>
        Une nouvelle demande a été déposée via le site web. Voici les informations du patient :
      </Text>

      <Section style={infoBox}>
        <Heading style={h2}>Informations Patient</Heading>
        <Text style={infoRow}><strong>Nom :</strong> {patientName}</Text>
        <Text style={infoRow}><strong>Email :</strong> {patientEmail}</Text>
        <Text style={infoRow}><strong>Tél :</strong> {patientPhone}</Text>
        
        <Hr style={hr} />
        
        <Heading style={h2}>Détails de la demande</Heading>
        <Text style={infoRow}><strong>Type de soin :</strong> {careType}</Text>
        <Text style={infoRow}><strong>Date :</strong> {date}</Text>
        <Text style={infoRow}><strong>Créneau :</strong> {timeSlot}</Text>
      </Section>

      {patientNotes && (
        <Section style={notesBox}>
          <Text style={notesLabel}>Message du patient :</Text>
          <Text style={notesText}>{patientNotes}</Text>
        </Section>
      )}

      <Section style={btnContainer}>
        <Link href="https://edem-care.be/admin" style={button}>
          Accéder au Dashboard
        </Link>
      </Section>

      <Text style={smallText}>
        Vous pouvez confirmer ou modifier ce rendez-vous directement depuis votre interface d&apos;administration.
      </Text>
    </EmailLayout>
  );
};

export default NewBookingAdminEmail;

const h1 = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 16px",
};

const h2 = {
  color: "#334155",
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "12px 0 8px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const badge = {
  backgroundColor: "#fef3c7",
  borderRadius: "4px",
  display: "inline-block",
  padding: "4px 12px",
  border: "1px solid #f59e0b",
  marginBottom: "24px",
};

const badgeText = {
  color: "#92400e",
  fontSize: "12px",
  fontWeight: "700",
  margin: "0",
};

const infoBox = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};

const infoRow = {
  fontSize: "15px",
  margin: "6px 0",
  color: "#1e293b",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const notesBox = {
  backgroundColor: "#fff",
  padding: "16px",
  borderRadius: "8px",
  borderLeft: "4px solid #0B4DA2",
  margin: "24px 0",
};

const notesLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const notesText = {
  color: "#0f172a",
  margin: "0",
  fontSize: "14px",
  fontStyle: "italic",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0B4DA2",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const smallText = {
  color: "#94a3b8",
  fontSize: "13px",
  textAlign: "center" as const,
};
