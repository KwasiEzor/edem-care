"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const trustMetrics = [
  { value: "7j/7", label: "Disponibilité pour les soins urgents" },
  { value: "500+", label: "Visites réalisées à domicile" },
  { value: "< 24h", label: "Délai moyen de prise en charge" },
];

const serviceHighlights = [
  "Pansements et injections",
  "Suivi diabétique",
  "Prises de sang",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_48%,#ffffff_100%)] pt-24 text-white lg:pt-32">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_42%),radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%)]" />
      <div className="absolute left-1/2 top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,#0b4da2_0%,#0d5ec7_48%,#07a7d1_100%)] shadow-[0_30px_80px_rgba(11,77,162,0.28)]"
        >
          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-12 lg:py-14">
            <div>
              <motion.div
                variants={fadeUp}
                className="inline-flex flex-wrap items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" />
                  Soins infirmiers à domicile à Bruxelles
                </span>
                <span className="hidden h-4 w-px bg-white/20 sm:block" />
                <span className="inline-flex items-center gap-2 text-white/80">
                  <ShieldCheck className="h-4 w-4" />
                  Équipe professionnelle et agréée
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 max-w-2xl font-heading text-4xl font-bold leading-[0.95] text-white sm:text-5xl lg:text-6xl xl:text-[4.5rem]"
              >
                Des soins d&apos;exception,
                <span className="mt-2 block text-cyan-200">
                  directement chez vous.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-base leading-7 text-blue-50/90 sm:text-lg"
              >
                Edem-Care accompagne chaque patient avec une présence
                rassurante, des interventions rapides et un suivi infirmier
                humain, précis et coordonné.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <Button
                  size="lg"
                  className="h-12 bg-white px-7 text-base font-semibold text-forest hover:bg-slate-100"
                  nativeButton={false}
                  render={<Link href="/rendez-vous" />}
                >
                  Prendre rendez-vous
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/25 bg-white/10 px-7 text-base text-white hover:bg-white/15"
                  nativeButton={false}
                  render={<a href="tel:+32000000000" />}
                >
                  <Phone className="h-4 w-4" />
                  Appeler maintenant
                </Button>
              </motion.div>

              <motion.div
                variants={stagger}
                className="mt-10 grid gap-4 sm:grid-cols-3"
              >
                {trustMetrics.map((metric) => (
                  <motion.div
                    key={metric.label}
                    variants={fadeUp}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                  >
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="mt-1 text-sm leading-6 text-blue-100/85">
                      {metric.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="relative mx-auto w-full max-w-[34rem]"
            >
              <div className="absolute left-0 top-12 h-44 w-44 rounded-full bg-cyan-300/30 blur-3xl" />
              <div className="absolute bottom-4 right-6 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_100%)] p-4 shadow-2xl backdrop-blur">
                <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#f5fbff_0%,#dcedff_100%)] px-4 pt-6">
                  <div className="mb-4 flex items-center justify-between rounded-full bg-white/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-forest shadow-sm">
                    <span>Soins à domicile</span>
                    <span className="inline-flex items-center gap-2 text-cyan-600">
                      <HeartPulse className="h-4 w-4" />
                      Disponible
                    </span>
                  </div>
                  <Image
                    src="/hero-medical-team.svg"
                    alt="Illustration d'un infirmier et d'un patient dans un cadre de soins à domicile"
                    width={720}
                    height={760}
                    preload
                    className="mx-auto h-auto w-full max-w-md"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>

              <div className="absolute -left-2 top-8 w-52 rounded-2xl bg-white p-4 text-ink shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:-left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Satisfaction patients</p>
                    <p className="mt-1 text-xs text-muted-custom">
                      Accompagnement humain et ponctuel
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-current"
                    />
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 right-2 w-56 rounded-2xl bg-white p-4 text-ink shadow-[0_18px_45px_rgba(15,23,42,0.14)] sm:right-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-forest">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Prise en charge rapide</p>
                    <p className="mt-1 text-xs text-muted-custom">
                      Organisation claire des soins et visites
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted-custom">
                  <Clock3 className="h-4 w-4 text-cyan-600" />
                  Réponse sous 24h pour les demandes standards
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            className="border-t border-white/10 bg-slate-50/96 px-6 py-5 text-ink sm:px-8 lg:px-12"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">
                  Services essentiels
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-custom sm:text-base">
                  Une prise en charge sérieuse pour les soins quotidiens, les
                  suivis post-hospitalisation et les interventions techniques à
                  domicile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {serviceHighlights.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
          className="mx-auto mt-8 grid max-w-5xl gap-4 text-ink sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Stethoscope className="h-5 w-5 text-forest" />
            <p className="mt-3 font-semibold">Suivi infirmier complet</p>
            <p className="mt-1 text-sm leading-6 text-muted-custom">
              Coordination des soins et surveillance régulière.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <HeartPulse className="h-5 w-5 text-cyan-600" />
            <p className="mt-3 font-semibold">Approche bienveillante</p>
            <p className="mt-1 text-sm leading-6 text-muted-custom">
              Une relation de confiance pour chaque intervention.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-forest" />
            <p className="mt-3 font-semibold">Qualité et sécurité</p>
            <p className="mt-1 text-sm leading-6 text-muted-custom">
              Protocoles rigoureux et soins adaptés au patient.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="h-5 w-5 text-cyan-600" />
            <p className="mt-3 font-semibold">Disponibilité et réactivité</p>
            <p className="mt-1 text-sm leading-6 text-muted-custom">
                  Réponse claire pour les besoins planifiés ou urgents.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
