import React from 'react';

type Props = {
  title: string;
  description: string;
  image: string;
  price?: string;
  cta: string;
  onView?: () => void;
};

export default function LandFoodPremiumPlacementCard({ title, description, image, price, cta, onView }: Props) {
  return null;
}
