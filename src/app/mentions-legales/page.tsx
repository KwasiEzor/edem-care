import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et politique de confidentialité d'Edem-Care.",
};

export default function MentionsLegales() {
  return (
    <>
      <Navbar />
      <main className="pt-30 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#eef7ff_0%,#ffffff_58%,#f5fcff_100%)] px-6 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.05)] sm:px-8 lg:px-12">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Informations legales
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold text-ink">
              Mentions legales
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-custom">
              Les informations juridiques et les engagements de confidentialite
              d&apos;Edem-Care sont presentes ici dans un format plus lisible.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                1. Editeur du site
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                <strong className="text-ink">Edem-Care</strong>
                <br />
                Soins infirmiers à domicile
                <br />
                Bruxelles, Belgique
                <br />
                Email : contact@edem-care.be
                <br />
                Téléphone : +32 (0) 000 00 00 00
                <br />
                N° INAMI : à compléter
                <br />
                N° BCE : à compléter
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                2. Hebergeur
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
                Covina, CA 91723, États-Unis.
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                3. Propriete intellectuelle
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                L&apos;ensemble du contenu de ce site (textes, images, logo,
                design) est la propriété exclusive d&apos;Edem-Care ou de ses
                partenaires. Toute reproduction, même partielle, est interdite
                sans autorisation préalable.
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink mb-4">
                4. Protection des donnees personnelles (RGPD)
              </h2>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.1 Responsable du traitement
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                Edem-Care est responsable du traitement des données personnelles
                collectées via ce site.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.2 Donnees collectees
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                Les données personnelles collectées via les formulaires de
                contact et de rendez-vous sont : nom, adresse email, numéro de
                téléphone, et toute information communiquée dans le message.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.3 Finalite du traitement
              </h3>
              <p className="text-sm leading-7 text-muted-custom">
                Vos données sont utilisées uniquement pour répondre à vos
                demandes, gérer les rendez-vous et assurer le suivi des soins.
                Elles ne sont jamais transmises à des tiers à des fins
                commerciales.
              </p>

              <h3 className="font-semibold text-ink mt-6 mb-2">
                4.4 Duree de conservation
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
                contact@edem-care.be
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
                6. Limitation de responsabilite
              </h2>
              <p className="text-sm leading-7 text-muted-custom">
                Les informations présentes sur ce site sont fournies à titre
                indicatif. Elles ne remplacent en aucun cas un avis médical
                professionnel. Edem-Care ne saurait être tenu responsable de
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
