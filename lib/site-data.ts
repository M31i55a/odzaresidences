import { hasDatabase } from "./db";
import { getPublishedListings } from "./listings";
import { getRoomsBySlug } from "./rooms";
import { APARTMENTS } from "@/components/apartments-data";
import { DICTIONARIES } from "@/components/i18n/dictionary";
import type { Listing, Room } from "@/components/listing";

/* What the public site renders, loaded once per request on the server and
   handed down to the Client Components as props. They used to import the
   static table directly; now the admin owns this data, so it has to be read
   where a database connection exists.

   With no database configured the ten listings the site shipped with are
   used instead. That only happens on a deploy with no DATABASE_URL, and an
   unconfigured deploy showing the original residences beats one showing an
   empty page or a stack trace. */

const PART_IDS = ["parlour", "kitchen", "bedroom", "toilet"] as const;
const PHOTO_SETS = 5;

function fallback(): { listings: Listing[]; rooms: Record<string, Room[]> } {
  const en = DICTIONARIES.en;
  const fr = DICTIONARIES.fr;
  const rooms: Record<string, Room[]> = {};

  const listings = APARTMENTS.map((flat, index) => {
    // The same photo sets, cycling the same way they always did.
    const set = (index % PHOTO_SETS) + 1;

    rooms[flat.slug] = PART_IDS.map((part, position) => ({
      // Negative ids so they can never collide with a real row.
      id: -(index * 10 + position + 1),
      slug: flat.slug,
      position,
      name: { en: en.rooms[part].name, fr: fr.rooms[part].name },
      price: null,
      specs: { en: en.rooms[part].specs, fr: fr.rooms[part].specs },
      images: [{ id: -(index * 10 + position + 1), url: `/${part}${set}.jpg` }],
    }));

    return {
      slug: flat.slug,
      price: flat.price,
      perDay: flat.perDay ?? false,
      rooms: flat.rooms,
      seats: flat.seats ?? false,
      area: flat.area,
      src: flat.src,
      name: { en: en.listings[flat.slug].name, fr: fr.listings[flat.slug].name },
      kind: { en: en.listings[flat.slug].kind, fr: fr.listings[flat.slug].kind },
      position: index,
      published: true,
    } satisfies Listing;
  });

  return { listings, rooms };
}

export async function loadSiteData() {
  if (!hasDatabase) return fallback();

  const listings = await getPublishedListings();
  // One round trip for every listing's rooms rather than one query each.
  const rooms = await getRoomsBySlug(listings.map((listing) => listing.slug));
  return { listings, rooms };
}
