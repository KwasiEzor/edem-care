import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { CalendarView } from "@/components/admin/calendar-view";

async function getBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .in("status", ["pending", "confirmed"])
    .order("date", { ascending: true });
  return data || [];
}

export default async function CalendarPage() {
  const bookings = await getBookings();

  return (
    <>
      <AdminHeader
        title="Calendrier"
        description="Vue calendrier de vos rendez-vous"
      />
      <CalendarView bookings={bookings} />
    </>
  );
}
