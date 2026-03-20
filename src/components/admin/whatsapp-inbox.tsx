"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WhatsAppConversation, WhatsAppMessage } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Bot,
  UserRound,
  Send,
  Phone,
  Zap,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { QuickReply } from "@/lib/settings";

interface WhatsAppInboxProps {
  initialConversations: WhatsAppConversation[];
  quickReplies?: QuickReply[];
}

export function WhatsAppInbox({
  initialConversations,
  quickReplies = [],
}: WhatsAppInboxProps) {
  const [conversations, setConversations] =
    useState<WhatsAppConversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversations[0]?.id ?? null
  );
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("whatsapp_conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_conversations",
        },
        (payload) => {
          const newConv = payload.new as WhatsAppConversation;
          setConversations((prev) => [newConv, ...prev]);
          toast.info("Nouvelle conversation WhatsApp", {
            description: newConv.contact_name ?? newConv.phone_number,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "whatsapp_conversations",
        },
        (payload) => {
          const updated = payload.new as WhatsAppConversation;
          setConversations((prev) =>
            prev
              .map((c) => (c.id === updated.id ? updated : c))
              .sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() -
                  new Date(a.last_message_at).getTime()
              )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.contact_name?.toLowerCase().includes(q) ||
      c.phone_number.includes(q)
    );
  });

  const toggleAI = useCallback(
    async (conversationId: string, currentState: boolean) => {
      const supabase = createClient();
      const newState = !currentState;

      const { error } = await supabase
        .from("whatsapp_conversations")
        .update({ is_ai_active: newState, updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, is_ai_active: newState } : c
        )
      );

      toast.success(
        newState ? "IA réactivée" : "Vous avez pris le contrôle"
      );
    },
    []
  );

  const sendMessage = async () => {
    if (!selected || !messageInput.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selected.id,
          message: messageInput.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur d'envoi");
      }

      setMessageInput("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'envoi"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Left panel — conversation list */}
      <Card className="w-[350px] flex flex-col shrink-0 overflow-hidden">
        <div className="p-3 border-b">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher un contact..."
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Aucune conversation"
              description={
                search
                  ? "Aucun résultat trouvé"
                  : "Les conversations WhatsApp apparaîtront ici"
              }
            />
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/50",
                  selectedId === conv.id && "bg-forest/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-ink truncate">
                        {conv.contact_name ?? conv.phone_number}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold shrink-0",
                          conv.is_ai_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {conv.is_ai_active ? "IA" : "Manuel"}
                      </span>
                    </div>
                    {conv.contact_name && (
                      <p className="text-xs text-muted-custom flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {conv.phone_number}
                      </p>
                    )}
                    <p className="text-xs text-muted-custom truncate mt-1">
                      {getLastMessagePreview(conv.messages)}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-custom whitespace-nowrap">
                    {formatDistanceToNow(new Date(conv.last_message_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Right panel — chat thread */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="font-medium text-sm text-ink">
                  {selected.contact_name ?? selected.phone_number}
                </h3>
                {selected.contact_name && (
                  <p className="text-xs text-muted-custom">
                    {selected.phone_number}
                  </p>
                )}
              </div>
              <Button
                variant={selected.is_ai_active ? "outline" : "default"}
                size="sm"
                className={cn(
                  "text-xs",
                  !selected.is_ai_active &&
                    "bg-forest text-white hover:bg-forest/90"
                )}
                onClick={() => toggleAI(selected.id, selected.is_ai_active)}
              >
                {selected.is_ai_active ? (
                  <>
                    <UserRound className="h-3.5 w-3.5 mr-1" />
                    Prendre en charge
                  </>
                ) : (
                  <>
                    <Bot className="h-3.5 w-3.5 mr-1" />
                    Réactiver l&apos;IA
                  </>
                )}
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(selected.messages as WhatsAppMessage[]).map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t">
              {selected.is_ai_active ? (
                <p className="text-xs text-muted-custom text-center py-2">
                  L&apos;IA gère cette conversation. Cliquez &quot;Prendre en
                  charge&quot; pour répondre manuellement.
                </p>
              ) : (
                <div className="space-y-2">
                  {/* Quick replies */}
                  {quickReplies.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowQuickReplies((v) => !v)}
                        className="flex items-center gap-1 text-xs text-muted-custom hover:text-forest transition-colors"
                      >
                        <Zap className="h-3 w-3" />
                        Réponses rapides
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform",
                            showQuickReplies && "rotate-180"
                          )}
                        />
                      </button>
                      {showQuickReplies && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {quickReplies.map((qr, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setMessageInput(qr.message);
                                setShowQuickReplies(false);
                              }}
                              className="rounded-full border border-forest/20 bg-forest/5 px-2.5 py-1 text-xs text-forest hover:bg-forest/10 transition-colors"
                            >
                              {qr.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Écrire un message..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      disabled={sending}
                    />
                    <Button
                      size="icon"
                      className="bg-forest text-white hover:bg-forest/90 shrink-0"
                      onClick={sendMessage}
                      disabled={sending || !messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="Sélectionnez une conversation"
            description="Choisissez une conversation dans la liste pour afficher les messages"
            className="flex-1"
          />
        )}
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: WhatsAppMessage }) {
  const isPatient = message.role === "patient";

  return (
    <div
      className={cn("flex", isPatient ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-xl px-3 py-2",
          isPatient && "bg-slate-100 text-ink",
          message.role === "ai" &&
            "bg-forest/10 border border-forest/20 text-ink",
          message.role === "admin" && "bg-forest text-white"
        )}
      >
        <p className="text-xs font-medium mb-0.5 opacity-70">
          {message.role === "patient"
            ? "Patient"
            : message.role === "ai"
              ? "IA"
              : "Admin"}
        </p>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            message.role === "admin" ? "text-white/60" : "text-muted-custom"
          )}
        >
          {format(new Date(message.timestamp), "HH:mm", { locale: fr })}
        </p>
      </div>
    </div>
  );
}

function getLastMessagePreview(messages: WhatsAppMessage[]): string {
  if (!messages || messages.length === 0) return "Aucun message";
  const last = messages[messages.length - 1];
  const prefix =
    last.role === "patient"
      ? ""
      : last.role === "ai"
        ? "IA: "
        : "Admin: ";
  return prefix + last.content;
}
