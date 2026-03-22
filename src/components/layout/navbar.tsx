import { getSettings } from "@/lib/settings";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const settings = await getSettings();
  
  return (
    <NavbarClient 
      businessName={settings.business_name}
      businessPhone={settings.business_phone}
      businessEmail={settings.business_email || "contact@edem-care.be"}
      businessZone={settings.business_zone}
    />
  );
}
