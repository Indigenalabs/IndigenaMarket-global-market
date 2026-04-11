const fs = require('fs');
const path = require('path');

const runtimeDir = path.join(process.cwd(), '.runtime');
const outputFile = path.join(runtimeDir, 'launch-readiness.json');
const auditSummaryFile = path.join(runtimeDir, 'audit-summary.json');

function resolveBaseUrl() {
  const cliBase = process.argv[2]?.trim();
  if (cliBase) return cliBase;
  const envBase = process.env.LAUNCH_BASE_URL?.trim() || process.env.AUDIT_BASE_URL?.trim();
  if (envBase) return envBase;
  const port = process.env.PORT?.trim() || '3000';
  return `http://127.0.0.1:${port}`;
}

function readAuditSummary() {
  if (!fs.existsSync(auditSummaryFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(auditSummaryFile, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Launch readiness health check failed with HTTP ${response.status}`);
  }

  const json = await response.json();
  const launchReadiness = json.launchReadiness || null;
  if (!launchReadiness) {
    throw new Error('Launch readiness payload missing from /api/health');
  }

  const auditSummary = readAuditSummary();
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    overallStatus: launchReadiness.overallStatus,
    readiness: launchReadiness,
    audits: {
      passed: Boolean(launchReadiness.auditSummary?.clean),
      summary: auditSummary
    },
    smoke: {
      passed: String(process.env.LAUNCH_SMOKE_PASSED || 'false').trim().toLowerCase() === 'true'
    }
  };

  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Launch readiness report written to ${outputFile}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
