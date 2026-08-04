import Image from "next/image";
import DropReveal from "./DropReveal";
import TextDrop from "./TextDrop";
import styles from "./story-section.module.css";

type StorySectionProps = {
  eyebrow: string;
  /** One entry per line — each hinges in on its own. */
  title: string[];
  body: string[];
  image: { src: string; alt: string; width: number; height: number };
  /** Which column the image takes. Sections alternate down the page. */
  mediaSide?: "left" | "right";
  /** Anchor for the nav to scroll to. */
  id?: string;
};

export default function StorySection({
  eyebrow,
  title,
  body,
  image,
  mediaSide = "left",
  id,
}: StorySectionProps) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.inner} data-media={mediaSide}>
        <div className={styles.media}>
          <p className={styles.eyebrow}>{eyebrow}</p>

          <DropReveal className={styles.frame}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              // The container caps at 1280px, so past that the column stops
              // growing and a vw-based hint would over-fetch.
              sizes="(max-width: 760px) 100vw, (max-width: 1400px) 44vw, 540px"
              className={styles.shot}
            />
          </DropReveal>
        </div>

        <div className={styles.copy}>
          <TextDrop as="h2" lines={title} className={styles.title} />
          <TextDrop as="p" lines={body} className={styles.body} />
        </div>
      </div>
    </section>
  );
}
