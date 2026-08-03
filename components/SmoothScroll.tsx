"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SmoothScroll() {
  useEffect(() => {
    // Inertia is exactly what someone asking for reduced motion doesn't want.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      smoothTouch: 0.1, // full smoothing on touch reads as lag, not polish
      ignoreMobileResize: true,
      effects: false,
    });

    /* The loader locks scrolling with `body.loading`. Hold the smoother at the
       top for as long as that's set, so nobody scrolls past the first screen
       while the intro is still playing over it. */
    const syncLock = () => {
      const locked = document.body.classList.contains("loading");
      if (locked) smoother.scrollTop(0);
      smoother.paused(locked);
    };

    syncLock();
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      smoother.kill();
    };
  }, []);

  return null;
}
