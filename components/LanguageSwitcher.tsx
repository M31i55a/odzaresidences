"use client";

import { setLocale, useLocale, useT } from "./i18n/locale";
import type { Locale } from "./i18n/dictionary";
import styles from "./site-nav.module.css";

const OPTIONS: { value: Locale; short: string }[] = [
  { value: "en", short: "EN" },
  { value: "fr", short: "FR" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();

  return (
    <div className={styles.langs} role="group" aria-label={t.nav.language}>
      {OPTIONS.map((option, i) => (
        <span key={option.value} className={styles.langItem}>
          {i > 0 && (
            <span className={styles.langSep} aria-hidden="true">
              /
            </span>
          )}
          <button
            type="button"
            className={styles.lang}
            data-active={locale === option.value}
            aria-pressed={locale === option.value}
            onClick={() => setLocale(option.value)}
          >
            {option.short}
          </button>
        </span>
      ))}
    </div>
  );
}
