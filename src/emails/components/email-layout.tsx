import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Font,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily="Helvetica"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>EDEM-CARE</Text>
            <Text style={tagline}>Soins infirmiers à domicile</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerHr} />
            <Text style={footerTitle}>Edem-Care</Text>
            <Text style={footerText}>
              Bruxelles et communes avoisinantes<br />
              Tél : <Link href="tel:+32489343134" style={footerLink}>+32 489 34 31 34</Link><br />
              Email : <Link href="mailto:info@edem-care.be" style={footerLink}>info@edem-care.be</Link><br />
              Web : <Link href="https://edem-care.be" style={footerLink}>www.edem-care.be</Link>
            </Text>
            <Text style={legalText}>
              BCE : 0798.543.621 | INAMI : 4-64352-44-401<br />
              © {new Date().getFullYear()} Edem-Care. Tous droits réservés.
            </Text>
            <Text style={unsubText}>
              Vous recevez cet email suite à votre demande sur notre plateforme.<br />
              <Link href="https://edem-care.be/mentions-legales" style={unsubLink}>Mentions légales</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f4f7f9",
  fontFamily: "'DM Sans', 'HelveticaNeue', Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  width: "600px",
  maxWidth: "100%",
};

const header = {
  backgroundColor: "#0B4DA2",
  padding: "40px 32px",
  borderRadius: "16px 16px 0 0",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  letterSpacing: "0.05em",
  margin: "0",
  lineHeight: "1",
};

const tagline = {
  color: "#bfdbfe",
  fontSize: "14px",
  margin: "8px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px 32px",
  borderRadius: "0 0 16px 16px",
  border: "1px solid #e2e8f0",
  borderTop: "none",
};

const footer = {
  textAlign: "center" as const,
  padding: "32px 0",
};

const footerHr = {
  borderColor: "#cbd5e1",
  margin: "0 0 32px",
};

const footerTitle = {
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const footerText = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const footerLink = {
  color: "#0B4DA2",
  textDecoration: "none",
};

const legalText = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 16px",
};

const unsubText = {
  color: "#94a3b8",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "0",
};

const unsubLink = {
  color: "#64748b",
  textDecoration: "underline",
};
