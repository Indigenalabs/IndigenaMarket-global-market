import { redirect } from 'next/navigation';

export default function CommunityForumsLegacyPage() {
  redirect('/community?view=discussions');
}
