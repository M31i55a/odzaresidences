"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import ApartmentDetail from "./ApartmentDetail";
import ApartmentsList from "./ApartmentsList";
import CloseButton from "./CloseButton";
import { getLenis } from "./lenis-instance";
import styles from "./apartments-overlay.module.css";

export type OverlayView =
  | { type: "list" }
  | { type: "detail"; slug: string }
  | null;

type ApartmentsOverlayProps = {
  view: OverlayView;
  onClose: () => void;
  onSelect: (slug: string) => void;
};

export default function ApartmentsOverlay({
  view,
  onClose,
  onSelect,
}: ApartmentsOverlayProps) {
  const open = view !== null;

  useEffect(() => {
    if (!open) return;

    // Hold the page still underneath. Lenis' own stylesheet clips overflow
    // while stopped; the class covers the reduced-motion case where Lenis
    // isn't running at all.
    const lenis = getLenis();
    lenis?.stop();
    document.body.classList.add("overlay-open");

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("overlay-open");
      lenis?.start();
    };
  }, [open, onClose]);

  // Only ever open after a click, so the document always exists by now.
  // Portalling to body dodges the pinned section — a transformed ancestor
  // would make `position: fixed` resolve against it instead of the viewport.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.overlay}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={view.type === "list" ? "All apartments" : "Apartment details"}
    >
      <CloseButton onClose={onClose} />

      <div className={styles.body}>
        {view.type === "list" ? (
          <ApartmentsList onSelect={onSelect} />
        ) : (
          <ApartmentDetail slug={view.slug} />
        )}
      </div>
    </div>,
    document.body
  );
}
