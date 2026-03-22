import { AdminHeader } from "@/components/admin/admin-header";
import { PatientsManager } from "@/components/admin/patients-manager";
import { getAllPatients } from "@/lib/dal/patients";

export default async function PatientsPage() {
  const { data: patients } = await getAllPatients();

  return (
    <>
      <AdminHeader
        title="Patients"
        description="Gérez la liste de vos patients"
      />
      <PatientsManager initialPatients={patients || []} />
    </>
  );
}
