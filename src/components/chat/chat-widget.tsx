"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CARE_TYPE_LABELS, type CareType } from "@/types/database";

interface Message {
  role: "user" | "assistant";
  content: string;
  booking_intent?: boolean;
  suggested_care_type?: string | null;
  is_emergency?: boolean;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Bonjour ! Je suis l'assistant Edem-Care. Comment puis-je vous aider ? Vous pouvez me décrire vos besoins en soins ou me poser une question sur nos services.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Build API messages (exclude welcome + metadata)
      const apiMessages = [...messages.filter((m) => m !== WELCOME_MESSAGE), userMessage].map(
        (m) => ({ role: m.role, content: m.content })
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }

      const data = (await res.json()) as { 
        message: string; 
        metadata?: { 
          booking_intent?: boolean; 
          suggested_care_type?: string | null; 
          is_emergency?: boolean;
        } 
      };
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        booking_intent: data.metadata?.booking_intent,
        suggested_care_type: data.metadata?.suggested_care_type,
        is_emergency: data.metadata?.is_emergency,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, sessionId]);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-white shadow-lg transition-colors hover:bg-forest/90"
            aria-label="Ouvrir le chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:h-[520px] h-[70vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-forest px-4 py-3 text-white">
              <div>
                <p className="font-heading text-lg font-semibold">Edem-Care</p>
                <p className="text-xs text-white/70">
                  Assistant soins infirmiers
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 transition-colors hover:bg-white/10"
                aria-label="Fermer le chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((msg, i) => (
                <div key={i}>
                  <div
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

                  {/* Emergency intent card */}
                  {msg.is_emergency && (
                    <div className="mt-2 ml-0">
                      <div className="inline-block rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          Urgence médicale détectée
                        </p>
                        <p className="text-xs text-red-600 mb-3 max-w-[250px]">
                          Vos symptômes nécessitent une attention médicale immédiate. N&apos;attendez pas.
                        </p>
                        <a href="tel:112" className="w-full">
                          <Button
                            size="sm"
                            className="h-9 w-full rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center font-bold"
                          >
                            Appeler le 112
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Booking intent card */}
                  {msg.booking_intent && msg.suggested_care_type && !msg.is_emergency && (
                    <div className="mt-2 ml-0">
                      <div className="inline-block rounded-xl border border-forest/20 bg-forest/5 p-3">
                        <p className="text-xs font-semibold text-forest">
                          Soins suggérés :{" "}
                          {CARE_TYPE_LABELS[
                            msg.suggested_care_type as CareType
                          ] || msg.suggested_care_type}
                        </p>
                        <Link
                          href={`/rendez-vous?care_type=${msg.suggested_care_type}`}
                        >
                          <Button
                            size="sm"
                            className="mt-2 h-8 rounded-full bg-forest text-white hover:bg-forest/90"
                          >
                            Prendre rendez-vous
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl bg-slate-100 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Décrivez vos besoins..."
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none transition-colors focus:border-forest/40 focus:ring-1 focus:ring-forest/20"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white transition-colors hover:bg-forest/90 disabled:opacity-40"
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
