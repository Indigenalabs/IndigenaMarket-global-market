import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { issueCourseCertificate, findCourseCertificate } from '@/app/lib/courseCertificates';
import { getVerificationProduct } from '@/app/lib/verificationRevenue';
import { createSimplePdf } from '@/app/lib/pdf';
import { enforceCreatorListingCapacityForActor } from '@/app/lib/creatorListingAccess';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';

type JsonMap = Record<string, unknown>;

function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function actor(req: NextRequest) {
  return resolveRequestActorId(req);
}

function mapCourse(row: JsonMap) {
  return {
    courseId: String(row.id),
    title: String(row.title || ''),
    description: String(row.description || ''),
    categoryId: String(row.category || ''),
    skillLevel: String(row.level || ''),
    creatorAddress: String(row.instructor_actor_id || ''),
    averageRating: Number(row.average_rating || 4.8),
    estimatedDuration: Number(row.duration_minutes || 60),
    tags: Array.isArray(row.tags) ? row.tags : [],
    pricing: { amount: Number(row.price || 0), currency: String(row.currency || 'USD') },
    thumbnailUrl: String(row.thumbnail_url || row.thumbnailUrl || ''),
    status: (row.published ? 'published' : 'draft') as string,
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

async function resolveCoursePrice(courseId: string, fallbackAmount = 100) {
  if (!isSupabaseServerConfigured()) return { amount: fallbackAmount, currency: 'USD' };
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('course_listings').select('price,currency').eq('id', courseId).maybeSingle();
  return {
    amount: Number((data as JsonMap | null)?.price || fallbackAmount),
    currency: String((data as JsonMap | null)?.currency || 'USD')
  };
}

async function listCourses(req: NextRequest, searchOnly = false) {
  if (!isSupabaseServerConfigured()) return ok({ courses: [], total: 0, page: 1, pages: 1 });
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '24')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let q = supabase.from('course_listings').select('*', { count: 'exact' });

  const text = String(req.nextUrl.searchParams.get('q') || '').trim();
  if (text) q = q.ilike('title', `%${text}%`);
  const categoryId = String(req.nextUrl.searchParams.get('categoryId') || '').trim();
  if (categoryId) q = q.eq('category', categoryId);
  const level = String(req.nextUrl.searchParams.get('level') || '').trim();
  if (level) q = q.eq('level', level);

  if (!searchOnly) {
    const status = String(req.nextUrl.searchParams.get('status') || '').trim();
    if (status === 'published') q = q.eq('published', true);
  }

  const sort = String(req.nextUrl.searchParams.get('sort') || 'newest');
  if (sort === 'price-low') q = q.order('price', { ascending: true });
  else if (sort === 'price-high') q = q.order('price', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  q = q.range(from, to);
  const { data, count, error } = await q;
  if (error) return fail(error.message, 500);
  const courses = (data || []).map((row) => mapCourse(row as unknown as JsonMap));
  const total = Number(count || courses.length);
  return ok({ courses, count: total, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

async function getCourseById(id: string) {
  if (!isSupabaseServerConfigured()) return ok({ course: null });
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('course_listings').select('*').eq('id', id).maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) return ok({ course: null });
  return ok({ course: mapCourse(data as unknown as JsonMap) });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c] = slug;

  if (!a) return listCourses(req, false);
  if (a === 'search') return listCourses(req, true);
  if (a === 'receipts' && b === 'me') {
    if (!isSupabaseServerConfigured()) return ok({ receipts: [] });
    const supabase = createSupabaseServerClient();
    const rows = await supabase.from('course_receipts').select('*').eq('student_actor_id', actor(req)).order('created_at', { ascending: false }).limit(100);
    if (rows.error) return fail(rows.error.message, 500);
    return ok({
      receipts: (rows.data || []).map((r) => ({
        receiptId: (r as JsonMap).receipt_id,
        courseId: (r as JsonMap).course_id,
        studentAddress: (r as JsonMap).student_actor_id,
        amount: Number((r as JsonMap).amount || 0),
        currency: (r as JsonMap).currency || 'USD',
        status: (r as JsonMap).status || 'captured',
        feeBreakdown: ((r as JsonMap).payment_breakdown as JsonMap | undefined) || null,
        createdAt: (r as JsonMap).created_at
      }))
    });
  }
  if (a === 'enrollments' && b === 'me') {
    if (!isSupabaseServerConfigured()) return ok({ enrollments: [] });
    const supabase = createSupabaseServerClient();
    const rows = await supabase.from('course_enrollments').select('*').eq('student_actor_id', actor(req)).order('created_at', { ascending: false }).limit(100);
    if (rows.error) return fail(rows.error.message, 500);
    return ok({ enrollments: (rows.data || []).map((r) => ({ courseId: (r as JsonMap).course_id, title: 'Course', status: (r as JsonMap).status, completed: Boolean((r as JsonMap).completed), enrolledAt: (r as JsonMap).enrolled_at, completedAt: (r as JsonMap).completed_at, certificateNftId: (r as JsonMap).certificate_nft_id })) });
  }
  if (a === 'profiles' && b) {
    return ok({ profile: { walletAddress: b, displayName: 'Creator', tribalAffiliation: 'Indigenous Nation' } });
  }

  if (a && !b) return getCourseById(a);
  if (a && b === 'progress') {
    if (!isSupabaseServerConfigured()) return ok({ progress: { percentComplete: 0, completedModules: [] }, completed: false });
    const supabase = createSupabaseServerClient();
    const row = await supabase.from('course_progress').select('*').eq('course_id', a).eq('student_actor_id', actor(req)).maybeSingle();
    if (row.error) return fail(row.error.message, 500);
    const p = row.data as JsonMap | null;
    return ok({
      progress: {
        completedModules: Array.isArray(p?.completed_modules) ? p?.completed_modules : [],
        percentComplete: Number(p?.percent_complete || 0),
        currentLessonId: p?.current_lesson_id || undefined,
        resumePositionSec: Number(p?.resume_position_sec || 0),
        lastAccessed: p?.last_accessed || undefined
      },
      completed: Number(p?.percent_complete || 0) >= 100
    });
  }
  if (a && b === 'certificate-status') {
    const studentActorId = actor(req);
    let completed = false;
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const row = await supabase
        .from('course_progress')
        .select('percent_complete')
        .eq('course_id', a)
        .eq('student_actor_id', studentActorId)
        .maybeSingle();
      if (row.error) return fail(row.error.message, 500);
      completed = Number((row.data as JsonMap | null)?.percent_complete || 0) >= 100;
    }
    const certificate = await findCourseCertificate(a, studentActorId);
    return ok({ completed, certificate });
  }
  if (a && b === 'certificate-pdf') {
    const studentActorId = actor(req);
    const certificate = await findCourseCertificate(a, studentActorId);
    if (!certificate) return fail('Certificate not issued yet.', 404);
    const courseResponse = await getCourseById(a);
    const coursePayload = await courseResponse.json();
    const course = (coursePayload?.course || null) as ReturnType<typeof mapCourse> | null;
    const pdf = createSimplePdf([
      'Indigena Global Market',
      'Certificate of Completion',
      `Certificate ID: ${certificate.certificateId}`,
      `Course: ${course?.title || a}`,
      `Learner: ${studentActorId}`,
      `Issued: ${new Date(certificate.issuedAt).toLocaleDateString('en-AU')}`,
      `Verification: ${certificate.verificationUrl}`
    ]);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=\"course-certificate-${a}.pdf\"`
      }
    });
  }

  return fail('Unsupported courses endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  const body = (await req.json().catch(() => ({}))) as JsonMap;

  if (!a && body.courseId && body.studentAddress) {
    // not used
  }

  if (a === 'enroll') {
    const courseId = String(body.courseId || '').trim();
    const studentAddress = String(body.studentAddress || actor(req)).trim().toLowerCase();
    if (!courseId || !studentAddress) return fail('courseId and studentAddress are required');
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const id = `enr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await supabase.from('course_enrollments').upsert({ id, course_id: courseId, student_actor_id: studentAddress, status: 'active', completed: false, updated_at: new Date().toISOString() }, { onConflict: 'course_id,student_actor_id' });
    }
    return ok({ success: true, enrolled: true, courseId, studentAddress });
  }

  if (a === 'create') {
      await enforceCreatorListingCapacityForActor({
        actorId: actor(req),
        currentCount: isSupabaseServerConfigured()
          ? Number((await createSupabaseServerClient().from('course_listings').select('*', { count: 'exact', head: true }).eq('instructor_actor_id', actor(req))).count || 0)
          : 0
      });
      const id = `crs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const row: JsonMap = {
      id,
      instructor_actor_id: actor(req),
      title: String(body.title || 'Untitled Course'),
      description: String(body.description || ''),
      category: String(body.categoryId || body.category || 'general'),
      price: Number((body.pricing as JsonMap | undefined)?.amount || body.price || 0),
      currency: String((body.pricing as JsonMap | undefined)?.currency || 'USD'),
      level: String(body.skillLevel || body.level || 'beginner'),
      duration_minutes: Number(body.estimatedDuration || 60),
      metadata: body,
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const ins = await supabase.from('course_listings').insert(row).select('*').single();
      if (ins.error) return fail(ins.error.message, 500);
      return ok({ course: mapCourse(ins.data as unknown as JsonMap) }, 201);
    }
    return ok({ course: mapCourse(row) }, 201);
  }

  if (a && b === 'payment-intent') {
    const pricing = await resolveCoursePrice(a, Number(body.amount || 100));
    const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
    const quote = calculateTransactionQuote({
      pillar: 'courses',
      subtotal: pricing.amount,
      creatorPlanId,
      memberPlanId
    });
    return ok({
      paymentIntent: {
        intentId: `pi-${Date.now()}`,
        clientSecret: `cs-${Date.now()}`,
        amount: quote.buyerTotal,
        currency: pricing.currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      },
      feeBreakdown: quote
    });
  }

  if (a && b === 'payment-confirm') {
    const receiptId = `rcpt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const studentAddress = String(body.studentAddress || actor(req)).trim().toLowerCase();
    const pricing = await resolveCoursePrice(a, Number(body.amount || 100));
    const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
    const quote = calculateTransactionQuote({
      pillar: 'courses',
      subtotal: pricing.amount,
      creatorPlanId,
      memberPlanId
    });
    let instructorActorId = '';
    let courseTitle = a;
    if (isSupabaseServerConfigured()) {
      const listingRow = await createSupabaseServerClient().from('course_listings').select('instructor_actor_id,title').eq('id', a).maybeSingle();
      instructorActorId = String((listingRow.data as JsonMap | null)?.instructor_actor_id || '');
      courseTitle = String((listingRow.data as JsonMap | null)?.title || a);
    }
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('course_receipts').insert({
        receipt_id: receiptId,
        course_id: a,
        student_actor_id: studentAddress,
        amount: quote.buyerTotal,
        currency: pricing.currency,
        status: 'captured',
        payment_breakdown: {
          subtotal: quote.subtotal,
          buyerServiceFee: quote.buyerServiceFee,
          platformFee: quote.platformFee,
          buyerTotal: quote.buyerTotal,
          creatorNet: quote.creatorNet
        },
        created_at: new Date().toISOString()
      });
    }
    if (instructorActorId) {
      await appendFinanceLedgerEntry({
        id: `fin-ledger-${receiptId}`,
        actorId: instructorActorId,
        profileSlug: instructorActorId,
        pillar: 'courses',
        type: 'sale',
        status: 'paid',
        item: courseTitle,
        grossAmount: Number(quote.subtotal),
        platformFeeAmount: Number(quote.platformFee),
        processorFeeAmount: 0,
        escrowFeeAmount: 0,
        refundAmount: 0,
        disputeAmount: 0,
        creatorNetAmount: Number(quote.creatorNet),
        disputeReason: '',
        sourceType: 'course',
        sourceId: a,
        metadata: {
          currency: pricing.currency,
          receiptId
        },
        createdAt: new Date().toISOString()
      });
    }
    return ok({ success: true, receiptId, amount: quote.buyerTotal, currency: pricing.currency, feeBreakdown: quote });
  }

  if (a && b === 'watchlist') return ok({ success: true });
  if (a && b === 'share') return ok({ success: true });
  if (a && b === 'report') return ok({ success: true });
  if (a && b === 'submit') return ok({ success: true, status: 'in_review' });
  if (a && b === 'publish') {
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('course_listings').update({ published: true, updated_at: new Date().toISOString() }).eq('id', a);
    }
    return ok({ success: true, status: 'published' });
  }

  if (a && b === 'progress') {
    const studentAddress = String(body.studentAddress || actor(req)).trim().toLowerCase();
    const existingModules = Array.isArray(body.completedModules) ? body.completedModules : [];
    const completedModuleId = String(body.completedModuleId || '').trim();
    const completedModules = [...new Set([...(existingModules as string[]), ...(completedModuleId ? [completedModuleId] : [])])];
    const percent = Math.max(0, Math.min(100, Number(body.percentComplete || completedModules.length * 10)));
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('course_progress').upsert({
        id: `prg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        course_id: a,
        student_actor_id: studentAddress,
        completed_modules: completedModules,
        percent_complete: percent,
        current_lesson_id: body.currentLessonId || null,
        resume_position_sec: Number(body.resumePositionSec || 0),
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'course_id,student_actor_id' });
    }
    return ok({ success: true, progress: { completedModules, percentComplete: percent } });
  }
  if (a && b === 'certificate-issue') {
    const studentActorId = actor(req);
    const product = getVerificationProduct('course-certificate');
    if (!product) return fail('Course certificate product missing.', 500);

    let completed = false;
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const row = await supabase
        .from('course_progress')
        .select('percent_complete')
        .eq('course_id', a)
        .eq('student_actor_id', studentActorId)
        .maybeSingle();
      if (row.error) return fail(row.error.message, 500);
      completed = Number((row.data as JsonMap | null)?.percent_complete || 0) >= 100;
    } else {
      completed = true;
    }
    if (!completed) return fail('Complete the course before issuing a certificate.', 409);

    const certificate = await issueCourseCertificate({
      courseId: a,
      studentActorId,
      amount: product.amount,
      currency: 'USD'
    });

    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase
        .from('course_enrollments')
        .update({
          certificate_nft_id: certificate.certificateId,
          completed: true,
          completed_at: certificate.issuedAt,
          updated_at: new Date().toISOString()
        })
        .eq('course_id', a)
        .eq('student_actor_id', studentActorId);
    }

    return ok({ certificate }, 201);
  }

  return fail('Unsupported courses endpoint', 404);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [courseId] = slug;
  if (!courseId) return fail('courseId is required');
  const payload = (await req.json().catch(() => ({}))) as JsonMap;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const updates: JsonMap = {
      title: payload.title || undefined,
      description: payload.description || undefined,
      category: payload.categoryId || payload.category || undefined,
      level: payload.skillLevel || payload.level || undefined,
      price: Number((payload.pricing as JsonMap | undefined)?.amount || payload.price || 0),
      currency: String((payload.pricing as JsonMap | undefined)?.currency || 'USD'),
      duration_minutes: Number(payload.estimatedDuration || 60),
      metadata: payload,
      updated_at: new Date().toISOString()
    };
    const res = await supabase.from('course_listings').update(updates).eq('id', courseId).select('*').maybeSingle();
    if (res.error) return fail(res.error.message, 500);
    return ok({ course: res.data ? mapCourse(res.data as unknown as JsonMap) : null });
  }
  return ok({ course: { courseId } });
}
