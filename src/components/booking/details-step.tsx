"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, Loader2, Send, HelpCircle } from "lucide-react";
import { CARE_TYPE_LABELS } from "@/types/database";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { BookingData } from "./booking-wizard";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { env } from "@/lib/env";

interface DetailsStepProps {
  data: Partial<BookingData>;
  onSubmit: (details: Partial<BookingData>) => void;
  onBack: () => void;
}

export function DetailsStep({ data, onSubmit, onBack }: DetailsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: data.date,
      time_slot_start: data.time_slot_start,
      time_slot_end: data.time_slot_end,
      care_type: data.care_type as any,
      honeypot: "",
    },
  });

  const onFormSubmit = async (formData: BookingFormData) => {
    // If Turnstile is enabled, it's the primary, but we allow submission if math is filled
    if (turnstileEnabled && !turnstileToken && !formData.math_answer) {
      toast.error("Veuillez patienter pour la validation ou répondre au défi mathématique");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstile_token: turnstileToken }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Erreur lors de la réservation");
        setIsSubmitting(false);
        return;
      }

      toast.success("Demande de rendez-vous envoyée !");
      onSubmit({
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        care_type: formData.care_type,
        patient_notes: formData.patient_notes || "",
      });
    } catch {
      toast.error("Erreur de connexion. Veuillez réessayer.");
      setIsSubmitting(false);
    }
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
    <Card className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Étape 3
            </p>
            <h2 className="font-heading text-3xl font-semibold text-ink">
              Vos coordonnées
            </h2>
          </div>
        </div>

        <div className="mb-6 rounded-[1.6rem] border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-cyan-900">
          Les informations demandées servent uniquement à traiter votre demande
          de rendez-vous et à vous recontacter.
        </div>

        <form 
          onSubmit={handleSubmit(onFormSubmit, handleValidationError)} 
          className="space-y-5"
        >
          {/* Honeypot field for spam protection */}
          <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="patient_name">Nom complet *</Label>
              <Input
                id="patient_name"
                placeholder="Votre nom"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4"
                {...register("patient_name")}
              />
              {errors.patient_name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.patient_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_email">Email *</Label>
              <Input
                id="patient_email"
                type="email"
                placeholder="votre@email.com"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4"
                {...register("patient_email")}
              />
              {errors.patient_email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.patient_email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="patient_phone">Téléphone *</Label>
              <Input
                id="patient_phone"
                type="tel"
                placeholder="+32 ..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4"
                {...register("patient_phone")}
              />
              {errors.patient_phone && (
                <p className="text-xs text-destructive mt-1">
                  {errors.patient_phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="care_type">Type de soins *</Label>
              <Select
                defaultValue={data.care_type}
                onValueChange={(value) => value && setValue("care_type", value as any)}
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
              {errors.care_type && (
                <p className="text-xs text-destructive mt-1">
                  {errors.care_type.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient_notes">
              Notes supplémentaires (optionnel)
            </Label>
            <Textarea
              id="patient_notes"
              placeholder="Informations complémentaires sur votre demande..."
              rows={4}
              className="min-h-32 rounded-[1.4rem] border-slate-200 bg-slate-50/70 px-4 py-3"
              {...register("patient_notes")}
            />
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
            disabled={isSubmitting}
            className="h-12 w-full rounded-full bg-forest text-base shadow-lg shadow-blue-900/10 hover:bg-forest/90"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting
              ? "Envoi en cours..."
              : "Confirmer la demande de rendez-vous"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
