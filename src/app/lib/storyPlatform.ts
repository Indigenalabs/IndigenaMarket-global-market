import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface StoryAuthorRecord {
  type: 'creator' | 'community';
  id: string;
  slug: string;
  name: string;
  roleLabel: string;
  avatar: string;
}

export interface StoryPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  communitySlug: string;
  pillar: string;
  format: 'article' | 'photo-essay' | 'video-story' | 'audio-story';
  tags: string[];
  coverImage: string;
  author: StoryAuthorRecord;
  publishedAt: string;
}

export interface StoryDashboard {
  stories: StoryPostRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'story-platform.json');
const LEGACY_ASSET_MAP: Record<string, string> = {
  '/hero1.jpg': '/launchpad/artist-tour.svg',
  '/hero2.jpg': '/communities/ngarra-banner.svg',
  '/hero3.jpg': '/communities/riverstone-banner.svg',
  '/artists/artist-1.jpg': '/communities/reps/aiyana-redbird.svg',
  '/logo.svg': '/logo.png'
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeAssetPath(value: string) {
  return LEGACY_ASSET_MAP[value] || value;
}

function normalizeStory(story: StoryPostRecord): StoryPostRecord {
  return {
    ...story,
    coverImage: normalizeAssetPath(story.coverImage),
    author: {
      ...story.author,
      avatar: normalizeAssetPath(story.author.avatar)
    }
  };
}

function seedStories(): StoryDashboard {
  const now = nowIso();
  return {
    stories: [
      {
        id: 'storypost-1',
        slug: 'riverstone-market-day-revival',
        title: 'Riverstone market day is back, and the storefront now funds the weaving hall.',
        excerpt: 'A community-owned page changed how elders, artists, and youth split sales and support cultural space.',
        body: 'Riverstone rebuilt its market day around a community storefront, clear representative roles, and revenue routing into a shared weaving hall budget. The key shift was separating social community activity from the actual community seller page.',
        communitySlug: 'riverstone-arts-council',
        pillar: 'physical-items',
        format: 'photo-essay',
        tags: ['community', 'storefront', 'treasury'],
        coverImage: '/communities/riverstone-banner.svg',
        author: {
          type: 'community',
          id: 'acct-community-riverstone',
          slug: 'riverstone-arts-council',
          name: 'Riverstone Arts Council',
          roleLabel: 'Community page',
          avatar: '/logo.svg'
        },
        publishedAt: now
      },
      {
        id: 'storypost-2',
        slug: 'ngarra-archive-lessons-in-language-teaching',
        title: 'How Ngarra teachers moved archive lessons into weekly classroom practice.',
        excerpt: 'A tribe-owned education account used story uploads and course revenue splits to support language continuity.',
        body: 'Ngarra Learning Circle uses its tribe page for archive-guided teaching, course publishing, and restricted treasury rules. Story publishing is handled here, not inside the social community hub.',
        communitySlug: 'ngarra-learning-circle',
        pillar: 'language-heritage',
        format: 'article',
        tags: ['language', 'archive', 'education'],
        coverImage: '/communities/ngarra-banner.svg',
        author: {
          type: 'community',
          id: 'acct-tribe-ngarra',
          slug: 'ngarra-learning-circle',
          name: 'Ngarra Learning Circle',
          roleLabel: 'Tribe page',
          avatar: '/logo.svg'
        },
        publishedAt: now
      },
      {
        id: 'storypost-3',
        slug: 'aiyana-on-sharing-royalties-with-community',
        title: 'Aiyana on why royalty sharing should be set before the first sale.',
        excerpt: 'An artist account and a community account can collaborate cleanly only if the split logic is explicit from day one.',
        body: 'The creator view and the community view should not compete. The creator still has an independent identity, but offerings can intentionally support a community treasury through split rules.',
        communitySlug: 'riverstone-arts-council',
        pillar: 'digital-arts',
        format: 'audio-story',
        tags: ['royalties', 'creator', 'community'],
        coverImage: '/launchpad/artist-tour.svg',
        author: {
          type: 'creator',
          id: 'actor-aiyana',
          slug: 'aiyana-redbird',
          name: 'Aiyana Redbird',
          roleLabel: 'Creator',
          avatar: '/communities/reps/aiyana-redbird.svg'
        },
        publishedAt: now
      }
    ]
  };
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('story platform');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<StoryDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = seedStories();
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoryDashboard>;
    return {
      stories: Array.isArray(parsed.stories)
        ? (parsed.stories as StoryPostRecord[]).map(normalizeStory)
        : []
    };
  } catch {
    const seeded = seedStories();
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(data: StoryDashboard) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function listStories() {
  if (!isSupabaseServerConfigured()) return (await readRuntime()).stories;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('story_posts').select('*').order('published_at', { ascending: false });
  return ((data || []) as any[]).map((row) => ({
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    excerpt: String(row.excerpt || ''),
    body: String(row.body || ''),
    communitySlug: String(row.community_slug || ''),
    pillar: String(row.pillar || ''),
    format: String(row.format || 'article') as StoryPostRecord['format'],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    coverImage: String(row.cover_image || ''),
    author: {
      type: String(row.author_type || 'creator') as StoryAuthorRecord['type'],
      id: String(row.author_id || ''),
      slug: String(row.author_slug || ''),
      name: String(row.author_name || ''),
      roleLabel: String(row.author_role_label || ''),
      avatar: String(row.author_avatar || '')
    },
    publishedAt: String(row.published_at || '')
  }));
}

export async function listStoriesByCommunitySlug(slug: string) {
  return (await listStories()).filter((entry) => entry.communitySlug === slug);
}

export async function getStoryBySlug(slug: string) {
  return (await listStories()).find((entry) => entry.slug === slug) || null;
}
