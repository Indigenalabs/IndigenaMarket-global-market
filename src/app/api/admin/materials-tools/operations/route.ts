import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { getMaterialsToolsOperationsDashboard, updateMaterialsToolsActionReview } from '@/app/lib/materialsToolsOps';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import {
  coopCommitments,
  materialsToolsOrders,
  products,
  rentalBookings,
  suppliers,
} from '@/app/materials-tools/data/pillar10Data';

async function buildLaunchAuditSnapshot() {
  const configured = isSupabaseServerConfigured();
  const base = {
    supabaseConfigured: configured,
    proofBucketConfigured: Boolean(process.env.SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET),
    paymentWebhookConfigured: Boolean(
      process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET || process.env.NODE_ENV !== 'production',
    ),
    productionLike: configured && Boolean(process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET),
  };

  if (!configured) {
    return {
      ...base,
      source: 'mock' as const,
      counts: {
        listings: products.length,
        suppliers: suppliers.length,
        orders: materialsToolsOrders.length,
        bookings: rentalBookings.length,
        commitments: coopCommitments.length,
      },
    };
  }

  const supabase = createSupabaseServerClient();
  const [listings, suppliersCount, ordersCount, bookingsCount, commitmentsCount] = await Promise.all([
    supabase.from('materials_tools_listings').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_orders').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_rental_bookings').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_coop_commitments').select('*', { count: 'exact', head: true }),
  ]);

  return {
    ...base,
    source: 'api' as const,
    counts: {
      listings: Number(listings.count || 0),
      suppliers: Number(suppliersCount.count || 0),
      orders: Number(ordersCount.count || 0),
      bookings: Number(bookingsCount.count || 0),
      commitments: Number(commitmentsCount.count || 0),
    },
  };
}

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  return NextResponse.json({
    dashboard: await getMaterialsToolsOperationsDashboard(),
    audit: await buildLaunchAuditSnapshot(),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id || '').trim();
  const status = String(body.status || '').trim();
  const note = String(body.note || '').trim();
  if (!id || !status) {
    return NextResponse.json({ message: 'id and status are required' }, { status: 400 });
  }
  if (!['pending', 'in-review', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ message: 'Unsupported materials-tools review status' }, { status: 400 });
  }
  const action = await updateMaterialsToolsActionReview({
    id,
    status: status as never,
    note,
    reviewedBy: auth.identity?.actorId || 'materials-tools-ops',
  });
  return NextResponse.json({ action });
}
