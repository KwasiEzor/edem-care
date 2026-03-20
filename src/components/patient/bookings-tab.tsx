"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CARE_TYPE_LABELS } from "@/types/database";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CalendarDays, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BookingEditDialog } from "./booking-edit-dialog";

export type Booking = {
  id: string;
  date: string;
  time_slot_start: string;
  time_slot_end: string;
  care_type: string;
  patient_notes: string | null;
  status: string;
  patient_name: string;
  patient_phone: string;
};

type BookingFilter = "upcoming" | "past" | "cancelled";

interface BookingsTabProps {
  bookings: Booking[];
  onBookingsChange: (bookings: Booking[]) => void;
}

export function BookingsTab({ bookings, onBookingsChange }: BookingsTabProps) {
  const [filter, setFilter] = useState<BookingFilter>("upcoming");
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (filter === "cancelled") return b.status === "cancelled";
    const bookingDate = new Date(b.date);
    if (filter === "past")
      return bookingDate < now && b.status !== "cancelled";
    return bookingDate >= now && b.status !== "cancelled";
  });

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    setCancelingId(cancelConfirm);
    setCancelConfirm(null);
    try {
      const res = await fetch("/api/patient/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: cancelConfirm }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Impossible d'annuler");
      }

      toast.success("Rendez-vous annulé");
      onBookingsChange(bookings.filter((b) => b.id !== cancelConfirm));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCancelingId(null);
    }
  };

  const handleEditSaved = async () => {
    setEditingBooking(null);
    try {
      const res = await fetch("/api/patient/bookings");
      const { bookings: refreshed } = await res.json();
      onBookingsChange(refreshed ?? []);
    } catch {
      // Will show stale data, but non-critical
    }
  };

  const filterButtons: { key: BookingFilter; label: string }[] = [
    { key: "upcoming", label: "À venir" },
    { key: "past", label: "Passés" },
    { key: "cancelled", label: "Annulés" },
  ];

  return (
    <>
      <div className="flex gap-2 mb-4">
        {filterButtons.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            className={
              filter === f.key
                ? "rounded-full bg-forest text-white"
                : "rounded-full"
            }
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Aucun rendez-vous"
          description={
            filter === "upcoming"
              ? "Vous n'avez pas de rendez-vous à venir."
              : filter === "past"
                ? "Aucun rendez-vous passé."
                : "Aucun rendez-vous annulé."
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-forest">
                    {format(new Date(booking.date), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-sm text-muted-custom">
                    {booking.time_slot_start} – {booking.time_slot_end}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-3 text-sm text-muted-custom">
                Soins :{" "}
                {CARE_TYPE_LABELS[
                  booking.care_type as keyof typeof CARE_TYPE_LABELS
                ] ?? booking.care_type}
              </p>
              {booking.patient_notes && (
                <p className="mt-1 text-sm text-muted-custom italic">
                  Notes : {booking.patient_notes}
                </p>
              )}
              {booking.status !== "cancelled" &&
                booking.status !== "completed" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-300 text-forest"
                      onClick={() => setEditingBooking(booking)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-destructive"
                      onClick={() => setCancelConfirm(booking.id)}
                      disabled={cancelingId === booking.id}
                    >
                      {cancelingId === booking.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Annuler
                        </>
                      )}
                    </Button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={cancelConfirm !== null}
        onOpenChange={(open) => !open && setCancelConfirm(null)}
        title="Annuler le rendez-vous ?"
        description="Cette action est irréversible. Le créneau sera libéré pour d'autres patients."
        confirmLabel="Oui, annuler"
        cancelLabel="Non, garder"
        variant="destructive"
        onConfirm={handleCancel}
      />

      {editingBooking && (
        <BookingEditDialog
          booking={editingBooking}
          open={!!editingBooking}
          onOpenChange={(open) => !open && setEditingBooking(null)}
          onSaved={handleEditSaved}
        />
      )}
    </>
  );
}
