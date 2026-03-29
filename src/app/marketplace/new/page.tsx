import { redirect } from 'next/navigation';

export default function MarketplaceNewPage() {
  redirect('/trending?view=new');
}
