"use client";

import { Badge } from "@/components/ui/badge";
import { Award, Quote, Sparkles, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const expertiseTags = [
  "Soins infirmiers généraux",
  "Soins de plaies",
  "Diabétologie",
  "Soins palliatifs",
  "Éducation thérapeutique",
  "Coordination pluridisciplinaire",
];

export function Founder() {
  return (
    <section id="a-propos" className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_22%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[1.6rem] bg-[linear-gradient(145deg,#eff7ff_0%,#d7ebff_100%)]">
                <div className="absolute left-6 top-6 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                  Fondateur
                </div>
                <div className="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/75 text-forest shadow-sm">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <div className="text-center px-8">
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-white/80 shadow-lg">
                    <span className="font-heading text-5xl font-bold text-forest">
                    EC
                    </span>
                  </div>
                  <p className="mt-5 text-base font-semibold text-ink">
                    Infirmier diplômé
                  </p>
                  <p className="mt-2 text-sm text-muted-custom">
                    Une présence professionnelle, attentive et rassurante.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-ink">Soins</p>
                  <p className="mt-1 text-sm text-muted-custom">
                    Precis, humains et adaptes a domicile.
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-ink">Suivi</p>
                  <p className="mt-1 text-sm text-muted-custom">
                    Communication claire avec le patient et ses proches.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-[1.4rem] border border-cyan-100 bg-white px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Formation continue</p>
                  <p className="text-xs text-muted-custom">Pratiques a jour et rigoureuses</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              <Sparkles className="h-4 w-4" />
              A propos
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
              Un infirmier engagé pour des soins fiables et une relation humaine.
            </h2>

            <div className="mt-6 space-y-4 text-base leading-7 text-muted-custom">
              <p>
                Fondateur d&apos;Edem-Care, je suis infirmier diplômé avec
                plusieurs années d&apos;expérience en milieu hospitalier et à
                domicile. Ma vocation est d&apos;offrir des soins de qualité
                dans le confort et la sécurité de votre foyer.
              </p>
              <p>
                Formé aux dernières techniques de soins et en formation
                continue, je m&apos;engage à vous proposer un accompagnement
                personnalisé, respectueux et professionnel. Chaque patient est
                unique et mérite une attention particulière.
              </p>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
              <Quote className="mb-3 h-6 w-6 text-cyan-600" />
              <p className="font-heading text-xl italic text-ink">
                &ldquo;Chaque patient mérite des soins empreints de respect, de
                compétence et de chaleur humaine.&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium text-muted-custom">
                Edem-Care, soins infirmiers a domicile
              </p>
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-custom">
                Domaines d&apos;expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {expertiseTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-auto rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-100"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
