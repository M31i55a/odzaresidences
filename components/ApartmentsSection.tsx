"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURED_COUNT, describe, type Listing, type Room } from "./listing";
import { useT } from "./i18n/locale";
import ApartmentsOverlay, { type OverlayView } from "./ApartmentsOverlay";
import styles from "./apartments-section.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Anchor the nav links scroll to. */
export const SECTION_ID = "apartments";

export default function ApartmentsSection({
  listings,
  rooms,
}: {
  /** Loaded on the server; the admin owns this data now. */
  listings: Listing[];
  rooms: Record<string, Room[]>;
}) {
  const featured = listings.slice(0, FEATURED_COUNT);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<OverlayView>(null);
  const [atEnd, setAtEnd] = useState(false);
  const [hintTaken, setHintTaken] = useState(false);
  const t = useT();

  /* On a phone the strip is an ordinary swipeable row, and a row of images
     with no visible scrollbar reads as a static picture. Two cues say
     otherwise: a fade on the right edge, and a nudging hint under the heading.
     Both retire themselves — the fade once there's nothing left to reveal, the
     hint the moment the user takes it. Off phones the CSS never shows either,
     so this just idles: the viewport doesn't scroll there. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const read = () => {
      const overflow = viewport.scrollWidth - viewport.clientWidth;
      // Two pixels of slack: sub-pixel layout leaves scrollLeft just short of
      // its maximum on plenty of devices, so an exact test never fires.
      const spent = overflow <= 2 || viewport.scrollLeft >= overflow - 2;
      setAtEnd(spent);
      // Far enough along to be a deliberate swipe rather than a stray touch.
      if (spent || viewport.scrollLeft > 24) setHintTaken(true);
    };

    read();
    viewport.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      viewport.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* gsap.matchMedia rather than a one-off check: it tears the whole setup
       down and rebuilds it when the query stops matching, so rotating a phone
       or dragging a window across the breakpoint lands in the right mode. */
    const mm = gsap.matchMedia();

    /* Phones (and anyone asking for reduced motion): no pin, no scrubbing. The
       page scrolls vertically as usual and the strip is swiped by hand. */
    mm.add("(max-width: 760px), (prefers-reduced-motion: reduce)", () => {
      section.setAttribute("data-static", "true");
      return () => section.removeAttribute("data-static");
    });

    mm.add(
      "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
      () => {
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
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section className={styles.section} id={SECTION_ID} ref={sectionRef}>
      <div className={styles.pin} ref={pinRef}>
        <header className={styles.head} ref={headRef}>
          <p className={`${styles.eyebrow} ${styles.hinge}`}>{t.apartments.eyebrow}</p>
          <h2 className={`${styles.title} ${styles.hinge}`}>
            {t.apartments.title}
          </h2>

          {/* Deliberately not a .hinge — it belongs to the strip below, not to
              the heading's reveal. Hidden from assistive tech: the scroll
              region is already reachable without being told to swipe. */}
          <p
            className={styles.swipeHint}
            data-taken={hintTaken || undefined}
            aria-hidden="true"
          >
            {t.apartments.swipeHint}
            <svg className={`${styles.arrow} ${styles.swipeArrow}`} viewBox="0 0 16 10">
              <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
            </svg>
          </p>
        </header>

        {/* Wrapper exists so the fade can sit still at the right edge — inside
            .viewport it would be part of the scrolled content and slide away. */}
        <div className={styles.strip}>
          <div className={styles.viewport} ref={viewportRef}>
            <div className={styles.track} ref={trackRef}>
              {featured.map((flat) => {
                const info = describe(flat, t);
                return (
                <article className={`${styles.card} ${styles.panel}`} key={flat.slug}>
                  <div className={styles.shot}>
                    <Image
                      src={flat.src}
                      alt={info.alt}
                      fill
                      sizes="(max-width: 760px) 88vw, 32vw"
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
                  {t.apartments.moreWaiting(Math.max(listings.length - FEATURED_COUNT, 0))}
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

          <div
            className={styles.edgeFade}
            data-spent={atEnd || undefined}
            aria-hidden="true"
          />
        </div>
      </div>

      <ApartmentsOverlay
        listings={listings}
        rooms={rooms}
        view={view}
        onClose={() => setView(null)}
        onSelect={(slug) => setView({ type: "detail", slug })}
        onReserve={(slug) => setView({ type: "reserve", slug })}
      />
    </section>
  );
}
