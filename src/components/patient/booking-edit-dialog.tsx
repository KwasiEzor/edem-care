"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CARE_TYPE_LABELS } from "@/types/database";
import type { Booking } from "./bookings-tab";

interface BookingEditDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function BookingEditDialog({
  booking,
  open,
  onOpenChange,
  onSaved,
}: BookingEditDialogProps) {
  const [values, setValues] = useState({
    date: booking.date,
    time_slot_start: booking.time_slot_start,
    time_slot_end: booking.time_slot_end,
    care_type: booking.care_type,
    patient_notes: booking.patient_notes ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = { booking_id: booking.id };

      if (values.date) payload.date = values.date;
      if (values.time_slot_start && values.time_slot_end) {
        payload.time_slot_start = values.time_slot_start;
        payload.time_slot_end = values.time_slot_end;
      }
      if (values.care_type) payload.care_type = values.care_type;
      payload.patient_notes = values.patient_notes;

      const res = await fetch("/api/patient/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Impossible de modifier");
      }

      toast.success("Rendez-vous mis à jour");
      onSaved();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Modifier le rendez-vous
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="date"
              value={values.date}
              onChange={(e) =>
                setValues({ ...values, date: e.target.value })
              }
            />
            <div className="space-y-2">
              <Input
                type="time"
                value={values.time_slot_start}
                onChange={(e) =>
                  setValues({ ...values, time_slot_start: e.target.value })
                }
              />
              <Input
                type="time"
                value={values.time_slot_end}
                onChange={(e) =>
                  setValues({ ...values, time_slot_end: e.target.value })
                }
              />
            </div>
          </div>
          <Select
            value={values.care_type || undefined}
            onValueChange={(v) =>
              setValues({ ...values, care_type: v ?? "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type de soins" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CARE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={values.patient_notes}
            onChange={(e) =>
              setValues({ ...values, patient_notes: e.target.value })
            }
            placeholder="Notes ou besoins particuliers"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              className="flex-1 rounded-full bg-forest text-white"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sauvegarder"
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
