import crypto from 'node:crypto';
import { expect, test } from '@playwright/test';

test.describe('Pillar 9 - Advocacy ops auth and workflow', () => {
  test('rejects ops writes without an authenticated actor', async ({ request }) => {
    const res = await request.post('/api/advocacy-legal/ops/case-workflow', {
      data: {
        caseId: 'case-auth-missing',
        workflowStatus: 'under_review',
        priority: 'high',
        queueBucket: 'general-intake'
      }
    });

    expect(res.status()).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      message: 'Verified wallet or authenticated user required'
    });
  });

  test('rejects ops writes without admin signing even for an allowlisted wallet', async ({ request }) => {
    const res = await request.post('/api/advocacy-legal/ops/case-workflow', {
      headers: {
        'x-wallet-address': '0xadmin-test'
      },
      data: {
        caseId: 'case-missing-signature',
        workflowStatus: 'under_review',
        priority: 'high',
        queueBucket: 'general-intake'
      }
    });

    expect(res.status()).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      message: 'Admin signature required'
    });
  });

  test('allows an allowlisted admin wallet to update case workflow', async ({ request }) => {
    const res = await request.post('/api/advocacy-legal/ops/case-workflow', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        caseId: 'case-approved-flow',
        workflowStatus: 'assigned',
        priority: 'critical',
        queueBucket: 'emergency-defense',
        assignedAttorneyName: 'Mika Redsky',
        lastNote: 'Escalated to urgent review.'
      }
    });

    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      success: true,
      data: {
        case_id: 'case-approved-flow',
        workflow_status: 'assigned',
        priority: 'critical',
        queue_bucket: 'emergency-defense',
        assigned_attorney_name: 'Mika Redsky'
      }
    });
  });

  test('allows an allowlisted admin wallet to reconcile a donation payment state', async ({ request }) => {
    const intent = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xsupporter-reconcile'
      },
      data: {
        action: 'donation-intent',
        campaignId: 'coastal-fishery-defense',
        campaignTitle: 'Coastal Fishery Defense',
        donorName: 'Processor Check',
        amount: 55,
        currency: 'USD'
      }
    });
    expect(intent.status()).toBe(200);
    const intentJson = await intent.json();
    const donationId = intentJson.data.id as string;

    const res = await request.post('/api/advocacy-legal/ops/donation-reconcile', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        donationId,
        paymentState: 'failed',
        processorEventId: 'evt_failed_test',
        processorFailureReason: 'Synthetic decline for reconciliation coverage'
      }
    });

    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      success: true,
      data: {
        donationId,
        paymentState: 'failed'
      }
    });
  });

  test('accepts a signed payment webhook and reconciles by payment intent', async ({ request }) => {
    const intent = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xsupporter-webhook'
      },
      data: {
        action: 'donation-intent',
        campaignId: 'coastal-fishery-defense',
        campaignTitle: 'Coastal Fishery Defense',
        donorName: 'Webhook Supporter',
        amount: 65,
        currency: 'USD'
      }
    });
    expect(intent.status()).toBe(200);
    const intentJson = await intent.json();
    const paymentIntentId = intentJson.data.paymentIntentId as string;

    const body = JSON.stringify({
      paymentIntentId,
      paymentState: 'failed',
      processorEventId: 'evt_webhook_failed',
      processorFailureReason: 'Synthetic webhook decline'
    });
    const timestamp = Date.now().toString();
    const signature = crypto.createHmac('sha256', process.env.ADVOCACY_PAYMENT_WEBHOOK_SECRET || 'test-webhook-secret').update(`${timestamp}.${body}`).digest('hex');

    const res = await request.post('/api/advocacy-legal/webhooks/payment', {
      headers: {
        'content-type': 'application/json',
        'x-indigena-webhook-timestamp': timestamp,
        'x-indigena-webhook-signature': signature
      },
      data: body
    });

    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      success: true,
      data: {
        paymentIntentId,
        paymentState: 'failed'
      }
    });

    const duplicate = await request.post('/api/advocacy-legal/webhooks/payment', {
      headers: {
        'content-type': 'application/json',
        'x-indigena-webhook-timestamp': timestamp,
        'x-indigena-webhook-signature': signature
      },
      data: body
    });

    expect(duplicate.status()).toBe(200);
    await expect(duplicate.json()).resolves.toMatchObject({
      success: true,
      duplicate: true,
      data: {
        paymentIntentId
      }
    });
  });

  test('signed supporter can submit an ICIP claim and admin can review it', async ({ request }) => {
    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-claimant'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Woven River Motif',
        communityName: 'Ngarrindjeri',
        claimantName: 'River Rights Collective',
        contactEmail: 'icip@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'This motif is only licensed for community-approved educational use.',
        evidence: [
          {
            label: 'Archive record',
            evidenceType: 'link',
            fileUrl: 'https://example.com/archive/river-motif'
          }
        ]
      }
    });

    expect(submit.status()).toBe(200);
    const claimJson = await submit.json();
    const entryId = claimJson.data.id as string;

    const review = await request.post('/api/advocacy-legal/ops/icip-review', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        entryId,
        reviewStatus: 'approved',
        reviewNotes: 'Registry evidence accepted and approved.'
      }
    });

    expect(review.status()).toBe(200);
    await expect(review.json()).resolves.toMatchObject({
      success: true,
      data: {
        id: entryId,
        status: 'approved'
      }
    });
  });

  test('signed supporter can upload ICIP evidence and retrieve it through the protected file route', async ({ request }) => {
    const upload = await request.post('/api/advocacy-legal/uploads/icip-evidence', {
      headers: {
        'x-wallet-address': '0xicip-uploader'
      },
      multipart: {
        file: {
          name: 'protocol-note.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('sacred protocol note for registry evidence', 'utf8')
        }
      }
    });

    expect(upload.status()).toBe(200);
    const uploadJson = await upload.json();
    const fileUrl = uploadJson.data.fileUrl as string;
    expect(fileUrl).toContain('/api/advocacy-legal/uploads/icip-evidence?path=');

    const filePath = fileUrl.split('path=')[1];
    const download = await request.get(`/api/advocacy-legal/uploads/icip-evidence?path=${filePath}`, {
      headers: {
        'x-wallet-address': '0xicip-uploader'
      }
    });

    expect(download.status()).toBe(200);
    await expect(download.text()).resolves.toContain('sacred protocol note');
  });

  test('icip registry supports multi-file upload previews in the browser', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xicip-browser');
    });

    await page.goto('/advocacy-legal/icip-registry');
    await expect(page.getByRole('heading', { name: 'ICIP Registry Portal' })).toBeVisible();

    await page.locator('input[type="file"][multiple]').setInputFiles([
      {
        name: 'motif-proof.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l9QAAAABJRU5ErkJggg==',
          'base64'
        )
      },
      {
        name: 'protocol-letter.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf8')
      }
    ]);

    await expect(page.getByText('Evidence uploaded: protocol-letter.pdf')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('p.text-sm.font-semibold.text-white', { hasText: 'motif-proof' })).toBeVisible();
    await expect(page.getByText('PDF Evidence')).toBeVisible();
  });

  test('icip registry exposes a claim detail permalink', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xicip-detail');
    });

    await page.goto('/advocacy-legal/icip-registry');
    await page.getByPlaceholder('Claim title').fill('River Pattern Licensing Claim');
    await page.getByPlaceholder('Community or Nation').fill('Ngarrindjeri');
    await page.getByPlaceholder('Claimant or organization').fill('River Rights Collective');
    await page.getByPlaceholder('Contact email').fill('detail@example.com');
    await page.getByPlaceholder('Protocol summary, origin story, authority chain, or cultural restrictions').fill(
      'This woven river pattern is reserved for community-authorized educational and ceremonial use.'
    );
    await page.getByRole('button', { name: 'Submit ICIP Claim' }).click();

    await expect(page.getByText(/submitted for legal review/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('link', { name: 'View Claim Record' }).first().click();

    await page.waitForURL('**/advocacy-legal/icip-registry/**');
    await expect(page.getByRole('heading', { name: 'ICIP Claim Record' })).toBeVisible();
    await expect(page.getByText('River Pattern Licensing Claim')).toBeVisible();
    await expect(page.getByText('Attached proof and provenance')).toBeVisible();
    await expect(page.getByText('Protected timeline and internal notes')).toBeVisible();
    await page.getByPlaceholder('Add a protected internal note for claimant or legal review context').fill('Claimant added provenance context for internal review.');
    await page.getByRole('button', { name: 'Add protected note' }).click();
    await expect(page.getByText('Protected note added to the claim timeline.')).toBeVisible();
    await expect(page.getByText('Claimant added provenance context for internal review.').first()).toBeVisible();
  });

  test('icip claims can be assigned to a named reviewer and show ownership on the protected record', async ({ request, page }) => {
    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-assignment-owner'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Ceremonial Reed Pattern',
        communityName: 'Ngarrindjeri',
        claimantName: 'Reed Rights Collective',
        contactEmail: 'assignment@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'This reed pattern remains under community authority and should stay with a named reviewer.'
      }
    });
    expect(submit.status()).toBe(200);
    const submitJson = await submit.json();
    const entryId = submitJson.data.id as string;

    const assignment = await request.post('/api/advocacy-legal/ops/icip-assignment', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        entryId,
        assignedReviewerId: '0xlegal-owner',
        assignedReviewerName: 'Mika Redsky'
      }
    });
    expect(assignment.status()).toBe(200);

    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xicip-assignment-owner');
    });

    await page.goto(`/advocacy-legal/icip-registry/${entryId}`);
    await expect(page.getByText('Reviewer assignment')).toBeVisible();
    await expect(page.getByText(/^Mika Redsky$/).first()).toBeVisible();
    await expect(page.getByText('Reviewer assigned: Mika Redsky')).toBeVisible();
  });

  test('protected claim record can preview uploaded evidence in a modal', async ({ request, page }) => {
    const upload = await request.post('/api/advocacy-legal/uploads/icip-evidence', {
      headers: {
        'x-wallet-address': '0xicip-preview-owner'
      },
      multipart: {
        file: {
          name: 'preview-evidence.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf8')
        }
      }
    });
    expect(upload.status()).toBe(200);
    const uploadJson = await upload.json();
    const fileUrl = uploadJson.data.fileUrl as string;

    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-preview-owner'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Preview Window Claim',
        communityName: 'Ngarrindjeri',
        claimantName: 'Preview Rights Collective',
        contactEmail: 'preview@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'Claim used to verify protected evidence previews.',
        evidence: [
          {
            label: 'Preview Evidence',
            evidenceType: 'document',
            fileUrl,
            description: 'Uploaded PDF evidence for modal preview.'
          }
        ]
      }
    });
    expect(submit.status()).toBe(200);
    const submitJson = await submit.json();
    const entryId = submitJson.data.id as string;

    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xicip-preview-owner');
    });

    await page.goto(`/advocacy-legal/icip-registry/${entryId}`);
    await page.getByRole('button', { name: 'Preview' }).first().click();
    await expect(page.getByText('Protected Evidence Preview', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preview Evidence' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  test('protected evidence modal can move to the next file in the claim pack', async ({ request, page }) => {
    const firstUpload = await request.post('/api/advocacy-legal/uploads/icip-evidence', {
      headers: {
        'x-wallet-address': '0xicip-preview-pack'
      },
      multipart: {
        file: {
          name: 'first-evidence.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf8')
        }
      }
    });
    expect(firstUpload.status()).toBe(200);
    const firstFileUrl = (await firstUpload.json()).data.fileUrl as string;

    const secondUpload = await request.post('/api/advocacy-legal/uploads/icip-evidence', {
      headers: {
        'x-wallet-address': '0xicip-preview-pack'
      },
      multipart: {
        file: {
          name: 'second-evidence.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf8')
        }
      }
    });
    expect(secondUpload.status()).toBe(200);
    const secondFileUrl = (await secondUpload.json()).data.fileUrl as string;

    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-preview-pack'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Pack Navigation Claim',
        communityName: 'Ngarrindjeri',
        claimantName: 'Pack Rights Collective',
        contactEmail: 'pack@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'Claim used to verify next and previous navigation in the evidence modal.',
        evidence: [
          {
            label: 'First Evidence',
            evidenceType: 'document',
            fileUrl: firstFileUrl,
            description: 'First file in the pack.'
          },
          {
            label: 'Second Evidence',
            evidenceType: 'document',
            fileUrl: secondFileUrl,
            description: 'Second file in the pack.'
          }
        ]
      }
    });
    expect(submit.status()).toBe(200);
    const entryId = (await submit.json()).data.id as string;

    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xicip-preview-pack');
    });

    await page.goto(`/advocacy-legal/icip-registry/${entryId}`);
    await page.getByRole('button', { name: 'Preview' }).first().click();
    await expect(page.getByRole('heading', { name: 'First Evidence' })).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Second Evidence' })).toBeVisible();
    await expect(page.getByText('2 of 2')).toBeVisible();
  });

  test('icip registry search and ownership filters narrow the protected registry view', async ({ request, page }) => {
    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-filter-owner'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Star Water Pattern',
        communityName: 'Ngarrindjeri',
        claimantName: 'Water Rights Collective',
        contactEmail: 'filters@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'Filter test claim for the protected registry interface.'
      }
    });
    expect(submit.status()).toBe(200);
    const submitJson = await submit.json();
    const entryId = submitJson.data.id as string;

    const assignment = await request.post('/api/advocacy-legal/ops/icip-assignment', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        entryId,
        assignedReviewerId: '0xadmin-test',
        assignedReviewerName: 'Mika Redsky'
      }
    });
    expect(assignment.status()).toBe(200);

    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });

    await page.goto('/advocacy-legal/icip-registry');
    await page.getByPlaceholder('Search title, community, registry number, or reviewer').fill('Star Water Pattern');
    await expect(page.getByText('Star Water Pattern').first()).toBeVisible();

    await page.locator('select').nth(1).selectOption('mine');
    await expect(page.getByText('Star Water Pattern').first()).toBeVisible();

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByPlaceholder('Search title, community, registry number, or reviewer')).toHaveValue('');
  });

  test('legal dashboard can filter workload down to claims assigned to the current reviewer', async ({ request, page }) => {
    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-dashboard-filter'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Assigned Reviewer Queue Claim',
        communityName: 'Ngarrindjeri',
        claimantName: 'Queue Rights Collective',
        contactEmail: 'queue-filter@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'Claim used to verify legal dashboard workload filtering.'
      }
    });
    expect(submit.status()).toBe(200);
    const entryId = (await submit.json()).data.id as string;

    const assignment = await request.post('/api/advocacy-legal/ops/icip-assignment', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        entryId,
        assignedReviewerId: '0xadmin-test',
        assignedReviewerName: 'Mika Redsky'
      }
    });
    expect(assignment.status()).toBe(200);

    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_wallet', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });

    await page.goto('/advocacy-legal/dashboard/legal-professional');
    await expect(page.getByText('Reviewer workload filter')).toBeVisible();
    await page.locator('select').filter({ has: page.locator('option[value="mine"]') }).first().selectOption('mine');
    await expect(page.getByText('Assigned Reviewer Queue Claim').first()).toBeVisible();
  });

  test('legal dashboard workload filter also narrows refund and reconciliation ownership queues', async ({ request, page }) => {
    const intent = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xops-filter-supporter'
      },
      data: {
        action: 'donation-intent',
        campaignId: 'coastal-fishery-defense',
        campaignTitle: 'Coastal Fishery Defense',
        donorName: 'Ops Filter Supporter',
        amount: 44,
        currency: 'USD'
      }
    });
    expect(intent.status()).toBe(200);
    const donationId = (await intent.json()).data.id as string;

    const assignment = await request.post('/api/advocacy-legal/ops/donation-assignment', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        donationId,
        assignedReviewerId: '0xadmin-test',
        assignedReviewerName: 'Mika Redsky'
      }
    });
    expect(assignment.status()).toBe(200);

    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_wallet', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });

    await page.goto('/advocacy-legal/dashboard/legal-professional');
    await page.locator('select').filter({ has: page.locator('option[value="mine"]') }).first().selectOption('mine');
    await expect(page.getByText('Coastal Fishery Defense').first()).toBeVisible();
    await expect(page.getByText('Owner: Mika Redsky').first()).toBeVisible();
  });

  test('approved claims can publish sanitized public summaries without exposing private details', async ({ request, page }) => {
    const submit = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-public-owner'
      },
      data: {
        action: 'icip-registry-entry',
        claimTitle: 'Sacred River Weave',
        communityName: 'Ngarrindjeri',
        claimantName: 'River Rights Collective',
        contactEmail: 'private-claim@example.com',
        assetType: 'design',
        rightsScope: 'protocol-protection',
        protocolVisibility: 'restricted',
        protocolSummary: 'Full protocol summary that should stay private.',
        infringementSummary: 'Private misuse notes that should not appear publicly.'
      }
    });
    expect(submit.status()).toBe(200);
    const submitJson = await submit.json();
    const entryId = submitJson.data.id as string;

    const review = await request.post('/api/advocacy-legal/ops/icip-review', {
      headers: {
        'x-wallet-address': '0xadmin-test',
        'x-admin-signed': 'true'
      },
      data: {
        entryId,
        reviewStatus: 'approved',
        reviewNotes: 'Approved for optional public summary publication.'
      }
    });
    expect(review.status()).toBe(200);

    const publish = await request.post('/api/advocacy-legal/actions', {
      headers: {
        'x-wallet-address': '0xicip-public-owner'
      },
      data: {
        action: 'icip-public-visibility',
        entryId,
        publicListingState: 'public_summary',
        publicTitle: 'Public Notice: Sacred River Weave',
        publicSummary: 'This motif remains community-protected and requires explicit permission before reuse.',
        publicProtocolNotice: 'Do not reproduce, digitize, or commercialize without community consent.'
      }
    });
    expect(publish.status()).toBe(200);
    const publishJson = await publish.json();
    expect(publishJson).toMatchObject({
      success: true,
      data: {
        id: entryId,
        publicListingState: 'public_summary'
      }
    });
    const noticeTitle = publishJson.data.publicTitle as string;

    await page.goto('/advocacy-legal/icip-notices');
    await expect(page.getByRole('heading', { name: 'Public ICIP Notices' })).toBeVisible();
    await page.getByRole('link', { name: noticeTitle }).first().click();
    await page.waitForURL('**/advocacy-legal/icip-notices/**');
    await expect(page.getByRole('heading', { name: 'Public ICIP Notice' })).toBeVisible();
    await expect(page.getByText('This motif remains community-protected and requires explicit permission before reuse.').first()).toBeVisible();
    await expect(page.getByText('Do not reproduce, digitize, or commercialize without community consent.').first()).toBeVisible();
    await expect(page.getByText('private-claim@example.com')).toHaveCount(0);
    await expect(page.getByText('Private misuse notes that should not appear publicly.')).toHaveCount(0);
    await expect(page.getByText('Full protocol summary that should stay private.')).toHaveCount(0);
    await expect(page.getByText('Public-facing statement')).toBeVisible();
    await expect(page.getByText('Evidence files are not shown here.')).toBeVisible();
    await expect(page.getByText('private-claim@example.com')).toHaveCount(0);
  });

  test('keeps community dashboard protected behind signed identity', async ({ request }) => {
    const res = await request.get('/api/advocacy-legal/ops/community-dashboard');

    expect(res.status()).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      message: 'Missing signed identity (wallet or JWT)'
    });
  });

  test('returns signed dashboard reads for allowlisted legal ops wallet', async ({ request }) => {
    const [communityRes, legalRes] = await Promise.all([
      request.get('/api/advocacy-legal/ops/community-dashboard', {
        headers: {
          'x-wallet-address': '0xlegal-test'
        }
      }),
      request.get('/api/advocacy-legal/ops/legal-dashboard', {
        headers: {
          'x-wallet-address': '0xlegal-test'
        }
      })
    ]);

    expect(communityRes.status()).toBe(200);
    await expect(communityRes.json()).resolves.toMatchObject({
      success: true,
      data: {
        openCases: expect.any(Number),
        alertMembers: expect.any(Number),
        activeCampaignRequests: expect.any(Number)
      }
    });

    expect(legalRes.status()).toBe(200);
    await expect(legalRes.json()).resolves.toMatchObject({
      success: true,
      data: {
        openMatters: expect.any(Number),
        pendingConsultRequests: expect.any(Number),
        proBonoQueue: expect.any(Number)
      }
    });
  });

  test('legal professional dashboard can save workflow with signed admin state in the browser', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_wallet', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });

    await page.goto('/advocacy-legal/dashboard/legal-professional');

    await expect(page.getByRole('heading', { name: 'Legal Professional Dashboard' })).toBeVisible();
    await expect(page.getByText('Admin signed')).toBeVisible();

    await page.getByPlaceholder('Case ID').fill('case-ui-workflow');
    await page.getByPlaceholder('Assigned attorney name').fill('Tere Moana');
    await page.getByPlaceholder('Queue bucket').fill('land-defense');
    await page.getByPlaceholder('Workflow note').fill('Prepared for injunction filing and rapid response.');

    await page.getByRole('button', { name: 'Save Workflow' }).click();

    await expect(page.getByText('Workflow updated for case-ui-workflow.')).toBeVisible();
  });

  test('legal professional dashboard can approve a campaign with signed admin state', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_wallet', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });

    await page.goto('/advocacy-legal/dashboard/legal-professional');

    await expect(page.getByRole('heading', { name: 'Legal Professional Dashboard' })).toBeVisible();
    const approveButton = page.getByRole('button', { name: 'Approve' }).first();
    await expect(approveButton).toBeEnabled();

    await approveButton.click();

    await expect(page.getByText(/Campaign .* approved\./)).toBeVisible();
  });

  test('legal clinic calendar can publish a slot with signed admin state', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_wallet', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });

    await page.goto('/advocacy-legal/legal-clinic-calendar');

    await expect(page.getByRole('heading', { name: 'Legal Clinic Calendar & Booking' })).toBeVisible();
    await page.getByPlaceholder('Attorney name').fill('Aroha Kerei');
    await page.getByPlaceholder('Location label').fill('Treaty Rights Virtual Office');
    await page.locator('input[type="datetime-local"]').nth(0).fill('2026-04-10T09:00');
    await page.locator('input[type="datetime-local"]').nth(1).fill('2026-04-10T10:00');
    await page.locator('input[type="number"]').fill('3');

    await page.getByRole('button', { name: 'Save Slot' }).click();

    await expect(page.getByText('Clinic slot saved.')).toBeVisible();
  });

  test('marketplace discovery can open an attorney profile and submit a consultation request', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xsupporter-test');
    });

    await page.goto('/advocacy-legal/marketplace');

    await expect(page.getByRole('heading', { name: 'Browse All Services & Resources' })).toBeVisible();
    await page.locator('a[href="/advocacy-legal/attorney/mika-redsky"]').first().click();
    await page.waitForURL('**/advocacy-legal/attorney/mika-redsky');

    await expect(page.getByPlaceholder('Contact email')).toBeVisible();
    await page.getByPlaceholder('Contact email').fill('supporter@example.com');
    await page.getByPlaceholder('Case summary').fill('We need immediate advice on treaty access restrictions affecting harvest and travel rights.');

    await page.getByRole('button', { name: 'Request Consultation' }).click();

    await expect(page.getByText('Consultation request sent.')).toBeVisible();
  });

  test('marketplace discovery can open a campaign and record a donation pledge', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xsupporter-test');
    });

    await page.goto('/advocacy-legal/marketplace');

    await expect(page.getByRole('heading', { name: 'Browse All Services & Resources' })).toBeVisible();
    await page.getByRole('button', { name: 'Campaigns' }).click();
    await page.locator('a[href="/advocacy-legal/campaign/coastal-fishery-defense"]').first().click();
    await page.waitForURL('**/advocacy-legal/campaign/coastal-fishery-defense');

    await expect(page.getByPlaceholder('Donor name')).toBeVisible();
    await page.getByPlaceholder('Donor name').fill('Solidarity Circle');
    await page.getByPlaceholder('Amount').fill('250');

    await page.getByRole('button', { name: 'Donate to Case' }).click();

    await expect(page.getByText(/Donation confirmed: \$250 recorded\./)).toBeVisible();
  });

  test('submit case page records a signed legal help request', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xcommunity-test');
    });

    await page.goto('/advocacy-legal/submit-case');

    await expect(page.getByRole('heading', { name: 'Submit a Case / Request Legal Help' })).toBeVisible();
    await page.getByPlaceholder('Organization or Community Name').fill('Ngarrindjeri Water Defenders');
    await page.getByPlaceholder('Primary Contact Email').fill('council@example.com');
    await page.getByPlaceholder('Jurisdiction (optional)').fill('South Australia');
    await page.getByPlaceholder('Describe legal issue, urgency, and location').fill(
      'Urgent support is needed to respond to a fast-moving access restriction affecting cultural site protection and community entry.'
    );

    await page.getByRole('button', { name: 'Submit Secure Intake' }).click();

    await expect(page.getByText('Secure intake submitted. Your case is now in legal triage.')).toBeVisible({ timeout: 10000 });
  });

  test('supporter journey flows into my advocacy dashboard with actor-scoped contribution data', async ({ page }) => {
    const wallet = `0xsupporter-dashboard-${Date.now()}`;

    await page.addInitScript((value) => {
      window.localStorage.setItem('indigena_wallet_address', value);
    }, wallet);

    await page.goto('/advocacy-legal/marketplace');

    await expect(page.getByRole('heading', { name: 'Browse All Services & Resources' })).toBeVisible();
    await page.getByRole('button', { name: 'Campaigns' }).click();
    await page.getByRole('link', { name: 'View Campaign' }).first().click();

    await page.getByPlaceholder('Donor name').fill('Justice Backer');
    await page.getByPlaceholder('Amount').fill('180');
    await page.getByRole('button', { name: 'Donate to Case' }).click();

    await expect(page.getByText(/Donation confirmed: \$180 recorded\./)).toBeVisible();

    await page.goto('/advocacy-legal/dashboard/my-advocacy');

    await expect(page.getByRole('heading', { name: 'My Advocacy Dashboard' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Total Contributed' }).getByText('$180')).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Campaigns Supported' }).getByText('1')).toBeVisible();
    await expect(page.getByText(/raised/i)).toHaveCount(0);
    await expect(page.getByText('Payment Receipts')).toBeVisible();
    const receiptCard = page.locator('article').filter({ hasText: 'Receipt ID:' }).filter({ hasText: 'USD $180' }).first();
    await expect(receiptCard).toBeVisible();
    await receiptCard.getByRole('link', { name: 'View Receipt' }).click();
    await page.waitForURL('**/advocacy-legal/dashboard/my-advocacy/receipt/**');
    await expect(page.getByText('Donation Receipt')).toBeVisible();
    await expect(page.getByText('Receipt Actions')).toBeVisible();
  });

  test('supporter can request a refund and legal ops can approve it', async ({ page, browser }) => {
    const wallet = `0xsupporter-refund-${Date.now()}`;

    await page.addInitScript((value) => {
      window.localStorage.setItem('indigena_wallet_address', value);
    }, wallet);

    await page.goto('/advocacy-legal/marketplace');
    await page.getByRole('button', { name: 'Campaigns' }).click();
    await page.locator('a[href="/advocacy-legal/campaign/coastal-fishery-defense"]').first().click();
    await page.getByPlaceholder('Donor name').fill('Refund Tester');
    await page.getByPlaceholder('Amount').fill('95');
    await page.getByRole('button', { name: 'Donate to Case' }).click();
    await expect(page.getByText(/Donation confirmed: \$95 recorded\./)).toBeVisible();

    await page.goto('/advocacy-legal/dashboard/my-advocacy');
    await expect(page.locator('article').filter({ hasText: 'Total Contributed' }).getByText('$95')).toBeVisible();
    await page.getByRole('button', { name: 'Request Refund' }).click();
    await expect(page.getByText(/Refund request submitted/i)).toBeVisible();
    await expect(page.getByText(/pending legal review/i)).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Receipt ID:' }).getByText(/refund pending/i)).toBeVisible();

    const adminPage = await browser.newPage();
    await adminPage.addInitScript(() => {
      window.localStorage.setItem('indigena_wallet_address', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_wallet', '0xadmin-test');
      window.localStorage.setItem('indigena_admin_signed', 'true');
    });
    await adminPage.goto('/advocacy-legal/dashboard/legal-professional');
    await expect(adminPage.getByText('Refund review queue')).toBeVisible();
    await adminPage.getByRole('button', { name: 'Approve Refund' }).first().click();
    await expect(adminPage.getByText(/Refund approved/i)).toBeVisible();
    await adminPage.close();

    await page.reload();
    await expect(page.locator('article').filter({ hasText: 'Receipt ID:' }).getByText('refunded')).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Total Contributed' }).getByText('$0')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('article').filter({ hasText: 'Receipt ID:' }).getByText('refunded')).toBeVisible();
  });
});
