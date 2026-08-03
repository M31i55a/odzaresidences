"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./text-drop.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Wrapper that opens the 3D room. Must be an ancestor of the hinging items. */
export const dropRootClass = styles.drop;

/** Every element that should hinge carries this — a line of type or an image. */
export const dropItemClass = styles.line;

/**
 * The site's reveal: each item lies face-down and swings up on its top edge,
 * scrubbed by scroll position. Shared so text and media hinge identically
 * rather than drifting apart as two copies of the same tween.
 */
export function useDropReveal(
  rootRef: RefObject<HTMLElement | null>,
  /** Change this when the contents change, to rebuild the triggers. */
  signature?: string
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = gsap.utils.toArray<HTMLElement>(`.${dropItemClass}`, root);

    // Land them flat rather than leaving content edge-on and unreadable.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { rotateX: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { rotateX: -120 },
          {
            rotateX: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [rootRef, signature]);
}
