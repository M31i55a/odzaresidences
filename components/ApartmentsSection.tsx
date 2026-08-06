"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APARTMENTS, FEATURED_COUNT, describe } from "./apartments-data";
import { useT } from "./i18n/locale";
import ApartmentsOverlay, { type OverlayView } from "./ApartmentsOverlay";
import styles from "./apartments-section.module.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURED = APARTMENTS.slice(0, FEATURED_COUNT);

/** Anchor the nav links scroll to. */
export const SECTION_ID = "apartments";

export default function ApartmentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<OverlayView>(null);
  const t = useT();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sectionRef.current?.setAttribute("data-static", "true");
      return;
    }

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      // How far the track has to travel for its last card to reach the left
      // edge. Read lazily so a resize re-measures instead of freezing a stale
      // width — hence invalidateOnRefresh below.
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const horizontal = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /* The heading hinges in on the section's approach, finishing exactly as
         the pin engages — once pinned it stops moving vertically, so there'd be
         no scroll left to drive it. */
      const headItems = gsap.utils.toArray<HTMLElement>(
        `.${styles.hinge}`,
        headRef.current
      );
      gsap.set(headItems, {
        transformPerspective: 2000,
        transformOrigin: "50% 0",
      });
      gsap.fromTo(
        headItems,
        { rotateX: -120 },
        {
          rotateX: 0,
          ease: "power2.out",
          stagger: 0.18,
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }
      );

      /* Cards travel sideways, not down, so their triggers read positions along
         the horizontal tween via containerAnimation. Ending at "left 70%" means
         anything already well inside the viewport when the pin starts is
         resolved flat, rather than sitting there half-turned. */
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, track);
      gsap.set(panels, {
        transformPerspective: 2000,
        transformOrigin: "50% 0",
      });
      panels.forEach((panel) => {
        gsap.fromTo(
          panel,
          { rotateX: -120 },
          {
            rotateX: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontal,
              start: "left right",
              end: "left 70%",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id={SECTION_ID} ref={sectionRef}>
      <div className={styles.pin} ref={pinRef}>
        <header className={styles.head} ref={headRef}>
          <p className={`${styles.eyebrow} ${styles.hinge}`}>{t.apartments.eyebrow}</p>
          <h2 className={`${styles.title} ${styles.hinge}`}>
            {t.apartments.title}
          </h2>
        </header>

        <div className={styles.viewport}>
          <div className={styles.track} ref={trackRef}>
            {FEATURED.map((flat) => {
              const info = describe(flat, t);
              return (
              <article className={`${styles.card} ${styles.panel}`} key={flat.slug}>
                <div className={styles.shot}>
                  <Image
                    src={flat.src}
                    alt={info.alt}
                    fill
                    sizes="(max-width: 760px) 80vw, 32vw"
                    className={styles.img}
                  />
                </div>

                <div className={styles.desc}>
                  <h3 className={styles.name}>{info.name}</h3>
                  <p className={styles.kind}>{info.kind}</p>

                  <dl className={styles.facts}>
                    <div className={styles.fact}>
                      <dt>{t.apartments.price}</dt>
                      <dd className={styles.price}>{info.price}</dd>
                    </div>
                    <div className={styles.fact}>
                      <dt>{t.apartments.rooms}</dt>
                      <dd>{info.rooms}</dd>
                    </div>
                    <div className={styles.fact}>
                      <dt>{t.apartments.area}</dt>
                      <dd>{info.area}</dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    className={styles.detail}
                    onClick={() => setView({ type: "detail", slug: flat.slug })}
                  >
                    {t.apartments.seeDetails}
                    <svg className={styles.arrow} viewBox="0 0 16 10" aria-hidden="true">
                      <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
                    </svg>
                  </button>
                </div>
              </article>
              );
            })}

            <div className={`${styles.more} ${styles.panel}`}>
              <p className={styles.moreText}>
                {t.apartments.moreWaiting(APARTMENTS.length - FEATURED_COUNT)}
              </p>
              <button
                type="button"
                className={styles.moreLink}
                onClick={() => setView({ type: "list" })}
              >
                {t.apartments.visitMore}
                <svg className={styles.arrow} viewBox="0 0 16 10" aria-hidden="true">
                  <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ApartmentsOverlay
        view={view}
        onClose={() => setView(null)}
        onSelect={(slug) => setView({ type: "detail", slug })}
      />
    </section>
  );
}
