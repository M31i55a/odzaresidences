import type Lenis from "lenis";

/* Lenis owns the scroll position, so anything that wants to jump the page has
   to go through it. Setting scrollTop directly leaves Lenis' internal target
   stale and it animates straight back to where it was. */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
