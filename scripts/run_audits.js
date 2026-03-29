const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function resolveAuditBaseUrl() {
  const envBase = process.env.AUDIT_BASE_URL?.trim();
  if (envBase) return envBase;

  const cliBase = process.argv[2]?.trim();
  if (cliBase) return cliBase;

  const envPort = process.env.PORT?.trim();
  if (envPort) return `http://127.0.0.1:${envPort}`;

  return 'http://127.0.0.1:3002';
}

function writeSummary(baseUrl) {
  const runtimeDir = path.join(process.cwd(), '.runtime');
  const full = path.join(runtimeDir, 'full-app-audit.json');
  const commerce = path.join(runtimeDir, 'commerce-cta-audit.json');
  const modals = path.join(runtimeDir, 'modal-flows-audit.json');
  if (![full, commerce, modals].every((file) => fs.existsSync(file))) return;

  const fullAudit = JSON.parse(fs.readFileSync(full, 'utf8'));
  const commerceAudit = JSON.parse(fs.readFileSync(commerce, 'utf8'));
  const modalAudit = JSON.parse(fs.readFileSync(modals, 'utf8'));
  const summary = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    fullAudit: {
      visitedRoutes: fullAudit.coverage?.visitedRoutes ?? fullAudit.visitedRoutes ?? 0,
      totalManifestRoutes: fullAudit.manifest?.total ?? fullAudit.totalManifestRoutes ?? 0,
      missingDynamicPatterns:
        Array.isArray(fullAudit.coverage?.missingDynamicPatterns)
          ? fullAudit.coverage.missingDynamicPatterns.length
          : fullAudit.missingDynamicPatterns ?? 0,
      issueCount: Array.isArray(fullAudit.issues) ? fullAudit.issues.length : fullAudit.issueCount ?? 0
    },
    commerceAudit: {
      issueCount: Array.isArray(commerceAudit.issues) ? commerceAudit.issues.length : 0
    },
    modalAudit: {
      issueCount: Array.isArray(modalAudit.failures) ? modalAudit.failures.length : 0
    }
  };

  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.writeFileSync(path.join(runtimeDir, 'audit-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  return summary;
}

function assertCleanSummary(summary) {
  if (!summary) return;
  const failures = [];
  if ((summary.fullAudit?.issueCount || 0) > 0) failures.push(`${summary.fullAudit.issueCount} full-audit issue(s)`);
  if ((summary.fullAudit?.missingDynamicPatterns || 0) > 0) {
    failures.push(`${summary.fullAudit.missingDynamicPatterns} missing dynamic pattern(s)`);
  }
  if ((summary.commerceAudit?.issueCount || 0) > 0) failures.push(`${summary.commerceAudit.issueCount} commerce CTA issue(s)`);
  if ((summary.modalAudit?.issueCount || 0) > 0) failures.push(`${summary.modalAudit.issueCount} modal flow issue(s)`);
  if (failures.length > 0) {
    throw new Error(`Audit gate failed: ${failures.join(', ')}`);
  }
}

const base = resolveAuditBaseUrl();
const steps = [
  {
    name: 'full app audit',
    env: {
      AUDIT_BASE_URL: base,
      AUDIT_AUTHENTICATED: 'true',
      AUDIT_INCLUDE_CTA_CLICKS: 'false',
      AUDIT_MAX_CTA_CANDIDATES: '0'
    },
    script: 'scripts/full_app_audit.js'
  },
  {
    name: 'commerce CTA audit',
    env: {
      AUDIT_BASE_URL: base
    },
    script: 'scripts/commerce_cta_audit.js'
  },
  {
    name: 'modal flows audit',
    env: {
      AUDIT_BASE_URL: base
    },
    script: 'scripts/modal_flows_audit.js'
  }
];

function healthcheck() {
  return fetch(`${base}/api/health`, { cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
    })
    .catch((error) => {
      throw new Error(`Preview app is not reachable at ${base}. Start the app first. ${error.message}`);
    });
}

(async () => {
  await healthcheck();

  for (const step of steps) {
    console.log(`\\n== ${step.name} ==`);
    const result = spawnSync(process.execPath, [step.script], {
      stdio: 'inherit',
      env: {
        ...process.env,
        ...step.env
      }
    });

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }

  const summary = writeSummary(base);
  assertCleanSummary(summary);
})().catch((error) => {
  console.error((error.message || String(error)) + `\nTip: set AUDIT_BASE_URL or pass a preview URL as the first argument.`);
  process.exit(1);
});
