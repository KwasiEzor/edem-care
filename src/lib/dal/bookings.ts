import { experimental_taintObjectReference } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Booking } from "@/types/database";

export type DALResult<T> = {
  data: T | null;
  error: Error | null;
};

export async function getBookings(): Promise<DALResult<(Booking & { patient_address?: string | null })[]>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, patients(address)")
    .order("date", { ascending: false });
    
  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const result = (data || []).map(b => ({
    ...b,
    patient_address: (b.patients as any)?.address || null
  })) as (Booking & { patient_address?: string | null })[];

  return { data: result, error: null };
}

export async function getBookingById(id: string): Promise<DALResult<Booking>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (data) {
    experimental_taintObjectReference(
      "Do not pass raw Booking PHI directly to Client Components.",
      data
    );
  }

  return { data: data as Booking, error: null };
}
