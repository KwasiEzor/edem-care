"use client";

import { motion } from "framer-motion";
import { FileText, ClipboardList, Home, HeartPulse } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Demande",
    description:
      "Prenez contact via le formulaire en ligne ou par téléphone. Nous évaluons vos besoins rapidement.",
  },
  {
    icon: ClipboardList,
    title: "Planification",
    description:
      "Nous organisons votre prise en charge : type de soins, fréquence et créneaux adaptés à votre rythme.",
  },
  {
    icon: Home,
    title: "Visite à domicile",
    description:
      "Un infirmier qualifié se déplace chez vous pour réaliser les soins dans un cadre confortable et sécurisé.",
  },
  {
    icon: HeartPulse,
    title: "Suivi",
    description:
      "Nous assurons un suivi régulier et ajustons le plan de soins selon l'évolution de votre état de santé.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function CareTimeline() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(11,77,162,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.06),transparent_24%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Comment ça marche
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
            Votre parcours de soins, étape par étape.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-custom">
            De la première prise de contact au suivi continu, nous vous
            accompagnons à chaque moment.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative mt-16"
        >
          {/* Vertical connecting line — desktop only */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-forest via-cyan-500 to-gold lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  variants={stepVariants}
                  className="relative lg:flex lg:items-center lg:min-h-[160px]"
                >
                  {/* Center icon — desktop */}
                  <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-forest to-gold shadow-lg ring-4 ring-white">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content card */}
                  <div
                    className={`lg:w-1/2 ${isEven ? "lg:pr-16 lg:text-right" : "lg:pl-16 lg:ml-auto"}`}
                  >
                    <div className="flex items-start gap-4 lg:items-center">
                      {/* Icon — mobile only */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest to-gold shadow-md lg:hidden">
                        <step.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-forest/60">
                          Étape {index + 1}
                        </span>
                        <h3 className="mt-1 font-heading text-2xl font-semibold text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-custom">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
