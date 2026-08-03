export type Apartment = {
  slug: string;
  name: string;
  kind: string;
  price: string;
  rooms: string;
  area: string;
  src: string;
  alt: string;
};

/* Placeholder listings — names, prices and figures are invented to fill the
   layout. Figures are in XAF. */
export const APARTMENTS: Apartment[] = [
  {
    slug: "the-penthouse",
    name: "The Penthouse",
    kind: "Penthouse",
    price: "1,850,000 XAF",
    rooms: "4 rooms",
    area: "210 m²",
    src: "/pexels-artbovich-7061395.jpg",
    alt: "Interior of The Penthouse",
  },
  {
    slug: "garden-villa",
    name: "Garden Villa",
    kind: "Villa",
    price: "2,400,000 XAF",
    rooms: "6 rooms",
    area: "340 m²",
    src: "/pexels-ahmetcotur-26859037.jpg",
    alt: "Interior of the Garden Villa",
  },
  {
    slug: "skyline-apartment",
    name: "Skyline Apartment",
    kind: "Apartment",
    price: "780,000 XAF",
    rooms: "3 rooms",
    area: "124 m²",
    src: "/pexels-dropshado-12784156.jpg",
    alt: "Interior of the Skyline Apartment",
  },
  {
    slug: "the-assembly",
    name: "The Assembly",
    kind: "Conference hall",
    price: "1,200 XAF / day",
    rooms: "Seats 90",
    area: "180 m²",
    src: "/pexels-keeganjchecks-10117735.jpg",
    alt: "Interior of The Assembly conference hall",
  },
  {
    slug: "studio-one",
    name: "Studio One",
    kind: "Studio",
    price: "320,000 XAF",
    rooms: "1 room",
    area: "48 m²",
    src: "/pexels-zynaly-27822509.jpg",
    alt: "Interior of Studio One",
  },
  {
    slug: "terrace-suite",
    name: "Terrace Suite",
    kind: "Suite",
    price: "960,000 XAF",
    rooms: "3 rooms",
    area: "140 m²",
    src: "/pexels-artbovich-7061426.jpg",
    alt: "Interior of the Terrace Suite",
  },
  {
    slug: "loft-duplex",
    name: "Loft Duplex",
    kind: "Duplex",
    price: "1,140,000 XAF",
    rooms: "4 rooms",
    area: "165 m²",
    src: "/pexels-ahmetcotur-20975733.jpg",
    alt: "Interior of the Loft Duplex",
  },
  {
    slug: "poolside-villa",
    name: "Poolside Villa",
    kind: "Villa",
    price: "2,150,000 XAF",
    rooms: "5 rooms",
    area: "300 m²",
    src: "/pexels-asadphoto-12720684.jpg",
    alt: "Interior of the Poolside Villa",
  },
  {
    slug: "corner-residence",
    name: "Corner Residence",
    kind: "Apartment",
    price: "690,000 XAF",
    rooms: "2 rooms",
    area: "96 m²",
    src: "/pexels-didi-lecatompessy-2149441489-30821350.jpg",
    alt: "Interior of the Corner Residence",
  },
  {
    slug: "north-atelier",
    name: "North Atelier",
    kind: "Studio",
    price: "285,000 XAF",
    rooms: "1 room",
    area: "42 m²",
    src: "/pexels-essahak-shyam-2160973582-37276162.jpg",
    alt: "Interior of the North Atelier",
  },
];

/** The home page strip shows only this many; the rest live on /apartments. */
export const FEATURED_COUNT = 5;
