import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { getLaunchReadinessSnapshot } from '@/app/lib/launchReadiness';

function toCsv(snapshot: Awaited<ReturnType<typeof getLaunchReadinessSnapshot>>) {
  const lines = ['group,check,status,value'];
  for (const group of snapshot.groups) {
    for (const check of group.checks) {
      lines.push(
        [group.label, check.label, check.ok ? 'pass' : 'fail', check.value]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      );
    }
  }
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;

  const snapshot = await getLaunchReadinessSnapshot();
  const format = String(req.nextUrl.searchParams.get('format') || 'json').trim().toLowerCase();

  if (format === 'csv') {
    return new NextResponse(toCsv(snapshot), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="launch-readiness-report.csv"',
      },
    });
  }

  return NextResponse.json({ snapshot });
}
