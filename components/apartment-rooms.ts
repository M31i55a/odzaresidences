import type { Dict } from "./i18n/dictionary";

export type RoomSpec = { label: string; value: string };

export type RoomPart = {
  id: string;
  name: string;
  image: string;
  alt: string;
  specs: RoomSpec[];
};

/** The part shown first when the gallery opens. */
export const DEFAULT_PART_ID = "bedroom";

/** Walkthrough order; the bedroom is what opens. */
const PART_IDS = ["parlour", "kitchen", "bedroom", "toilet"] as const;

/** There are five photo sets for ten listings, so the sets repeat. */
const PHOTO_SETS = 5;

export function roomsFor(
  index: number,
  apartmentName: string,
  t: Dict
): RoomPart[] {
  const set = (index % PHOTO_SETS) + 1;

  return PART_IDS.map((id) => {
    const part = t.rooms[id];

    return {
      id,
      name: part.name,
      image: `/${id}${set}.jpg`,
      alt: `${part.name} — ${apartmentName}`,
      specs: part.specs,
    };
  });
}
