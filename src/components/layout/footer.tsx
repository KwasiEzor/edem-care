import Link from "next/link";
import { ArrowRight, Clock3, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#082d5e_0%,#0b4da2_52%,#0b4da2_100%)] text-white">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_25%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-sm lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Edem-Care
              </span>
              <h2 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
                Un accompagnement infirmier rassurant, chez vous.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/82 sm:text-base">
                Soins à domicile, suivi coordonné et interventions avec une attention
                réelle à votre confort, votre rythme et votre sécurité.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/rendez-vous"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-forest shadow-lg shadow-blue-950/20 transition-transform hover:-translate-y-0.5"
                >
                  Prendre rendez-vous
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+32000000000"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Phone className="h-4 w-4" />
                  +32 (0) 000 00 00 00
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5">
                <Clock3 className="h-5 w-5 text-cyan-200" />
                <p className="mt-4 text-lg font-semibold">Disponibilite 7j/7</p>
                <p className="mt-2 text-sm leading-6 text-blue-100/78">
                  Réponse rapide pour organiser les soins et orienter votre demande.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5">
                <MapPin className="h-5 w-5 text-cyan-200" />
                <p className="mt-4 text-lg font-semibold">Bruxelles et environs</p>
                <p className="mt-2 text-sm leading-6 text-blue-100/78">
                  Intervention à domicile avec un suivi adapté à votre situation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/12 pt-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-forest">
                <span className="font-heading text-xl font-semibold">EC</span>
              </div>
              <span className="font-heading text-2xl font-bold">Edem-Care</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-blue-100/76">
              Soins infirmiers professionnels à domicile à Bruxelles, avec un accompagnement
              attentif, clair et bienveillant.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-white">Navigation</h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/#services", label: "Services" },
                { href: "/a-propos", label: "A propos" },
                { href: "/#confiance", label: "Confiance" },
                { href: "/contact", label: "Contact" },
                { href: "/rendez-vous", label: "Rendez-vous" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/78 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-4 text-sm text-blue-100/78">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                <a href="tel:+32000000000" className="transition-colors hover:text-white">
                  +32 (0) 000 00 00 00
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                <a href="mailto:contact@edem-care.be" className="transition-colors hover:text-white">
                  contact@edem-care.be
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                <span>Bruxelles, Belgique</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-white">Informations</h3>
            <ul className="mt-4 space-y-3 text-sm text-blue-100/78">
              <li>
                <Link href="/mentions-legales" className="transition-colors hover:text-white">
                  Mentions legales
                </Link>
              </li>
              <li>N° INAMI : a completer</li>
              <li>N° BCE : a completer</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/12 pt-6 text-sm text-blue-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Edem-Care. Tous droits reserves.</p>
          <p>Site concu pour une experience simple, claire et rassurante.</p>
        </div>
      </div>
    </footer>
  );
}
