import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertPrivateStorageAvailable } from '@/app/lib/runtimePersistence';

export const runtime = 'nodejs';

const ENTERPRISE_CONTRACT_BUCKET =
  process.env.SUPABASE_ENTERPRISE_CONTRACT_BUCKET || 'enterprise-contracts';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ message: 'Invalid contract upload payload.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Choose a contract file to upload.' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || 'application/octet-stream';
  const fileName = file.name || `contract-${Date.now()}.bin`;

  try {
    assertPrivateStorageAvailable('enterprise contract uploads');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Private storage is unavailable.';
    return NextResponse.json({ message }, { status: 503 });
  }

  if (isSupabaseServerConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      const path = `contracts/${Date.now()}-${sanitizeFileName(fileName)}`;
      const { error: uploadError } = await supabase.storage.from(ENTERPRISE_CONTRACT_BUCKET).upload(path, bytes, {
        contentType,
        upsert: true
      });
      if (!uploadError) {
        return NextResponse.json({ data: { ok: true, fileName, storagePath: path, privateStorage: true } });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Contract upload failed.';
      return NextResponse.json({ message }, { status: 500 });
    }
  }
  return NextResponse.json({ message: 'Private contract storage is not configured.' }, { status: 503 });
}
