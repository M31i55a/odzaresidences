"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useT } from "./i18n/locale";
import styles from "./qualities-section.module.css";

gsap.registerPlugin(ScrollTrigger);

/* Order down the page; copy for each lives in the dictionary. */
const QUALITY_IDS = ["security", "wifi", "climate", "lights", "parking", "design"] as const;

/** Where the house turns to night. Keyed by id, not by label — the label
    changes with the language and would break a name lookup. */
const NIGHTFALL_INDEX = QUALITY_IDS.indexOf("lights");

const DAY_BG = "#f8f1e7";
const NIGHT_BG = "#1b1815";
const DAY_INK = "#16181c";
const NIGHT_INK = "#ede6da";
const NIGHT_ACCENT = "#c9a567";

export default function QualitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const nightfallRef = useRef<HTMLHeadingElement>(null);
  const t = useT();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(
        `.${styles.hinge}`,
        copyRef.current
      );

      if (reduceMotion) {
        gsap.set(items, { rotateX: 0 });
        return;
      }

      // Each item hinges in, the site's standard reveal.
      gsap.set(items, {
        transformPerspective: 2000,
        transformOrigin: "50% 0",
      });
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

      /* Nightfall. The day layer sits on top of the night one and simply loses
         its opacity, so the house never blinks or reloads — and the page's
         colours travel with it on the same scrub.

         Triggered on the heading itself rather than its list item: the item is
         half a screen tall with its content centred, so "top 75%" on the box
         would fire long before the words are anywhere near the reader. */
      const accents = gsap.utils.toArray<HTMLElement>(
        `.${styles.index}, .${styles.name}`,
        copyRef.current
      );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: nightfallRef.current,
            start: "top 50%", // the heading reaching mid-screen
            end: "top 12%",
            scrub: true,
          },
        })
        .to(dayRef.current, { opacity: 0, ease: "none" }, 0)
        .to(sectionRef.current, { backgroundColor: NIGHT_BG, ease: "none" }, 0)
        .to(copyRef.current, { color: NIGHT_INK, ease: "none" }, 0)
        .to(accents, { color: NIGHT_ACCENT, opacity: 1, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className={styles.section}
      id="qualities"
      ref={sectionRef}
      style={{ backgroundColor: DAY_BG }}
    >
      <div className={styles.inner}>
        <div className={styles.copy} ref={copyRef} style={{ color: DAY_INK }}>
          <p className={`${styles.eyebrow} ${styles.hinge}`}>{t.qualities.eyebrow}</p>
          <h2 className={`${styles.title} ${styles.hinge}`}>
            {t.qualities.title}
          </h2>

          <ol className={styles.list}>
            {QUALITY_IDS.map((id, i) => {
              const quality = t.qualities.items[id];
              return (
              <li className={`${styles.item} ${styles.hinge}`} key={id}>
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className={styles.name}
                  ref={i === NIGHTFALL_INDEX ? nightfallRef : undefined}
                >
                  {quality.name}
                </h3>
                <p className={styles.note}>{quality.note}</p>
              </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.media}>
          <div className={styles.frame}>
            <div className={styles.layer}>
              <Image
                src="/house_night.jpg"
                alt={t.qualitiesHouse.night}
                fill
                sizes="(max-width: 860px) 100vw, 46vw"
                className={styles.shot}
              />
            </div>

            <div className={styles.layer} ref={dayRef}>
              <Image
                src="/house_day.png"
                alt={t.qualitiesHouse.day}
                fill
                sizes="(max-width: 860px) 100vw, 46vw"
                className={styles.shot}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
