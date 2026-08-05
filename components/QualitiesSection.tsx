"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./qualities-section.module.css";

gsap.registerPlugin(ScrollTrigger);

/* Placeholder copy, same as the listings. */
const QUALITIES = [
  {
    name: "Security",
    note: "Monitored entry, cameras on every approach, and a concierge who knows every face on the stair.",
  },
  {
    name: "High-speed WiFi",
    note: "Fibre to every room and mesh coverage throughout — a line that doesn't blink when the building fills up.",
  },
  {
    name: "Lights 24/7",
    note: "Backup power picks up the moment the grid drops. You won't notice it happen.",
  },
  {
    name: "Climate intelligence",
    note: "Zoned heating and cooling that learns the hours you keep, room by room.",
  },
  {
    name: "Parking",
    note: "Covered, assigned and lit, with room for a second car and a charger at every bay.",
  },
  {
    name: "Luxury design",
    note: "Materials chosen to age well — stone, oak, brass, and as much daylight as the plot allows.",
  },
];

/** "Lights 24/7" is where the house turns to night. */
const NIGHTFALL_INDEX = QUALITIES.findIndex((q) => q.name === "Lights 24/7");

const DAY_BG = "#f8f1e7";
const NIGHT_BG = "#1b1815";
const DAY_INK = "#16181c";
const NIGHT_INK = "#ede6da";

export default function QualitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const nightfallRef = useRef<HTMLLIElement>(null);

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
         colours travel with it on the same scrub. */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: nightfallRef.current,
            start: "top 75%",
            end: "top 30%",
            scrub: true,
          },
        })
        .to(dayRef.current, { opacity: 0, ease: "none" }, 0)
        .to(sectionRef.current, { backgroundColor: NIGHT_BG, ease: "none" }, 0)
        .to(copyRef.current, { color: NIGHT_INK, ease: "none" }, 0);
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
          <p className={`${styles.eyebrow} ${styles.hinge}`}>Qualities</p>
          <h2 className={`${styles.title} ${styles.hinge}`}>
            Everything already running.
          </h2>

          <ol className={styles.list}>
            {QUALITIES.map((quality, i) => (
              <li
                className={`${styles.item} ${styles.hinge}`}
                key={quality.name}
                ref={i === NIGHTFALL_INDEX ? nightfallRef : undefined}
              >
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.name}>{quality.name}</h3>
                <p className={styles.note}>{quality.note}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.media}>
          <div className={styles.frame}>
            <div className={styles.layer}>
              <Image
                src="/house_night.jpg"
                alt="The residence after dark"
                fill
                sizes="(max-width: 860px) 100vw, 46vw"
                className={styles.shot}
              />
            </div>

            <div className={styles.layer} ref={dayRef}>
              <Image
                src="/house_day.png"
                alt="The residence in daylight"
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
