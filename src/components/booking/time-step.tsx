"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";

interface Slot {
  slot_id: string;
  start_time: string;
  end_time: string;
  remaining_spots: number;
}

interface TimeStepProps {
  date: string;
  selectedSlot?: string;
  onSelect: (start: string, end: string) => void;
  onBack: () => void;
}

export function TimeStep({ date, selectedSlot, onSelect, onBack }: TimeStepProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true);
      try {
        const res = await fetch(`/api/available-slots?date=${date}`);
        const data = await res.json();
        setSlots(data.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [date]);

  const formattedDate = format(
    parse(date, "yyyy-MM-dd", new Date()),
    "EEEE d MMMM yyyy",
    { locale: fr }
  );

  const formatTime = (time: string) => time.slice(0, 5);

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
              Etape 2
            </p>
            <h2 className="font-heading text-3xl font-semibold text-ink">
              Choisissez un creneau
            </h2>
            <p className="text-sm text-muted-custom capitalize">
              {formattedDate}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 py-12 text-center">
            <Clock className="h-12 w-12 text-muted-custom/30 mx-auto mb-4" />
            <p className="text-muted-custom">
              Aucun creneau disponible pour cette date.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={onBack}
            >
              Choisir une autre date
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.slot_id}
                onClick={() => onSelect(slot.start_time, slot.end_time)}
                className={`rounded-[1.4rem] border-2 p-4 text-center transition-all hover:border-forest hover:bg-forest/5 ${
                  selectedSlot === slot.start_time
                    ? "border-forest bg-forest/5"
                    : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-forest" />
                  <span className="font-semibold text-ink">
                    {formatTime(slot.start_time)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-custom">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
