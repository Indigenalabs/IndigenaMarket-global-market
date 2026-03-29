export type VerificationProductId =
  | 'course-certificate'
  | 'artist-verification-renewal'
  | 'community-verification'
  | 'elder-signature'
  | 'blockchain-authentication'
  | 'nfc-tag-encoding';

export interface VerificationProduct {
  id: VerificationProductId;
  name: string;
  description: string;
  amount: number;
  audience: 'creator' | 'learner' | 'community' | 'collector';
}

export const VERIFICATION_PRODUCTS: VerificationProduct[] = [
  {
    id: 'course-certificate',
    name: 'Course Certificate',
    description: 'Verified completion certificate for paid course outcomes.',
    amount: 25,
    audience: 'learner'
  },
  {
    id: 'artist-verification-renewal',
    name: 'Artist Verification Renewal',
    description: 'Annual renewal for verified creator trust status.',
    amount: 10,
    audience: 'creator'
  },
  {
    id: 'community-verification',
    name: 'Community Verification',
    description: 'Verification for community-run hubs, collectives, and organizations.',
    amount: 50,
    audience: 'community'
  },
  {
    id: 'elder-signature',
    name: 'Elder Digital Signature',
    description: 'Restricted-content or protocol approval requiring elder sign-off.',
    amount: 100,
    audience: 'creator'
  },
  {
    id: 'blockchain-authentication',
    name: 'Blockchain Authentication',
    description: 'On-chain proof of authenticity for items, works, and certificates.',
    amount: 5,
    audience: 'collector'
  },
  {
    id: 'nfc-tag-encoding',
    name: 'NFC Tag Encoding',
    description: 'Encode authenticity and origin into a physical NFC tag.',
    amount: 5,
    audience: 'collector'
  }
];

export function getVerificationProduct(productId: string) {
  return VERIFICATION_PRODUCTS.find((entry) => entry.id === productId) || null;
}
