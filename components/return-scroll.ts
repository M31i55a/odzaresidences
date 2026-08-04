/* Where the visitor was on the home page before they opened a listing.

   The browser restores scroll on `back()` all by itself, but it does it before
   ScrollTrigger has injected the apartments pin spacer — several thousand
   pixels of document height that only exists once JS has run. The restored
   position gets clamped to the shorter page and lands somewhere up in the hero.

   So we keep the number ourselves and re-apply it once the page is actually
   its full height. */
let saved: number | null = null;

export function rememberScroll() {
  saved = window.scrollY;
}

/** Reads and clears — a saved position is only ever restored once. */
export function takeSavedScroll() {
  const value = saved;
  saved = null;
  return value;
}
