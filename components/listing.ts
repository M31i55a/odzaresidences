import type { Dict, Locale } from "./i18n/dictionary";

/* The shape a listing has once it leaves the database, and the formatting the
   site does with it.

   This lives under components/ rather than lib/ because Client Components
   import it. lib/listings.ts reads these same types but also opens a database
   connection, so importing it from the browser would pull a Postgres driver
   into the bundle. Types here, queries there. */

export type Listing = {
  slug: string;
  /** One unit of a stay — a night, or a day when `perDay`. */
  price: number;
  perDay: boolean;
  rooms: number;
  seats: boolean;
  area: string;
  /** Hero photograph: a Blob URL, a /uploads path, or a /public file. */
  src: string;
  /* Copy per language, on the row rather than in the dictionary, because the
     admin can add a residence the code has never heard of. */
  name: Record<Locale, string>;
  kind: Record<Locale, string>;
  position: number;
  published: boolean;
};

export type RoomSpec = { label: string; value: string };

export type RoomImage = { id: number; url: string };

export type Room = {
  id: number;
  slug: string;
  position: number;
  name: Record<Locale, string>;
  /** Descriptive only. A stay is priced from the listing — see quote(). */
  price: number | null;
  specs: Record<Locale, RoomSpec[]>;
  images: RoomImage[];
};

/** The home page strip shows only this many; the rest live in the overlay. */
export const FEATURED_COUNT = 5;

/** Everything a card needs, resolved into the active language. */
export function describe(flat: Listing, t: Dict) {
  // `code` is the dictionary's own locale, so this is always "en" or "fr".
  const locale = t.code as Locale;
  const name = flat.name[locale];

  return {
    name,
    kind: flat.kind[locale],
    price: flat.perDay
      ? t.apartments.perDay(flat.price)
      : t.apartments.perNight(flat.price),
    rooms: flat.seats
      ? t.apartments.seats(flat.rooms)
      : t.apartments.roomCount(flat.rooms),
    area: flat.area,
    alt: t.apartments.interiorAlt(name),
  };
}
