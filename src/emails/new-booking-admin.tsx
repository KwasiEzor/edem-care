import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface NewBookingAdminEmailProps {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  careType: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  patientNotes?: string | null;
}

export const NewBookingAdminEmail = ({
  patientName,
  patientEmail,
  patientPhone,
  careType,
  date,
  timeStart,
  timeEnd,
  patientNotes,
}: NewBookingAdminEmailProps) => (
  <Html>
    <Head />
    <Preview>Nouveau rendez-vous : {patientName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={headerText}>Edem-Care</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Nouvelle demande de rendez-vous</Heading>
          <Text style={badge}>En attente de confirmation</Text>
          
          <Section style={tableSection}>
            <Text style={row}>
              <span style={label}>Patient :</span> <strong>{patientName}</strong>
            </Text>
            <Text style={row}>
              <span style={label}>Email :</span> {patientEmail}
            </Text>
            <Text style={row}>
              <span style={label}>Téléphone :</span> {patientPhone}
            </Text>
            <Hr style={hr} />
            <Text style={row}>
              <span style={label}>Date :</span> <strong>{date}</strong>
            </Text>
            <Text style={row}>
              <span style={label}>Créneau :</span> {timeStart} - {timeEnd}
            </Text>
            <Text style={row}>
              <span style={label}>Soin :</span> {careType}
            </Text>
          </Section>

          {patientNotes && (
            <Section style={notesBox}>
              <Text style={notesLabel}>Notes du patient :</Text>
              <Text style={notesText}>{patientNotes}</Text>
            </Section>
          )}

          <Text style={footer}>
            Connectez-vous au dashboard admin pour gérer ce rendez-vous.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewBookingAdminEmail;

// Styles
const main = {
  backgroundColor: "#f8fafc",
  fontFamily: "'DM Sans', 'HelveticaNeue', Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const header = {
  backgroundColor: "#0B4DA2",
  padding: "32px",
  borderRadius: "12px 12px 0 0",
};

const headerText = {
  color: "#ffffff",
  fontSize: "24px",
  margin: "0",
  textAlign: "center" as const,
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "0 0 12px 12px",
  border: "1px solid #e2e8f0",
};

const h1 = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 20px",
};

const badge = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "0 4px 4px 0",
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 24px",
  padding: "12px 16px",
};

const tableSection = {
  margin: "24px 0",
};

const row = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  color: "#334155",
};

const label = {
  color: "#64748b",
  width: "100px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const notesBox = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
};

const notesLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
};

const notesText = {
  color: "#0f172a",
  margin: "0",
  fontSize: "14px",
  lineHeight: "20px",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "32px",
};
