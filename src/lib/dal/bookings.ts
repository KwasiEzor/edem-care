import { experimental_taintObjectReference } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Booking } from "@/types/database";

export async function getBookings(): Promise<(Booking & { patient_address?: string | null })[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, patients(address)")
    .order("date", { ascending: false });
    
  if (error || !data) {
    return [];
  }

  return data.map(b => ({
    ...b,
    patient_address: (b.patients as any)?.address || null
  })) as (Booking & { patient_address?: string | null })[];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  experimental_taintObjectReference(
    "Do not pass raw Booking PHI directly to Client Components.",
    data
  );

  return data as Booking;
}
