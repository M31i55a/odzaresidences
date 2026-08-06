"use client";

import Image from "next/image";
import DropReveal from "./DropReveal";
import TextDrop from "./TextDrop";
import { useT } from "./i18n/locale";
import styles from "./story-section.module.css";

type StorySectionProps = {
  /** Which block of copy in `dict.story` this section renders. */
  copyKey: "why" | "residences";
  image: { src: string; width: number; height: number };
  /** Which column the image takes. Sections alternate down the page. */
  mediaSide?: "left" | "right";
  /** Anchor for the nav to scroll to. */
  id?: string;
};

export default function StorySection({
  copyKey,
  image,
  mediaSide = "left",
  id,
}: StorySectionProps) {
  const copy = useT().story[copyKey];

  return (
    <section className={styles.section} id={id}>
      <div className={styles.inner} data-media={mediaSide}>
        <div className={styles.media}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>

          <DropReveal className={styles.frame}>
            <Image
              src={image.src}
              alt={copy.alt}
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
          {/* Keyed on the language so the hinge rebuilds when the lines change
              length — otherwise the triggers keep the old measurements. */}
          <TextDrop
            key={`${copy.eyebrow}-title`}
            as="h2"
            lines={copy.title}
            className={styles.title}
          />
          <TextDrop
            key={`${copy.eyebrow}-body`}
            as="p"
            lines={copy.body}
            className={styles.body}
          />
        </div>
      </div>
    </section>
  );
}
