import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PatientPortal } from "@/components/patient/patient-portal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon espace patient",
  description:
    "Connectez-vous à votre espace Edem-Care pour gérer vos rendez-vous et vos informations de soins.",
};

export default function PatientSpacePage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16">
        <PatientPortal />
      </main>
      <Footer />
    </>
  );
}
