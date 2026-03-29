import { redirect } from 'next/navigation';

export default function MarketplaceGemsPage() {
  redirect('/trending?view=gems');
}
