"use client";

import { useEffect, useState, type MouseEvent } from "react";
import styles from "./site-nav.module.css";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";
import { scrollToSection } from "./scroll-to-section";
import { useActiveSection } from "./use-active-section";
import { SECTION_IDS, SECTION_LINKS } from "./site-sections";
import LanguageSwitcher from "./LanguageSwitcher";
import { useT } from "./i18n/locale";

const MENU_ID = "site-menu";

export default function SiteNav() {
  const active = useActiveSection(SECTION_IDS);
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function goTo(event: MouseEvent<HTMLAnchorElement>, target: string) {
    if (scrollToSection(target)) event.preventDefault();
    // Get out of the way so the section it just scrolled to is visible.
    setOpen(false);
  }

  return (
    <nav className={styles.nav} aria-label={t.nav.primary}>
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

      {/* `display: contents` on wide screens, so links / language / sign-in sit
          straight in the nav grid. Below the breakpoint it becomes a real
          panel that drops from the bar. */}
      <div className={styles.menu} id={MENU_ID} data-open={open}>
        <div className={styles.links}>
          {SECTION_LINKS.map(({ key, target }) =>
            target ? (
              <a
                key={key}
                className={styles.link}
                href={target}
                data-active={active === target.slice(1)}
                aria-current={active === target.slice(1) ? "true" : undefined}
                onClick={(event) => goTo(event, target)}
              >
                {t.nav[key]}
              </a>
            ) : (
              <span key={key} className={styles.link} data-pending="true">
                {t.nav[key]}
              </span>
            )
          )}
        </div>

        <div className={styles.right}>
          <LanguageSwitcher />
          <a className={styles.signIn} href="#">
            {t.nav.signIn}
          </a>
        </div>
      </div>

      <button
        type="button"
        className={styles.toggle}
        data-open={open}
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>
    </nav>
  );
}
