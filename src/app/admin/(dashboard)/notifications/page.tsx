import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { NotificationsCenter } from "@/components/admin/notifications-center";

async function getNotifications() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <>
      <AdminHeader
        title="Notifications"
        description="Toutes vos notifications"
      />
      <NotificationsCenter initialNotifications={notifications} />
    </>
  );
}
