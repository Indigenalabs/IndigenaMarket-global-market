import { redirect } from 'next/navigation';

export default function CommunityMentorshipLegacyPage() {
  redirect('/community?view=mentorship');
}
