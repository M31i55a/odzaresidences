import styles from "./site-nav.module.css";
import { LOGO_PATH_D, LOGO_VIEWBOX } from "./logo-path";

/* Links are placeholders — no routes exist yet, and no dropdown panels were
   specified, so the carets are purely the affordance shown in the reference. */
const LINKS = [
  { label: "Search", caret: false },
  { label: "Agents", caret: false },
  { label: "Join", caret: true },
  { label: "Paperwork", caret: true },
  { label: "Resources", caret: true },
  { label: "About", caret: true },
];

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
        {LINKS.map(({ label, caret }) => (
          <a key={label} className={styles.link} href="#">
            {label}
            {caret && (
              <svg className={styles.caret} viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 3.75 L5 6.75 L8 3.75" />
              </svg>
            )}
          </a>
        ))}
      </div>

      <a className={styles.signIn} href="#">
        Sign In
      </a>
    </nav>
  );
}
