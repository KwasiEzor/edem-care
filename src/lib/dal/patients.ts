import { experimental_taintObjectReference } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Patient } from "@/types/database";

export async function getPatientById(id: string): Promise<Patient | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  // Next.js 16/React 19 Security: Prevent this raw PHI from being passed to Client Components.
  // If a developer tries to pass the returned object to a "use client" component, React throws an error.
  experimental_taintObjectReference(
    "Do not pass raw Patient PHI (Protected Health Information) directly to Client Components. Pass only the specific fields needed.",
    data
  );

  return data as Patient;
}

export async function getAllPatients(): Promise<Patient[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Patient[];
}
