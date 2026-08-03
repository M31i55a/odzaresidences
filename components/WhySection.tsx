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
        <p className={styles.eyebrow}>Why Odza</p>

        <div className={styles.copy}>
          <TextDrop as="h2" lines={TITLE} />
          <TextDrop as="p" lines={BODY} className={styles.body} />
        </div>
      </div>
    </section>
  );
}
