import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

const memoryBuckets = new Map<string, { count: number; windowStart: number }>();

export type SharedRateLimitResult = {
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: string;
};

function bucketStartMs(windowMs: number) {
  return Math.floor(Date.now() / windowMs) * windowMs;
}

export async function enforceSharedRateLimit(input: {
  scope: string;
  bucketKey: string;
  limit: number;
  windowMs: number;
}): Promise<SharedRateLimitResult> {
  const startMs = bucketStartMs(input.windowMs);
  const resetAt = new Date(startMs + input.windowMs).toISOString();
  const memoryKey = `${input.scope}:${input.bucketKey}:${startMs}`;

  if (!isSupabaseServerConfigured()) {
    const existing = memoryBuckets.get(memoryKey);
    if (!existing) {
      memoryBuckets.set(memoryKey, { count: 1, windowStart: startMs });
      return { allowed: true, count: 1, remaining: Math.max(input.limit - 1, 0), resetAt };
    }
    if (existing.count >= input.limit) {
      return { allowed: false, count: existing.count, remaining: 0, resetAt };
    }
    existing.count += 1;
    memoryBuckets.set(memoryKey, existing);
    return { allowed: true, count: existing.count, remaining: Math.max(input.limit - existing.count, 0), resetAt };
  }

  const supabase = createSupabaseServerClient();
  const windowStart = new Date(startMs).toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('app_rate_limit_windows')
    .select('request_count')
    .eq('scope', input.scope)
    .eq('bucket_key', input.bucketKey)
    .eq('window_start', windowStart)
    .maybeSingle();

  if (existingError) throw existingError;

  if (!existing) {
    const { error: insertError } = await supabase.from('app_rate_limit_windows').insert({
      scope: input.scope,
      bucket_key: input.bucketKey,
      window_start: windowStart,
      request_count: 1,
      last_request_at: new Date().toISOString()
    });
    if (insertError) throw insertError;
    return { allowed: true, count: 1, remaining: Math.max(input.limit - 1, 0), resetAt };
  }

  const nextCount = Number(existing.request_count || 0) + 1;
  if (Number(existing.request_count || 0) >= input.limit) {
    return { allowed: false, count: Number(existing.request_count || 0), remaining: 0, resetAt };
  }

  const { error: updateError } = await supabase
    .from('app_rate_limit_windows')
    .update({
      request_count: nextCount,
      last_request_at: new Date().toISOString()
    })
    .eq('scope', input.scope)
    .eq('bucket_key', input.bucketKey)
    .eq('window_start', windowStart);
  if (updateError) throw updateError;

  return { allowed: true, count: nextCount, remaining: Math.max(input.limit - nextCount, 0), resetAt };
}
