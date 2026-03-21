import { experimental_taintObjectReference } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WhatsAppConversation } from "@/types/database";

export async function getWhatsAppConversations(): Promise<WhatsAppConversation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as WhatsAppConversation[];
}

export async function getConversationById(id: string): Promise<WhatsAppConversation | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  experimental_taintObjectReference(
    "Do not pass raw WhatsApp Conversation PHI directly to Client Components.",
    data
  );

  return data as WhatsAppConversation;
}
