import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { ContactsTable } from "@/components/admin/contacts-table";

async function getContacts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("is_spam", false)
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <>
      <AdminHeader
        title="Messages de contact"
        description="Gérez les messages reçus via le formulaire de contact"
      />
      <ContactsTable initialContacts={contacts} />
    </>
  );
}
