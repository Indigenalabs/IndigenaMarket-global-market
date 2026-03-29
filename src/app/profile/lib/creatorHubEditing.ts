import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

export function getCreatorHubEditHref(offeringId: string) {
  return `/creator-hub/edit/${encodeURIComponent(offeringId)}`;
}

export function getNativeCreatorEditorHref(offering: ProfileOffering, profileSlug = 'aiyana-redbird') {
  const returnTo = encodeURIComponent(getCreatorHubEditHref(offering.id));
  const slugParam = `slug=${encodeURIComponent(profileSlug)}`;

  switch (offering.pillar) {
    case 'digital-arts':
      return `/digital-arts/add?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}`;
    case 'physical-items':
      return `/physical-items/add?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}`;
    case 'courses':
      return `/courses/create?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}`;
    case 'cultural-tourism':
      return `/cultural-tourism/operator?focus=create&returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}`;
    case 'freelancing':
    case 'language-heritage':
    case 'land-food':
    case 'advocacy-legal':
    case 'materials-tools':
      return `/creator-hub/new/${encodeURIComponent(offering.pillar)}?returnTo=${returnTo}&edit=${encodeURIComponent(offering.id)}&${slugParam}`;
    default:
      return getCreatorHubEditHref(offering.id);
  }
}
