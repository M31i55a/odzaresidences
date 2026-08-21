import type { Dict } from "./i18n/dictionary";

/** Only what doesn't change between languages. Names and kinds live in the
    dictionary, keyed by slug; rooms and prices are formatted per language. */
export type Apartment = {
  slug: keyof Dict["listings"];
  /** What one unit of a stay costs — a night, or a day for the hall. */
  price: number;
  /** Let by the day rather than by the night: nobody sleeps in the hall. */
  perDay?: boolean;
  /** Rendered as a room count, or as seating when it's the hall. */
  rooms: number;
  seats?: boolean;
  area: string;
  src: string;
};

/* Placeholder listings, but the figures are in the right range for a
   furnished short let in Yaoundé rather than invented: a studio around 25k
   XAF a night, a large villa around 145k, the hall by the day.

   Deliberately kept where mobile money can reach them. MTN and Orange cap a
   single transaction near 500,000 XAF, so a 30% deposit has to sit under that
   to go through in one push — which it does here for any stay up to eleven
   nights, even on the priciest villa. Raise these and that stops being true;
   see quote() in components/reservation.ts for where the deposit is worked
   out. */
export const APARTMENTS: Apartment[] = [
  { slug: "the-penthouse", price: 120000, rooms: 4, area: "210 m²", src: "/pexels-artbovich-7061395.jpg" },
  { slug: "garden-villa", price: 145000, rooms: 6, area: "340 m²", src: "/pexels-ahmetcotur-26859037.jpg" },
  { slug: "skyline-apartment", price: 58000, rooms: 3, area: "124 m²", src: "/pexels-dropshado-12784156.jpg" },
  { slug: "the-assembly", price: 150000, perDay: true, rooms: 90, seats: true, area: "180 m²", src: "/pexels-keeganjchecks-10117735.jpg" },
  { slug: "studio-one", price: 28000, rooms: 1, area: "48 m²", src: "/pexels-zynaly-27822509.jpg" },
  { slug: "terrace-suite", price: 72000, rooms: 3, area: "140 m²", src: "/pexels-artbovich-7061426.jpg" },
  { slug: "loft-duplex", price: 85000, rooms: 4, area: "165 m²", src: "/pexels-ahmetcotur-20975733.jpg" },
  { slug: "poolside-villa", price: 135000, rooms: 5, area: "300 m²", src: "/pexels-asadphoto-12720684.jpg" },
  { slug: "corner-residence", price: 45000, rooms: 2, area: "96 m²", src: "/pexels-didi-lecatompessy-2149441489-30821350.jpg" },
  { slug: "north-atelier", price: 25000, rooms: 1, area: "42 m²", src: "/pexels-essahak-shyam-2160973582-37276162.jpg" },
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
      : t.apartments.perNight(flat.price),
    rooms: flat.seats
      ? t.apartments.seats(flat.rooms)
      : t.apartments.roomCount(flat.rooms),
    area: flat.area,
    alt: t.apartments.interiorAlt(listing.name),
  };
}
