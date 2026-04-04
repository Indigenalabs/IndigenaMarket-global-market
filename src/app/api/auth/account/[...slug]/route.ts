import { NextRequest, NextResponse } from 'next/server';
import { ensureAccountIdentityFromAccessToken } from '@/app/lib/accountAuthService';

function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;

  if (a === 'me') {
    const token = parseBearerToken(req);
    if (!token) return ok(null);
    try {
      const account = await ensureAccountIdentityFromAccessToken(token);
      return ok(account);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account lookup failed';
      return fail(message, 500);
    }
  }

  return fail('Unsupported account auth endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;

  if (a === 'sync') {
    const token = parseBearerToken(req);
    if (!token) return fail('Authorization bearer token required', 401);
    try {
      const account = await ensureAccountIdentityFromAccessToken(token);
      if (!account) return ok(null);
      return ok(account, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account sync failed';
      return fail(message, 500);
    }
  }

  if (a === 'logout') {
    return ok({ ok: true });
  }

  return fail('Unsupported account auth endpoint', 404);
}
