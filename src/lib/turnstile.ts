import { env } from "@/lib/env";

export async function validateTurnstileToken(token?: string) {
  // If keys are not configured, we skip validation (allows dev/CI or partial configuration)
  if (!env.TURNSTILE_SECRET_KEY || !env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Turnstile keys missing. Skipping validation.");
    }
    return true;
  }

  // If we have keys but no token was provided, it's a validation failure
  if (!token) {
    console.error("Turnstile token missing while keys are configured.");
    return false;
  }

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
  return data.success;
}
