"use client";

import { useRouter } from "next/navigation";
import styles from "./close-button.module.css";

/**
 * Closes the page and drops the visitor back where they came from.
 *
 * Deliberately history-based rather than a link to an anchor: the browser
 * restores the previous scroll position itself, so there's nothing to
 * re-measure and nothing to fight Lenis over.
 */
export default function CloseButton() {
  const router = useRouter();

  function exit() {
    // No history means a deep link or a fresh tab — there's nothing to go back
    // to, so send them to the home page instead.
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <button
      type="button"
      className={styles.close}
      onClick={exit}
      aria-label="Close"
    >
      <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 5 L15 15 M15 5 L5 15" />
      </svg>
    </button>
  );
}
