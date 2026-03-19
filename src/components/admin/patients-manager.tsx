"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Patient } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PatientsManagerProps {
  initialPatients: Patient[];
}

export function PatientsManager({ initialPatients }: PatientsManagerProps) {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const router = useRouter();

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setForm({
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email || "",
      phone: patient.phone || "",
      address: patient.address || "",
      notes: patient.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name) {
      toast.error("Le nom et le prénom sont requis");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      notes: form.notes || null,
    };

    if (editing) {
      const { error } = await supabase
        .from("patients")
        .update(payload)
        .eq("id", editing.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        setLoading(false);
        return;
      }

      setPatients((prev) =>
        prev.map((p) =>
          p.id === editing.id ? { ...p, ...payload } : p
        )
      );
      toast.success("Patient mis à jour");
    } else {
      const { data, error } = await supabase
        .from("patients")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error("Erreur lors de la création");
        setLoading(false);
        return;
      }

      setPatients((prev) => [...prev, data]);
      toast.success("Patient créé");
    }

    setLoading(false);
    setDialogOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("patients").delete().eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    setPatients((prev) => prev.filter((p) => p.id !== id));
    toast.success("Patient supprimé");
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-custom" />
          <Input
            placeholder="Rechercher un patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={openCreate}
          className="bg-forest hover:bg-forest/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau patient
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-custom"
                  >
                    Aucun patient trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.last_name} {patient.first_name}
                    </TableCell>
                    <TableCell className="text-muted-custom">
                      {patient.email || "-"}
                    </TableCell>
                    <TableCell className="text-muted-custom">
                      {patient.phone || "-"}
                    </TableCell>
                    <TableCell className="text-muted-custom truncate max-w-48">
                      {patient.address || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(patient)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Modifier le patient" : "Nouveau patient"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, first_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, last_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-forest hover:bg-forest/90"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Mettre à jour" : "Créer le patient"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
