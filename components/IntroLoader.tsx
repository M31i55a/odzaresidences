"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import styles from "./intro-loader.module.css";
import { LOGO_PATH_D } from "./logo-path";

gsap.registerPlugin(MorphSVGPlugin);

/* Every `.line-inner` on the page rises into view once the loader finishes.
   An optional `data-line` sets the order; untagged lines keep document order. */
function revealTargets() {
  return gsap.utils
    .toArray<HTMLElement>(".line-inner")
    .sort((a, b) => Number(a.dataset.line ?? 0) - Number(b.dataset.line ?? 0));
}

export default function IntroLoader() {
  const screenRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGRectElement>(null);
  const fillBarRef = useRef<SVGRectElement>(null);
  const percentageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.body;
    body.classList.add("loading");

    // geometry — must match the SVG attributes (viewBox is 0 0 49.979 49.979)
    const CENTER_X = 24.9895;
    const TRACK_TOP = 12.4895;
    const TRACK_BOTTOM = 37.4895;
    const TRACK_HEIGHT = TRACK_BOTTOM - TRACK_TOP; // 25
    const WIDE_WIDTH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--wide-width"
        )
      ) || 14;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let tl1: gsap.core.Timeline | null = null;
    let tl2: gsap.core.Timeline | null = null;
    const strayTweens: gsap.core.Tween[] = [];

    function finish() {
      body.classList.remove("loading");
    }

    function startMorphPhase() {
      // convertToPath swaps the <rect> for a <path> in the DOM (the old node
      // is detached), so grab the returned path element for all morph tweens.
      const fillPath = MorphSVGPlugin.convertToPath(fillBarRef.current!)[0];

      tl2 = gsap.timeline();

      tl2.to(fillPath, {
        duration: 1.1,
        ease: "power2.inOut",
        morphSVG: { shape: "#targetPath", map: "complexity" },
      }, "+=0.05")
        .addLabel("morphed");

      tl2.to(glowRef.current, { opacity: 1, duration: 0.7, ease: "power1.out" }, "morphed-=0.15")
        .to(svgRef.current, { scale: 1.06, duration: 0.2, ease: "power1.out", transformOrigin: "50% 50%" }, "morphed")
        .to(svgRef.current, { scale: 1, duration: 0.3, ease: "power2.out" })
        .to(glowRef.current, { opacity: 0.45, duration: 0.8, ease: "power1.inOut" }, "<");

      tl2.to({}, { duration: 2 });

      tl2.addLabel("zoomOut");
      tl2.to(figureRef.current, {
        scale: 4.9,
        duration: 1.1,
        ease: "power2.in"
      }, "zoomOut")
        .to(screenRef.current, {
          opacity: 0,
          duration: 1.1,
          ease: "power2.in",
          onComplete: () => {
            if (screenRef.current) screenRef.current.style.display = "none";
            finish();
          },
        }, "zoomOut");

      // Ordered by `data-line` rather than document order — the page's lines can
      // be split across stacking layers, which scrambles their DOM sequence.
      tl2.to(revealTargets(), {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.16,
      });
    }

    if (reduceMotion) {
      const fillPath = MorphSVGPlugin.convertToPath(fillBarRef.current!)[0];
      gsap.set(fillPath, { morphSVG: "#targetPath" });
      gsap.set(trackRef.current, { opacity: 0 });
      gsap.set(percentageRef.current, { opacity: 0 });
      strayTweens.push(
        gsap.to(screenRef.current, {
          opacity: 0,
          duration: 0.3,
          delay: 0.2,
          onComplete: () => {
            if (screenRef.current) screenRef.current.style.display = "none";
            finish();
          },
        })
      );
      gsap.set(".line-inner", { y: 0, opacity: 1 });
    } else {
      const progress = { value: 0 };

      tl1 = gsap.timeline({ onComplete: startMorphPhase });

      gsap.set(figureRef.current, { opacity: 0, scale: 0.85 });
      gsap.set(percentageRef.current, { opacity: 0 });

      tl1.to(figureRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" })
        .to(percentageRef.current, { opacity: 1, duration: 0.4 }, "<0.1");

      function updateFill() {
        const p = progress.value;
        const h = (TRACK_HEIGHT * p) / 100;
        fillBarRef.current?.setAttribute("height", h.toFixed(3));
        fillBarRef.current?.setAttribute("y", (TRACK_BOTTOM - h).toFixed(3));
        if (percentageRef.current) {
          percentageRef.current.textContent = Math.round(p) + "%";
        }
      }

      tl1.to(progress, {
        value: 40,
        duration: 2.1,
        ease: "power2.out",
        onUpdate: updateFill,
      }, "+=0.1")
        .to(progress, { duration: 1 })
        .to(progress, {
          value: 100,
          duration: 0.9,
          ease: "power1.inOut",
          onUpdate: updateFill,
        });

      tl1.to([trackRef.current, fillBarRef.current], {
        duration: 0.5,
        ease: "power3.inOut",
        attr: { width: WIDE_WIDTH, x: CENTER_X - WIDE_WIDTH / 2 },
      }, "+=0.15");

      tl1.to(trackRef.current, { opacity: 0, duration: 0.3 }, "-=0.2")
        .to(percentageRef.current, { opacity: 0, y: 4, duration: 0.3 }, "<");
    }

    return () => {
      body.classList.remove("loading");
      tl1?.kill();
      tl2?.kill();
      strayTweens.forEach((tween) => tween.kill());
    };
  }, []);

  return (
    <div className={styles.screen} ref={screenRef} aria-hidden="true">
      <div className={styles.figure} ref={figureRef}>
        <div className={styles.glow} ref={glowRef} />

        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox="0 0 49.979 49.979"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            ref={trackRef}
            className={styles.track}
            x="23.4895"
            y="12.4895"
            width="3"
            height="25"
            rx="1.4"
            ry="1.4"
          />
          <rect
            ref={fillBarRef}
            className={styles.fillBar}
            x="23.4895"
            y="37.4895"
            width="3"
            height="0"
            rx="1.4"
            ry="1.4"
          />
          <path id="targetPath" className={styles.target} d={LOGO_PATH_D} />
        </svg>
      </div>

      <div className={styles.percentage} ref={percentageRef}>
        0%
      </div>
    </div>
  );
}
