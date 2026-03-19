"use client";

import {
  ArrowRight,
  Stethoscope,
  Syringe,
  Bandage,
  Droplets,
  Activity,
  HeartHandshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const services = [
  {
    icon: Stethoscope,
    title: "Soins généraux",
    description:
      "Surveillance des paramètres vitaux, administration de médicaments, et suivi de l'état de santé global à domicile.",
  },
  {
    icon: Syringe,
    title: "Prises de sang & Injections",
    description:
      "Prélèvements sanguins, injections sous-cutanées et intramusculaires réalisés avec précision et douceur.",
  },
  {
    icon: Bandage,
    title: "Pansements",
    description:
      "Soins de plaies simples et complexes, pansements post-opératoires, suivi de cicatrisation.",
  },
  {
    icon: Droplets,
    title: "Perfusions",
    description:
      "Mise en place et surveillance de perfusions intraveineuses, hydratation et traitements par voie parentérale.",
  },
  {
    icon: Activity,
    title: "Suivi diabète",
    description:
      "Éducation thérapeutique, contrôle glycémique, gestion de l'insulinothérapie et prévention des complications.",
  },
  {
    icon: HeartHandshake,
    title: "Soins palliatifs",
    description:
      "Accompagnement bienveillant en fin de vie, gestion de la douleur et soutien aux familles.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end"
        >
          <div>
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Nos services
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
              Une offre complete de soins, avec une presentation claire et rassurante.
            </h2>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <p className="text-base leading-7 text-muted-custom">
              Chaque intervention est pensee pour simplifier le parcours du patient :
              soins techniques, suivi quotidien, coordination avec les professionnels
              de sante et accompagnement adapte a la situation.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {["Suivi post-hospitalisation", "Soins reguliers", "Interventions techniques"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-ink"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {services.map((service, index) => (
            <motion.div key={service.title} variants={cardVariants}>
              <Card className="group h-full rounded-[1.8rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-forest/20 hover:shadow-[0_24px_50px_rgba(11,77,162,0.12)]">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(11,77,162,0.1)_0%,rgba(6,182,212,0.15)_100%)] transition-colors group-hover:bg-[linear-gradient(135deg,rgba(11,77,162,0.14)_0%,rgba(6,182,212,0.22)_100%)]">
                    <service.icon className="h-6 w-6 text-forest" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-custom">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-heading text-2xl font-semibold text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-custom">
                    {service.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest">
                    Soins adaptes
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
