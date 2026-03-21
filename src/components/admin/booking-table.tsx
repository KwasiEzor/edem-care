"use client";

import { useState, useMemo } from "react";
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
import { Button, buttonVariants } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchInput } from "@/components/ui/search-input";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  Eye,
  CheckCircle2,
  Loader2,
  Download,
  CalendarDays,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { VoiceNotesInput } from "./voice-notes-input";

const PAGE_SIZE = 10;

interface BookingTableProps {
  initialBookings: (Booking & { patient_address?: string | null })[];
}

export function BookingTable({ initialBookings }: BookingTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    status: BookingStatus;
    label: string;
    variant: "destructive" | "default";
  } | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.patient_name.toLowerCase().includes(q) ||
          b.patient_email.toLowerCase().includes(q) ||
          (CARE_TYPE_LABELS[b.care_type as CareType] || b.care_type)
            .toLowerCase()
            .includes(q)
      );
    }

    return list;
  }, [bookings, filter, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = async (
    id: string,
    status: BookingStatus,
    notes?: string
  ) => {
    setLoading(id);
    setConfirmAction(null);
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

  const exportCsv = () => {
    const header = "Patient,Email,Téléphone,Date,Créneau,Type,Statut\n";
    const rows = filtered
      .map(
        (b) =>
          `"${b.patient_name}","${b.patient_email}","${b.patient_phone}","${b.date}","${b.time_slot_start}-${b.time_slot_end}","${CARE_TYPE_LABELS[b.care_type as CareType] || b.care_type}","${b.status}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rendez-vous-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={(v) => { v && setFilter(String(v)); setPage(1); }}>
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
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Rechercher patient, email, type..."
          className="flex-1 max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1.5" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Aucun rendez-vous trouvé"
              description="Aucun résultat pour vos filtres."
              className="py-12"
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
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
                    {paged.map((booking) => (
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
                          <StatusBadge status={booking.status} />
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
                                    setConfirmAction({
                                      id: booking.id,
                                      status: "confirmed",
                                      label: "Confirmer ce rendez-vous ?",
                                      variant: "default",
                                    })
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
                                    setConfirmAction({
                                      id: booking.id,
                                      status: "cancelled",
                                      label: "Annuler ce rendez-vous ?",
                                      variant: "destructive",
                                    })
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-border">
                {paged.map((booking) => (
                  <div key={booking.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-ink">
                          {booking.patient_name}
                        </p>
                        <p className="text-xs text-muted-custom">
                          {format(new Date(booking.date), "EEEE d MMMM", { locale: fr })} • {booking.time_slot_start.slice(0, 5)}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {CARE_TYPE_LABELS[booking.care_type as CareType] || booking.care_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${booking.patient_phone}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "flex-1 h-9 gap-1.5 text-xs"
                        )}
                      >
                        <Phone className="h-3.5 w-3.5 text-forest" />
                        Appeler
                      </a>
                      {booking.patient_address && (
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.patient_address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "flex-1 h-9 gap-1.5 text-xs"
                          )}
                        >
                          <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                          GPS
                        </a>
                      )}
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setAdminNotes(booking.admin_notes || "");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          className="flex-1 h-9 bg-forest hover:bg-forest/90 text-xs"
                          size="sm"
                          disabled={loading === booking.id}
                          onClick={() => updateStatus(booking.id, "confirmed")}
                        >
                          {loading === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                          Confirmer
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 h-9 text-xs"
                          size="sm"
                          disabled={loading === booking.id}
                          onClick={() => updateStatus(booking.id, "cancelled")}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    )}
                    
                    {booking.status === "confirmed" && (
                      <Button
                        className="w-full h-9 bg-secondary hover:bg-secondary/90 text-xs"
                        size="sm"
                        disabled={loading === booking.id}
                        onClick={() => updateStatus(booking.id, "completed")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Marquer comme terminé
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <DataTablePagination
                currentPage={page}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm action dialog */}
      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.label ?? ""}
        description="Cette action enverra une notification au patient par email."
        confirmLabel={
          confirmAction?.status === "confirmed" ? "Confirmer" : "Annuler le RDV"
        }
        variant={confirmAction?.variant ?? "default"}
        onConfirm={() =>
          confirmAction && updateStatus(confirmAction.id, confirmAction.status)
        }
        loading={!!loading}
      />

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

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-custom">Statut :</span>
                <StatusBadge status={selectedBooking.status} />
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
                <div className="flex items-center justify-between">
                  <Label>Notes administrateur</Label>
                  <VoiceNotesInput 
                    onTranscript={(text) => setAdminNotes(prev => prev ? `${prev} ${text}` : text)} 
                  />
                </div>
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
