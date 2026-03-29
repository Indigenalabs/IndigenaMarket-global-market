import { redirect } from 'next/navigation';

export default function TrendingLosersPage() {
  redirect('/trending?view=losers');
}
