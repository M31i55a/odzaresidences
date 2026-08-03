"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    // Inertia is exactly what someone asking for reduced motion doesn't want.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      // Lenis' own docs call syncTouch experimental, and hijacking touch
      // scrolling reads as lag on a phone. Native momentum is better there.
      syncTouch: false,
      autoRaf: false, // GSAP's ticker drives it instead — see below
    });

    /* Lenis and ScrollTrigger have to share one clock, or the pinned scene
       lags a frame behind the scroll position it's supposed to be scrubbing. */
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000); // gsap ticker is in seconds
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* The loader locks scrolling with `body.loading`. Hold Lenis at the top for
       as long as that's set, so nobody scrolls past the first screen while the
       intro is still playing over it. */
    const syncLock = () => {
      if (document.body.classList.contains("loading")) {
        lenis.scrollTo(0, { immediate: true });
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    syncLock();
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      lenis.destroy();
    };
  }, []);

  return null;
}
