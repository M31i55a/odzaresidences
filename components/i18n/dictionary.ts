export type Locale = "en" | "fr";

/* Grouped by hand rather than with toLocaleString: Intl output can differ
   between the Node build that renders the page and the browser that hydrates
   it, which shows up as a hydration mismatch on every price. */
function group(value: number, separator: string) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

const en = {
  code: "en",
  label: "English",

  nav: {
    primary: "Primary",
    footer: "Footer",
    language: "Language",
    signIn: "Sign In",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    welcome: "Welcome",
    about: "About",
    apartments: "Apartments",
    qualities: "Qualities",
    contact: "Contact",
  },

  hero: {
    eyebrow: "Welcome",
    heading: "The door is open.",
    subStart: "Your house is ",
    subHere: "here",
    subMiddle: " Just come and grab the ",
    subKeys: "keys",
    subEnd: " !",
    cta: "Find Properties",
  },

  story: {
    why: {
      eyebrow: "Why Odza",
      title: [
        "Your life's changing.",
        "Don't just find a place —",
        "find what's next.",
      ],
      body: [
        "We help you move forward with clarity,",
        "confidence, and the right key",
        "already in your hand.",
      ],
      alt: "An Odza villa",
    },
    residences: {
      eyebrow: "The Residences",
      title: [
        "Rooms that hold light.",
        "Space that holds a life.",
        "Built for both.",
      ],
      body: [
        "Every Odza residence is drawn around",
        "the way a day actually moves —",
        "from first light to quiet evening.",
      ],
      alt: "The terrace of an Odza residence",
    },
  },

  apartments: {
    eyebrow: "Apartments",
    title: "Spaces to move into.",
    seeDetails: "See in details",
    visitMore: "Visit more",
    moreWaiting: (count: number) => `${count} more waiting.`,
    listTitle: "Everything available.",
    detailHint:
      "Hover the large view for room details — pick a part on the right.",
    price: "Price",
    rooms: "Rooms",
    area: "Area",
    money: (amount: number) => `${group(amount, ",")} XAF`,
    perDay: (amount: number) => `${group(amount, ",")} XAF / day`,
    interiorAlt: (name: string) => `Interior of ${name}`,
    roomCount: (count: number) => `${count} room${count === 1 ? "" : "s"}`,
    seats: (count: number) => `Seats ${count}`,
  },

  listings: {
    "the-penthouse": { name: "The Penthouse", kind: "Penthouse" },
    "garden-villa": { name: "Garden Villa", kind: "Villa" },
    "skyline-apartment": { name: "Skyline Apartment", kind: "Apartment" },
    "the-assembly": { name: "The Assembly", kind: "Conference hall" },
    "studio-one": { name: "Studio One", kind: "Studio" },
    "terrace-suite": { name: "Terrace Suite", kind: "Suite" },
    "loft-duplex": { name: "Loft Duplex", kind: "Duplex" },
    "poolside-villa": { name: "Poolside Villa", kind: "Villa" },
    "corner-residence": { name: "Corner Residence", kind: "Apartment" },
    "north-atelier": { name: "North Atelier", kind: "Studio" },
  },

  rooms: {
    parlour: {
      name: "Parlour",
      specs: [
        { label: "Dimensions", value: "6.2 × 4.8 m" },
        { label: "Wall sockets", value: "8" },
        { label: "Windows", value: "3 — south facing" },
        { label: "Flooring", value: "Oak parquet" },
      ],
    },
    kitchen: {
      name: "Kitchen",
      specs: [
        { label: "Dimensions", value: "4.1 × 3.4 m" },
        { label: "Wall sockets", value: "12" },
        { label: "Windows", value: "1 — east facing" },
        { label: "Worktop", value: "Honed granite" },
      ],
    },
    bedroom: {
      name: "Bedroom",
      specs: [
        { label: "Dimensions", value: "4.6 × 3.9 m" },
        { label: "Wall sockets", value: "6" },
        { label: "Windows", value: "2 — north facing" },
        { label: "Flooring", value: "Oak parquet" },
      ],
    },
    toilet: {
      name: "Toilet",
      specs: [
        { label: "Dimensions", value: "2.4 × 1.8 m" },
        { label: "Wall sockets", value: "2" },
        { label: "Ventilation", value: "Mechanical extract" },
        { label: "Flooring", value: "Porcelain tile" },
      ],
    },
  },

  qualities: {
    eyebrow: "Qualities",
    title: "Everything already running.",
    items: {
      security: {
        name: "Security",
        note: "Monitored entry, cameras on every approach, and a concierge who knows every face on the stair.",
      },
      wifi: {
        name: "High-speed WiFi",
        note: "Fibre to every room and mesh coverage throughout — a line that doesn't blink when the building fills up.",
      },
      climate: {
        name: "Climate intelligence",
        note: "Zoned heating and cooling that learns the hours you keep, room by room.",
      },
      lights: {
        name: "Lights 24/7",
        note: "Backup power picks up the moment the grid drops. You won't notice it happen.",
      },
      parking: {
        name: "Parking",
        note: "Covered, assigned and lit, with room for a second car and a charger at every bay.",
      },
      design: {
        name: "Luxury design",
        note: "Materials chosen to age well — stone, oak, brass, and as much daylight as the plot allows.",
      },
    },
  },

  contact: {
    eyebrow: "Contact",
    title: "Come and grab the keys.",
    office: "Office",
    phone: "Phone",
    hours: "Hours",
    social: "Social",
    address: ["Nouvelle Route Odza", "Yaoundé, Cameroon"],
    openingHours: ["Monday – Friday, 08:00 – 18:00", "Saturday, 09:00 – 13:00"],
  },

  footer: {
    tagline: "Residences built around the way a day actually moves.",
    rights: "All rights reserved.",
    legal: ["Privacy", "Terms", "Cookies"],
  },

  common: {
    close: "Close",
  },

  qualitiesHouse: {
    day: "The residence in daylight",
    night: "The residence after dark",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  code: "fr",
  label: "Français",

  nav: {
    primary: "Principale",
    footer: "Pied de page",
    language: "Langue",
    signIn: "Connexion",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    welcome: "Accueil",
    about: "À propos",
    apartments: "Appartements",
    qualities: "Prestations",
    contact: "Contact",
  },

  hero: {
    eyebrow: "Bienvenue",
    heading: "La porte est ouverte.",
    subStart: "Votre maison est ",
    subHere: "ici",
    subMiddle: " Venez simplement prendre les ",
    subKeys: "clés",
    subEnd: " !",
    cta: "Voir les biens",
  },

  story: {
    why: {
      eyebrow: "Pourquoi Odza",
      title: [
        "Votre vie change.",
        "Ne cherchez pas qu'un lieu —",
        "trouvez la suite.",
      ],
      body: [
        "Nous vous aidons à avancer avec clarté,",
        "confiance, et la bonne clé",
        "déjà en main.",
      ],
      alt: "Une villa Odza",
    },
    residences: {
      eyebrow: "Les Résidences",
      title: [
        "Des pièces qui gardent la lumière.",
        "Un espace qui contient une vie.",
        "Pensé pour les deux.",
      ],
      body: [
        "Chaque résidence Odza est dessinée autour",
        "du rythme réel d'une journée —",
        "du petit matin au soir paisible.",
      ],
      alt: "La terrasse d'une résidence Odza",
    },
  },

  apartments: {
    eyebrow: "Appartements",
    title: "Des espaces où s'installer.",
    seeDetails: "Voir en détail",
    visitMore: "Voir plus",
    moreWaiting: (count: number) => `${count} autres vous attendent.`,
    listTitle: "Tout ce qui est disponible.",
    detailHint:
      "Survolez la grande vue pour les détails — choisissez une pièce à droite.",
    price: "Prix",
    rooms: "Pièces",
    area: "Surface",
    money: (amount: number) => `${group(amount, " ")} XAF`,
    perDay: (amount: number) => `${group(amount, " ")} XAF / jour`,
    interiorAlt: (name: string) => `Intérieur de ${name}`,
    roomCount: (count: number) => `${count} pièce${count === 1 ? "" : "s"}`,
    seats: (count: number) => `${count} places`,
  },

  listings: {
    "the-penthouse": { name: "Le Penthouse", kind: "Penthouse" },
    "garden-villa": { name: "Villa Jardin", kind: "Villa" },
    "skyline-apartment": { name: "Appartement Panorama", kind: "Appartement" },
    "the-assembly": { name: "L'Assemblée", kind: "Salle de conférence" },
    "studio-one": { name: "Studio Un", kind: "Studio" },
    "terrace-suite": { name: "Suite Terrasse", kind: "Suite" },
    "loft-duplex": { name: "Loft Duplex", kind: "Duplex" },
    "poolside-villa": { name: "Villa Piscine", kind: "Villa" },
    "corner-residence": { name: "Résidence d'Angle", kind: "Appartement" },
    "north-atelier": { name: "Atelier Nord", kind: "Studio" },
  },

  rooms: {
    parlour: {
      name: "Salon",
      specs: [
        { label: "Dimensions", value: "6,2 × 4,8 m" },
        { label: "Prises murales", value: "8" },
        { label: "Fenêtres", value: "3 — plein sud" },
        { label: "Sol", value: "Parquet en chêne" },
      ],
    },
    kitchen: {
      name: "Cuisine",
      specs: [
        { label: "Dimensions", value: "4,1 × 3,4 m" },
        { label: "Prises murales", value: "12" },
        { label: "Fenêtres", value: "1 — plein est" },
        { label: "Plan de travail", value: "Granit adouci" },
      ],
    },
    bedroom: {
      name: "Chambre",
      specs: [
        { label: "Dimensions", value: "4,6 × 3,9 m" },
        { label: "Prises murales", value: "6" },
        { label: "Fenêtres", value: "2 — plein nord" },
        { label: "Sol", value: "Parquet en chêne" },
      ],
    },
    toilet: {
      name: "Salle d'eau",
      specs: [
        { label: "Dimensions", value: "2,4 × 1,8 m" },
        { label: "Prises murales", value: "2" },
        { label: "Ventilation", value: "Extraction mécanique" },
        { label: "Sol", value: "Grès cérame" },
      ],
    },
  },

  qualities: {
    eyebrow: "Prestations",
    title: "Tout fonctionne déjà.",
    items: {
      security: {
        name: "Sécurité",
        note: "Entrée surveillée, caméras sur chaque accès, et un concierge qui connaît chaque visage de l'immeuble.",
      },
      wifi: {
        name: "WiFi très haut débit",
        note: "La fibre dans chaque pièce et une couverture maillée partout — une ligne qui ne faiblit pas quand l'immeuble se remplit.",
      },
      climate: {
        name: "Climat intelligent",
        note: "Chauffage et climatisation par zones, qui apprennent vos horaires pièce par pièce.",
      },
      lights: {
        name: "Lumière 24h/24",
        note: "Le groupe électrogène prend le relais dès que le réseau lâche. Vous ne le remarquerez pas.",
      },
      parking: {
        name: "Stationnement",
        note: "Couvert, attribué et éclairé, avec la place pour une seconde voiture et une borne à chaque emplacement.",
      },
      design: {
        name: "Design haut de gamme",
        note: "Des matériaux choisis pour bien vieillir — pierre, chêne, laiton, et autant de lumière que le terrain le permet.",
      },
    },
  },

  contact: {
    eyebrow: "Contact",
    title: "Venez prendre les clés.",
    office: "Bureau",
    phone: "Téléphone",
    hours: "Horaires",
    social: "Réseaux",
    address: ["Nouvelle Route Odza", "Yaoundé, Cameroun"],
    openingHours: ["Lundi – Vendredi, 08h00 – 18h00", "Samedi, 09h00 – 13h00"],
  },

  footer: {
    tagline: "Des résidences pensées autour du rythme réel d'une journée.",
    rights: "Tous droits réservés.",
    legal: ["Confidentialité", "Conditions", "Cookies"],
  },

  common: {
    close: "Fermer",
  },

  qualitiesHouse: {
    day: "La résidence en plein jour",
    night: "La résidence à la nuit tombée",
  },
};

export const DICTIONARIES: Record<Locale, Dict> = { en, fr };
