"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import styles from "./intro-loader.module.css";

gsap.registerPlugin(MorphSVGPlugin);

const TARGET_PATH_D = `M25.276,0L12.665,9.877h3.328v15.137h5.038v2.271h1.271v20.469l1.844,1.207V27.285h0.636v22.058l0.73,0.636l3.401-3.369
  v-1.334l-1.018-0.381l1.018-0.765v-0.698l-2.225-1.779l1.906-2.034l-0.699-0.89l0.699-0.572v-0.954l-1.336-1.461l0.637-1.398
  l-1.207-1.082v-1.397l1.906-1.779v-2.797h1.397v-2.271h4.565V9.877h2.756L25.276,0z M20.033,11.94h4.56v4.146h-4.56V11.94z
  M20.033,17.136h4.56v4.146h-4.56V17.136z M30.418,21.281h-4.56v-4.146h4.56V21.281z M30.418,16.087h-4.56V11.94h4.56V16.087z`;

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

      tl2.to(".line-inner", {
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
          <path id="targetPath" className={styles.target} d={TARGET_PATH_D} />
        </svg>
      </div>

      <div className={styles.percentage} ref={percentageRef}>
        0%
      </div>
    </div>
  );
}
