/**
 * Données du site utilisées par le chat IA (alignées avec VehiclesSection, Footer, Reseaux).
 */

export const CONTACT = {
  phone: "+41 79 123 45 67",
  phoneRaw: "41791234567",
  whatsappUrl: "https://wa.me/41791234567",
  instagramUrl: "https://www.instagram.com/rebellion.luxury/",
  facebookUrl: "https://www.facebook.com/people/Rebellion-luxury/61585966329317/",
  tiktokUrl: "https://www.tiktok.com/@rebellion.luxury",
  email: "contact@rebellionluxury.ch",
  location: "Suisse, Evionnaz",
  googleMapsUrl: "https://www.google.com/maps/search/Evionnaz+Suisse",
  googleReviewsUrl: "https://www.google.com/maps/search/Evionnaz+Suisse",
} as const;

/** Créateur du site */
export const CREATOR = {
  name: "Adem Elite",
  whatsappUrl: "https://wa.me/41791234567",
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
      { label: "Journée (24h)", price: "470 CHF", km: "200 km" },
      { label: "Vendredi au dimanche", price: "670 CHF", km: "200 km" },
      { label: "Lundi au lundi", price: "2'800 CHF", km: "1'000 km" },
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
      { label: "Journée (24h)", price: "950 CHF", km: "200 km" },
      { label: "Vendredi au dimanche", price: "1'350 CHF", km: "200 km" },
      { label: "Lundi au lundi", price: "5'990 CHF", km: "1'400 km" },
    ],
    pricePerDay: 950,
  },
] as const;

export const CONDITIONS = [
  "Âge minimum: 25 ans",
  "Permis de conduire valide (2+ ans)",
  "Pièce d'identité",
  "Caution par carte bancaire",
  "Le véhicule doit rester en Suisse sauf accord préalable",
] as const;
