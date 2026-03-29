import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import DigitalArtsHero from '@/app/digital-arts/components/DigitalArtsHero';
import { ArtworkTile, SpotlightStrip } from '@/app/digital-arts/components/DigitalArtsCards';
import { categoryMeta, getArtworksByCategory, type DigitalArtwork } from '@/app/digital-arts/data/pillar1Showcase';

export default function AnimationCategoryPage() {
  const key: DigitalArtwork['category'] = 'animation-motion-graphics';
  const meta = categoryMeta[key];
  const listings = getArtworksByCategory(key);

  return (
    <DigitalArtsFrame title={meta.label} subtitle={meta.description}>
      <DigitalArtsHero
        eyebrow="Category Showcase"
        title="Animation and Motion Graphics Marketplace"
        description="Purchase loops, sequences, and story-driven motion assets for campaigns, exhibitions, and media productions."
        image={meta.cover}
        chips={['Loop Packs', 'Performance Visuals', 'Commercial licensing']}
        actions={[
          { href: '/digital-arts/licensing-inquiry', label: 'Request Motion License' },
          { href: '/digital-arts/commission-request', label: 'Commission Custom Motion', tone: 'secondary' }
        ]}
      />
      <SpotlightStrip />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ArtworkTile key={listing.id} artwork={listing} />
        ))}
      </section>
    </DigitalArtsFrame>
  );
}

