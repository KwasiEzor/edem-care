import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et politique de confidentialité d'Edem-Care.",
};

export default async function MentionsLegales() {
  const settings = await getSettings();
  const businessEmail = settings.business_email || "contact@edem-care.be";

  return (
    <>
      <Navbar />
      <main className="pt-30 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#eef7ff_0%,#ffffff_58%,#f5fcff_100%)] px-6 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.05)] sm:px-8 lg:px-12">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Informations légales
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold text-ink">
              Mentions légales
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-custom">
              Les informations juridiques et les engagements de confidentialité
              d&apos;{settings.business_name} sont présentés ici dans un format plus lisible.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                1. Éditeur du site
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                <strong className="text-ink">{settings.business_name}</strong>
                <br />
                {settings.business_specialty}
                <br />
                {settings.business_zone}
                <br />
                Email : {businessEmail}
                <br />
                Téléphone : {settings.business_phone}
                <br />
                N° INAMI : {settings.business_inami || "—"}
                <br />
                N° BCE : {settings.business_bce || "—"}
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                2. Hébergeur
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
                Covina, CA 91723, États-Unis.
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                3. Propriété intellectuelle
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                L&apos;ensemble du contenu de ce site (textes, images, logo,
                design) est la propriété exclusive d&apos;{settings.business_name} ou de ses
                partenaires. Toute reproduction, même partielle, est interdite
                sans autorisation préalable.
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                4. Protection des données personnelles (RGPD)
              </h2>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.1 Responsable du traitement
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                {settings.business_name} est responsable du traitement des données personnelles
                collectées via ce site.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.2 Données collectées
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                Les données personnelles collectées via les formulaires de
                contact et de rendez-vous sont : nom, adresse email, numéro de
                téléphone, et toute information communiquée dans le message.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.3 Finalité du traitement
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                Vos données sont utilisées uniquement pour répondre à vos
                demandes, gérer les rendez-vous et assurer le suivi des soins.
                Elles ne sont jamais transmises à des tiers à des fins
                commerciales.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.4 Durée de conservation
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                Les données sont conservées pour la durée nécessaire au
                traitement de votre demande et conformément aux obligations
                légales en matière de dossiers médicaux.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.5 Vos droits
              </h3>
              <p className="mb-2 text-sm leading-7 text-muted-custom">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm leading-7 text-muted-custom">
                <li>Droit d&apos;accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d&apos;opposition</li>
              </ul>
              <p className="mt-2 text-sm leading-7 text-muted-custom">
                Pour exercer ces droits, contactez-nous à :
                {businessEmail}
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                5. Cookies
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                Ce site utilise uniquement des cookies essentiels au bon
                fonctionnement du site (préférences de cookies, session
                d&apos;authentification). Aucun cookie de traçage ou
                publicitaire n&apos;est utilisé.
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                6. Limitation de responsabilité
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                Les informations présentes sur ce site sont fournies à titre
                indicatif. Elles ne remplacent en aucun cas un avis médical
                professionnel. {settings.business_name} ne saurait être tenu responsable de
                l&apos;utilisation qui en est faite.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
