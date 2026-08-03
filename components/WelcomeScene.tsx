"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import SiteNav from "./SiteNav";
import { LOGO_PATH_D } from "./logo-path";
import styles from "./welcome-scene.module.css";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/* The mark is composed in its own space: the key sits at the top, the wordmark
   underneath. Both the outline, the frosted fill and the knockout clip reuse
   these exact coordinates so the three states register perfectly. */
const MARK_VIEWBOX = "0 0 100 78";
const KEY_TRANSFORM = "translate(25 2)";
const WORD_Y = 68;

export default function WelcomeScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const houseLayerRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLDivElement>(null);
  const cloudLRef = useRef<HTMLDivElement>(null);
  const cloudRRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<SVGGElement>(null);
  const drawPathRef = useRef<SVGPathElement>(null);
  const wipeRef = useRef<SVGRectElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const knockRef = useRef<SVGImageElement>(null);
  const whiteoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Collapse the runway rather than scrubbing a scene nobody asked to see.
    if (reduceMotion) {
      sceneRef.current?.setAttribute("data-static", "true");
      return;
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    const ctx = gsap.context(() => {
      gsap.set(houseRef.current, { transformOrigin: "50% 14%" });
      gsap.set(copyRef.current, { transformOrigin: "50% 22%" });
      gsap.set(drawPathRef.current, { drawSVG: "0%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      /* ---- 0.00 → 0.18 · approach (slides 1 → 2) ----
         The chrome leaves first, then the roofline climbs into the button. */
      tl.to(navRef.current, { autoAlpha: 0, y: -34, duration: 0.07, ease: "power1.in" }, 0)
        .to(ctaRef.current, { autoAlpha: 0, y: -16, duration: 0.09, ease: "power1.in" }, 0.05)
        .to(houseRef.current, { scale: 1.35, yPercent: -5, duration: 0.18, ease: "none" }, 0)
        .to(copyRef.current, { scale: 1.12, yPercent: -4, duration: 0.18, ease: "none" }, 0)
        .fromTo(
          smokeRef.current,
          { yPercent: 100, opacity: 0 },
          { yPercent: 55, opacity: 0.9, duration: 0.18, ease: "none" },
          0
        );

      /* ---- 0.18 → 0.34 · dissolve (slide 3) ----
         The heading thins out to a ghost while the weather closes in. */
      tl.to(houseRef.current, { scale: 1.9, yPercent: -9, duration: 0.16, ease: "none" }, 0.18)
        .to(copyRef.current, { scale: 1.3, yPercent: -9, duration: 0.16, ease: "none" }, 0.18)
        .to(headingRef.current, { opacity: 0.32, duration: 0.12, ease: "none" }, 0.18)
        .to(subRef.current, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.18)
        .to(eyebrowRef.current, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.18)
        .to(smokeRef.current, { yPercent: 25, opacity: 1, duration: 0.16, ease: "none" }, 0.18)
        .fromTo(
          [cloudLRef.current, cloudRRef.current],
          { opacity: 0 },
          { opacity: 0.85, duration: 0.16, ease: "none" },
          0.18
        )
        .fromTo(cloudLRef.current, { xPercent: -24 }, { xPercent: 0, duration: 0.24, ease: "none" }, 0.18)
        .fromTo(cloudRRef.current, { xPercent: 24 }, { xPercent: 0, duration: 0.24, ease: "none" }, 0.18)
        .to(copyRef.current, { autoAlpha: 0, duration: 0.06, ease: "none" }, 0.31);

      /* ---- 0.34 → 0.52 · the mark draws itself on (slide 4) ---- */
      tl.fromTo(markRef.current, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: "none" }, 0.34)
        .to(drawPathRef.current, { drawSVG: "100%", duration: 0.13, ease: "power1.inOut" }, 0.35)
        .fromTo(
          wipeRef.current,
          { attr: { width: 0 } },
          { attr: { width: 100 }, duration: 0.09, ease: "power1.inOut" },
          0.43
        );

      /* ---- 0.52 → 0.68 · the outline fills (slide 5) ---- */
      tl.fromTo(fillRef.current, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "none" }, 0.53)
        .to(outlineRef.current, { opacity: 0, duration: 0.1, ease: "none" }, 0.54)
        .to(houseRef.current, { scale: 2.35, duration: 0.16, ease: "none" }, 0.52)
        .to(houseLayerRef.current, { opacity: 0.55, duration: 0.16, ease: "none" }, 0.52);

      /* ---- 0.68 → 0.85 · knockout (slide 6) ----
         The full-bleed house leaves as the letterform-shaped one arrives, so
         only the building inside the mark survives. */
      tl.fromTo(knockRef.current, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "none" }, 0.68)
        .to(fillRef.current, { opacity: 0, duration: 0.1, ease: "none" }, 0.7)
        .to(houseLayerRef.current, { opacity: 0, duration: 0.12, ease: "none" }, 0.7)
        .to(houseRef.current, { scale: 2.7, duration: 0.17, ease: "none" }, 0.68);

      /* ---- 0.85 → 1.00 · whiteout (slide 7) ---- */
      tl.to([cloudLRef.current, cloudRRef.current], { scale: 1.4, opacity: 1, duration: 0.15, ease: "none" }, 0.85)
        .to(smokeRef.current, { yPercent: -8, duration: 0.15, ease: "none" }, 0.85)
        .to(markRef.current, { scale: 1.14, opacity: 0, duration: 0.12, ease: "power1.in" }, 0.87)
        .to(whiteoutRef.current, { opacity: 1, duration: 0.13, ease: "power1.in" }, 0.87);
    }, sceneRef);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.scene} ref={sceneRef}>
      <div className={styles.stage}>
        {/* ---- sky ---- */}
        <div className={styles.back}>
          <Image
            src="/back.jpg"
            alt=""
            fill
            preload
            sizes="100vw"
            className={styles.backImg}
          />
        </div>

        {/* ---- nav ----
            Sits first in the DOM only so the loader's staggered `.line-inner`
            reveal starts at the top of the page; layering is all z-index. */}
        <div className={styles.navShell} ref={navRef}>
          <div className="line-mask">
            <div className="line-inner">
              <SiteNav />
            </div>
          </div>
        </div>

        {/* ---- hero copy ---- */}
        <div className={styles.copy} ref={copyRef}>
          <div className="line-mask" ref={eyebrowRef}>
            <p className={`line-inner ${styles.eyebrow}`}>Welcome</p>
          </div>

          <div className="line-mask" ref={headingRef}>
            <h1 className={`line-inner ${styles.heading}`}>The door is open.</h1>
          </div>

          <div className="line-mask" ref={subRef}>
            <p className={`line-inner ${styles.sub}`}>
              Your house is <span className={styles.subLead}>here</span> Just
              come and grab the <span className={styles.subLead}>keys</span> !
            </p>
          </div>

          <div className="line-mask" ref={ctaRef}>
            <div className={`line-inner ${styles.ctaWrap}`}>
              <a className={styles.cta} href="#">
                Find Properties
                <svg className={styles.ctaArrow} viewBox="0 0 16 10" aria-hidden="true">
                  <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ---- house ---- */}
        <div className={styles.houseLayer} ref={houseLayerRef}>
          <div className={styles.house} ref={houseRef}>
            {/* `unoptimized` keeps this on the same /house.png URL the knockout
                <image> below requests — one fetch, and the two stay aligned. */}
            <Image
              src="/house.png"
              alt="An Odza residence at golden hour"
              width={1920}
              height={1708}
              preload
              unoptimized
              className={styles.houseImg}
            />
          </div>
        </div>

        {/* ---- smoke ---- */}
        <div className={styles.smoke} ref={smokeRef}>
          <Image
            src="/smoke.png"
            alt=""
            width={1920}
            height={620}
            sizes="140vw"
            className={styles.smokeImg}
          />
        </div>

        {/* ---- clouds ---- */}
        <div className={`${styles.cloud} ${styles.cloudL}`} ref={cloudLRef}>
          <Image src="/cloud.png" alt="" width={1920} height={815} sizes="78vw" className={styles.cloudImg} />
        </div>
        <div className={`${styles.cloud} ${styles.cloudR}`} ref={cloudRRef}>
          <Image src="/cloud.png" alt="" width={1920} height={815} sizes="78vw" className={styles.cloudImg} />
        </div>

        {/* ---- the mark ---- */}
        <div className={styles.mark} ref={markRef} aria-hidden="true">
          <svg className={styles.markSvg} viewBox={MARK_VIEWBOX} xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* left-to-right reveal for the wordmark — DrawSVG cannot animate
                  <text>, and a clipped wipe reads the same at this scale. */}
              <clipPath id="odzaWordWipe">
                <rect ref={wipeRef} x="0" y="54" width="0" height="24" />
              </clipPath>

              <clipPath id="odzaMarkClip">
                <path d={LOGO_PATH_D} transform={KEY_TRANSFORM} />
                <text x="50" y={WORD_Y} textAnchor="middle" className={styles.wordmark}>
                  Odza Residences
                </text>
              </clipPath>
            </defs>

            {/* state 1 — outline */}
            <g className={styles.markOutline} ref={outlineRef}>
              <path ref={drawPathRef} d={LOGO_PATH_D} transform={KEY_TRANSFORM} />
              <g clipPath="url(#odzaWordWipe)">
                <text x="50" y={WORD_Y} textAnchor="middle" className={styles.wordmark}>
                  Odza Residences
                </text>
              </g>
            </g>

            {/* state 2 — frosted fill */}
            <g className={styles.markFill} ref={fillRef}>
              <path d={LOGO_PATH_D} transform={KEY_TRANSFORM} />
              <text x="50" y={WORD_Y} textAnchor="middle" className={styles.wordmark}>
                Odza Residences
              </text>
            </g>

            {/* state 3 — the house, knocked out */}
            <image
              ref={knockRef}
              className={styles.markKnock}
              href="/house.png"
              x="-15"
              y="-22"
              width="130"
              height="130"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#odzaMarkClip)"
            />
          </svg>
        </div>

        {/* ---- whiteout ---- */}
        <div className={styles.whiteout} ref={whiteoutRef} />
      </div>
    </section>
  );
}
