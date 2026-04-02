import { NextRequest, NextResponse } from 'next/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import {
  createVerificationApplication,
  getSellerPermissionsForActor,
  listVerificationApplicationsForActor,
  type VerificationType
} from '@/app/lib/indigenousVerification';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseEvidence(payload: unknown) {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((entry) => ({
      evidenceType: asText((entry as Record<string, unknown>)?.evidenceType),
      label: asText((entry as Record<string, unknown>)?.label),
      detail: asText((entry as Record<string, unknown>)?.detail),
      metadata: ((entry as Record<string, unknown>)?.metadata || {}) as Record<string, unknown>
    }))
    .filter((entry) => entry.evidenceType && entry.label);
}

function parseEndorsements(payload: unknown) {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((entry) => ({
      endorserActorId: asText((entry as Record<string, unknown>)?.endorserActorId),
      endorserName: asText((entry as Record<string, unknown>)?.endorserName),
      endorserRole: asText((entry as Record<string, unknown>)?.endorserRole),
      endorsementType: asText((entry as Record<string, unknown>)?.endorsementType),
      note: asText((entry as Record<string, unknown>)?.note),
      metadata: ((entry as Record<string, unknown>)?.metadata || {}) as Record<string, unknown>
    }))
    .filter((entry) => entry.endorserName && entry.endorserRole && entry.endorsementType);
}

function getAccountEmail(req: NextRequest) {
  return (req.headers.get('x-account-email') || '').trim().toLowerCase();
}

async function requireAuthenticatedActor(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  const email = getAccountEmail(req);
  if (actorId === 'guest' && !walletAddress && !email) {
    return {
      error: NextResponse.json({ message: 'Sign in is required to manage verification.' }, { status: 401 })
    };
  }

  return {
    actorId: actorId === 'guest' ? walletAddress || email : actorId,
    walletAddress,
    email
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const auth = await requireAuthenticatedActor(req);
  if ('error' in auth) return auth.error;

  const { slug = [] } = await context.params;
  if (slug[0] !== 'me') {
    return NextResponse.json({ message: 'Unknown verification endpoint.' }, { status: 404 });
  }

  const profileSlug = req.nextUrl.searchParams.get('profileSlug') || '';
  const [applications, permissions] = await Promise.all([
    listVerificationApplicationsForActor({
      actorId: auth.actorId,
      walletAddress: auth.walletAddress,
      email: auth.email,
      profileSlug
    }),
    getSellerPermissionsForActor({
      actorId: auth.actorId,
      walletAddress: auth.walletAddress,
      email: auth.email
    })
  ]);

  return NextResponse.json({
    data: {
      applications,
      activeApplication: applications[0] || null,
      permissions
    }
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const auth = await requireAuthenticatedActor(req);
  if ('error' in auth) return auth.error;

  const { slug = [] } = await context.params;
  if (slug[0] !== 'apply') {
    return NextResponse.json({ message: 'Unknown verification endpoint.' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid verification application payload.' }, { status: 400 });

  const verificationType = asText(body.verificationType) as VerificationType;
  const applicantDisplayName = asText(body.applicantDisplayName);
  const profileSlug = asText(body.profileSlug);
  const statement = asText(body.statement);
  const evidenceSummary = asText(body.evidenceSummary);

  const validTypes: VerificationType[] = [
    'individual_indigenous_seller',
    'nation_community_seller',
    'elder_cultural_authority',
    'partner_institution'
  ];

  if (!validTypes.includes(verificationType)) {
    return NextResponse.json({ message: 'A valid verification type is required.' }, { status: 400 });
  }
  if (!applicantDisplayName || !statement || !evidenceSummary) {
    return NextResponse.json(
      { message: 'Applicant name, statement, and evidence summary are required.' },
      { status: 400 }
    );
  }

  const application = await createVerificationApplication({
    actorId: auth.actorId,
    walletAddress: auth.walletAddress,
    email: auth.email,
    profileSlug,
    verificationType,
    applicantDisplayName,
    nationName: asText(body.nationName),
    communityName: asText(body.communityName),
    communitySlug: asText(body.communitySlug),
    statement,
    evidenceSummary,
    endorsementSummary: asText(body.endorsementSummary),
    evidence: parseEvidence(body.evidence),
    endorsements: parseEndorsements(body.endorsements),
    metadata: {
      accountEmail: auth.email,
      source: 'verification-apply'
    }
  });

  return NextResponse.json({ data: { application } }, { status: 201 });
}
