import { sql } from "./db";
import type { Locale } from "@/components/i18n/dictionary";
import type { Room, RoomImage, RoomSpec } from "@/components/listing";

export type { Room, RoomImage, RoomSpec };

/* Rooms belong to a listing and are entirely the admin's. Server only — this
   touches the database, so nothing here may be imported by a Client
   Component.

   A room's `price` is descriptive: it is shown as a detail and nothing else.
   Stays are priced from the listing, by quote() in components/reservation.ts,
   which never reads this file. */

type Row = {
  id: number | string;
  slug: string;
  position: number;
  name_en: string;
  name_fr: string;
  price: number | string | null;
  specs_en: unknown;
  specs_fr: unknown;
  image_ids: (number | string)[] | null;
  image_urls: string[] | null;
};

/** jsonb usually arrives parsed; a driver that hands back text still works. */
function toSpecs(value: unknown): RoomSpec[] {
  const raw = typeof value === "string" ? safeParse(value) : value;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { label, value: text } = entry as Record<string, unknown>;
    // A half-filled row is dropped rather than rendered as "undefined".
    if (typeof label !== "string" || typeof text !== "string") return [];
    if (!label.trim() && !text.trim()) return [];
    return [{ label, value: text }];
  });
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toRoom(row: Row): Room {
  const ids = row.image_ids ?? [];
  const urls = row.image_urls ?? [];

  return {
    id: Number(row.id),
    slug: row.slug,
    position: Number(row.position),
    name: { en: row.name_en, fr: row.name_fr },
    price: row.price === null ? null : Number(row.price),
    specs: { en: toSpecs(row.specs_en), fr: toSpecs(row.specs_fr) },
    // Two parallel arrays out of the join, zipped back into one list.
    images: ids.map((id, i) => ({ id: Number(id), url: urls[i] })).filter((i) => i.url),
  };
}

const SELECT = `
  select r.id, r.slug, r.position, r.name_en, r.name_fr, r.price,
         r.specs_en, r.specs_fr,
         array_remove(array_agg(i.id  order by i.position, i.id), null) as image_ids,
         array_remove(array_agg(i.url order by i.position, i.id), null) as image_urls
    from rooms r
    left join room_images i on i.room_id = r.id
`;

export async function getRooms(slug: string): Promise<Room[]> {
  const rows = (await sql.query(
    `${SELECT} where r.slug = $1 group by r.id order by r.position, r.id`,
    [slug]
  )) as Row[];
  return rows.map(toRoom);
}

/** Every room for several listings at once, keyed by slug — one round trip
    rather than one per listing when the site renders the whole collection. */
export async function getRoomsBySlug(
  slugs: string[]
): Promise<Record<string, Room[]>> {
  if (slugs.length === 0) return {};

  const rows = (await sql.query(
    `${SELECT} where r.slug = any($1::text[]) group by r.id order by r.position, r.id`,
    [slugs]
  )) as Row[];

  const grouped: Record<string, Room[]> = {};
  for (const row of rows) {
    const room = toRoom(row);
    (grouped[room.slug] ??= []).push(room);
  }
  return grouped;
}

export async function getRoom(id: number): Promise<Room | null> {
  const rows = (await sql.query(`${SELECT} where r.id = $1 group by r.id`, [
    id,
  ])) as Row[];
  return rows[0] ? toRoom(rows[0]) : null;
}

export type RoomInput = {
  slug: string;
  name: Record<Locale, string>;
  price: number | null;
  specs: Record<Locale, RoomSpec[]>;
};

/** New room, appended after whatever is already there. Returns its id so the
    caller can send the admin straight to it. */
export async function createRoom(input: RoomInput): Promise<number> {
  const rows = (await sql.query(
    `insert into rooms (slug, position, name_en, name_fr, price, specs_en, specs_fr)
     values ($1,
             coalesce((select max(position) + 1 from rooms where slug = $1), 0),
             $2, $3, $4, $5::jsonb, $6::jsonb)
     returning id`,
    [
      input.slug,
      input.name.en,
      input.name.fr,
      input.price,
      JSON.stringify(input.specs.en),
      JSON.stringify(input.specs.fr),
    ]
  )) as { id: number | string }[];

  return Number(rows[0].id);
}

export async function updateRoom(id: number, input: RoomInput) {
  await sql.query(
    `update rooms set name_en = $2, name_fr = $3, price = $4,
                      specs_en = $5::jsonb, specs_fr = $6::jsonb,
                      updated_at = now()
      where id = $1`,
    [
      id,
      input.name.en,
      input.name.fr,
      input.price,
      JSON.stringify(input.specs.en),
      JSON.stringify(input.specs.fr),
    ]
  );
}

/** Photographs go with it — the foreign key cascades. */
export async function deleteRoom(id: number) {
  await sql.query(`delete from rooms where id = $1`, [id]);
}

export async function addRoomImage(roomId: number, url: string) {
  await sql.query(
    `insert into room_images (room_id, url, position)
     values ($1, $2,
             coalesce((select max(position) + 1 from room_images where room_id = $1), 0))`,
    [roomId, url]
  );
}

/** Scoped to the room so a stray id can't delete another listing's picture. */
export async function deleteRoomImage(roomId: number, imageId: number) {
  await sql.query(`delete from room_images where id = $1 and room_id = $2`, [
    imageId,
    roomId,
  ]);
}

/** Apply a new running order to one room's gallery in a single round trip. */
export async function reorderRoomImages(roomId: number, imageIds: number[]) {
  if (imageIds.length === 0) return;
  await sql.query(
    `update room_images set position = data.position
       from (select unnest($2::bigint[]) as id,
                    generate_subscripts($2::bigint[], 1) as position) as data
      where room_images.id = data.id and room_images.room_id = $1`,
    [roomId, imageIds]
  );
}

/** And the same for the rooms of one listing. */
export async function reorderRooms(slug: string, roomIds: number[]) {
  if (roomIds.length === 0) return;
  await sql.query(
    `update rooms set position = data.position, updated_at = now()
       from (select unnest($2::bigint[]) as id,
                    generate_subscripts($2::bigint[], 1) as position) as data
      where rooms.id = data.id and rooms.slug = $1`,
    [slug, roomIds]
  );
}

/* The four parts every seeded residence has. A listing the admin creates
   starts with the same set, so a new apartment matches the others straight
   away instead of opening with an empty detail view — all that is left is
   photographs. The copy is the dictionary's, the same text the original ten
   were seeded from. */
const STANDARD_PARTS = ["parlour", "kitchen", "bedroom", "toilet"] as const;

export async function createStandardRooms(slug: string) {
  const { DICTIONARIES } = await import("@/components/i18n/dictionary");
  const en = DICTIONARIES.en;
  const fr = DICTIONARIES.fr;

  // Sequential: createRoom appends after whatever is already there, so this
  // is what puts them in walkthrough order.
  for (const part of STANDARD_PARTS) {
    await createRoom({
      slug,
      name: { en: en.rooms[part].name, fr: fr.rooms[part].name },
      price: null,
      specs: { en: [...en.rooms[part].specs], fr: [...fr.rooms[part].specs] },
    });
  }
}
