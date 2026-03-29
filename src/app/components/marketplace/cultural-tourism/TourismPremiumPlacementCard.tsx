'use client';

interface TourismPremiumPlacementCardProps {
  title: string;
  description: string;
  price?: string;
  image: string;
  cta: string;
  onView: () => void;
}

export default function TourismPremiumPlacementCard({
  title,
  description,
  price,
  image,
  cta,
  onView
}: TourismPremiumPlacementCardProps) {
  return null;
}
