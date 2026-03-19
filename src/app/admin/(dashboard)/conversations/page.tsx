import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { ConversationsTable } from "@/components/admin/conversations-table";

async function getTranscripts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_transcripts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

export default async function ConversationsPage() {
  const transcripts = await getTranscripts();

  return (
    <>
      <AdminHeader
        title="Conversations"
        description="Historique des conversations avec l'assistant IA"
      />
      <ConversationsTable initialTranscripts={transcripts} />
    </>
  );
}
