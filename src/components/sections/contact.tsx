"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { submitContact } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CARE_TYPE_LABELS } from "@/types/database";
import { useTransition } from "react";

export function Contact() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      honeypot: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    startTransition(async () => {
      const result = await submitContact(data);
      if (result.success) {
        toast.success("Message envoyé avec succès !", {
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        reset();
      } else {
        toast.error("Erreur lors de l'envoi", {
          description: result.error || "Veuillez réessayer plus tard.",
        });
      }
    });
  };

  return (
    <section id="contact" className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_22%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Contact
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
            Prenons contact dans un cadre simple, clair et professionnel.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-custom">
            Une question, une demande de renseignements ? N&apos;hésitez pas à
            nous écrire, nous vous répondrons rapidement.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="rounded-[2rem] bg-[linear-gradient(180deg,#0b4da2_0%,#0f67cc_100%)] p-6 text-white shadow-[0_24px_60px_rgba(11,77,162,0.2)] lg:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Coordonnees
            </p>
            <h3 className="mt-4 font-heading text-3xl font-bold">
              Une reponse rapide pour organiser vos soins.
            </h3>
            <p className="mt-4 text-sm leading-7 text-blue-100/82">
              Nous vous aidons a clarifier la demande, le type de soins et les
              prochaines etapes avant la prise en charge.
            </p>
            <div className="mt-6 space-y-4">
            {[
              {
                icon: Phone,
                title: "Téléphone",
                value: "+32 (0) 000 00 00 00",
                href: "tel:+32000000000",
              },
              {
                icon: Mail,
                title: "Email",
                value: "contact@edem-care.be",
                href: "mailto:contact@edem-care.be",
              },
              {
                icon: MapPin,
                title: "Zone d'intervention",
                value: "Bruxelles et environs",
              },
            ].map((info) => (
              <div
                key={info.title}
                className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12">
                    <info.icon className="h-5 w-5 text-cyan-100" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {info.title}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-sm text-blue-100/80 transition-colors hover:text-white"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-blue-100/80">{info.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
            <div className="mt-6 rounded-[1.4rem] border border-white/12 bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">Ce que vous pouvez nous envoyer</p>
              <p className="mt-2 text-sm leading-6 text-blue-100/78">
                Vos coordonnees, le type de soins souhaites, votre disponibilite
                et toute information utile pour preparer la prise en charge.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.07)] backdrop-blur-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Formulaire
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-bold text-ink">
                    Envoyez votre demande
                  </h3>
                </div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Honeypot field - hidden from users */}
                  <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
                    <Input
                      {...register("honeypot")}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+32 ..."
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="care_type">Type de soins</Label>
                      <Select
                        onValueChange={(value) => value && setValue("care_type", String(value))}
                      >
                        <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50/70 px-4">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CARE_TYPE_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre demande..."
                      rows={5}
                      className="min-h-36 rounded-[1.4rem] border-slate-200 bg-slate-50/70 px-4 py-3"
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-12 w-full rounded-full bg-forest text-base shadow-lg shadow-blue-900/10 hover:bg-forest/90"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isPending ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
