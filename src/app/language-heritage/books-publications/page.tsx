import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Books & Publications" subtitle="Children books, poetry, journals, and community publications.">
      <HeritageHeroBanner
        eyebrow="Publishing"
        title="Reading Pathways for Every Generation"
        description="Browse children books, poetry, and journals that keep language active across homes, schools, and community spaces."
        image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=700&fit=crop"
        chips={['Children Books', 'Poetry', 'Community Journals']}
      />
      <HeritageLiveListings title="Books & Publications" query={{ categoryId: 'written-literature', sort: 'featured' }} />
      <HeritageLiveListings title="Folklore & Oral Traditions" query={{ categoryId: 'folklore-oral-traditions', sort: 'featured' }} />
    </LanguageHeritageFrame>
  );
}
