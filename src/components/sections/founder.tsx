import { getSettings } from "@/lib/settings";
import { FounderClient } from "./founder-client";

export async function Founder() {
  const settings = await getSettings();
  
  return (
    <FounderClient 
      adminDisplayName={settings.admin_display_name || "Infirmier"}
      businessName={settings.business_name}
    />
  );
}
