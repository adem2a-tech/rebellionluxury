/**
 * Données véhicules partagées (liste, détail, filtres).
 * Les images sont des chemins publics ou imports selon l'usage.
 */

import { getApprovedVehicles } from "./vehicleRequests";
import { getAdminVehicles } from "./adminVehicles";
import { getBaseFleet } from "./baseFleet";

export interface VehicleSpec {
  caution: string;
  power: string;
  type: string;
  transmission: string;
  boite?: string;
  year: number;
  doors: number;
  seats: number;
  /** Optionnel : couleur extérieure */
  exteriorColor?: string;
  /** Optionnel : couleur intérieure */
  interiorColor?: string;
  /** Optionnel : kilométrage affiché */
  kilometers?: string;
  /** Optionnel : garantie */
  warranty?: string;
}

export interface PricingTier {
  duration: string;
  km: string;
  price: string;
}

/** Lien Boboloc pour les disponibilités en temps réel */
export const BOBOLOC_URLS: Record<string, string> = {
  "Audi R8 V8": "https://www.boboloc.com/rebellionluxury-7245/kezntQs6TguHxEoSYnFb/carDetails",
  "McLaren 570S": "https://www.boboloc.com/rebellionluxury-7245/w841mVrBl2hpGgwHN0dG/carDetails",
};

export interface VehicleData {
  slug: string;
  name: string;
  description: string;
  video: string;
  images: string[];
  specs: VehicleSpec;
  pricing: PricingTier[];
  brand: string;
  model: string;
  pricePerDay: number;
  power: number;
  year: number;
  category: string;
  transmission: string;
  boite: string;
  location: string;
  /** Lien Boboloc pour voir les disponibilités en temps réel */
  availabilityUrl?: string;
}

