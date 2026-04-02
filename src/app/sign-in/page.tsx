import SignInClient from '@/app/sign-in/SignInClient';

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <SignInClient nextPath={params.next || '/creator-hub'} />;
}
