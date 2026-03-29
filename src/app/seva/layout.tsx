import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seva',
  description: 'Support community-led impact, urgent response, and cultural resilience through Seva.'
};

export default function SevaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
