import { sql } from "./db";
import type { Locale } from "@/components/i18n/dictionary";

/* Reads and writes for the listings the admin manages. Server only — it
   touches the database, so nothing here may be imported by a Client
   Component. The shape it returns is what the site renders; see
   components/listing.ts for the type and the language-aware formatting,
   which both sides share. */

export const ROOM_PARTS = ["parlour", "kitchen", "bedroom", "toilet"] as const;
export type RoomPartId = (typeof ROOM_PARTS)[number];

export type Listing = {
  slug: string;
  /** One unit of a stay — a night, or a day when `perDay`. */
  price: number;
  perDay: boolean;
  rooms: number;
  seats: boolean;
  area: string;
  /** Hero photograph. A Blob URL once uploaded, or a `/public` path. */
  src: string;
  /* Copy per language. On the row rather than in the dictionary because the
     admin can create a listing the code has never heard of. */
  name: Record<Locale, string>;
  kind: Record<Locale, string>;
  position: number;
  published: boolean;
  /** Only the parts the admin has given a picture to. */
  roomImages: Partial<Record<RoomPartId, string>>;
};

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
  room_parts: string[] | null;
  room_urls: string[] | null;
};

function toListing(row: Row): Listing {
  const roomImages: Partial<Record<RoomPartId, string>> = {};
  // Postgres gives the joined rooms back as two parallel arrays.
  (row.room_parts ?? []).forEach((part, i) => {
    const url = row.room_urls?.[i];
    if (part && url) roomImages[part as RoomPartId] = url;
  });

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
    roomImages,
  };
}

/* One query rather than a query per listing for its rooms — ten listings
   would otherwise be eleven round trips, and each one crosses the network. */
const SELECT = `
  select l.slug, l.price, l.per_day, l.rooms, l.seats, l.area, l.image_url,
         l.name_en, l.name_fr, l.kind_en, l.kind_fr, l.position, l.published,
         array_remove(array_agg(r.part order by r.part), null) as room_parts,
         array_remove(array_agg(r.image_url order by r.part), null) as room_urls
    from listings l
    left join listing_rooms r on r.slug = l.slug
`;

/** What the public site shows, in the order the admin arranged. */
export async function getPublishedListings(): Promise<Listing[]> {
  const rows = (await sql.query(
    `${SELECT} where l.published group by l.slug order by l.position, l.slug`
  )) as Row[];
  return rows.map(toListing);
}

/** Everything, published or not — the admin's own list. */
export async function getAllListings(): Promise<Listing[]> {
  const rows = (await sql.query(
    `${SELECT} group by l.slug order by l.position, l.slug`
  )) as Row[];
  return rows.map(toListing);
}

export async function getListing(slug: string): Promise<Listing | null> {
  const rows = (await sql.query(`${SELECT} where l.slug = $1 group by l.slug`, [
    slug,
  ])) as Row[];
  return rows[0] ? toListing(rows[0]) : null;
}

export type ListingInput = Omit<Listing, "roomImages">;

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

export async function saveRoomImage(
  slug: string,
  part: RoomPartId,
  imageUrl: string
) {
  await sql.query(
    `insert into listing_rooms (slug, part, image_url) values ($1, $2, $3)
     on conflict (slug, part) do update set image_url = excluded.image_url`,
    [slug, part, imageUrl]
  );
}

/** Rooms go with it — the foreign key cascades. */
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
