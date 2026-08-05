"use client";

import styles from "./close-button.module.css";

/** Dismisses the overlay. Nothing navigates, so there's nothing to restore. */
export default function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className={styles.close}
      onClick={onClose}
      aria-label="Close"
    >
      <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 5 L15 15 M15 5 L5 15" />
      </svg>
    </button>
  );
}
