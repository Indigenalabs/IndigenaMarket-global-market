import { API_BASE_URL, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';
const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

export interface CommunityOverview {
  stats: {
    members: string;
    online: number;
    posts: string;
    artists: string;
  };
  posts: Array<{
    id: string;
    author: { name: string; avatar: string; verified: boolean; role: string };
    content: string;
    image: string | null;
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
    tags: string[];
  }>;
  discussions: Array<{ id: string; title: string; replies: number; views: number; hot: boolean }>;
  hashtags: Array<{ tag: string; posts: string }>;
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export async function fetchCommunityOverview(): Promise<CommunityOverview> {
  const [forumsRes, eventsRes, storiesRes, mentorsRes] = await Promise.all([
    fetchWithTimeout(`${API_BASE}/community/forums`, { cache: 'no-store' }),
    fetchWithTimeout(`${API_BASE}/community/events`, { cache: 'no-store' }),
    fetchWithTimeout(`${API_BASE}/community/stories`, { cache: 'no-store' }),
    fetchWithTimeout(`${API_BASE}/community/mentors`, { cache: 'no-store' })
  ]);

  for (const res of [forumsRes, eventsRes, storiesRes, mentorsRes]) {
    if (!res.ok) throw new Error(await parseApiError(res, 'Community request failed'));
  }

  const forumsJson = (await forumsRes.json()) as Record<string, unknown>;
  const eventsJson = (await eventsRes.json()) as Record<string, unknown>;
  const storiesJson = (await storiesRes.json()) as Record<string, unknown>;
  const mentorsJson = (await mentorsRes.json()) as Record<string, unknown>;

  const forums = (Array.isArray((forumsJson as { data?: unknown[] }).data) ? (forumsJson as { data?: unknown[] }).data : []) as Array<Record<string, unknown>>;
  const events = (Array.isArray((eventsJson as { data?: unknown[] }).data) ? (eventsJson as { data?: unknown[] }).data : []) as Array<Record<string, unknown>>;
  const stories = (Array.isArray((storiesJson as { data?: unknown[] }).data) ? (storiesJson as { data?: unknown[] }).data : []) as Array<Record<string, unknown>>;
  const mentors = (Array.isArray((mentorsJson as { data?: unknown[] }).data) ? (mentorsJson as { data?: unknown[] }).data : []) as Array<Record<string, unknown>>;

  const posts = stories.slice(0, 6).map((story, idx) => ({
    id: String(story.storyId || story._id || `story-${idx + 1}`),
    author: {
      name: String((story.author as Record<string, unknown> | undefined)?.name || 'Community Member'),
      avatar: String((story.author as Record<string, unknown> | undefined)?.avatar || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop'),
      verified: Boolean((story.author as Record<string, unknown> | undefined)?.verified),
      role: String((story.author as Record<string, unknown> | undefined)?.role || 'Member')
    },
    content: String(story.content || story.title || 'Community story'),
    image: story.image ? String(story.image) : null,
    likes: Number(story.likes || 0),
    comments: Number(story.comments || 0),
    shares: Number(story.shares || 0),
    timestamp: String(story.createdAt ? new Date(String(story.createdAt)).toLocaleDateString() : 'Recently'),
    tags: Array.isArray(story.tags) ? (story.tags as string[]) : []
  }));

  const discussions = forums.slice(0, 8).map((forum, idx) => ({
    id: String(forum.forumId || forum._id || `forum-${idx + 1}`),
    title: String(forum.title || forum.name || 'Community forum'),
    replies: Number(forum.replyCount || forum.replies || 0),
    views: Number(forum.views || 0),
    hot: Number(forum.replyCount || forum.replies || 0) > 20
  }));

  const tagCounts = new Map<string, number>();
  posts.forEach((p) => p.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const hashtags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag: tag.startsWith('#') ? tag : `#${tag}`, posts: formatCompact(count) }));

  return {
    stats: {
      members: formatCompact(Number((forumsJson as { totalMembers?: unknown }).totalMembers || forums.length * 40 + mentors.length * 12)),
      online: Math.max(1, Math.round((forums.length + mentors.length + events.length) * 3.2)),
      posts: formatCompact(posts.length || stories.length || 0),
      artists: formatCompact(mentors.length || 0)
    },
    posts,
    discussions,
    hashtags
  };
}
