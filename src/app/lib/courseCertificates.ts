import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface CourseCertificateRecord {
  certificateId: string;
  courseId: string;
  studentActorId: string;
  amount: number;
  currency: string;
  status: 'issued' | 'pending' | 'cancelled';
  issuedAt: string;
  verificationUrl: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'course-certificates.json');

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

function normalizeRow(row: Record<string, unknown>): CourseCertificateRecord {
  return {
    certificateId: String(row.certificate_id || ''),
    courseId: String(row.course_id || ''),
    studentActorId: String(row.student_actor_id || ''),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'issued') as CourseCertificateRecord['status'],
    issuedAt: String(row.issued_at || ''),
    verificationUrl: String(row.verification_url || '')
  };
}

export async function findCourseCertificate(courseId: string, studentActorId: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('course_certificate_issuances')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_actor_id', studentActorId)
      .maybeSingle();
    return data ? normalizeRow(data as Record<string, unknown>) : null;
  }

  const runtime = await readRuntime();
  return runtime.find((entry) => entry.courseId === courseId && entry.studentActorId === studentActorId) || null;
}

export async function listCourseCertificates(limit = 100) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('course_certificate_issuances')
      .select('*')
      .order('issued_at', { ascending: false })
      .limit(limit);
    return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntime();
  return runtime.slice(0, limit);
}

export async function updateCourseCertificateStatus(input: {
  certificateId: string;
  status: CourseCertificateRecord['status'];
  reissued?: boolean;
}) {
  const nextIssuedAt = input.reissued ? new Date().toISOString() : undefined;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('course_certificate_issuances')
      .update({
        status: input.status,
        issued_at: nextIssuedAt || undefined
      })
      .eq('certificate_id', input.certificateId)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as Record<string, unknown>);
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
  return updated.find((entry) => entry.certificateId === input.certificateId) || null;
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
