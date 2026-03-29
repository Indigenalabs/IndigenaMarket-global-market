import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import DigitalArtsHero from '@/app/digital-arts/components/DigitalArtsHero';
import { ArtworkTile, SpotlightStrip } from '@/app/digital-arts/components/DigitalArtsCards';
import { categoryMeta, getArtworksByCategory, type DigitalArtwork } from '@/app/digital-arts/data/pillar1Showcase';

export default function ThreeDCategoryPage() {
  const key: DigitalArtwork['category'] = '3d-art';
  const meta = categoryMeta[key];
  const listings = getArtworksByCategory(key);

  return (
    <DigitalArtsFrame title={meta.label} subtitle={meta.description}>
      <DigitalArtsHero
        eyebrow="Category Showcase"
        title="3D Worlds, Sculptures, and Interactive Assets"
        description="Browse immersive collectible assets for galleries, virtual venues, and premium collectors."
        image={meta.cover}
        chips={['GLB/OBJ assets', 'XR-ready', 'Creator royalties']}
        actions={[
          { href: '/digital-arts/collection/col-1', label: 'Explore Signature Collection' },
          { href: '/digital-arts/artist-portfolio', label: 'Creator Dashboard', tone: 'secondary' }
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

