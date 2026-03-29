import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type WebhookEventStatus = 'processing' | 'processed' | 'ignored' | 'failed';

export type WebhookEventRecord = {
  provider: string;
  eventId: string;
  status: WebhookEventStatus;
  payloadFingerprint: string;
  firstSeenAt: string;
  lastSeenAt: string;
  processedAt?: string;
  attemptCount: number;
  resultSummary?: string;
  metadata?: Record<string, string>;
};

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'webhook-events.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('webhook event log');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<WebhookEventRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WebhookEventRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: WebhookEventRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function fingerprintPayload(rawBody: string) {
  return crypto.createHash('sha256').update(rawBody).digest('hex');
}

export async function beginWebhookEvent(input: {
  provider: string;
  eventId: string;
  rawBody: string;
  metadata?: Record<string, string>;
}) {
  const records = await readRuntime();
  const fingerprint = fingerprintPayload(input.rawBody);
  const now = new Date().toISOString();
  const index = records.findIndex(
    (entry) => entry.provider === input.provider && entry.eventId === input.eventId
  );

  if (index >= 0) {
    const existing = records[index];
    const duplicate = existing.status === 'processed' || existing.status === 'ignored' || existing.status === 'processing';
    records[index] = {
      ...existing,
      lastSeenAt: now,
      attemptCount: existing.attemptCount + 1,
      metadata: input.metadata ? { ...(existing.metadata || {}), ...input.metadata } : existing.metadata
    };
    await writeRuntime(records);
    return {
      duplicate,
      record: records[index]
    };
  }

  const record: WebhookEventRecord = {
    provider: input.provider,
    eventId: input.eventId,
    status: 'processing',
    payloadFingerprint: fingerprint,
    firstSeenAt: now,
    lastSeenAt: now,
    attemptCount: 1,
    metadata: input.metadata
  };
  records.unshift(record);
  await writeRuntime(records);
  return { duplicate: false, record };
}

export async function completeWebhookEvent(input: {
  provider: string;
  eventId: string;
  status: Exclude<WebhookEventStatus, 'processing'>;
  resultSummary?: string;
  metadata?: Record<string, string>;
}) {
  const records = await readRuntime();
  const now = new Date().toISOString();
  const index = records.findIndex(
    (entry) => entry.provider === input.provider && entry.eventId === input.eventId
  );

  const nextRecord: WebhookEventRecord = index >= 0
    ? {
        ...records[index],
        status: input.status,
        lastSeenAt: now,
        processedAt: now,
        resultSummary: input.resultSummary,
        metadata: input.metadata ? { ...(records[index].metadata || {}), ...input.metadata } : records[index].metadata
      }
    : {
        provider: input.provider,
        eventId: input.eventId,
        status: input.status,
        payloadFingerprint: '',
        firstSeenAt: now,
        lastSeenAt: now,
        processedAt: now,
        attemptCount: 1,
        resultSummary: input.resultSummary,
        metadata: input.metadata
      };

  if (index >= 0) {
    records[index] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  await writeRuntime(records);
  return nextRecord;
}
