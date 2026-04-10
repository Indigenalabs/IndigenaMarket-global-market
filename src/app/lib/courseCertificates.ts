import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { XrplTrustStatus } from '@/app/lib/xrplTrustLayer';

export interface CourseCertificateRecord {
  certificateId: string;
  courseId: string;
  studentActorId: string;
  amount: number;
  currency: string;
  status: 'issued' | 'pending' | 'cancelled';
  issuedAt: string;
  verificationUrl: string;
  trustRecordId?: string;
  trustStatus?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'course-certificates.json');
const TRUST_FILE = path.join(RUNTIME_DIR, 'course-certificates-trust.json');

interface CourseCertificateTrustSupplement {
  certificateId: string;
  trustRecordId?: string;
  trustStatus?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
}

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('course certificates');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<CourseCertificateRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CourseCertificateRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: CourseCertificateRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

async function readTrustRuntime(): Promise<CourseCertificateTrustSupplement[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(TRUST_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CourseCertificateTrustSupplement[]) : [];
  } catch {
    return [];
  }
}

async function writeTrustRuntime(records: CourseCertificateTrustSupplement[]) {
  await ensureRuntimeDir();
  await fs.writeFile(TRUST_FILE, JSON.stringify(records, null, 2), 'utf8');
}

async function findCertificateById(certificateId: string) {
  const trustRuntime = await readTrustRuntime();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('course_certificate_issuances')
      .select('*')
      .eq('certificate_id', certificateId)
      .maybeSingle();
    if (error && !shouldFallback(error)) throw error;
    if (data) {
      return normalizeRow(
        data as Record<string, unknown>,
        trustRuntime.find((entry) => entry.certificateId === String((data as Record<string, unknown>).certificate_id || ''))
      );
    }
  }

  const runtime = await readRuntime();
  const match = runtime.find((entry) => entry.certificateId === certificateId) || null;
  if (!match) return null;
  return {
    ...match,
    ...(trustRuntime.find((entry) => entry.certificateId === certificateId) || {})
  };
}

function shouldFallback(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = String((error as Record<string, unknown>).code || '');
  const message = String((error as Record<string, unknown>).message || '').toLowerCase();
  return code === '42P01' || code === '42703' || code === 'PGRST204' || message.includes('column') || message.includes('schema cache');
}

function normalizeRow(row: Record<string, unknown>, trust?: CourseCertificateTrustSupplement): CourseCertificateRecord {
  return {
    certificateId: String(row.certificate_id || ''),
    courseId: String(row.course_id || ''),
    studentActorId: String(row.student_actor_id || ''),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'issued') as CourseCertificateRecord['status'],
    issuedAt: String(row.issued_at || ''),
    verificationUrl: String(row.verification_url || ''),
    trustRecordId: String(row.trust_record_id || trust?.trustRecordId || ''),
    trustStatus: String(row.trust_status || trust?.trustStatus || '') as XrplTrustStatus,
    xrplTransactionHash: String(row.xrpl_transaction_hash || trust?.xrplTransactionHash || ''),
    xrplTokenId: String(row.xrpl_token_id || trust?.xrplTokenId || ''),
    xrplLedgerIndex: String(row.xrpl_ledger_index || trust?.xrplLedgerIndex || ''),
    anchorUri: String(row.anchor_uri || trust?.anchorUri || '')
  };
}

export async function findCourseCertificate(courseId: string, studentActorId: string) {
  const trustRuntime = await readTrustRuntime();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('course_certificate_issuances')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_actor_id', studentActorId)
      .maybeSingle();
    if (error && !shouldFallback(error)) throw error;
    if (data) {
      return normalizeRow(
        data as Record<string, unknown>,
        trustRuntime.find((entry) => entry.certificateId === String((data as Record<string, unknown>).certificate_id || ''))
      );
    }
  }

  const runtime = await readRuntime();
  return runtime.find((entry) => entry.courseId === courseId && entry.studentActorId === studentActorId) || null;
}

export async function listCourseCertificates(limit = 100) {
  const trustRuntime = await readTrustRuntime();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('course_certificate_issuances')
      .select('*')
      .order('issued_at', { ascending: false })
      .limit(limit);
    if (error && !shouldFallback(error)) throw error;
    if (data) {
      return (data || []).map((row) =>
        normalizeRow(
          row as Record<string, unknown>,
          trustRuntime.find((entry) => entry.certificateId === String((row as Record<string, unknown>).certificate_id || ''))
        )
      );
    }
  }

  const runtime = await readRuntime();
  return runtime.slice(0, limit);
}

