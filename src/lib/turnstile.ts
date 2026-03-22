import { env } from "@/lib/env";
import { verifyMathChallenge } from "./security/challenges";

export async function validateBotProtection({
  token,
  honeypot,
  mathAnswer,
  mathToken,
}: {
  token?: string;
  honeypot?: string;
  mathAnswer?: string;
  mathToken?: string;
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

  // 3. Fallback: Dynamic Math Challenge if Turnstile failed or was skipped
  if (mathAnswer && mathToken) {
    return verifyMathChallenge(mathAnswer, mathToken);
  }

  // If Turnstile is not configured and no math challenge was provided, we allow it (local dev)
  if (!hasTurnstileKeys && !mathAnswer) {
    return true;
  }

  // If we got here, everything failed
  console.warn("[BotProtection] All validation failed.");
  return false;
}
