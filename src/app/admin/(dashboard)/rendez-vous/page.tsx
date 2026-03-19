import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { BookingTable } from "@/components/admin/booking-table";

async function getBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("date", { ascending: false });
  return data || [];
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <>
      <AdminHeader
        title="Rendez-vous"
        description="Gérez les demandes de rendez-vous"
      />
      <BookingTable initialBookings={bookings} />
    </>
  );
}
