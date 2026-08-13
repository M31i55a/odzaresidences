"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import ApartmentDetail from "./ApartmentDetail";
import ApartmentsList from "./ApartmentsList";
import ReservationForm from "./ReservationForm";
import CloseButton from "./CloseButton";
import { getLenis } from "./lenis-instance";
import styles from "./apartments-overlay.module.css";

export type OverlayView =
  | { type: "list" }
  | { type: "detail"; slug: string }
  | { type: "reserve"; slug: string }
  | null;

type ApartmentsOverlayProps = {
  view: OverlayView;
  onClose: () => void;
  onSelect: (slug: string) => void;
  onReserve: (slug: string) => void;
};

const LABELS = {
  list: "All apartments",
  detail: "Apartment details",
  reserve: "Book a viewing",
};

export default function ApartmentsOverlay({
  view,
  onClose,
  onSelect,
  onReserve,
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
      aria-label={LABELS[view.type]}
    >
      <CloseButton onClose={onClose} />

      <div className={styles.body}>
        {view.type === "list" ? (
          <ApartmentsList onSelect={onSelect} />
        ) : view.type === "detail" ? (
          <ApartmentDetail slug={view.slug} onReserve={onReserve} />
        ) : (
          /* Back goes to the residence it was opened from rather than closing
             the overlay outright — someone who changes their mind about the
             date is still interested in the flat. */
          <ReservationForm slug={view.slug} onBack={() => onSelect(view.slug)} />
        )}
      </div>
    </div>,
    document.body
  );
}
