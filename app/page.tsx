import WelcomeScene from "@/components/WelcomeScene";
import StorySection from "@/components/StorySection";
import ApartmentsSection from "@/components/ApartmentsSection";
import QualitiesSection from "@/components/QualitiesSection";

/* Placeholder copy — written to sit in the right shape, not to be final. */
export default function Home() {
  return (
    <>
      <WelcomeScene />

      <StorySection
        id="about"
        eyebrow="Why Odza"
        title={[
          "Your life's changing.",
          "Don't just find a place —",
          "find what's next.",
        ]}
        body={[
          "We help you move forward with clarity,",
          "confidence, and the right key",
          "already in your hand.",
        ]}
        image={{
          src: "/villa.avif",
          alt: "An Odza villa",
          width: 768,
          height: 512,
        }}
        mediaSide="left"
      />

      <StorySection
        eyebrow="The Residences"
        title={[
          "Rooms that hold light.",
          "Space that holds a life.",
          "Built for both.",
        ]}
        body={[
          "Every Odza residence is drawn around",
          "the way a day actually moves —",
          "from first light to quiet evening.",
        ]}
        image={{
          src: "/villa2.jpg",
          alt: "The terrace of an Odza residence",
          width: 6720,
          height: 4480,
        }}
        mediaSide="right"
      />

      <ApartmentsSection />

      <QualitiesSection />
    </>
  );
}
