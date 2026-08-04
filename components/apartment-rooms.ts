export type RoomSpec = { label: string; value: string };

export type RoomPart = {
  id: string;
  name: string;
  image: string;
  alt: string;
  specs: RoomSpec[];
};

/** The part shown first when the page opens. */
export const DEFAULT_PART_ID = "bedroom";

/* Placeholder specs — invented to fill the overlay, same as the listing
   figures. Listed in walkthrough order; the bedroom is what opens. */
const PART_TYPES = [
  {
    id: "parlour",
    name: "Parlour",
    specs: [
      { label: "Dimensions", value: "6.2 × 4.8 m" },
      { label: "Wall sockets", value: "8" },
      { label: "Windows", value: "3 — south facing" },
      { label: "Flooring", value: "Oak parquet" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    specs: [
      { label: "Dimensions", value: "4.1 × 3.4 m" },
      { label: "Wall sockets", value: "12" },
      { label: "Windows", value: "1 — east facing" },
      { label: "Worktop", value: "Honed granite" },
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    specs: [
      { label: "Dimensions", value: "4.6 × 3.9 m" },
      { label: "Wall sockets", value: "6" },
      { label: "Windows", value: "2 — north facing" },
      { label: "Flooring", value: "Oak parquet" },
    ],
  },
  {
    id: "toilet",
    name: "Toilet",
    specs: [
      { label: "Dimensions", value: "2.4 × 1.8 m" },
      { label: "Wall sockets", value: "2" },
      { label: "Ventilation", value: "Mechanical extract" },
      { label: "Flooring", value: "Porcelain tile" },
    ],
  },
];

/** There are five photo sets for ten listings, so the sets repeat. */
const PHOTO_SETS = 5;

export function roomsFor(index: number, apartmentName: string): RoomPart[] {
  const set = (index % PHOTO_SETS) + 1;

  return PART_TYPES.map((part) => ({
    id: part.id,
    name: part.name,
    image: `/${part.id}${set}.jpg`,
    alt: `${part.name} of the ${apartmentName}`,
    specs: part.specs,
  }));
}
