import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Edem-Care pour vos soins infirmiers à domicile à Bruxelles. Formulaire de contact et coordonnées.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-30 pb-20">
        <Contact />
      </main>
      <Footer />
    </>
  );
}
