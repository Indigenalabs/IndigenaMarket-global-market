import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

export async function GET(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ courses: [], total: 0, page: 1, pages: 1 });
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '24')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase.from('course_listings').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  const categoryId = String(req.nextUrl.searchParams.get('categoryId') || '').trim();
  const level = String(req.nextUrl.searchParams.get('level') || '').trim();
  const status = String(req.nextUrl.searchParams.get('status') || '').trim();
  if (categoryId) q = q.eq('category', categoryId);
  if (level) q = q.eq('level', level);
  if (status === 'published') q = q.eq('published', true);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  const courses = (data || []).map((row: any) => ({
    courseId: row.id,
    title: row.title,
    description: row.description,
    categoryId: row.category,
    skillLevel: row.level,
    creatorAddress: row.instructor_actor_id,
    averageRating: Number(row.average_rating || 4.8),
    estimatedDuration: Number(row.duration_minutes || 60),
    tags: Array.isArray(row.tags) ? row.tags : [],
    pricing: { amount: Number(row.price || 0), currency: row.currency || 'USD' },
    thumbnailUrl: row.thumbnail_url || '',
    status: row.published ? 'published' : 'draft',
    createdAt: row.created_at
  }));
  const total = Number(count || courses.length);
  return NextResponse.json({ courses, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}
