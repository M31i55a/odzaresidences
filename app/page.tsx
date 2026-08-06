import SiteHeader from "@/components/SiteHeader";
import WelcomeScene from "@/components/WelcomeScene";
import StorySection from "@/components/StorySection";
import ApartmentsSection from "@/components/ApartmentsSection";
import QualitiesSection from "@/components/QualitiesSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

/* All copy lives in components/i18n/dictionary.ts — this file only lays the
   sections out and says which images they use. */
export default function Home() {
  return (
    <>
      <SiteHeader />

      <WelcomeScene />

      <StorySection
        id="about"
        copyKey="why"
        image={{ src: "/villa.avif", width: 768, height: 512 }}
        mediaSide="left"
      />

      <StorySection
        copyKey="residences"
        image={{ src: "/villa2.jpg", width: 6720, height: 4480 }}
        mediaSide="right"
      />

      <ApartmentsSection />

      <QualitiesSection />

      <ContactSection />

      <SiteFooter />
    </>
  );
}
