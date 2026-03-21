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
import { Phone, Mail, MapPin, Send, Loader2, HelpCircle } from "lucide-react";

import { toast } from "sonner";
import { CARE_TYPE_LABELS } from "@/types/database";
import { useTransition, useState, useEffect } from "react";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { env } from "@/lib/env";

export function Contact() {
  const [isPending, startTransition] = useTransition();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [showMathFallback, setShowMathFallback] = useState(false);

  useEffect(() => {
    setTurnstileEnabled(!!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    
    // Show math fallback if Turnstile hasn't succeeded after 6 seconds
    const timer = setTimeout(() => {
      if (!turnstileToken) {
        setShowMathFallback(true);
      }
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [turnstileToken]);

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
    if (turnstileEnabled && !turnstileToken && !data.math_answer) {
      toast.error("Veuillez patienter pour la validation ou répondre au défi mathématique");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitContact({ ...data, turnstile_token: turnstileToken || undefined });
        if (result.success) {
          toast.success("Message envoyé avec succès !", {
            description: "Nous vous répondrons dans les plus brefs délais.",
          });
          reset();
          setTurnstileToken(null);
        } else {
          toast.error("Erreur lors de l'envoi", {
            description: result.error || "Veuillez réessayer plus tard.",
          });
        }
      } catch {
        toast.error("Erreur lors de l'envoi", {
          description: "Veuillez réessayer plus tard.",
        });
      }
    });
  };

  const handleValidationError = () => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      toast.error("Veuillez vérifier les champs du formulaire", {
        description: `Champs manquants ou invalides : ${errorFields.join(", ")}`,
      });
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_22%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-in-up">
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
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <div className="animate-fade-in-left rounded-[2rem] bg-[linear-gradient(180deg,#0b4da2_0%,#0f67cc_100%)] p-6 text-white shadow-[0_24px_60px_rgba(11,77,162,0.2)] lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Coordonnées
            </p>
            <h3 className="mt-4 font-heading text-3xl font-bold">
              Une réponse rapide pour organiser vos soins.
            </h3>
            <p className="mt-4 text-sm leading-7 text-blue-100/82">
              Nous vous aidons à clarifier la demande, le type de soins et les
              prochaines étapes avant la prise en charge.
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
                  href: "#",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12">
                    <item.icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/60">
                      {item.title}
                    </p>
                    <a
                      href={item.href}
                      className="text-sm font-medium hover:text-cyan-200 transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="animate-fade-in-right rounded-[2rem] border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6 sm:p-8">
              <form 
                onSubmit={handleSubmit(onSubmit, handleValidationError)} 
                className="space-y-5"
              >
                {/* Honeypot field for spam protection */}
                <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
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
                    <Label htmlFor="care_type">Type de soins (optionnel)</Label>
                    <Select
                      onValueChange={(value) => setValue("care_type", value as any)}
                    >
                      <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50/70 px-4">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CARE_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="min-h-36 rounded-[1.4rem] border-slate-200 bg-slate-50/70 px-4 py-3"
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50/30 p-4 sm:p-6">
                  <TurnstileWidget
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setValue("turnstile_token", token);
                    }}
                    onExpire={() => {
                      setTurnstileToken(null);
                      setValue("turnstile_token", "");
                    }}
                  />

                  {(showMathFallback || !turnstileToken) && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-forest">
                        <HelpCircle className="h-4 w-4" />
                        <Label htmlFor="math_answer" className="text-xs font-semibold uppercase tracking-wider">
                          Défi de secours (si Turnstile échoue)
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-custom bg-white px-3 py-2 rounded-xl border border-slate-200">
                          Combien font 3 + 4 ?
                        </span>
                        <Input
                          id="math_answer"
                          placeholder="Votre réponse"
                          className="h-10 w-32 rounded-xl border-slate-200 bg-white px-4"
                          {...register("math_answer")}
                        />
                      </div>
                    </div>
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
        </div>
      </div>
    </section>
  );
}
