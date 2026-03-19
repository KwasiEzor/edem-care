"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking, BookingStatus } from "@/types/database";
import { CARE_TYPE_LABELS, type CareType } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  X,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "En attente", variant: "outline" },
  confirmed: { label: "Confirmé", variant: "default" },
  cancelled: { label: "Annulé", variant: "destructive" },
  completed: { label: "Terminé", variant: "secondary" },
};

interface BookingTableProps {
  initialBookings: Booking[];
}

export function BookingTable({ initialBookings }: BookingTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const updateStatus = async (
    id: string,
    status: BookingStatus,
    notes?: string
  ) => {
    setLoading(id);
    const supabase = createClient();

    const updateData: Partial<Booking> = { status };
    if (notes) updateData.admin_notes = notes;

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
      setLoading(null);
      return;
    }

    // Send email notification to patient
    try {
      await fetch("/api/booking/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, status, notes }),
      });
    } catch {
      // Non-blocking
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status, admin_notes: notes || b.admin_notes } : b
      )
    );

    toast.success(
      status === "confirmed"
        ? "Rendez-vous confirmé"
        : status === "cancelled"
          ? "Rendez-vous annulé"
          : "Statut mis à jour"
    );

    setLoading(null);
    setSelectedBooking(null);
    router.refresh();
  };

  return (
    <>
      {/* Filter */}
      <div className="mb-4">
        <Select value={filter} onValueChange={(v) => v && setFilter(String(v))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Créneau</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-custom">
                    Aucun rendez-vous trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const statusConfig = STATUS_CONFIG[booking.status];
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-ink">
                            {booking.patient_name}
                          </p>
                          <p className="text-xs text-muted-custom">
                            {booking.patient_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.date), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        {booking.time_slot_start.slice(0, 5)} -{" "}
                        {booking.time_slot_end.slice(0, 5)}
                      </TableCell>
                      <TableCell>
                        {CARE_TYPE_LABELS[booking.care_type as CareType] ||
                          booking.care_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setAdminNotes(booking.admin_notes || "");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-forest hover:text-forest"
                                disabled={loading === booking.id}
                                onClick={() =>
                                  updateStatus(booking.id, "confirmed")
                                }
                              >
                                {loading === booking.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={loading === booking.id}
                                onClick={() =>
                                  updateStatus(booking.id, "cancelled")
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-secondary hover:text-secondary"
                              disabled={loading === booking.id}
                              onClick={() =>
                                updateStatus(booking.id, "completed")
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking detail modal */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Détails du rendez-vous
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-custom">Patient</span>
                  <p className="font-medium text-ink">
                    {selectedBooking.patient_name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Email</span>
                  <p className="font-medium text-ink">
                    {selectedBooking.patient_email}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Téléphone</span>
                  <p className="font-medium text-ink">
                    {selectedBooking.patient_phone}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Type de soins</span>
                  <p className="font-medium text-ink">
                    {CARE_TYPE_LABELS[
                      selectedBooking.care_type as CareType
                    ] || selectedBooking.care_type}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Date</span>
                  <p className="font-medium text-ink">
                    {format(
                      new Date(selectedBooking.date),
                      "dd MMMM yyyy",
                      { locale: fr }
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Créneau</span>
                  <p className="font-medium text-ink">
                    {selectedBooking.time_slot_start.slice(0, 5)} -{" "}
                    {selectedBooking.time_slot_end.slice(0, 5)}
                  </p>
                </div>
              </div>

              {selectedBooking.patient_notes && (
                <div>
                  <span className="text-sm text-muted-custom">
                    Notes du patient
                  </span>
                  <p className="mt-1 text-sm text-ink bg-muted/50 p-3 rounded-lg">
                    {selectedBooking.patient_notes}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes administrateur</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajouter des notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                {selectedBooking.status === "pending" && (
                  <>
                    <Button
                      className="flex-1 bg-forest hover:bg-forest/90"
                      disabled={loading === selectedBooking.id}
                      onClick={() =>
                        updateStatus(
                          selectedBooking.id,
                          "confirmed",
                          adminNotes
                        )
                      }
                    >
                      Confirmer
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={loading === selectedBooking.id}
                      onClick={() =>
                        updateStatus(
                          selectedBooking.id,
                          "cancelled",
                          adminNotes
                        )
                      }
                    >
                      Annuler
                    </Button>
                  </>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button
                    className="flex-1"
                    disabled={loading === selectedBooking.id}
                    onClick={() =>
                      updateStatus(
                        selectedBooking.id,
                        "completed",
                        adminNotes
                      )
                    }
                  >
                    Marquer terminé
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
