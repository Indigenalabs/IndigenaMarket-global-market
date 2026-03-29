import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Language Apps & Tools" subtitle="Apps, keyboards, fonts, and speech support tools.">
      <HeritageHeroBanner
        eyebrow="Language Tech"
        title="Tools for Writing, Speaking, and Daily Use"
        description="Discover keyboard layouts, app-based learning systems, and software designed for Indigenous language continuity."
        image="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1400&h=700&fit=crop"
        chips={['Mobile Apps', 'Keyboard Layouts', 'Syllabics & Fonts']}
      />
      <HeritageLiveListings title="Apps & Tools" query={{ format: 'software', sort: 'featured' }} />
      <HeritageLiveListings title="Language Technology" query={{ categoryId: 'language-technology', sort: 'featured' }} />
    </LanguageHeritageFrame>
  );
}
