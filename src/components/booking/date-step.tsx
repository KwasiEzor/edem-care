"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { addDays, isBefore, startOfDay, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface DateStepProps {
  selectedDate?: string;
  maxDays?: number;
  allowSundays?: boolean;
  onSelect: (date: string) => void;
}

export function DateStep({ selectedDate, maxDays = 60, allowSundays = false, onSelect }: DateStepProps) {
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [selected, setSelected] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  useEffect(() => {
    async function fetchBlockedDates() {
      const supabase = createClient();
      const { data } = await supabase
        .from("blocked_dates")
        .select("date");

      if (data) {
        setBlockedDates(data.map((d) => new Date(d.date)));
      }
    }
    fetchBlockedDates();
  }, []);

  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDays);

  const isDateDisabled = (date: Date) => {
    // Past dates
    if (isBefore(date, today)) return true;
    // Beyond max days
    if (date > maxDate) return true;
    // Sundays (0)
    if (!allowSundays && date.getDay() === 0) return true;
    // Blocked dates
    if (
      blockedDates.some(
        (bd) => bd.toDateString() === date.toDateString()
      )
    )
      return true;
    return false;
  };

  return (
    <Card className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Étape 1
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-ink">
            Choisissez une date
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-custom">
            Sélectionnez un jour disponible dans les {maxDays} prochains jours.
          </p>
        </div>

        <div className="flex justify-center rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                setSelected(date);
                onSelect(format(date, "yyyy-MM-dd"));
              }
            }}
            disabled={isDateDisabled}
            locale={fr}
            fromDate={today}
            toDate={maxDate}
            className="rounded-[1.4rem]"
          />
        </div>

        <div className="mt-5 rounded-[1.4rem] bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          {allowSundays
            ? "Les dates bloquées ne sont pas disponibles."
            : "Les dimanches et les dates bloquées ne sont pas disponibles."}
        </div>
      </CardContent>
    </Card>
  );
}
