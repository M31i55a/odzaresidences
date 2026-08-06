"use client";

import type { MouseEvent } from "react";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";
import { scrollToSection } from "./scroll-to-section";
import { SECTION_LINKS } from "./site-sections";
import { useT } from "./i18n/locale";
import styles from "./site-footer.module.css";

const YEAR = 2026;

function goTo(event: MouseEvent<HTMLAnchorElement>, target: string) {
  if (scrollToSection(target)) event.preventDefault();
}

export default function SiteFooter() {
  const t = useT();

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
              {t.footer.tagline}
            </p>
          </div>

          <nav className={styles.links} aria-label={t.nav.footer}>
            {SECTION_LINKS.map(({ key, target }) =>
              target ? (
                <a
                  key={key}
                  className={styles.link}
                  href={target}
                  onClick={(event) => goTo(event, target)}
                >
                  {t.nav[key]}
                </a>
              ) : null
            )}
          </nav>
        </div>

        <div className={styles.base}>
          <p className={styles.copyright}>
            © {YEAR} Odza Residences. {t.footer.rights}
          </p>

          <div className={styles.legal}>
            {t.footer.legal.map((item) => (
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
