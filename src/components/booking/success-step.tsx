"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { BookingData } from "./booking-wizard";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { CARE_TYPE_LABELS, type CareType } from "@/types/database";

interface SuccessStepProps {
  data: BookingData;
}

export function SuccessStep({ data }: SuccessStepProps) {
  const formattedDate = format(
    parse(data.date, "yyyy-MM-dd", new Date()),
    "EEEE d MMMM yyyy",
    { locale: fr }
  );
  const formatTime = (time: string) => time.slice(0, 5);
  const careLabel =
    CARE_TYPE_LABELS[data.care_type as CareType] || data.care_type;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-[2rem] border border-slate-200 bg-white/94 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <CardContent className="p-8 text-center lg:p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-50">
              <CheckCircle2 className="h-16 w-16 text-forest mx-auto" />
            </div>
          </motion.div>

          <h2 className="mt-6 font-heading text-3xl font-bold text-ink">
            Demande envoyee !
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-custom">
            Votre demande de rendez-vous a bien été enregistrée. Nous vous
            confirmerons le rendez-vous par email dans les plus brefs délais.
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-5 text-left">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-forest shrink-0" />
              <span className="text-muted-custom">Date :</span>
              <span className="text-ink font-medium capitalize">
                {formattedDate}
              </span>
            </div>
              <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-forest shrink-0" />
              <span className="text-muted-custom">Créneau :</span>
              <span className="text-ink font-medium">
                {formatTime(data.time_slot_start)} -{" "}
                {formatTime(data.time_slot_end)}
              </span>
            </div>
              <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-forest shrink-0" />
              <span className="text-muted-custom">Soins :</span>
              <span className="text-ink font-medium">{careLabel}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button nativeButton={false} render={<Link href="/" />} className="rounded-full bg-forest px-6 hover:bg-forest/90">
              Retour à l&apos;accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
