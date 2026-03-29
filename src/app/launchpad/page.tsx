import LaunchpadClient from '@/app/launchpad/LaunchpadClient';
import { listPublicLaunchpadCampaignRecords } from '@/app/lib/launchpadCampaignStore';

export const dynamic = 'force-dynamic';

export default async function LaunchpadPage() {
  return <LaunchpadClient campaigns={await listPublicLaunchpadCampaignRecords()} />;
}
