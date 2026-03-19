import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Trust } from "@/components/sections/trust";
import { Founder } from "@/components/sections/founder";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Founder />
        <Trust />

        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#082d5e_0%,#0b4da2_42%,#0fb7d6_100%)] px-6 py-10 text-white shadow-[0_28px_70px_rgba(11,77,162,0.22)] sm:px-8 lg:px-12 lg:py-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
                    Besoin de soins infirmiers à domicile ?
                  </span>
                  <h2 className="mt-4 font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
                    Organisons une prise en charge claire et rassurante.
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100/84">
                    Contactez-nous dès aujourd&apos;hui pour discuter de vos besoins ou
                    prenez directement rendez-vous en ligne.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<Link href="/rendez-vous" />}
                    className="h-12 rounded-full bg-white px-8 text-base text-forest hover:bg-slate-100"
                  >
                    Prendre rendez-vous
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    nativeButton={false}
                    render={<Link href="/contact" />}
                    className="h-12 rounded-full border-white/25 bg-white/10 px-8 text-base text-white hover:bg-white/15"
                  >
                    <Phone className="h-4 w-4" />
                    Nous contacter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