export const VEHICLES_DATA: VehicleData[] = [
  {
    slug: "audi-r8-v8",
    name: "Audi R8 V8",
    description:
      "L'Audi R8 V8 allie puissance brute et raffinement. Moteur atmosphérique V8, transmission automatique et tenue de route exemplaire pour des sensations uniques sur les routes de Suisse romande. Idéal pour un week-end ou une occasion spéciale.",
    video: "/vehicle-audi.mp4",
    images: ["/audi-r8-front-quarter.png", "/audi-r8-interior.png", "/audi-r8-rear.png"],
    specs: {
      caution: "3'000 CHF",
      power: "420 CH",
      type: "Sport",
      transmission: "Automatique",
      boite: "Automatique",
      year: 2010,
      doors: 2,
      seats: 2,
      exteriorColor: "Noir / Argent",
      interiorColor: "Cuir noir",
      kilometers: "—",
      warranty: "—",
    },
    pricing: [
      { duration: "Du lundi au jeudi — 3 h", km: "50 km", price: "170 CHF" },
      { duration: "Du lundi au jeudi — 6 h", km: "100 km", price: "210 CHF" },
      { duration: "Du lundi au jeudi — 12 h", km: "200 km", price: "390 CHF" },
      { duration: "Du lundi au jeudi — 24 h", km: "200 km", price: "470 CHF" },
      { duration: "Du lundi au jeudi — 48 h", km: "200 km", price: "670 CHF" },
      { duration: "Du lundi au jeudi — 72 h", km: "200 km", price: "830 CHF" },
      { duration: "Du vendredi au dimanche — 3 h", km: "50 km", price: "210 CHF" },
      { duration: "Du vendredi au dimanche — 6 h", km: "100 km", price: "250 CHF" },
      { duration: "Du vendredi au dimanche — 12 h", km: "200 km", price: "430 CHF" },
      { duration: "Du vendredi au dimanche — 24 h", km: "200 km", price: "510 CHF" },
      { duration: "Du vendredi au dimanche — 48 h", km: "200 km", price: "710 CHF" },
      { duration: "Du vendredi au dimanche — 72 h", km: "200 km", price: "870 CHF" },
    ],
    brand: "Audi",
    model: "R8 V8",
    pricePerDay: 470,
    power: 420,
    year: 2010,
    category: "Sport",
    transmission: "Automatique",
    boite: "Automatique",
    location: "Suisse romande",
    availabilityUrl: BOBOLOC_URLS["Audi R8 V8"],
  },
  {
    slug: "mclaren-570s",
    name: "McLaren 570S",
    description:
      "La McLaren 570S incarne la pureté sportive : portières papillon, châssis en fibre de carbone et 570 chevaux. Une expérience de conduite ultime pour les amateurs de supercars. Réservez votre essai avec Rebellion IA.",
    video: "/vehicle-mclaren.mp4",
    images: [
      "/mclaren-570s-front.png",
      "/mclaren-570s-interior-door.png",
      "/mclaren-570s-interior-dash.png",
      "/mclaren-570s-wheel.png",
      "/mclaren-570s-rear.png",
    ],
    specs: {
      caution: "10'000 CHF",
      power: "570 CH",
      type: "Supercar",
      transmission: "Automatique",
      boite: "Automatique",
      year: 2017,
      doors: 2,
      seats: 2,
      exteriorColor: "—",
      interiorColor: "—",
      kilometers: "—",
      warranty: "—",
    },
    pricing: [
      { duration: "Du lundi au jeudi — 3 h", km: "50 km", price: "390 CHF" },
      { duration: "Du lundi au jeudi — 6 h", km: "100 km", price: "490 CHF" },
      { duration: "Du lundi au jeudi — 12 h", km: "200 km", price: "790 CHF" },
      { duration: "Du lundi au jeudi — 24 h", km: "200 km", price: "950 CHF" },
      { duration: "Du lundi au jeudi — 48 h", km: "200 km", price: "1'350 CHF" },
      { duration: "Du lundi au jeudi — 72 h", km: "200 km", price: "1'690 CHF" },
      { duration: "Du vendredi au dimanche — 3 h", km: "50 km", price: "450 CHF" },
      { duration: "Du vendredi au dimanche — 6 h", km: "100 km", price: "550 CHF" },
      { duration: "Du vendredi au dimanche — 12 h", km: "200 km", price: "850 CHF" },
      { duration: "Du vendredi au dimanche — 24 h", km: "200 km", price: "1'050 CHF" },
      { duration: "Du vendredi au dimanche — 48 h", km: "200 km", price: "1'450 CHF" },
      { duration: "Du vendredi au dimanche — 72 h", km: "200 km", price: "1'790 CHF" },
    ],
    brand: "McLaren",
    model: "570S",
    pricePerDay: 950,
    power: 570,
    year: 2017,
    category: "Supercar",
    transmission: "Automatique",
    boite: "Automatique",
    location: "Suisse romande",
    availabilityUrl: BOBOLOC_URLS["McLaren 570S"],
  },
  {
    slug: "maserati-quattroporte-gts",
    name: "Maserati Quattroporte GTS",
    description:
      "Expérience automobile d'exception avec la berline de luxe au caractère sportif affirmé. Sous son capot se cache un moteur V8 Ferrari biturbo, délivrant des performances impressionnantes. Élégance italienne, puissance et prestige. Idéale pour mariages, événements et déplacements VIP.",
    video: "",
    images: [
      "/maserati-quattroporte-side.png",
      "/maserati-quattroporte-front.png",
      "/maserati-quattroporte-rear.png",
      "/maserati-quattroporte-interior.png",
    ],
    specs: {
      caution: "5'000 CHF",
      power: "530 CH",
      type: "Berline luxe",
      transmission: "Automatique",
      boite: "Automatique",
      year: 2019,
      doors: 4,
      seats: 4,
      exteriorColor: "Brun métallisé",
      interiorColor: "Cuir beige",
      kilometers: "—",
      warranty: "—",
    },
    pricing: [
      { duration: "Du lundi au jeudi — 3 h", km: "50 km", price: "150 CHF" },
      { duration: "Du lundi au jeudi — 6 h", km: "100 km", price: "190 CHF" },
      { duration: "Du lundi au jeudi — 12 h", km: "200 km", price: "350 CHF" },
      { duration: "Du lundi au jeudi — 24 h", km: "200 km", price: "420 CHF" },
      { duration: "Du lundi au jeudi — 48 h", km: "200 km", price: "600 CHF" },
      { duration: "Du lundi au jeudi — 72 h", km: "200 km", price: "750 CHF" },
      { duration: "Du vendredi au dimanche — 3 h", km: "50 km", price: "190 CHF" },
      { duration: "Du vendredi au dimanche — 6 h", km: "100 km", price: "225 CHF" },
      { duration: "Du vendredi au dimanche — 12 h", km: "200 km", price: "390 CHF" },
      { duration: "Du vendredi au dimanche — 24 h", km: "200 km", price: "460 CHF" },
      { duration: "Du vendredi au dimanche — 48 h", km: "200 km", price: "640 CHF" },
      { duration: "Du vendredi au dimanche — 72 h", km: "200 km", price: "780 CHF" },
    ],
    brand: "Maserati",
    model: "Quattroporte GTS",
    pricePerDay: 420,
    power: 530,
    year: 2019,
    category: "Berline luxe",
    transmission: "Automatique",
    boite: "Automatique",
    location: "Suisse romande",
  },
];

/**
 * Retourne tous les véhicules : flotte de base (modifiable) + admin + demandes acceptées.
 */
export function getAllVehicles(): VehicleData[] {
  const base = getBaseFleet();
  const approved = getApprovedVehicles();
  const admin = getAdminVehicles();
  return [...base, ...admin, ...approved];
}

export function getVehicleBySlug(slug: string): VehicleData | undefined {
  const all = getAllVehicles();
  return all.find((v) => v.slug === slug);
}
