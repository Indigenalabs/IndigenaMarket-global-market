import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import LanguageHeritageMarketplace from '@/app/components/marketplace/LanguageHeritageMarketplace';

export default function LanguageHeritageMarketplacePage() {
  return (
    <LanguageHeritageFrame
      title="Language & Heritage Marketplace"
      subtitle="Search, filter, request access, and purchase language and heritage materials."
    >
      <LanguageHeritageMarketplace viewAllOnly />
    </LanguageHeritageFrame>
  );
}
