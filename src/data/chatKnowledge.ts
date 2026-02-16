/**
 * Données du site utilisées par le chat IA (alignées avec VehiclesSection, Footer, Reseaux).
 */

export const CONTACT = {
  phone: "+41 79 913 01 28",
  phoneRaw: "41799130128",
  whatsappUrl: "https://wa.me/41799130128",
  instagramUrl: "https://www.instagram.com/rebellion.luxury/",
  facebookUrl: "https://www.facebook.com/people/Rebellion-luxury/61585966329317/",
  tiktokUrl: "https://www.tiktok.com/@rebellion.luxury",
  email: "Rebellionluxury@outlook.com",
  location: "Suisse, Evionnaz",
  googleMapsUrl: "https://www.google.com/maps/search/Evionnaz+Suisse",
  googleReviewsUrl: "https://www.google.com/maps/search/Evionnaz+Suisse",
} as const;

/** Créateur du site */
export const CREATOR = {
  name: "Adem Elite",
  whatsappUrl: "https://wa.me/41799130128",
} as const;

/** Liens Boboloc — disponibilités en temps réel (mis à jour côté Boboloc) */
export const BOBOLOC_AVAILABILITY_URLS: Record<string, string> = {
  "Audi R8 V8": "https://www.boboloc.com/rebellionluxury-7245/kezntQs6TguHxEoSYnFb/carDetails",
  "McLaren 570S": "https://www.boboloc.com/rebellionluxury-7245/w841mVrBl2hpGgwHN0dG/carDetails",
};

export const VEHICLES = [
  {
    name: "Audi R8 V8",
    shortName: "R8 V8",
    type: "Sport",
    description: "L'Audi R8 V8 allie puissance brute et raffinement. Moteur atmosphérique V8, transmission automatique et tenue de route exemplaire.",
    specs: {
      power: "420 CH",
      transmission: "Automatique",
      year: 2010,
      caution: "3'000 CHF",
    },
    pricing: [
      { label: "Du lundi au jeudi — 3 h", price: "170 CHF", km: "50 km" },
      { label: "Du lundi au jeudi — 24 h", price: "470 CHF", km: "200 km" },
      { label: "Du vendredi au dimanche — 24 h", price: "510 CHF", km: "200 km" },
    ],
    pricePerDay: 470,
  },
  {
    name: "McLaren 570S",
    shortName: "McLaren",
    type: "Supercar",
    description: "La McLaren 570S incarne la pureté sportive : portières papillon, châssis en fibre de carbone et 570 chevaux.",
    specs: {
      power: "570 CH",
      transmission: "Automatique",
      year: 2017,
      caution: "10'000 CHF",
    },
    pricing: [
      { label: "Du lundi au jeudi — 3 h", price: "390 CHF", km: "50 km" },
      { label: "Du lundi au jeudi — 24 h", price: "950 CHF", km: "200 km" },
      { label: "Du vendredi au dimanche — 24 h", price: "1'050 CHF", km: "200 km" },
    ],
    pricePerDay: 950,
  },
  {
    name: "Maserati Quattroporte GTS",
    shortName: "Quattroporte",
    type: "Berline luxe",
    description: "Berline de luxe au caractère sportif. Moteur V8 Ferrari biturbo. Idéale pour mariages, événements et déplacements VIP.",
    specs: {
      power: "530 CH",
      transmission: "Automatique",
      year: 2019,
      caution: "5'000 CHF",
    },
    pricing: [
      { label: "Du lundi au jeudi — 3 h", price: "150 CHF", km: "50 km" },
      { label: "Du lundi au jeudi — 24 h", price: "420 CHF", km: "200 km" },
      { label: "Du vendredi au dimanche — 24 h", price: "460 CHF", km: "200 km" },
    ],
    pricePerDay: 420,
  },
] as const;

export const CONDITIONS = [
  "Âge minimum: 25 ans",
  "Permis de conduire valide (2+ ans)",
  "Pièce d'identité",
  "Caution par carte bancaire",
  "Le véhicule doit rester en Suisse sauf accord préalable",
] as const;

/** Infos site — pour le chat IA (pages, services) */
export const SITE_INFO = {
  location: "Evionnaz, Valais",
  region: "Suisse romande",
  transportPricePerKm: 2,
  extraKmPrice: 0.5,
  minAge: 25,
  minPermitYears: 2,
  pages: {
    vehicules: "/vehicules",
    calculerPrix: "/calculer-prix",
    transport: "/transport",
    loueTonVehicule: "/loue-ton-vehicule",
    verifierDemande: "/verifier-ma-demande",
    rentabilite: "/rentabilite",
    reseaux: "/reseaux",
    aPropos: "/a-propos",
    contact: "/contact",
    espacePro: "/espace-pro",
  },
} as const;
