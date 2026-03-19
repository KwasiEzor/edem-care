"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Eye, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContactsTableProps {
  initialContacts: ContactSubmission[];
}

export function ContactsTable({ initialContacts }: ContactsTableProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

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

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-custom"
                  >
                    Aucun message de contact
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
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
                      {format(new Date(contact.created_at), "dd/MM/yyyy HH:mm", {
                        locale: fr,
                      })}
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
                        <Button variant="ghost" size="icon" nativeButton={false} render={<a href={`mailto:${contact.email}`} />}>
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
                ))
              )}
            </TableBody>
          </Table>
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
              <Button className="w-full" nativeButton={false} render={<a href={`mailto:${selected.email}`} />}>
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
