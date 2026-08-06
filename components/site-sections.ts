/** Keys into `dict.nav` — the visible label comes from the active language. */
export type SectionKey =
  | "welcome"
  | "about"
  | "apartments"
  | "qualities"
  | "contact";

export type SectionLink = {
  key: SectionKey;
  /** `null` means the section doesn't exist yet — the link renders inert. */
  target: string | null;
};

/** The site's sections, in page order. Shared by the nav and the footer. */
export const SECTION_LINKS: SectionLink[] = [
  { key: "welcome", target: "#welcome" },
  { key: "about", target: "#about" },
  { key: "apartments", target: "#apartments" },
  { key: "qualities", target: "#qualities" },
  { key: "contact", target: "#contact" },
];

/** Ids of the sections that actually exist, for scroll-spying. */
export const SECTION_IDS = SECTION_LINKS.flatMap(({ target }) =>
  target ? [target.slice(1)] : []
);
