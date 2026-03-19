import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const trackSchema = z.object({
  page_path: z.string().min(1).max(500),
  referrer_origin: z.string().max(253).nullable(),
  session_hash: z.string().max(64),
});

export async function POST(request: NextRequest) {
  // Always return ok to avoid leaking errors to client
  const ok = () => NextResponse.json({ ok: true });

  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { allowed } = rateLimit(ip, "track", 60, 60_000);
    if (!allowed) return ok();

    const body = await request.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return ok();

    const supabase = createAdminClient();
    await supabase.from("page_views").insert({
      page_path: parsed.data.page_path,
      referrer_origin: parsed.data.referrer_origin,
      session_hash: parsed.data.session_hash,
    });
  } catch {
    // Silent error
  }

  return ok();
}
