import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface RateLimitConfig {
  limit: number
  window: number
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowKey = `ratelimit:${key}:${Math.floor(now / config.window)}`

  const current = await redis.incr(windowKey)

  if (current === 1) {
    await redis.expire(windowKey, config.window)
  }

  return {
    allowed: current <= config.limit,
    remaining: Math.max(0, config.limit - current),
    resetAt: (Math.floor(now / config.window) + 1) * config.window,
  }
}
