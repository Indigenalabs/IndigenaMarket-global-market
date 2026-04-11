const { spawn, spawnSync } = require('child_process');
const net = require('net');
const path = require('path');

const cwd = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const requestedPort = process.env.RELEASE_GATE_PORT?.trim() || process.env.PORT?.trim() || '';

function runStep(name, command, args, extraEnv = {}) {
  console.log(`\n== ${name} ==`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv
    }
  });

  if (result.status !== 0) {
    throw new Error(`${name} failed with exit code ${result.status || 1}`);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.unref();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port);
  });
}

async function resolvePort() {
  if (requestedPort) {
    const available = await isPortAvailable(Number(requestedPort));
    if (!available) {
      throw new Error(`Release gate port ${requestedPort} is already in use. Set RELEASE_GATE_PORT to a free port and rerun.`);
    }
    return Number(requestedPort);
  }

  for (let candidate = 3102; candidate < 3202; candidate += 1) {
    if (await isPortAvailable(candidate)) return candidate;
  }

  throw new Error('Could not find a free release gate port between 3102 and 3201.');
}

function terminateProcessTree(server) {
  if (!server || server.exitCode !== null || server.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], {
      stdio: 'ignore'
    });
    return;
  }
  server.kill('SIGTERM');
}

async function waitForHealth(baseUrl, server, timeoutMs = 90000) {
  const startedAt = Date.now();
  let lastError = 'No response';

  while (Date.now() - startedAt < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`Preview server exited before health check succeeded (exit code ${server.exitCode}).`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' });
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await wait(1000);
  }

  throw new Error(`Timed out waiting for ${baseUrl}/api/health (${lastError})`);
}

async function main() {
  runStep('build', npmCommand, ['run', 'build']);

  const port = await resolvePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\n== start preview (${baseUrl}) ==`);

  const server = spawn(npmCommand, ['run', 'start', '--', '--port', String(port)], {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
      NEXT_PUBLIC_USE_APP_API: process.env.NEXT_PUBLIC_USE_APP_API || 'true',
      ADVOCACY_ADMIN_WALLETS: process.env.ADVOCACY_ADMIN_WALLETS || '0xadmin-test,0xlegal-test',
      ADVOCACY_LEGAL_OPS_WALLETS: process.env.ADVOCACY_LEGAL_OPS_WALLETS || '0xlegal-test',
      ADVOCACY_PAYMENT_WEBHOOK_SECRET: process.env.ADVOCACY_PAYMENT_WEBHOOK_SECRET || 'test-webhook-secret',
      MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET:
        process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET || 'test-materials-webhook-secret'
    }
  });

  let startupFailure = null;
  server.once('exit', (code, signal) => {
    if (code !== 0) {
      startupFailure = `Preview server exited early with code ${code}${signal ? ` (${signal})` : ''}.`;
    }
  });

  const stopServer = () => {
    terminateProcessTree(server);
  };

  process.on('exit', stopServer);
  process.on('SIGINT', () => {
    stopServer();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    stopServer();
    process.exit(143);
  });

  try {
    await waitForHealth(baseUrl, server);
    if (startupFailure) throw new Error(startupFailure);
    runStep('release gate audit', process.execPath, [path.join('scripts', 'run_audits.js'), baseUrl], {
      AUDIT_BASE_URL: baseUrl
    });
    runStep('release smoke', npmCommand, ['run', 'test:smoke:release'], {
      PLAYWRIGHT_BASE_URL: baseUrl
    });
    runStep('launch readiness report', process.execPath, [path.join('scripts', 'launch_readiness_report.js'), baseUrl], {
      LAUNCH_BASE_URL: baseUrl,
      LAUNCH_SMOKE_PASSED: 'true'
    });
  } finally {
    stopServer();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
