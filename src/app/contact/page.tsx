import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import type { Metadata } from "next";

import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Edem-Care pour vos soins infirmiers à domicile à Bruxelles. Formulaire de contact et coordonnées.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-30 pb-20">
        <Contact 
          businessPhone={settings.business_phone}
          businessEmail={settings.business_email || "contact@edem-care.be"}
          businessZone={settings.business_zone}
        />
      </main>
      <Footer />
    </>
  );
}
