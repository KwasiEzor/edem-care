import { env } from "@/lib/env";

export async function validateBotProtection({
  token,
  honeypot,
  mathAnswer,
}: {
  token?: string;
  honeypot?: string;
  mathAnswer?: string;
}) {
  // 1. Honeypot check (always first)
  if (honeypot && honeypot.length > 0) {
    console.warn("[BotProtection] Honeypot field filled. Blocking.");
    return false;
  }

  // 2. Turnstile check (primary)
  const hasTurnstileKeys = !!(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  
  if (hasTurnstileKeys && token) {
    try {
      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET_KEY!)}&response=${encodeURIComponent(token)}`,
        }
      );
      const data = await response.json();
      if (data.success) return true;
    } catch (e) {
      console.error("[BotProtection] Turnstile error:", e);
    }
  }

  // 3. Fallback: Simple Math Challenge if Turnstile failed or was skipped
  // This ensures that even if Cloudflare is blocked, humans can still submit.
  if (mathAnswer === "7") {
    return true;
  }

  // If Turnstile is not configured, we allow it (local dev)
  if (!hasTurnstileKeys) {
    return true;
  }

  // If we got here, everything failed
  console.warn("[BotProtection] All validation failed.");
  return false;
}
