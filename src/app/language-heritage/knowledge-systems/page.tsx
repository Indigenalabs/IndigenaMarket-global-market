import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Indigenous Knowledge Systems" subtitle="TEK, plant medicine, astronomy, and seasonal knowledge resources.">
      <HeritageHeroBanner
        eyebrow="IKS Hub"
        title="Knowledge Systems Connected to Land and Language"
        description="Explore ecological knowledge, medicinal references, and star teachings carried in language and community practice."
        image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&h=700&fit=crop"
        chips={['TEK', 'Star Knowledge', 'Plant Medicine']}
      />
      <HeritageLiveListings title="IKS Resources" query={{ categoryId: 'knowledge-systems', sort: 'featured' }} />
      <HeritageLiveListings title="Heritage Sites & Land Knowledge" query={{ categoryId: 'heritage-sites-land-knowledge', sort: 'featured' }} />
    </LanguageHeritageFrame>
  );
}
