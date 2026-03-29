import { redirect } from 'next/navigation';

export default function TrendingGainersPage() {
  redirect('/trending?view=gainers');
}
