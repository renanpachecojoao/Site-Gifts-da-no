import { Hero } from "@/components/home/Hero";
import { BestSellers, CategoriesSection } from "@/components/home/CatalogSections";
import { HowItWorks, OccasionsSection, PersonalizeSection } from "@/components/home/StorySections";
import { InstagramFeed, Newsletter, Testimonials } from "@/components/home/CommunitySections";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <BestSellers />
      <PersonalizeSection />
      <HowItWorks />
      <OccasionsSection />
      <Testimonials />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}
