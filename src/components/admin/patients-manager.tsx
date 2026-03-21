"use client";

import { useState, useMemo } from "react";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Pencil, Trash2, Users, Loader2, Phone, MapPin, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

interface PatientsManagerProps {
  initialPatients: Patient[];
}

export function PatientsManager({ initialPatients }: PatientsManagerProps) {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
    );
  }, [patients, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", deleteConfirm);

    if (error) {
      toast.error("Erreur lors de la suppression");
      setDeleteConfirm(null);
      return;
    }

    setPatients((prev) => prev.filter((p) => p.id !== deleteConfirm));
    toast.success("Patient supprimé");
    setDeleteConfirm(null);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Rechercher un patient..."
          className="flex-1 max-w-sm"
        />
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
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun patient trouvé"
              description={
                search
                  ? "Aucun résultat pour cette recherche."
                  : "Commencez par ajouter votre premier patient."
              }
              actionLabel={!search ? "Ajouter un patient" : undefined}
              onAction={!search ? openCreate : undefined}
              className="py-12"
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
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
                    {paged.map((patient) => (
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
                              onClick={() => setDeleteConfirm(patient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-border">
                {paged.map((patient) => (
                  <div key={patient.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-ink">
                          {patient.last_name} {patient.first_name}
                        </p>
                        {patient.address && (
                          <p className="text-xs text-muted-custom flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {patient.address}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(patient)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteConfirm(patient.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {patient.phone && (
                        <a 
                          href={`tel:${patient.phone}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "flex-1 h-9 gap-1.5 text-xs"
                          )}
                        >
                          <Phone className="h-3.5 w-3.5 text-forest" />
                          Appeler
                        </a>
                      )}
                      {patient.address && (
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(patient.address)}`}
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
                      {patient.email && (
                        <a 
                          href={`mailto:${patient.email}`}
                          className={cn(
                            buttonVariants({ variant: "secondary", size: "icon" }),
                            "h-9 w-9 shrink-0"
                          )}
                        >
                          <Mail className="h-4 w-4 text-slate-600" />
                        </a>
                      )}
                    </div>
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

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Supprimer ce patient ?"
        description="Cette action est irréversible. Toutes les données associées seront perdues."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
      />

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
