import Image from "next/image";
import DropReveal from "./DropReveal";
import TextDrop from "./TextDrop";
import styles from "./why-section.module.css";

/* Placeholder copy — written to sit in the right shape, not to be final. */
const TITLE = [
  "Your life's changing.",
  "Don't just find a place —",
  "find what's next.",
];

const BODY = [
  "We help you move forward with clarity,",
  "confidence, and the right key",
  "already in your hand.",
];

export default function WhySection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.media}>
          <p className={styles.eyebrow}>Why Odza</p>

          <DropReveal className={styles.frame}>
            <Image
              src="/villa.avif"
              alt="An Odza villa"
              width={768}
              height={512}
              sizes="(max-width: 760px) 100vw, 34vw"
              className={styles.villa}
            />
          </DropReveal>
        </div>

        <div className={styles.copy}>
          <TextDrop as="h2" lines={TITLE} className={styles.title} />
          <TextDrop as="p" lines={BODY} className={styles.body} />
        </div>
      </div>
    </section>
  );
}
