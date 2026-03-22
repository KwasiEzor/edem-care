import { AdminHeader } from "@/components/admin/admin-header";
import { BookingTable } from "@/components/admin/booking-table";
import { getBookings } from "@/lib/dal/bookings";

export default async function BookingsPage() {
  const { data: bookings } = await getBookings();

  return (
    <>
      <AdminHeader
        title="Rendez-vous"
        description="Gérez les demandes de rendez-vous"
      />
      <BookingTable initialBookings={bookings || []} />
    </>
  );
}
