import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Language Learning Materials" subtitle="Dictionaries, phrasebooks, primers, and workbook resources.">
      <HeritageHeroBanner
        eyebrow="Learning Library"
        title="Build Fluency with Community-Curated Materials"
        description="Discover primers, dictionaries, and structured learning packs designed by language keepers and educators."
        image="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&h=700&fit=crop"
        chips={['Beginner to Advanced', 'Audio Support', 'Community-Curated']}
        actions={[
          { href: '/language-heritage/languages', label: 'Browse Languages' },
          { href: '/language-heritage/my-library', label: 'Open My Library', tone: 'secondary' }
        ]}
      />
      <HeritageLiveListings title="Language Learning Materials" query={{ categoryId: 'language-learning-materials', sort: 'featured' }} />
    </LanguageHeritageFrame>
  );
}
