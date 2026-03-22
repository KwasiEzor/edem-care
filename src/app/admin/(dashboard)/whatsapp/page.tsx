import { getSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/admin-header";
import { WhatsAppInbox } from "@/components/admin/whatsapp-inbox";
import { getWhatsAppConversations } from "@/lib/dal/whatsapp_conversations";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const [conversationsResult, settings] = await Promise.all([
    getWhatsAppConversations(),
    getSettings(),
  ]);

  const conversations = conversationsResult.data || [];

  return (
    <>
      <AdminHeader
        title="WhatsApp"
        description="Gérez les conversations WhatsApp avec les patients"
      />
      <WhatsAppInbox
        initialConversations={conversations.slice(0, 50)}
        quickReplies={settings.whatsapp_quick_replies}
      />
    </>
  );
}
