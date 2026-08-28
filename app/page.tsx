import SiteHeader from "@/components/SiteHeader";
import WelcomeScene from "@/components/WelcomeScene";
import StorySection from "@/components/StorySection";
import ApartmentsSection from "@/components/ApartmentsSection";
import QualitiesSection from "@/components/QualitiesSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import { loadSiteData } from "@/lib/site-data";

/* Rendered per request rather than prerendered at build. The residences are
   editable, so a page baked at build time would show whatever was in the
   database when it was deployed until something happened to revalidate it —
   and the build would need a database connection just to render the page. */
export const dynamic = "force-dynamic";

/* All copy lives in components/i18n/dictionary.ts — this file only lays the
   sections out and says which images they use.

   The residences themselves come from the database, read here on the server
   and passed down: the admin owns them now, so the Client Components can no
   longer import a static table. */
export default async function Home() {
  const { listings, rooms } = await loadSiteData();

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

      <ApartmentsSection listings={listings} rooms={rooms} />

      <QualitiesSection />

      <ContactSection />

      <SiteFooter />
    </>
  );
}
