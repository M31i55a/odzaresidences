import styles from "./site-nav.module.css";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";

/* Placeholders — no routes exist yet. */
const LINKS = ["Welcome", "About", "Apartments", "Qualities", "Contact"];

export default function SiteNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <a className={styles.brand} href="#">
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
        {LINKS.map((label) => (
          <a key={label} className={styles.link} href="#">
            {label}
          </a>
        ))}
      </div>

      <a className={styles.signIn} href="#">
        Sign In
      </a>
    </nav>
  );
}
