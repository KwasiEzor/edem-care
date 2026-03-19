"use client";

import { Award, Clock, GraduationCap, ShieldCheck, UserCheck, Users } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: GraduationCap,
    title: "Formation continue",
    description:
      "Constamment formée aux dernières pratiques et protocoles de soins pour vous garantir des prestations à la pointe.",
  },
  {
    icon: UserCheck,
    title: "Patient au centre",
    description:
      "Chaque plan de soins est personnalisé selon vos besoins spécifiques, vos préférences et votre rythme de vie.",
  },
  {
    icon: Clock,
    title: "Disponibilité",
    description:
      "Disponible 7 jours sur 7, je m'adapte à vos horaires pour des soins quand vous en avez besoin.",
  },
  {
    icon: Users,
    title: "Coordination",
    description:
      "Collaboration étroite avec vos médecins et spécialistes pour assurer une prise en charge cohérente et optimale.",
  },
];

const metrics = [
  { value: "7j/7", label: "Disponibilite pour organiser les soins" },
  { value: "Humain", label: "Accompagnement centre sur le patient" },
  { value: "Coordonne", label: "Lien avec medecins et proches" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Trust() {
  return (
    <section id="confiance" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="bg-[linear-gradient(180deg,#0b4da2_0%,#0b65c8_100%)] p-8 text-white lg:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                Pourquoi nous choisir
              </span>
              <h2 className="mt-5 font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
                Une relation de confiance, visible dans chaque detail.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-blue-100/86">
                L&apos;objectif n&apos;est pas seulement de realiser un soin, mais de
                proposer une experience plus sereine, plus claire et plus humaine
                pour le patient et ses proches.
              </p>
              <div className="mt-8 space-y-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4"
                  >
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="mt-1 text-sm text-blue-100/80">{metric.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-[1.4rem] border border-white/12 bg-white/10 p-4">
                <Award className="h-10 w-10 rounded-2xl bg-white/12 p-2.5 text-cyan-200" />
                <p className="text-sm leading-6 text-blue-100/84">
                  Soins organises avec professionnalisme, communication claire et
                  attention constante au confort du patient.
                </p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 gap-5 p-8 sm:grid-cols-2 lg:p-10"
            >
              {pillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  variants={itemVariants}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(11,77,162,0.08)_0%,rgba(6,182,212,0.14)_100%)]">
                    <pillar.icon className="h-6 w-6 text-forest" />
                  </div>
                  <h3 className="mt-5 font-heading text-2xl font-semibold text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-custom">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
