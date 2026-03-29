import { NextRequest, NextResponse } from 'next/server';
import { listEnterpriseInquiries } from '@/app/lib/enterpriseInquiries';
import { DEFAULT_ENTERPRISE_STAGE_WEIGHTS } from '@/app/lib/enterpriseForecastConfig';

function buildMonthlyForecastRows() {
  return listEnterpriseInquiries().then((inquiries) => {
    const byMonth = new Map<string, { raw: number; weighted: number; count: number }>();
    for (const entry of inquiries) {
      if (!entry.expectedCloseDate) continue;
      const month = entry.expectedCloseDate.slice(0, 7);
      const raw = Number(entry.estimatedValue || 0);
      const weighted = raw * (DEFAULT_ENTERPRISE_STAGE_WEIGHTS[entry.contractStage] ?? 0);
      const current = byMonth.get(month) || { raw: 0, weighted: 0, count: 0 };
      current.raw += raw;
      current.weighted += weighted;
      current.count += 1;
      byMonth.set(month, current);
    }
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, totals]) => ({ month, ...totals }));
  });
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') || 'json';
  const rows = await buildMonthlyForecastRows();

  if (format === 'csv') {
    const csv = [
      'month,deal_count,raw_forecast,weighted_forecast',
      ...rows.map((row) => `${row.month},${row.count},${row.raw},${row.weighted}`)
    ].join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="enterprise-monthly-forecast.csv"'
      }
    });
  }

  return NextResponse.json({ data: { rows } }, { status: 200 });
}
