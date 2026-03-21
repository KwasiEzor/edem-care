import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ContactSubmissionAdminEmailProps {
  name: string;
  email: string;
  phone?: string | null;
  careType?: string | null;
  message: string;
}

export const ContactSubmissionAdminEmail = ({
  name,
  email,
  phone,
  careType,
  message,
}: ContactSubmissionAdminEmailProps) => (
  <Html>
    <Head />
    <Preview>Nouveau message de contact : {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={headerText}>Edem-Care</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Nouveau message de contact</Heading>
          
          <Section style={tableSection}>
            <Text style={row}>
              <span style={label}>Nom :</span> <strong>{name}</strong>
            </Text>
            <Text style={row}>
              <span style={label}>Email :</span> {email}
            </Text>
            {phone && (
              <Text style={row}>
                <span style={label}>Téléphone :</span> {phone}
              </Text>
            )}
            {careType && (
              <Text style={row}>
                <span style={label}>Type de soin :</span> {careType}
              </Text>
            )}
          </Section>

          <Section style={notesBox}>
            <Text style={notesLabel}>Message :</Text>
            <Text style={notesText}>{message}</Text>
          </Section>

          <Text style={footer}>
            Ce message a été envoyé via le formulaire de contact sur edem-care.be
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ContactSubmissionAdminEmail;

// Styles (same as booking email for consistency)
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
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "32px",
};
