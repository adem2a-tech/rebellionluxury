/**
 * Données véhicules partagées (liste, détail, filtres).
 * Les images sont des chemins publics ou imports selon l'usage.
 */

import { getApprovedVehicles } from "./vehicleRequests";
import { getAdminVehicles } from "./adminVehicles";

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
      { duration: "Journée (24h)", km: "200 km", price: "470 CHF" },
      { duration: "Lundi au vendredi", km: "800 km", price: "2'200 CHF" },
      { duration: "Lundi au lundi", km: "1'000 km", price: "2'800 CHF" },
      { duration: "Vendredi au dimanche", km: "200 km", price: "670 CHF" },
      { duration: "Vendredi au lundi", km: "200 km", price: "890 CHF" },
      { duration: "Mois (30 jours)", km: "2'000 km", price: "8'500 CHF" },
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
      { duration: "Journée (24h)", km: "200 km", price: "950 CHF" },
      { duration: "Lundi au vendredi", km: "1'000 km", price: "4'490 CHF" },
      { duration: "Lundi au lundi", km: "1'400 km", price: "5'990 CHF" },
      { duration: "Vendredi au dimanche", km: "200 km", price: "1'350 CHF" },
      { duration: "Vendredi au lundi", km: "200 km", price: "1'690 CHF" },
      { duration: "Mois (30 jours)", km: "3'000 km", price: "14'900 CHF" },
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
];

/**
 * Retourne tous les véhicules : statiques + admin + demandes acceptées.
 */
export function getAllVehicles(): VehicleData[] {
  const approved = getApprovedVehicles();
  const admin = getAdminVehicles();
  return [...VEHICLES_DATA, ...admin, ...approved];
}

export function getVehicleBySlug(slug: string): VehicleData | undefined {
  const all = getAllVehicles();
  return all.find((v) => v.slug === slug);
}
