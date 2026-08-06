import type { Dict } from "./i18n/dictionary";

/** Only what doesn't change between languages. Names and kinds live in the
    dictionary, keyed by slug; rooms and prices are formatted per language. */
export type Apartment = {
  slug: keyof Dict["listings"];
  price: number;
  /** Priced per day rather than to buy. */
  perDay?: boolean;
  /** Rendered as a room count, or as seating when it's the hall. */
  rooms: number;
  seats?: boolean;
  area: string;
  src: string;
};

/* Placeholder listings — figures are invented. Prices are XAF. */
export const APARTMENTS: Apartment[] = [
  { slug: "the-penthouse", price: 1850000, rooms: 4, area: "210 m²", src: "/pexels-artbovich-7061395.jpg" },
  { slug: "garden-villa", price: 2400000, rooms: 6, area: "340 m²", src: "/pexels-ahmetcotur-26859037.jpg" },
  { slug: "skyline-apartment", price: 780000, rooms: 3, area: "124 m²", src: "/pexels-dropshado-12784156.jpg" },
  { slug: "the-assembly", price: 1200, perDay: true, rooms: 90, seats: true, area: "180 m²", src: "/pexels-keeganjchecks-10117735.jpg" },
  { slug: "studio-one", price: 320000, rooms: 1, area: "48 m²", src: "/pexels-zynaly-27822509.jpg" },
  { slug: "terrace-suite", price: 960000, rooms: 3, area: "140 m²", src: "/pexels-artbovich-7061426.jpg" },
  { slug: "loft-duplex", price: 1140000, rooms: 4, area: "165 m²", src: "/pexels-ahmetcotur-20975733.jpg" },
  { slug: "poolside-villa", price: 2150000, rooms: 5, area: "300 m²", src: "/pexels-asadphoto-12720684.jpg" },
  { slug: "corner-residence", price: 690000, rooms: 2, area: "96 m²", src: "/pexels-didi-lecatompessy-2149441489-30821350.jpg" },
  { slug: "north-atelier", price: 285000, rooms: 1, area: "42 m²", src: "/pexels-essahak-shyam-2160973582-37276162.jpg" },
];

/** The home page strip shows only this many; the rest live in the overlay. */
export const FEATURED_COUNT = 5;

/** Everything a card needs, resolved into the active language. */
export function describe(flat: Apartment, t: Dict) {
  const listing = t.listings[flat.slug];

  return {
    name: listing.name,
    kind: listing.kind,
    price: flat.perDay
      ? t.apartments.perDay(flat.price)
      : t.apartments.money(flat.price),
    rooms: flat.seats
      ? t.apartments.seats(flat.rooms)
      : t.apartments.roomCount(flat.rooms),
    area: flat.area,
    alt: t.apartments.interiorAlt(listing.name),
  };
}
