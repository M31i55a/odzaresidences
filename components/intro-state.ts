/* The intro loader sits in the root layout, so it survives client-side
   navigation and only ever plays once per full page load. Pages that rely on it
   to reveal their copy need to know whether it has already been and gone —
   otherwise they mount invisible with nothing left to bring them in.

   Module state, not sessionStorage: it should reset on a hard reload, which is
   exactly when the loader plays again. */
let played = false;

export function introHasPlayed() {
  return played;
}

export function markIntroPlayed() {
  played = true;
}
