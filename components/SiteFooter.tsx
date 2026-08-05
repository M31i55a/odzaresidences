"use client";

import type { MouseEvent } from "react";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";
import { scrollToSection } from "./scroll-to-section";
import { SECTION_LINKS } from "./site-sections";
import styles from "./site-footer.module.css";

/* Placeholder legal links — no pages behind them yet. */
const LEGAL = ["Privacy", "Terms", "Cookies"];

const YEAR = 2026;

function goTo(event: MouseEvent<HTMLAnchorElement>, target: string) {
  if (scrollToSection(target)) event.preventDefault();
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
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

            <p className={styles.tagline}>
              Residences built around the way a day actually moves.
            </p>
          </div>

          <nav className={styles.links} aria-label="Footer">
            {SECTION_LINKS.map(({ label, target }) =>
              target ? (
                <a
                  key={label}
                  className={styles.link}
                  href={target}
                  onClick={(event) => goTo(event, target)}
                >
                  {label}
                </a>
              ) : null
            )}
          </nav>
        </div>

        <div className={styles.base}>
          <p className={styles.copyright}>
            © {YEAR} Odza Residences. All rights reserved.
          </p>

          <div className={styles.legal}>
            {LEGAL.map((item) => (
              <a className={styles.legalLink} href="#" key={item}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
