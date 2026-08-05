export type SectionLink = {
  label: string;
  /** `null` means the section doesn't exist yet — the link renders inert. */
  target: string | null;
};

/** The site's sections, in page order. Shared by the nav and the footer. */
export const SECTION_LINKS: SectionLink[] = [
  { label: "Welcome", target: "#welcome" },
  { label: "About", target: "#about" },
  { label: "Apartments", target: "#apartments" },
  { label: "Qualities", target: "#qualities" },
  { label: "Contact", target: "#contact" },
];

/** Ids of the sections that actually exist, for scroll-spying. */
export const SECTION_IDS = SECTION_LINKS.flatMap(({ target }) =>
  target ? [target.slice(1)] : []
);
