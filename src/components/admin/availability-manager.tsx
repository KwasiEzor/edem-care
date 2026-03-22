"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TimeSlot, BlockedDate } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

interface AvailabilityManagerProps {
  initialTimeSlots: TimeSlot[];
  initialBlockedDates: BlockedDate[];
}

export function AvailabilityManager({
  initialTimeSlots,
  initialBlockedDates,
}: AvailabilityManagerProps) {
  const [timeSlots, setTimeSlots] = useState(initialTimeSlots);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slotForm, setSlotForm] = useState({
    day_of_week: "1",
    start_time: "08:00",
    end_time: "09:00",
    max_bookings: "1",
  });
  const [dateForm, setDateForm] = useState({
    date: "",
    reason: "",
  });
  const router = useRouter();

  // Group time slots by day
  const slotsByDay = timeSlots.reduce(
    (acc, slot) => {
      const day = slot.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    },
    {} as Record<number, TimeSlot[]>
  );

  const toggleSlot = async (slot: TimeSlot) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("time_slots")
      .update({ is_active: !slot.is_active })
      .eq("id", slot.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
      return;
    }

    setTimeSlots((prev) =>
      prev.map((s) =>
        s.id === slot.id ? { ...s, is_active: !s.is_active } : s
      )
    );
  };

  const addSlot = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        day_of_week: parseInt(slotForm.day_of_week),
        start_time: slotForm.start_time,
        end_time: slotForm.end_time,
        max_bookings: parseInt(slotForm.max_bookings),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création");
      setLoading(false);
      return;
    }

    setTimeSlots((prev) => [...prev, data].sort(
      (a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
    ));
    toast.success("Créneau ajouté");
    setLoading(false);
    setSlotDialogOpen(false);
    router.refresh();
  };

  const deleteSlot = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("time_slots").delete().eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    setTimeSlots((prev) => prev.filter((s) => s.id !== id));
    toast.success("Créneau supprimé");
    router.refresh();
  };

  const addBlockedDate = async () => {
    if (!dateForm.date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("blocked_dates")
      .insert({
        date: dateForm.date,
        reason: dateForm.reason || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur : cette date est peut-être déjà bloquée");
      setLoading(false);
      return;
    }

    setBlockedDates((prev) =>
      [...prev, data].sort((a, b) => a.date.localeCompare(b.date))
    );
    toast.success("Date bloquée");
    setLoading(false);
    setDateDialogOpen(false);
    setDateForm({ date: "", reason: "" });
    router.refresh();
  };

  const removeBlockedDate = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    setBlockedDates((prev) => prev.filter((d) => d.id !== id));
    toast.success("Date débloquée");
    router.refresh();
  };

  return (
    <Tabs defaultValue="slots">
      <TabsList className="mb-6">
        <TabsTrigger value="slots">Créneaux horaires</TabsTrigger>
        <TabsTrigger value="blocked">Dates bloquées</TabsTrigger>
      </TabsList>

      {/* Time Slots Tab */}
      <TabsContent value="slots">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setSlotDialogOpen(true)}
            className="bg-forest hover:bg-forest/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un créneau
          </Button>
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const slots = slotsByDay[day] || [];
            if (slots.length === 0 && day === 0) return null;

            return (
              <Card key={day}>
                <CardContent className="p-4">
                  <h3 className="font-heading text-lg font-semibold text-ink mb-3">
                    {DAY_LABELS[day]}
                  </h3>
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-custom">
                      Aucun créneau configuré
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                            slot.is_active
                              ? "border-forest/20 bg-forest/5"
                              : "border-border bg-muted/50 opacity-50"
                          }`}
                        >
                          <button
                            onClick={() => toggleSlot(slot)}
                            className="font-medium"
                          >
                            {slot.start_time.slice(0, 5)} -{" "}
                            {slot.end_time.slice(0, 5)}
                          </button>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add slot dialog */}
        <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Ajouter un créneau
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jour</Label>
                <Select
                  value={slotForm.day_of_week}
                  onValueChange={(v) =>
                    v && setSlotForm((f) => ({ ...f, day_of_week: String(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {DAY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Début</Label>
                  <Input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) =>
                      setSlotForm((f) => ({ ...f, start_time: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin</Label>
                  <Input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) =>
                      setSlotForm((f) => ({ ...f, end_time: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Places maximum</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={slotForm.max_bookings}
                  onChange={(e) =>
                    setSlotForm((f) => ({ ...f, max_bookings: e.target.value }))
                  }
                />
              </div>
              <Button
                onClick={addSlot}
                disabled={loading}
                className="w-full bg-forest hover:bg-forest/90"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* Blocked Dates Tab */}
      <TabsContent value="blocked">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setDateDialogOpen(true)}
            className="bg-forest hover:bg-forest/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Bloquer une date
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedDates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-custom"
                    >
                      Aucune date bloquée
                    </TableCell>
                  </TableRow>
                ) : (
                  blockedDates.map((bd) => (
                    <TableRow key={bd.id}>
                      <TableCell className="font-medium">
                        {format(new Date(bd.date), "EEEE dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-muted-custom">
                        {bd.reason || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeBlockedDate(bd.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add blocked date dialog */}
        <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Bloquer une date
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={dateForm.date}
                  onChange={(e) =>
                    setDateForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Raison (optionnel)</Label>
                <Input
                  placeholder="Ex: Congé, Formation..."
                  value={dateForm.reason}
                  onChange={(e) =>
                    setDateForm((f) => ({ ...f, reason: e.target.value }))
                  }
                />
              </div>
              <Button
                onClick={addBlockedDate}
                disabled={loading}
                className="w-full bg-forest hover:bg-forest/90"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Bloquer la date
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
}
