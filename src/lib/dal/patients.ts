import { experimental_taintObjectReference } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Patient } from "@/types/database";
import type { DALResult } from "./bookings";

export async function getPatientById(id: string): Promise<DALResult<Patient>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (data) {
    // Next.js 16/React 19 Security: Prevent this raw PHI from being passed to Client Components.
    experimental_taintObjectReference(
      "Do not pass raw Patient PHI (Protected Health Information) directly to Client Components. Pass only the specific fields needed.",
      data
    );
  }

  return { data: data as Patient, error: null };
}

export async function getAllPatients(): Promise<DALResult<Patient[]>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data || [], error: null };
}
