"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { RoomPart } from "./apartment-rooms";
import { useDropReveal } from "./use-drop-reveal";
import styles from "./room-gallery.module.css";

type RoomGalleryProps = {
  parts: RoomPart[];
  /** Which part opens selected. */
  initialId: string;
};

export default function RoomGallery({ parts, initialId }: RoomGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(initialId);

  const active = parts.find((part) => part.id === activeId) ?? parts[0];

  // "mount", not "scroll": this sits above the fold, so a scroll-scrubbed
  // trigger would leave it face-down with nothing to drive it.
  useDropReveal(rootRef, undefined, {
    trigger: "mount",
    selector: `.${styles.hinge}`,
  });

  return (
    <div className={styles.gallery} ref={rootRef}>
      <figure className={`${styles.stage} ${styles.hinge}`}>
        <Image
          key={active.id}
          src={active.image}
          alt={active.alt}
          fill
          sizes="(max-width: 860px) 100vw, 50vw"
          className={styles.stageImg}
        />

        <figcaption className={styles.overlay}>
          <h2 className={styles.overlayName}>{active.name}</h2>

          <dl className={styles.specs}>
            {active.specs.map((spec) => (
              <div className={styles.spec} key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </figcaption>
      </figure>

      <div className={styles.rail}>
        {parts.map((part) => (
          <button
            type="button"
            key={part.id}
            className={`${styles.thumb} ${styles.hinge}`}
            data-active={part.id === activeId}
            aria-pressed={part.id === activeId}
            onClick={() => setActiveId(part.id)}
          >
            <Image
              src={part.image}
              alt=""
              fill
              sizes="(max-width: 860px) 25vw, 22vw"
              className={styles.thumbImg}
            />
            <span className={styles.thumbLabel}>{part.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
