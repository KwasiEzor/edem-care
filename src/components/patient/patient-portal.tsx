"use client";

import { usePatientSession } from "@/lib/patient/session";
import { AuthForms } from "./auth-forms";
import { PatientDashboard } from "./patient-dashboard";
import { PageTransition } from "@/components/ui/page-transition";

export function PatientPortal() {
  const session = usePatientSession();
  const isAuthenticated = Boolean(session?.user?.email);

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          <PageTransition>
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-forest">
                  Mon espace
                </p>
                <h1 className="mt-3 font-heading text-4xl font-bold text-ink">
                  Bienvenue sur votre espace patient
                </h1>
                <p className="mt-3 text-base text-muted-custom">
                  Connectez-vous ou créez un compte pour gérer vos rendez-vous
                  et votre profil.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
                <AuthForms />
              </div>
            </div>
          </PageTransition>
        ) : (
          <PatientDashboard session={session!} />
        )}
      </div>
    </section>
  );
}
