"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";
import TextDrop from "./TextDrop";
import { useT } from "./i18n/locale";
import styles from "./not-found.module.css";

gsap.registerPlugin(DrawSVGPlugin);

export default function NotFoundView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<SVGPathElement>(null);
  const codeRef = useRef<HTMLParagraphElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(keyRef.current, { drawSVG: "100%" });
        gsap.set([codeRef.current, tailRef.current], { opacity: 1, y: 0 });
        return;
      }

      /* The key draws itself on, exactly as the mark does at the end of the
         welcome scene — the one gesture that most says "this is Odza". */
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .fromTo(
          keyRef.current,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.4, ease: "power2.inOut" },
          0.15
        )
        .fromTo(
          codeRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.75
        )
        .fromTo(
          tailRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9 },
          1.15
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className={styles.page} ref={rootRef}>
      <div className={styles.inner}>
        <svg
          className={styles.mark}
          viewBox={LOGO_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path ref={keyRef} d={LOGO_PATH_D} />
        </svg>

        <p className={styles.code} ref={codeRef}>
          {t.notFound.code}
        </p>

        {/* "mount", not "scroll" — nothing here is below the fold, so a
            scroll-scrubbed hinge would have nothing to drive it. */}
        <TextDrop
          key={t.notFound.title}
          as="h1"
          lines={[t.notFound.title]}
          className={styles.title}
          trigger="mount"
        />

        <div className={styles.tail} ref={tailRef}>
          <p className={styles.body}>
            {t.notFound.body.map((line) => (
              <span className={styles.line} key={line}>
                {line}
              </span>
            ))}
          </p>

          <Link className={styles.back} href="/">
            <svg className={styles.arrow} viewBox="0 0 16 10" aria-hidden="true">
              <path d="M1 5 H14 M10 1.5 L14 5 L10 8.5" />
            </svg>
            {t.notFound.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
