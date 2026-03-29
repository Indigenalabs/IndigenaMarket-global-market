import { redirect } from 'next/navigation';

export default function CollectionsPage() {
  redirect('/trending?view=collections');
}
