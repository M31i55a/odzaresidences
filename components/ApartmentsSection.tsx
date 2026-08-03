"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APARTMENTS, FEATURED_COUNT } from "./apartments-data";
import { getLenis } from "./lenis-instance";
import styles from "./apartments-section.module.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURED = APARTMENTS.slice(0, FEATURED_COUNT);

/** Anchor the /apartments page links back to. */
export const SECTION_ID = "apartments";

export default function ApartmentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

    /* Arriving from /apartments via #apartments. Next scrolls to the anchor
       before ScrollTrigger has laid out the pin spacer, so the native jump
       lands short — re-measure, then move through Lenis, which owns the
       scroll position. */
    let raf = 0;
    if (window.location.hash === `#${SECTION_ID}`) {
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const el = sectionRef.current;
        if (!el) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(el, { immediate: true });
        else el.scrollIntoView();
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.section} id={SECTION_ID} ref={sectionRef}>
      <div className={styles.pin} ref={pinRef}>
        <header className={styles.head} ref={headRef}>
          <p className={`${styles.eyebrow} ${styles.hinge}`}>Apartments</p>
          <h2 className={`${styles.title} ${styles.hinge}`}>
            Spaces to move into.
          </h2>
        </header>

        <div className={styles.viewport}>
          <div className={styles.track} ref={trackRef}>
            {FEATURED.map((flat) => (
              <article className={`${styles.card} ${styles.panel}`} key={flat.slug}>
                <div className={styles.shot}>
                  <Image
                    src={flat.src}
                    alt={flat.alt}
                    fill
                    sizes="(max-width: 760px) 80vw, 32vw"
                    className={styles.img}
                  />
                </div>

                <div className={styles.desc}>
                  <h3 className={styles.name}>{flat.name}</h3>
                  <p className={styles.kind}>{flat.kind}</p>

                  <dl className={styles.facts}>
                    <div className={styles.fact}>
                      <dt>Price</dt>
                      <dd className={styles.price}>{flat.price}</dd>
                    </div>
                    <div className={styles.fact}>
                      <dt>Rooms</dt>
                      <dd>{flat.rooms}</dd>
                    </div>
                    <div className={styles.fact}>
                      <dt>Area</dt>
                      <dd>{flat.area}</dd>
                    </div>
                  </dl>

                  <Link
                    className={styles.detail}
                    href={`/apartments#${flat.slug}`}
                  >
                    See in details
                    <svg className={styles.arrow} viewBox="0 0 16 10" aria-hidden="true">
                      <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}

            <div className={`${styles.more} ${styles.panel}`}>
              <p className={styles.moreText}>
                {APARTMENTS.length - FEATURED_COUNT} more waiting.
              </p>
              <Link className={styles.moreLink} href="/apartments">
                Visit more
                <svg className={styles.arrow} viewBox="0 0 16 10" aria-hidden="true">
                  <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
