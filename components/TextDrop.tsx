"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./text-drop.module.css";

gsap.registerPlugin(ScrollTrigger);

type TextDropProps = {
  /** One entry per line. Line breaks are deliberate — each one hinges alone. */
  lines: string[];
  /** Element to render the copy as. Pick for document outline, not for looks. */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /** Applied to the text element, so callers can override the type scale. */
  className?: string;
};

/**
 * The site's reveal for headings and display copy: each line lies face-down and
 * swings up on its top edge, scrubbed by scroll position.
 *
 * <TextDrop as="h2" lines={["Your life's changing.", "Find what's next."]} />
 */
export default function TextDrop({
  lines,
  as: Tag = "div",
  className,
}: TextDropProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lineEls = gsap.utils.toArray<HTMLElement>(`.${styles.line}`, root);

    // Land them flat rather than leaving the copy edge-on and unreadable.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(lineEls, { rotateX: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      lineEls.forEach((line) => {
        gsap.fromTo(
          line,
          { rotateX: -120 },
          {
            rotateX: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: line,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [lines]);

  return (
    <div className={styles.drop} ref={rootRef}>
      <Tag className={`${styles.text}${className ? ` ${className}` : ""}`}>
        {lines.map((line, i) => (
          <span key={`${i}-${line}`} className={styles.line}>
            {line}
          </span>
        ))}
      </Tag>
    </div>
  );
}
