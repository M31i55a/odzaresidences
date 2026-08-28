import { sql } from "./db";
import type { Listing } from "@/components/listing";

export type { Listing };

/* Reads and writes for the listings the admin manages. Server only — it
   touches the database, so nothing here may be imported by a Client
   Component. The shape it returns is what the site renders; see
   components/listing.ts for the type and the language-aware formatting,
   which both sides share. */

type Row = {
  slug: string;
  price: number;
  per_day: boolean;
  rooms: number;
  seats: boolean;
  area: string;
  image_url: string;
  name_en: string;
  name_fr: string;
  kind_en: string;
  kind_fr: string;
  position: number;
  published: boolean;
};

function toListing(row: Row): Listing {
  return {
    slug: row.slug,
    price: Number(row.price),
    perDay: row.per_day,
    rooms: Number(row.rooms),
    seats: row.seats,
    area: row.area,
    src: row.image_url,
    name: { en: row.name_en, fr: row.name_fr },
    kind: { en: row.kind_en, fr: row.kind_fr },
    position: Number(row.position),
    published: row.published,
  };
}

/* Rooms live in their own table now and are read separately — see
   lib/rooms.ts, whose getRoomsBySlug fetches them for many listings at once
   rather than one query per listing. */
const SELECT = `
  select l.slug, l.price, l.per_day, l.rooms, l.seats, l.area, l.image_url,
         l.name_en, l.name_fr, l.kind_en, l.kind_fr, l.position, l.published
    from listings l
`;

/** What the public site shows, in the order the admin arranged. */
export async function getPublishedListings(): Promise<Listing[]> {
  const rows = (await sql.query(
    `${SELECT} where l.published order by l.position, l.slug`
  )) as Row[];
  return rows.map(toListing);
}

/** Everything, published or not — the admin's own list. */
export async function getAllListings(): Promise<Listing[]> {
  const rows = (await sql.query(
    `${SELECT} order by l.position, l.slug`
  )) as Row[];
  return rows.map(toListing);
}

export async function getListing(slug: string): Promise<Listing | null> {
  const rows = (await sql.query(`${SELECT} where l.slug = $1`, [slug])) as Row[];
  return rows[0] ? toListing(rows[0]) : null;
}

export type ListingInput = Listing;

/** Create or replace a listing. The slug is the identity, so renaming one
    means creating a new listing rather than editing this one. */
export async function saveListing(listing: ListingInput) {
  await sql.query(
    `insert into listings
       (slug, price, per_day, rooms, seats, area, image_url,
        name_en, name_fr, kind_en, kind_fr, position, published, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())
     on conflict (slug) do update set
       price = excluded.price, per_day = excluded.per_day,
       rooms = excluded.rooms, seats = excluded.seats,
       area = excluded.area, image_url = excluded.image_url,
       name_en = excluded.name_en, name_fr = excluded.name_fr,
       kind_en = excluded.kind_en, kind_fr = excluded.kind_fr,
       position = excluded.position, published = excluded.published,
       updated_at = now()`,
    [
      listing.slug,
      listing.price,
      listing.perDay,
      listing.rooms,
      listing.seats,
      listing.area,
      listing.src,
      listing.name.en,
      listing.name.fr,
      listing.kind.en,
      listing.kind.fr,
      listing.position,
      listing.published,
    ]
  );
}

/** Its rooms and their photographs go with it — the foreign keys cascade. */
export async function deleteListing(slug: string) {
  await sql.query(`delete from listings where slug = $1`, [slug]);
}

/** Apply a new running order in one round trip. */
export async function reorderListings(slugs: string[]) {
  if (slugs.length === 0) return;
  await sql.query(
    `update listings set position = data.position, updated_at = now()
       from (select unnest($1::text[]) as slug,
                    generate_subscripts($1::text[], 1) as position) as data
      where listings.slug = data.slug`,
    [slugs]
  );
}

/** Where a brand new listing goes: after everything that already exists.
    Used instead of a fixed number so a new residence never lands in the
    middle of the running order, or miles past the end of it. */
export async function nextPosition(): Promise<number> {
  const rows = (await sql.query(
    `select coalesce(max(position) + 1, 0) as next from listings`
  )) as { next: number | string }[];
  return Number(rows[0]?.next ?? 0);
}
