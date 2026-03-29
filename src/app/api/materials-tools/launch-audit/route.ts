import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import {
  coopCommitments,
  materialsToolsOrders,
  products,
  rentalBookings,
  suppliers
} from '@/app/materials-tools/data/pillar10Data';

export async function GET() {
  const configured = isSupabaseServerConfigured();
  const base = {
    supabaseConfigured: configured,
    proofBucketConfigured: Boolean(process.env.SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET),
    paymentWebhookConfigured: Boolean(process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET || process.env.NODE_ENV !== 'production'),
    productionLike: configured && Boolean(process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET)
  };

  if (!configured) {
    return NextResponse.json({
      ...base,
      source: 'mock',
      counts: {
        listings: products.length,
        suppliers: suppliers.length,
        orders: materialsToolsOrders.length,
        bookings: rentalBookings.length,
        commitments: coopCommitments.length
      }
    });
  }

  const supabase = createSupabaseServerClient();
  const [listings, suppliersCount, ordersCount, bookingsCount, commitmentsCount] = await Promise.all([
    supabase.from('materials_tools_listings').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_orders').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_rental_bookings').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_coop_commitments').select('*', { count: 'exact', head: true })
  ]);

  return NextResponse.json({
    ...base,
    source: 'api',
    counts: {
      listings: Number(listings.count || 0),
      suppliers: Number(suppliersCount.count || 0),
      orders: Number(ordersCount.count || 0),
      bookings: Number(bookingsCount.count || 0),
      commitments: Number(commitmentsCount.count || 0)
    }
  });
}
