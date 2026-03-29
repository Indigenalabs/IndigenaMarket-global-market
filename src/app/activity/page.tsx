import { redirect } from 'next/navigation';

export default function ActivityRedirectPage() {
  redirect('/trending?view=activity');
}
