const rateMap = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(key);
    }
  }
}, 60_000);

export function rateLimit(
  ip: string,
  prefix: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false };
  }

  return { allowed: true };
}
