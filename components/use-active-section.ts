"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Which of the given sections the viewport is currently in, and keeps the URL
 * hash matching it.
 *
 * Sections not in the list (the second story block, say) leave the last match
 * standing rather than clearing it — so scrolling past them reads as still
 * being in the section they belong to.
 */
export function useActiveSection(ids: string[]) {
  const key = ids.join(",");
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const triggers = key
      .split(",")
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;

        return ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActive(id);
          },
        });
      })
      .filter(Boolean) as ScrollTrigger[];

    return () => triggers.forEach((trigger) => trigger.kill());
  }, [key]);

  /* replaceState, not a hash assignment: setting location.hash makes the
     browser jump to the element, which would fight Lenis mid-glide. This only
     rewrites what's in the address bar. */
  useEffect(() => {
    if (!active) return;
    window.history.replaceState(null, "", `${window.location.pathname}#${active}`);
  }, [active]);

  return active;
}
