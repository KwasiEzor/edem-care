import { experimental_taintObjectReference } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WhatsAppConversation } from "@/types/database";
import type { DALResult } from "./bookings";

export async function getWhatsAppConversations(): Promise<DALResult<WhatsAppConversation[]>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data || [], error: null };
}

export async function getConversationById(id: string): Promise<DALResult<WhatsAppConversation>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (data) {
    experimental_taintObjectReference(
      "Do not pass raw WhatsApp Conversation PHI directly to Client Components.",
      data
    );
  }

  return { data: data as WhatsAppConversation, error: null };
}
