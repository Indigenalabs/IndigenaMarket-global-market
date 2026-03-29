import type { Metadata } from 'next';
import LaunchpadShell from '@/app/launchpad/LaunchpadShell';

export const metadata: Metadata = {
  title: 'Launchpad',
  description: 'Fundraising campaigns for artists, communities, emergencies, scholarships, businesses, and cultural initiatives.'
};

export default function LaunchpadLayout({ children }: { children: React.ReactNode }) {
  return <LaunchpadShell>{children}</LaunchpadShell>;
}
