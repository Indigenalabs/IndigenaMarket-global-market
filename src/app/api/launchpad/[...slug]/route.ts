import { NextResponse } from 'next/server';
import { getLaunchpadSupportTiers, type LaunchpadCadence, type LaunchpadCategory, type LaunchpadCampaignStatus, type LaunchpadSupportTier } from '@/app/lib/launchpad';
import {
  createLaunchpadCampaign,
  getLaunchpadCampaignRecordBySlug,
  listLaunchpadCampaignsForAccount,
  updateLaunchpadCampaignStatus
} from '@/app/lib/launchpadCampaignStore';
import { createLaunchpadReceipt, getLaunchpadReceiptById, listLaunchpadReceiptsByCampaignSlug } from '@/app/lib/launchpadSupport';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.map((entry) => text(entry)).filter(Boolean);
}

function normalizeStatus(value: unknown): LaunchpadCampaignStatus {
  const raw = text(value);
  if (raw === 'draft' || raw === 'pending_review' || raw === 'published') return raw;
  return 'published';
}

function normalizeSupportTiers(value: unknown): { oneTime: LaunchpadSupportTier[]; monthly: LaunchpadSupportTier[] } | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;

  const parseList = (raw: unknown, cadence: LaunchpadCadence) => {
    if (!Array.isArray(raw)) return [] as LaunchpadSupportTier[];
    return raw
      .map((entry, index) => {
        const item = (entry || {}) as Record<string, unknown>;
        const amount = numberValue(item.amount);
        const label = text(item.label);
        const badge = text(item.badge);
        const description = text(item.description);
        return {
          id: text(item.id) || `${cadence}-${index + 1}`,
          label,
          amount,
          badge,
          description,
          cadence
        } satisfies LaunchpadSupportTier;
      })
      .filter((entry) => entry.label && entry.amount > 0 && entry.description);
  };

  const oneTime = parseList(candidate.oneTime, 'one-time');
  const monthly = parseList(candidate.monthly, 'monthly');
  if (oneTime.length === 0 || monthly.length === 0) return undefined;
  return { oneTime, monthly };
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;

  if (a === 'manage') {
    const url = new URL(_req.url);
    const accountSlug = text(url.searchParams.get('accountSlug'));
    if (!accountSlug) {
      return NextResponse.json({ message: 'accountSlug is required' }, { status: 400 });
    }
    const campaigns = await listLaunchpadCampaignsForAccount(accountSlug);
    return NextResponse.json({ data: campaigns });
  }

  if (a === 'campaign' && b) {
    const campaign = await getLaunchpadCampaignRecordBySlug(b);
    if (!campaign) return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    const receipts = await listLaunchpadReceiptsByCampaignSlug(b);
    return NextResponse.json({ data: { campaign, receipts } });
  }

  if (a === 'receipts' && b) {
    const receipt = await getLaunchpadReceiptById(b);
    if (!receipt) return NextResponse.json({ message: 'Receipt not found' }, { status: 404 });
    return NextResponse.json({ data: receipt });
  }

  return NextResponse.json({ message: 'Unsupported launchpad endpoint' }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (a === 'support') {
    const campaignSlug = text(body.campaignSlug);
    const cadence = (text(body.cadence) || 'one-time') as LaunchpadCadence;
    const campaign = await getLaunchpadCampaignRecordBySlug(campaignSlug);
    if (!campaign) return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    const tiers = getLaunchpadSupportTiers(campaign, cadence);
    const tierId = text(body.tierId);
    const tier = tiers.find((entry) => entry.id === tierId) || tiers[0];
    const amount = Number(body.amount || tier.amount);
    try {
      const receipt = await createLaunchpadReceipt({
        campaignSlug,
        supporterName: text(body.supporterName),
        supporterEmail: text(body.supporterEmail),
        cadence,
        tier,
        amount,
        note: text(body.note),
        visibility: text(body.visibility) === 'private' ? 'private' : 'public',
        sourceReference: text(body.idempotencyKey)
      });
      return NextResponse.json({ data: receipt, redirectUrl: `/launchpad/receipts/${receipt.id}` }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create Launchpad receipt.';
      return NextResponse.json({ message }, { status: 400 });
    }
  }

  if (a === 'create') {
    try {
      const campaign = await createLaunchpadCampaign({
        title: text(body.title),
        beneficiaryName: text(body.beneficiaryName),
        beneficiaryRole: text(body.beneficiaryRole),
        location: text(body.location),
        category: text(body.category) as LaunchpadCategory,
        status: normalizeStatus(body.status),
        goalAmount: numberValue(body.goalAmount),
        summary: text(body.summary),
        story: text(body.story),
        urgencyLabel: text(body.urgencyLabel),
        tags: stringArray(body.tags),
        useOfFunds: stringArray(body.useOfFunds),
        impactPoints: stringArray(body.impactPoints),
        image: text(body.image),
        beneficiaryImage: text(body.beneficiaryImage),
        linkedAccountSlug: text(body.linkedAccountSlug),
        linkedEntityHref: text(body.linkedEntityHref),
        supportTiers: normalizeSupportTiers(body.supportTiers),
        milestonePlan: Array.isArray(body.milestonePlan)
          ? body.milestonePlan
              .map((entry) => entry as Record<string, unknown>)
              .map((entry) => ({
                label: text(entry.label),
                amount: numberValue(entry.amount),
                detail: text(entry.detail)
              }))
              .filter((entry) => entry.label && entry.amount > 0 && entry.detail)
          : [],
        campaignUpdates: Array.isArray(body.campaignUpdates)
          ? body.campaignUpdates
              .map((entry) => entry as Record<string, unknown>)
              .map((entry) => ({
                title: text(entry.title),
                detail: text(entry.detail),
                postedLabel: text(entry.postedLabel) || 'Posted today'
              }))
              .filter((entry) => entry.title && entry.detail)
          : []
      });
      return NextResponse.json({ data: campaign, redirectUrl: `/launchpad/${campaign.slug}` }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create Launchpad campaign.';
      return NextResponse.json({ message }, { status: 400 });
    }
  }

  return NextResponse.json({ message: 'Unsupported launchpad endpoint' }, { status: 400 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (a === 'manage') {
    const campaignSlug = text(body.campaignSlug);
    const status = normalizeStatus(body.status);
    if (!campaignSlug) {
      return NextResponse.json({ message: 'campaignSlug is required' }, { status: 400 });
    }
    try {
      const campaign = await updateLaunchpadCampaignStatus(campaignSlug, status);
      return NextResponse.json({ data: campaign });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update Launchpad campaign.';
      return NextResponse.json({ message }, { status: 400 });
    }
  }

  return NextResponse.json({ message: 'Unsupported launchpad endpoint' }, { status: 400 });
}
