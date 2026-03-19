import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Edem-Care | Soins Infirmiers à Domicile à Bruxelles",
    template: "%s | Edem-Care",
  },
  description:
    "Edem-Care offre des soins infirmiers professionnels à domicile à Bruxelles. Soins personnalisés, accompagnement bienveillant et suivi rigoureux pour votre bien-être.",
  keywords: [
    "soins infirmiers",
    "domicile",
    "Bruxelles",
    "infirmière",
    "soins à domicile",
    "nursing care",
    "home care",
  ],
  metadataBase: new URL("https://edem-care.be"),
  openGraph: {
    type: "website",
    locale: "fr_BE",
    siteName: "Edem-Care",
    title: "Edem-Care | Soins Infirmiers à Domicile à Bruxelles",
    description:
      "Soins infirmiers professionnels à domicile à Bruxelles. Accompagnement personnalisé et bienveillant.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Edem-Care",
  description:
    "Soins infirmiers professionnels à domicile à Bruxelles",
  url: "https://edem-care.be",
  telephone: "+32000000000",
  email: "contact@edem-care.be",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bruxelles",
    addressCountry: "BE",
  },
  areaServed: {
    "@type": "City",
    name: "Bruxelles",
  },
  medicalSpecialty: "Nursing",
  availableService: [
    { "@type": "MedicalProcedure", name: "Soins infirmiers généraux" },
    { "@type": "MedicalProcedure", name: "Prises de sang" },
    { "@type": "MedicalProcedure", name: "Injections" },
    { "@type": "MedicalProcedure", name: "Pansements" },
    { "@type": "MedicalProcedure", name: "Perfusions" },
    { "@type": "MedicalProcedure", name: "Suivi diabète" },
    { "@type": "MedicalProcedure", name: "Soins palliatifs" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <CookieBanner />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
