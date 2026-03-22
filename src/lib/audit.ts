import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

interface AuditEvent {
  adminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

export async function logAudit(event: AuditEvent) {
  try {
    const supabase = createAdminClient();
    const headersList = await headers();
    
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const { error } = await supabase.from("audit_logs").insert({
      admin_id: event.adminId,
      action: event.action,
      entity_type: event.entityType,
      entity_id: event.entityId,
      old_data: event.oldData,
      new_data: event.newData,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Failed to log audit event:", error);
    }
  } catch (err) {
    console.error("Audit log execution error:", err);
  }
}
