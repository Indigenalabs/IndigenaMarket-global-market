import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import DigitalArtsHero from '@/app/digital-arts/components/DigitalArtsHero';
import { ArtworkTile, SpotlightStrip } from '@/app/digital-arts/components/DigitalArtsCards';
import { categoryMeta, getArtworksByCategory, type DigitalArtwork } from '@/app/digital-arts/data/pillar1Showcase';

export default function PhotographyCategoryPage() {
  const key: DigitalArtwork['category'] = 'photography';
  const meta = categoryMeta[key];
  const listings = getArtworksByCategory(key);

  return (
    <DigitalArtsFrame title={meta.label} subtitle={meta.description}>
      <DigitalArtsHero
        eyebrow="Category Showcase"
        title="Photography From Country and Community"
        description="From intimate portraits to expansive land narratives, find verified photo works with transparent rights and editions."
        image={meta.cover}
        chips={['Photo Essays', 'Print Editions', 'Usage Rights']}
        actions={[
          { href: '/digital-arts/licensing-inquiry', label: 'License a Photo' },
          { href: '/digital-arts/my-collection', label: 'Open My Collection', tone: 'secondary' }
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

