import type { Dict, Locale } from "./i18n/dictionary";
import type { Room } from "./listing";

export type RoomSpec = { label: string; value: string };

export type RoomPart = {
  id: string;
  name: string;
  image: string;
  alt: string;
  specs: RoomSpec[];
};

/**
 * Turn the rooms the admin manages into what the gallery renders.
 *
 * Rooms used to be four fixed parts with their copy in the dictionary. They
 * are rows now, in whatever order and number the admin arranged, so the
 * gallery is handed whatever exists rather than a known set.
 *
 * A room with no photograph is dropped: the gallery's whole job is showing
 * one, and an empty frame reads as a broken page rather than an empty room.
 */
export function partsFrom(
  rooms: Room[],
  listingName: string,
  t: Dict
): RoomPart[] {
  const locale = t.code as Locale;

  return rooms
    .filter((room) => room.images.length > 0)
    .map((room) => {
      const name = room.name[locale];
      const specs = [...room.specs[locale]];

      /* The room's own price, when it quotes one, reads as one more detail.
         It is never what a stay is billed at — see quote(). */
      if (room.price !== null) {
        specs.push({
          label: t.apartments.price,
          value: t.apartments.money(room.price),
        });
      }

      return {
        id: String(room.id),
        name,
        // Only the first for now; the rest of the gallery isn't shown here yet.
        image: room.images[0].url,
        alt: `${name} — ${listingName}`,
        specs,
      };
    });
}
