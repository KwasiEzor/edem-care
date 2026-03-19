import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { AvailabilityManager } from "@/components/admin/availability-manager";

async function getData() {
  const supabase = await createClient();
  const [{ data: timeSlots }, { data: blockedDates }] = await Promise.all([
    supabase
      .from("time_slots")
      .select("*")
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true }),
  ]);
  return {
    timeSlots: timeSlots || [],
    blockedDates: blockedDates || [],
  };
}

export default async function DisponibilitesPage() {
  const { timeSlots, blockedDates } = await getData();

  return (
    <>
      <AdminHeader
        title="Disponibilités"
        description="Gérez vos créneaux horaires et dates bloquées"
      />
      <AvailabilityManager
        initialTimeSlots={timeSlots}
        initialBlockedDates={blockedDates}
      />
    </>
  );
}
