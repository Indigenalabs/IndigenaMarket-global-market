import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface WorkspaceRoomRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  communitySlug: string;
  status: 'active' | 'planning' | 'completed';
  members: Array<{ actorId: string; label: string; role: string }>;
  taskCount: number;
  fileCount: number;
  threadCount: number;
  focus: string;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'workspace-rooms.json');

function seedRooms(): WorkspaceRoomRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'workspace-1',
      slug: 'riverstone-summer-market-launch',
      title: 'Riverstone Summer Market Launch',
      summary: 'A joint workspace for launch planning, listing QA, and champion support tasks.',
      communitySlug: 'riverstone-arts-council',
      status: 'active',
      members: [
        { actorId: 'actor-riverstone-steward', label: 'Talia Riverstone', role: 'Lead representative' },
        { actorId: 'actor-aiyana', label: 'Aiyana Redbird', role: 'Creator collaborator' }
      ],
      taskCount: 9,
      fileCount: 14,
      threadCount: 5,
      focus: 'Storefront launch and pricing review',
      updatedAt: now
    },
    {
      id: 'workspace-2',
      slug: 'ngarra-school-archive-sprint',
      title: 'Ngarra School Archive Sprint',
      summary: 'Story capture, transcript review, and archive release coordination for classroom delivery.',
      communitySlug: 'ngarra-learning-circle',
      status: 'planning',
      members: [
        { actorId: 'actor-ngarra-chair', label: 'Marra Ngarra', role: 'Program lead' },
        { actorId: 'actor-elder-lila', label: 'Elder Lila', role: 'Protocol reviewer' }
      ],
      taskCount: 6,
      fileCount: 11,
      threadCount: 4,
      focus: 'Archive lesson release prep',
      updatedAt: now
    }
  ];
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('workspace rooms');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<WorkspaceRoomRecord[]> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = seedRooms();
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as WorkspaceRoomRecord[] : [];
  } catch {
    const seeded = seedRooms();
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(data: WorkspaceRoomRecord[]) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function listWorkspaceRooms() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('workspace_rooms').select('*').order('updated_at', { ascending: false });
  if (error || !data || data.length === 0) return readRuntime();
  return (data as any[]).map((row) => ({
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    summary: String(row.summary || ''),
    communitySlug: String(row.community_slug || ''),
    status: String(row.status || 'planning') as WorkspaceRoomRecord['status'],
    members: Array.isArray(row.members) ? row.members : [],
    taskCount: Number(row.task_count || 0),
    fileCount: Number(row.file_count || 0),
    threadCount: Number(row.thread_count || 0),
    focus: String(row.focus || ''),
    updatedAt: String(row.updated_at || '')
  }));
}

export async function getWorkspaceRoomBySlug(slug: string) {
  return (await listWorkspaceRooms()).find((entry) => entry.slug === slug) || null;
}
