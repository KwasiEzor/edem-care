"use client";

import { useState, useMemo } from "react";
import type { ChatTranscript } from "@/types/database";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Eye, MessageSquareMore } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PAGE_SIZE = 10;

interface ConversationsTableProps {
  initialTranscripts: ChatTranscript[];
}

type Filter = "all" | "with_intent" | "without_intent";

export function ConversationsTable({
  initialTranscripts,
}: ConversationsTableProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<ChatTranscript | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return initialTranscripts.filter((t) => {
      if (filter === "with_intent") return t.booking_intent;
      if (filter === "without_intent") return !t.booking_intent;
      return true;
    });
  }, [initialTranscripts, filter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-muted-custom">Filtrer :</span>
        <Select
          value={filter}
          onValueChange={(v) => { setFilter(v as Filter); setPage(1); }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les conversations</SelectItem>
            <SelectItem value="with_intent">
              Avec intention de RDV
            </SelectItem>
            <SelectItem value="without_intent">
              Sans intention de RDV
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={MessageSquareMore}
              title="Aucune conversation"
              description="Les conversations avec le chatbot IA s'afficheront ici."
              className="py-12"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Type de soins suggéré</TableHead>
                    <TableHead>Intention RDV</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((transcript) => (
                    <TableRow key={transcript.id}>
                      <TableCell className="text-muted-custom">
                        {format(
                          new Date(transcript.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: fr }
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-ink">
                          {Array.isArray(transcript.messages)
                            ? transcript.messages.length
                            : 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transcript.care_type_suggested
                          ? CARE_TYPE_LABELS[
                              transcript.care_type_suggested as CareType
                            ] || transcript.care_type_suggested
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {transcript.booking_intent ? (
                          <Badge className="bg-forest/10 text-forest hover:bg-forest/15">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(transcript)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      {/* Conversation detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Conversation du{" "}
              {selected &&
                format(
                  new Date(selected.created_at),
                  "dd MMMM yyyy à HH:mm",
                  { locale: fr }
                )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {Array.isArray(selected.messages) &&
                selected.messages.map(
                  (
                    msg: { role: string; content: string },
                    i: number
                  ) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-forest text-white"
                            : "bg-slate-100 text-ink"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                )}
              {selected.care_type_suggested && (
                <div className="mt-2 rounded-lg border border-forest/20 bg-forest/5 p-3 text-sm">
                  <span className="font-semibold text-forest">
                    Soins suggérés :
                  </span>{" "}
                  {CARE_TYPE_LABELS[
                    selected.care_type_suggested as CareType
                  ] || selected.care_type_suggested}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
