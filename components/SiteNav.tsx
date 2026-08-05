"use client";

import type { MouseEvent } from "react";
import styles from "./site-nav.module.css";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";
import { scrollToSection } from "./scroll-to-section";
import { useActiveSection } from "./use-active-section";
import { SECTION_IDS, SECTION_LINKS } from "./site-sections";

function goTo(event: MouseEvent<HTMLAnchorElement>, target: string) {
  if (scrollToSection(target)) event.preventDefault();
}

export default function SiteNav() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <nav className={styles.nav} aria-label="Primary">
      <a
        className={styles.brand}
        href="#welcome"
        onClick={(event) => goTo(event, "#welcome")}
      >
        <span className={styles.brandBadge}>
          <svg
            className={styles.brandMark}
            viewBox={LOGO_VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d={LOGO_PATH_D} />
          </svg>
        </span>
        <span className={styles.brandName}>Odza</span>
      </a>

      <div className={styles.links}>
        {SECTION_LINKS.map(({ label, target }) =>
          target ? (
            <a
              key={label}
              className={styles.link}
              href={target}
              data-active={active === target.slice(1)}
              aria-current={active === target.slice(1) ? "true" : undefined}
              onClick={(event) => goTo(event, target)}
            >
              {label}
            </a>
          ) : (
            <span key={label} className={styles.link} data-pending="true">
              {label}
            </span>
          )
        )}
      </div>

      <a className={styles.signIn} href="#">
        Sign In
      </a>
    </nav>
  );
}
