"use client";

import { useEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { LOGO_PATH_D } from "./logo-path";
import { introHasPlayed } from "./intro-state";
import styles from "./welcome-scene.module.css";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/* The mark is composed in its own space: the key sits at the top, the wordmark
   underneath. Both the outline, the frosted fill and the knockout clip reuse
   these exact coordinates so the three states register perfectly. */
const MARK_VIEWBOX = "0 0 100 78";
const KEY_TRANSFORM = "translate(25 2)";
const WORD_Y = 68;

type CopyLayer = "back" | "front";
type LineRef = RefObject<HTMLDivElement | null>;

/* The hero copy is rendered twice — once behind the house and once in front of
   it. The subtitle and the button belong to the front stack; the eyebrow and
   heading stay behind, where the roofline can climb over them. Each stack owns
   its own lines and ghosts the rest, so the two stay in lockstep no matter how
   the clamped type resolves. */
function HeroLines({
  layer,
  eyebrowRef,
  headingRef,
  subRef,
  ctaRef,
}: {
  layer: CopyLayer;
  eyebrowRef: LineRef;
  headingRef: LineRef;
  subRef: LineRef;
  ctaRef: LineRef;
}) {
  const owns = (who: CopyLayer) => who === layer;
  const mask = (who: CopyLayer) => `line-mask${owns(who) ? "" : ` ${styles.ghost}`}`;
  const inner = (who: CopyLayer) => (owns(who) ? "line-inner" : styles.ghostInner);
  const bind = (who: CopyLayer, ref: LineRef) => (owns(who) ? ref : undefined);

  /* `data-line` fixes the reveal order the loader staggers through — the two
     stacks interleave in the DOM, so document order alone would land the
     subtitle after the button. */
  return (
    <>
      <div className={mask("back")} ref={bind("back", eyebrowRef)}>
        <p className={`${inner("back")} ${styles.eyebrow}`} data-line="2">
          Welcome
        </p>
      </div>

      <div className={mask("back")} ref={bind("back", headingRef)}>
        <h1 className={`${inner("back")} ${styles.heading}`} data-line="3">
          The door is open.
        </h1>
      </div>

      <div className={mask("front")} ref={bind("front", subRef)}>
        <p className={`${inner("front")} ${styles.sub}`} data-line="4">
          Your house is <span className={styles.subLead}>here</span> Just come
          and grab the <span className={styles.subLead}>keys</span> !
        </p>
      </div>

      <div className={mask("front")} ref={bind("front", ctaRef)}>
        <div className={`${inner("front")} ${styles.ctaWrap}`} data-line="5">
          <a className={styles.cta} href="#">
            Find Properties
            <svg className={styles.ctaArrow} viewBox="0 0 16 10" aria-hidden="true">
              <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

export default function WelcomeScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const copyFrontRef = useRef<HTMLDivElement>(null);
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
  const drawPathRef = useRef<SVGPathElement>(null);
  const wordRef = useRef<SVGGElement>(null);
  const knockRef = useRef<SVGGElement>(null);
  const knockImgRef = useRef<SVGImageElement>(null);
  const whiteoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Coming back here by client-side navigation remounts this copy but not the
       loader — it lives in the root layout and has already played. Nothing
       would ever reveal these lines, so bring them in outright. */
    if (introHasPlayed() && sceneRef.current) {
      gsap.set(sceneRef.current.querySelectorAll(".line-inner"), {
        y: 0,
        opacity: 1,
      });
    }

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
      // Both copy stacks are driven as one so the subtitle never drifts out of
      // register with the heading it sits under.
      const copy = [copyRef.current, copyFrontRef.current];
      const clouds = [cloudLRef.current, cloudRRef.current];

      gsap.set(houseRef.current, { transformOrigin: "50% 14%" });
      gsap.set(copy, { transformOrigin: "50% 22%" });
      gsap.set(drawPathRef.current, { drawSVG: "0%" });

      // Banked just off either edge on the first screen, so the house reads as
      // sitting among them from the outset.
      gsap.set(cloudLRef.current, { xPercent: -12 });
      gsap.set(cloudRRef.current, { xPercent: 12 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          // The section already supplies the runway, so the pin needs no spacer.
          pin: stageRef.current,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      /* ---- 0.00 → 0.18 · approach (slides 1 → 2) ----
         The chrome clears out first, then the roofline climbs into the heading. */
      tl.to(ctaRef.current, { autoAlpha: 0, y: -16, duration: 0.09, ease: "power1.in" }, 0.05)
        .to(houseRef.current, { scale: 1.25, yPercent: -10, duration: 0.18, ease: "none" }, 0)
        .to(copy, { scale: 1.12, yPercent: -4, duration: 0.18, ease: "none" }, 0)
        .fromTo(
          smokeRef.current,
          { yPercent: 100, opacity: 0 },
          { yPercent: 55, opacity: 0.9, duration: 0.18, ease: "none" },
          0
        )
        .to(clouds, { xPercent: 0, duration: 0.34, ease: "none" }, 0);

      /* ---- 0.18 → 0.34 · dissolve (slide 3) ----
         The heading thins out to a ghost while the weather closes in. */
      tl.to(houseRef.current, { scale: 1.7, yPercent: -20, duration: 0.16, ease: "none" }, 0.18)
        .to(copy, { scale: 1.3, yPercent: -9, duration: 0.16, ease: "none" }, 0.18)
        // The heading lingers — it thins to a ghost across a long stretch
        // rather than dropping away with the rest of the copy.
        .to(headingRef.current, { opacity: 0.32, duration: 0.2, ease: "none" }, 0.18)
        .to(subRef.current, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.18)
        .to(eyebrowRef.current, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.18)
        .to(smokeRef.current, { yPercent: 25, opacity: 1, duration: 0.16, ease: "none" }, 0.18)
        .to(clouds, { opacity: 0.9, duration: 0.2, ease: "none" }, 0.14)
        .to(copy, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.34);

      /* ---- 0.26 → 0.45 · the mark draws (slide 4) ----
         Deliberately overlapping the dissolve above: the key starts drawing
         while the copy is still leaving, so the draw is something the scene
         does on its way past rather than a beat it stops and waits for. */
      tl.fromTo(markRef.current, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: "none" }, 0.26)
        .to(drawPathRef.current, { drawSVG: "100%", duration: 0.18, ease: "power1.inOut" }, 0.27)
        // a long, unhurried fade — it used to snap in over a short wipe
        .fromTo(
          wordRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "power1.out" },
          0.3
        );

      /* ---- the scene never stops moving underneath the mark ----
         Without these the house, smoke and clouds sat frozen for the whole
         draw, which is what read as the scroll stalling. */
      tl.to(houseRef.current, { scale: 2.0, yPercent: -26, duration: 0.16, ease: "none" }, 0.34)
        .to(smokeRef.current, { yPercent: 8, duration: 0.16, ease: "none" }, 0.34)
        .to(clouds, { scale: 1.12, duration: 0.2, ease: "none" }, 0.34);

      /* ---- 0.45 → 0.68 · the house becomes the fill ----
         Rises slowly through the letterforms once the outline has closed. There
         is nothing white underneath any more, so the sky simply gives way to
         the building. The full-bleed house is already dimmed by this point and
         clears out as the mark takes over. */
      tl.to(houseLayerRef.current, { opacity: 0.45, duration: 0.11, ease: "none" }, 0.34)
        .fromTo(
          knockRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.23, ease: "power1.inOut" },
          0.45
        )
        .to(houseLayerRef.current, { opacity: 0, duration: 0.16, ease: "none" }, 0.45)
        .to(houseRef.current, { scale: 2.25, yPercent: -31, duration: 0.14, ease: "none" }, 0.5)
        .to(houseRef.current, { scale: 2.45, duration: 0.14, ease: "none" }, 0.64);

      /* The building keeps travelling inside the letterforms — the mark is a
         window onto the same climb, not a frozen crop of it. */
      tl.fromTo(
        knockImgRef.current,
        { y: 16 },
        { y: -14, duration: 0.45, ease: "none" },
        0.45
      );

      /* ---- 0.65 → 0.88 · hold ----
         The mark and its wordmark get the run of the screen. Only the building
         inside the letterforms is still moving. */

      /* ---- 0.86 → 1.00 · whiteout (slide 7) ---- */
      tl.to(clouds, { scale: 1.4, opacity: 1, duration: 0.14, ease: "none" }, 0.86)
        .to(smokeRef.current, { yPercent: -8, duration: 0.14, ease: "none" }, 0.86)
        .to(markRef.current, { scale: 1.14, opacity: 0, duration: 0.09, ease: "power1.in" }, 0.9)
        .to(whiteoutRef.current, { opacity: 1, duration: 0.11, ease: "power1.in" }, 0.89);
    }, sceneRef);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.scene} id="welcome" ref={sceneRef}>
      <div className={styles.stage} ref={stageRef}>
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

        {/* ---- hero copy, behind the house ---- */}
        <div className={styles.copy} ref={copyRef}>
          <HeroLines
            layer="back"
            eyebrowRef={eyebrowRef}
            headingRef={headingRef}
            subRef={subRef}
            ctaRef={ctaRef}
          />
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

        {/* ---- hero copy, in front of the house ---- */}
        <div className={`${styles.copy} ${styles.copyFront}`} ref={copyFrontRef}>
          <HeroLines
            layer="front"
            eyebrowRef={eyebrowRef}
            headingRef={headingRef}
            subRef={subRef}
            ctaRef={ctaRef}
          />
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
              <clipPath id="odzaMarkClip">
                <path d={LOGO_PATH_D} transform={KEY_TRANSFORM} />
                <text x="50" y={WORD_Y} textAnchor="middle" className={styles.wordmark}>
                  Odza Residences
                </text>
              </clipPath>
            </defs>

            {/* the outline — stays put once drawn; the house simply fills it */}
            <g className={styles.markOutline}>
              <path ref={drawPathRef} d={LOGO_PATH_D} transform={KEY_TRANSFORM} />
              {/* fades up rather than drawing — DrawSVG can't animate <text> */}
              <g ref={wordRef} className={styles.markWord}>
                <text x="50" y={WORD_Y} textAnchor="middle" className={styles.wordmark}>
                  Odza Residences
                </text>
              </g>
            </g>

            {/* the house, knocked out. Switched on the instant the outline
                closes — no fade, no wipe. The clip lives on the group so the
                image can travel behind a fixed set of letterforms; putting it
                on the image itself would drag the clip along with it. */}
            <g ref={knockRef} className={styles.markKnock} clipPath="url(#odzaMarkClip)">
              <image
                ref={knockImgRef}
                href="/house.png"
                x="-15"
                y="-34"
                width="130"
                height="150"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          </svg>
        </div>

        {/* ---- whiteout ---- */}
        <div className={styles.whiteout} ref={whiteoutRef} />
      </div>
    </section>
  );
}
