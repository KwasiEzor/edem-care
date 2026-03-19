import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Founder } from "@/components/sections/founder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez Edem-Care et sa fondatrice, infirmière diplômée offrant des soins à domicile de qualité à Bruxelles.",
};

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-30 pb-20">
        <Founder />
      </main>
      <Footer />
    </>
  );
}
