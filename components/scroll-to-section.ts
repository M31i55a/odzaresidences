import { getLenis } from "./lenis-instance";

/** One glide length for every in-page jump, wherever it's triggered from. */
export const SECTION_SCROLL_DURATION = 1.5;

/**
 * The single way anything on the site moves to a section. Lenis owns the scroll
 * position, so a native anchor jump gets fought and undone — and routing every
 * caller through here is what keeps the nav links and the back buttons feeling
 * identical.
 */
export function scrollToSection(
  target: string,
  duration = SECTION_SCROLL_DURATION
) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return false;

  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { duration });
  else el.scrollIntoView({ behavior: "smooth" });

  return true;
}
