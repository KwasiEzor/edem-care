import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getSettings } from "@/lib/settings";
import { env } from "@/lib/env";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Réservez votre rendez-vous pour des soins infirmiers à domicile à Bruxelles avec Edem-Care.",
};

export default async function RendezVousPage() {
  const settings = await getSettings();
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-30 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#082d5e_0%,#0b4da2_44%,#11b7d6_100%)] px-6 py-10 text-white shadow-[0_28px_70px_rgba(11,77,162,0.18)] sm:px-8 lg:px-12 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Rendez-vous
                </span>
                <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Prenez rendez-vous dans un parcours clair et guidé.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/84">
              Choisissez la date et le créneau qui vous conviennent, puis
              renseignez vos coordonnées.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Ce qu&apos;il faut savoir
                </p>
                <ul className="mt-4 space-y-3 text-sm text-blue-100/82">
                  <li>Réservation en 3 étapes</li>
                  <li>Choix de date et de créneau disponibles</li>
                  <li>Confirmation après validation de la demande</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Suspense>
              <BookingWizard
                maxDays={settings.booking_max_days_ahead}
                allowSundays={settings.booking_allow_sundays}
                turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
