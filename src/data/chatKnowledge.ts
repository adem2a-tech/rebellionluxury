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

/** Grille tarifaire officielle : Lundi–Jeudi (moins cher) vs Vendredi–Dimanche */
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
      extraKmChf: 5,
    },
    pricing: {
      "24h": { price: "470 CHF", km: "200 km" },
      "we_court": { price: "670 CHF", km: "200 km" },
      "we_long": { price: "830 CHF", km: "200 km" },
      "semaine_courte": { price: "1'350 CHF", km: "500 km" },
      "semaine_complete": { price: "1'965 CHF", km: "500 km" },
      "mois": { price: "6'900 CHF", km: "1'000 km" },
    },
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
      extraKmChf: 6,
    },
    pricing: {
      "24h": { price: "950 CHF", km: "200 km" },
      "we_court": { price: "1'350 CHF", km: "200 km" },
      "we_long": { price: "1'690 CHF", km: "200 km" },
      "semaine_courte": { price: "4'490 CHF", km: "1'000 km" },
      "semaine_complete": { price: "5'990 CHF", km: "1'400 km" },
      "mois": { price: "14'900 CHF", km: "3'000 km" },
    },
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
      caution: "3'000 CHF",
      extraKmChf: 4,
    },
    pricing: {
      "24h": { price: "460 CHF", km: "200 km" },
      "we_court": { price: "920 CHF", km: "400 km" },
      "we_long": { price: "1'380 CHF", km: "600 km" },
      "semaine_courte": { price: "2'100 CHF", km: "1'000 km" },
      "semaine_complete": { price: "2'240 CHF", km: "1'400 km" },
    },
    pricePerDay: 460,
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
  /** Tarifs km supplémentaires : Audi 5, Maserati 4, McLaren 6 CHF/km */
  extraKmPriceAudi: 5,
  extraKmPriceMaserati: 4,
  extraKmPriceMcLaren: 6,
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