export async function updateCourseCertificateStatus(input: {
  certificateId: string;
  status: CourseCertificateRecord['status'];
  reissued?: boolean;
  trustRecordId?: string;
  trustStatus?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
}) {
  const nextIssuedAt = input.reissued ? new Date().toISOString() : undefined;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const trustPayload = {
      trust_record_id: input.trustRecordId || undefined,
      trust_status: input.trustStatus || undefined,
      xrpl_transaction_hash: input.xrplTransactionHash || undefined,
      xrpl_token_id: input.xrplTokenId || undefined,
      xrpl_ledger_index: input.xrplLedgerIndex || undefined,
      anchor_uri: input.anchorUri || undefined
    };
    const { data, error } = await supabase
      .from('course_certificate_issuances')
      .update({
        status: input.status,
        issued_at: nextIssuedAt || undefined,
        ...trustPayload
      })
      .eq('certificate_id', input.certificateId)
      .select('*')
      .single();
    if (!error && data) {
      if (input.trustRecordId || input.trustStatus || input.xrplTransactionHash || input.xrplTokenId || input.xrplLedgerIndex || input.anchorUri) {
        await upsertCourseCertificateTrustLink({
          certificateId: input.certificateId,
          trustRecordId: input.trustRecordId,
          trustStatus: input.trustStatus,
          xrplTransactionHash: input.xrplTransactionHash,
          xrplTokenId: input.xrplTokenId,
          xrplLedgerIndex: input.xrplLedgerIndex,
          anchorUri: input.anchorUri
        });
      }
      return normalizeRow(data as Record<string, unknown>);
    }
    if (error && !shouldFallback(error)) throw error;
    const baseUpdate = await supabase
      .from('course_certificate_issuances')
      .update({
        status: input.status,
        issued_at: nextIssuedAt || undefined
      })
      .eq('certificate_id', input.certificateId)
      .select('*')
      .single();
    if (baseUpdate.error) throw baseUpdate.error;
    await upsertCourseCertificateTrustLink({
      certificateId: input.certificateId,
      trustRecordId: input.trustRecordId,
      trustStatus: input.trustStatus,
      xrplTransactionHash: input.xrplTransactionHash,
      xrplTokenId: input.xrplTokenId,
      xrplLedgerIndex: input.xrplLedgerIndex,
      anchorUri: input.anchorUri
    });
    if (baseUpdate.data) {
      return normalizeRow(baseUpdate.data as Record<string, unknown>, {
        certificateId: input.certificateId,
        trustRecordId: input.trustRecordId,
        trustStatus: input.trustStatus,
        xrplTransactionHash: input.xrplTransactionHash,
        xrplTokenId: input.xrplTokenId,
        xrplLedgerIndex: input.xrplLedgerIndex,
        anchorUri: input.anchorUri
      });
    }

    const refreshed = await findCertificateById(input.certificateId);
    if (refreshed) return refreshed;
  }

  const runtime = await readRuntime();
  const updated = runtime.map((entry) =>
    entry.certificateId === input.certificateId
      ? {
          ...entry,
          status: input.status,
          issuedAt: nextIssuedAt || entry.issuedAt
        }
      : entry
  );
  await writeRuntime(updated);
  if (input.trustRecordId || input.trustStatus || input.xrplTransactionHash || input.xrplTokenId || input.xrplLedgerIndex || input.anchorUri) {
    await upsertCourseCertificateTrustLink({
      certificateId: input.certificateId,
      trustRecordId: input.trustRecordId,
      trustStatus: input.trustStatus,
      xrplTransactionHash: input.xrplTransactionHash,
      xrplTokenId: input.xrplTokenId,
      xrplLedgerIndex: input.xrplLedgerIndex,
      anchorUri: input.anchorUri
    });
  }
  return (await findCertificateById(input.certificateId)) || updated.find((entry) => entry.certificateId === input.certificateId) || null;
}

export async function issueCourseCertificate(input: {
  courseId: string;
  studentActorId: string;
  amount: number;
  currency: string;
}) {
  const existing = await findCourseCertificate(input.courseId, input.studentActorId);
  if (existing) return existing;

  const issuedAt = new Date().toISOString();
  const record: CourseCertificateRecord = {
    certificateId: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    courseId: input.courseId,
    studentActorId: input.studentActorId,
    amount: input.amount,
    currency: input.currency,
    status: 'issued',
    issuedAt,
    verificationUrl: `https://indigena.market/verify/course/${input.courseId}/${input.studentActorId}`
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('course_certificate_issuances')
      .insert({
        certificate_id: record.certificateId,
        course_id: record.courseId,
        student_actor_id: record.studentActorId,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        issued_at: record.issuedAt,
        verification_url: record.verificationUrl
      })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as Record<string, unknown>);
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function upsertCourseCertificateTrustLink(input: CourseCertificateTrustSupplement) {
  const next: CourseCertificateTrustSupplement = {
    certificateId: input.certificateId,
    trustRecordId: input.trustRecordId || '',
    trustStatus: input.trustStatus,
    xrplTransactionHash: input.xrplTransactionHash || '',
    xrplTokenId: input.xrplTokenId || '',
    xrplLedgerIndex: input.xrplLedgerIndex || '',
    anchorUri: input.anchorUri || ''
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('course_certificate_issuances')
      .update({
        trust_record_id: next.trustRecordId || null,
        trust_status: next.trustStatus || null,
        xrpl_transaction_hash: next.xrplTransactionHash || null,
        xrpl_token_id: next.xrplTokenId || null,
        xrpl_ledger_index: next.xrplLedgerIndex || null,
        anchor_uri: next.anchorUri || null
      })
      .eq('certificate_id', next.certificateId);
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readTrustRuntime();
  const existingIndex = runtime.findIndex((entry) => entry.certificateId === next.certificateId);
  if (existingIndex >= 0) runtime[existingIndex] = { ...runtime[existingIndex], ...next };
  else runtime.unshift(next);
  await writeTrustRuntime(runtime);
  return next;
}
