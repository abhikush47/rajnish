import HeroSection from '@/components/sections/HeroSection';
import VisionSection from '@/components/sections/VisionSection';
import RMokshaTeaser from '@/components/sections/RMokshaTeaser';
import CampaignHighlights from '@/components/sections/CampaignHighlights';
import MayorTeaser from '@/components/sections/MayorTeaser';
import MarqueeTicker from '@/components/ui/MarqueeTicker';

export default function HomePage({ params: { locale } }) {
  return (
    <>
      <HeroSection locale={locale} />
      <MarqueeTicker locale={locale} />
      <VisionSection locale={locale} />
      <RMokshaTeaser locale={locale} />
      <CampaignHighlights locale={locale} />
      <MayorTeaser locale={locale} />
    </>
  );
}
