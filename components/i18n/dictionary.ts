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
    swipeHint: "Swipe to explore",
    seeDetails: "See in details",
    visitMore: "Visit more",
    moreWaiting: (count: number) => `${count} more waiting.`,
    listTitle: "Everything available.",
    detailHint:
      "Hover the large view for room details — pick a part on the right.",
    /* Touch has no hover, so the same view is driven by a button instead —
       and the rail isn't on the right down there either. */
    detailHintTouch:
      "Tap “See room info” for the details — pick another part to switch rooms.",
    seeRoomInfo: "See room info",
    hideRoomInfo: "Hide room info",
    price: "Price",
    rooms: "Rooms",
    area: "Area",
    money: (amount: number) => `${group(amount, ",")} XAF`,
    perDay: (amount: number) => `${group(amount, ",")} XAF / day`,
    interiorAlt: (name: string) => `Interior of ${name}`,
    roomCount: (count: number) => `${count} room${count === 1 ? "" : "s"}`,
    seats: (count: number) => `Seats ${count}`,
  },

  reserve: {
    cta: "Book a viewing",
    title: "Book a viewing",
    intro:
      "Tell us when suits you and we'll confirm by phone or email. Nothing is committed until we do.",
    back: "Back to the residence",
    name: "Your name",
    phone: "Phone",
    email: "Email",
    optional: "optional",
    date: "Preferred day",
    slot: "Preferred time",
    morning: "Morning",
    afternoon: "Afternoon",
    note: "Anything we should know?",
    submit: "Request viewing",
    sending: "Sending…",
    sentTitle: "Request received.",
    sentBody:
      "We'll be in touch shortly to confirm the day and time. Nothing is booked until we do.",
    failed:
      "Something went wrong on our side and the request wasn't sent. Please try again, or call us.",
    throttled:
      "That's several requests in a row. Please wait a few minutes, or call us and we'll sort it out straight away.",
    errors: {
      required: "This one is needed.",
      tooShort: "That looks a little short.",
      tooLong: "That's longer than we can take.",
      badEmail: "That email doesn't look right.",
      badPhone: "That phone number doesn't look right.",
      badDate: "That date doesn't look right.",
      pastDate: "Pick a day from today onwards.",
      tooFar: "That's too far ahead — within six months, please.",
      badSlot: "Pick a time of day.",
      unknownListing: "We can't find that residence.",
    },
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

  notFound: {
    code: "Error 404",
    /* Deliberately answers the hero's "The door is open." */
    title: "This door doesn't open.",
    body: [
      "The page you were looking for has moved,",
      "or was never here at all.",
    ],
    back: "Back to Odza",
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
    swipeHint: "Glissez pour explorer",
    seeDetails: "Voir en détail",
    visitMore: "Voir plus",
    moreWaiting: (count: number) => `${count} autres vous attendent.`,
    listTitle: "Tout ce qui est disponible.",
    detailHint:
      "Survolez la grande vue pour les détails — choisissez une pièce à droite.",
    detailHintTouch:
      "Touchez « Voir les infos » pour les détails — choisissez une autre pièce pour changer.",
    seeRoomInfo: "Voir les infos",
    hideRoomInfo: "Masquer les infos",
    price: "Prix",
    rooms: "Pièces",
    area: "Surface",
    money: (amount: number) => `${group(amount, " ")} XAF`,
    perDay: (amount: number) => `${group(amount, " ")} XAF / jour`,
    interiorAlt: (name: string) => `Intérieur de ${name}`,
    roomCount: (count: number) => `${count} pièce${count === 1 ? "" : "s"}`,
    seats: (count: number) => `${count} places`,
  },

  reserve: {
    cta: "Réserver une visite",
    title: "Réserver une visite",
    intro:
      "Dites-nous quand cela vous arrange, nous confirmons par téléphone ou par email. Rien n'est engagé avant.",
    back: "Retour à la résidence",
    name: "Votre nom",
    phone: "Téléphone",
    email: "Email",
    optional: "facultatif",
    date: "Jour souhaité",
    slot: "Créneau souhaité",
    morning: "Matin",
    afternoon: "Après-midi",
    note: "Quelque chose à nous signaler ?",
    submit: "Demander la visite",
    sending: "Envoi…",
    sentTitle: "Demande bien reçue.",
    sentBody:
      "Nous revenons vers vous très vite pour confirmer le jour et l'heure. Rien n'est réservé avant.",
    failed:
      "Un problème de notre côté : la demande n'est pas partie. Réessayez, ou appelez-nous.",
    throttled:
      "Cela fait plusieurs demandes d'affilée. Patientez quelques minutes, ou appelez-nous et nous réglons cela tout de suite.",
    errors: {
      required: "Ce champ est nécessaire.",
      tooShort: "C'est un peu court.",
      tooLong: "C'est plus long que ce que nous pouvons accepter.",
      badEmail: "Cet email semble incorrect.",
      badPhone: "Ce numéro semble incorrect.",
      badDate: "Cette date semble incorrecte.",
      pastDate: "Choisissez un jour à partir d'aujourd'hui.",
      tooFar: "C'est trop loin — dans les six mois, s'il vous plaît.",
      badSlot: "Choisissez un créneau.",
      unknownListing: "Nous ne trouvons pas cette résidence.",
    },
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

  notFound: {
    code: "Erreur 404",
    title: "Cette porte ne s'ouvre pas.",
    body: [
      "La page que vous cherchiez a été déplacée,",
      "ou n'a jamais existé.",
    ],
    back: "Retour à Odza",
  },

  qualitiesHouse: {
    day: "La résidence en plein jour",
    night: "La résidence à la nuit tombée",
  },
};

export const DICTIONARIES: Record<Locale, Dict> = { en, fr };
