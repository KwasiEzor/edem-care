import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { WhatsAppInbox } from "@/components/admin/whatsapp-inbox";
import type { WhatsAppConversation } from "@/types/database";

async function getConversations(): Promise<WhatsAppConversation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(50);
  return (data as WhatsAppConversation[]) || [];
}

export default async function WhatsAppPage() {
  const conversations = await getConversations();

  return (
    <>
      <AdminHeader
        title="WhatsApp"
        description="Gérez les conversations WhatsApp avec les patients"
      />
      <WhatsAppInbox initialConversations={conversations} />
    </>
  );
}
