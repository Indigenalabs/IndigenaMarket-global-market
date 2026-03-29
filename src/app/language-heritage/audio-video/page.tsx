import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Audio & Video Recordings" subtitle="Oral histories, storytelling, songs, and conversation packs.">
      <HeritageHeroBanner
        eyebrow="Oral Traditions"
        title="Listen to Living Voices and Story Archives"
        description="Explore dialogue packs, Elder storytelling, and song recordings with transcript-ready learning support."
        image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&h=700&fit=crop"
        chips={['Waveform Ready', 'Story Collections', 'Speaker Verified']}
      />
      <HeritageLiveListings title="Featured Recordings" query={{ categoryId: 'audio-video-resources', sort: 'featured' }} />
      <HeritageLiveListings title="Oral History & Storytelling" query={{ categoryId: 'oral-history-storytelling', sort: 'featured' }} />
    </LanguageHeritageFrame>
  );
}
