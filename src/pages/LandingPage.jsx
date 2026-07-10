import { Link } from 'react-router-dom';
import HeroSection from './sections/HeroSection';
// import TrendingGames from './sections/TrendingGames';
// import TrendingSport from './sections/TrendingSports';
import PromotionSection from './sections/PromotionSection';
import BetsLogSection from './sections/BetsLogSection';
import FaqSection from './sections/FaqSection';
import InhouseGames from './sections/InHouseGames';
import RecentWins from './sections/RecentWins';

function LandingPage() {
  return (
    <div className="min-h-screen w-full relative bg-gradient-to-b from-grey-900 to-grey-800 text-white">
      <div className="container relative mx-auto px-0 py-0">
        <HeroSection />
        <RecentWins />
        <InhouseGames />
       {/* <TrendingGames />

         <TrendingSport /> */}

        {/* <PromotionSection /> */}
        <BetsLogSection />
        <FaqSection />
      </div>
    </div>
  );
}

export default LandingPage;


