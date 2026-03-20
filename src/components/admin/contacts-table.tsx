"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContactSubmission } from "@/types/database";
import { CARE_TYPE_LABELS, type CareType } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Mail, Eye, CheckCheck, Download, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PAGE_SIZE = 10;

interface ContactsTableProps {
  initialContacts: ContactSubmission[];
}

export function ContactsTable({ initialContacts }: ContactsTableProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [page, setPage] = useState(1);

  const paged = useMemo(
    () => contacts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [contacts, page]
  );

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", id);

    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_read: true } : c))
    );
  };

  const handleOpen = (contact: ContactSubmission) => {
    setSelected(contact);
    if (!contact.is_read) {
      markAsRead(contact.id);
    }
  };

  const exportCsv = () => {
    const header = "Nom,Email,Téléphone,Type,Message,Date,Lu\n";
    const rows = contacts
      .map(
        (c) =>
          `"${c.name}","${c.email}","${c.phone || ""}","${c.care_type ? CARE_TYPE_LABELS[c.care_type as CareType] || c.care_type : ""}","${(c.message || "").replace(/"/g, '""')}","${format(new Date(c.created_at), "dd/MM/yyyy HH:mm")}","${c.is_read ? "Oui" : "Non"}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contacts-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1.5" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Aucun message de contact"
              description="Les messages reçus via le formulaire de contact s'afficheront ici."
              className="py-12"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className={!contact.is_read ? "bg-forest/5" : ""}
                    >
                      <TableCell className="w-8">
                        {!contact.is_read && (
                          <span className="w-2 h-2 bg-forest rounded-full inline-block" />
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            !contact.is_read ? "font-semibold" : ""
                          }
                        >
                          {contact.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-custom">
                        {contact.email}
                      </TableCell>
                      <TableCell>
                        {contact.care_type
                          ? CARE_TYPE_LABELS[contact.care_type as CareType] ||
                            contact.care_type
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-custom">
                        {format(
                          new Date(contact.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: fr }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpen(contact)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            nativeButton={false}
                            render={<a href={`mailto:${contact.email}`} />}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {!contact.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(contact.id)}
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                currentPage={page}
                totalItems={contacts.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Message detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Message de {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-custom">Email</span>
                  <p className="font-medium text-ink">{selected.email}</p>
                </div>
                <div>
                  <span className="text-muted-custom">Téléphone</span>
                  <p className="font-medium text-ink">
                    {selected.phone || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Type de soins</span>
                  <p className="font-medium text-ink">
                    {selected.care_type
                      ? CARE_TYPE_LABELS[selected.care_type as CareType] ||
                        selected.care_type
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-custom">Date</span>
                  <p className="font-medium text-ink">
                    {format(
                      new Date(selected.created_at),
                      "dd MMMM yyyy à HH:mm",
                      { locale: fr }
                    )}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-custom">Message</span>
                <p className="mt-1 text-sm text-ink bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
              <Button
                className="w-full"
                nativeButton={false}
                render={<a href={`mailto:${selected.email}`} />}
              >
                <Mail className="h-4 w-4 mr-2" />
                Répondre par email
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
