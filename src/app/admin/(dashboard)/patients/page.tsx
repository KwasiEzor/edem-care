import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { PatientsManager } from "@/components/admin/patients-manager";

async function getPatients() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .order("last_name", { ascending: true });
  return data || [];
}

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <>
      <AdminHeader
        title="Patients"
        description="Gérez la liste de vos patients"
      />
      <PatientsManager initialPatients={patients} />
    </>
  );
}
