import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

export function getCreatorHubEditHref(offeringId: string, accountSlug?: string) {
  const params = new URLSearchParams();
  if (accountSlug) params.set('accountSlug', accountSlug);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return `/creator-hub/edit/${encodeURIComponent(offeringId)}${suffix}`;
}

export function getNativeCreatorEditorHref(
  offering: ProfileOffering,
  profileSlug = 'aiyana-redbird',
  accountSlug?: string
) {
  const returnTo = encodeURIComponent(getCreatorHubEditHref(offering.id, accountSlug));
  const slugParam = `slug=${encodeURIComponent(profileSlug)}`;
  const storefrontParam = accountSlug ? `&accountSlug=${encodeURIComponent(accountSlug)}` : '';

  switch (offering.pillar) {
    case 'digital-arts':
      return `/digital-arts/add?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}${storefrontParam}`;
    case 'physical-items':
      return `/physical-items/add?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}${storefrontParam}`;
    case 'courses':
      return `/courses/create?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}${storefrontParam}`;
    case 'cultural-tourism':
      return `/cultural-tourism/operator?focus=create&returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}${storefrontParam}`;
    case 'freelancing':
    case 'language-heritage':
    case 'land-food':
    case 'advocacy-legal':
    case 'materials-tools':
      return `/creator-hub/new/${encodeURIComponent(offering.pillar)}?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}${storefrontParam}`;
    default:
      return getCreatorHubEditHref(offering.id, accountSlug);
  }
}
