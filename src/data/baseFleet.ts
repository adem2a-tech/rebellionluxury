/**
 * Flotte de base (Audi, McLaren, Maserati) — modifiable via Espace pro.
 * Stockée dans localStorage pour permettre les modifications sans redéploiement.
 */

import type { VehicleData, VehicleSpec, PricingTier } from "./vehicles";
import { VEHICLES_DATA } from "./vehicles";

const STORAGE_KEY = "rebellion_base_fleet";

export interface BaseFleetInput {
  brand: string;
  model: string;
  year: number;
  power: string;
  transmission: string;
  description: string;
  caution: string;
  location: string;
  category: string;
  images: string[];
  pricing: PricingTier[];
  availabilityUrl?: string;
  video?: string;
}

function loadBaseFleet(): VehicleData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBaseFleet(vehicles: VehicleData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

/** Retourne la flotte de base (localStorage ou défaut) */
export function getBaseFleet(): VehicleData[] {
  const stored = loadBaseFleet();
  if (stored.length > 0) return stored;
  // Premier chargement : initialiser avec les valeurs par défaut
  saveBaseFleet(VEHICLES_DATA);
  return VEHICLES_DATA;
}

/** Met à jour un véhicule de la flotte de base */
export function updateBaseVehicle(slug: string, input: BaseFleetInput): VehicleData | null {
  const list = getBaseFleet();
  const index = list.findIndex((v) => v.slug === slug);
  if (index < 0) return null;

  const existing = list[index];
  const powerNum = parseInt(input.power.replace(/\D/g, ""), 10) || 0;

  const specs: VehicleSpec = {
    caution: input.caution || "À définir",
    power: input.power,
    type: input.category || "Sport",
    transmission: input.transmission,
    boite: input.transmission,
    year: input.year,
    doors: existing.specs?.doors ?? 2,
    seats: existing.specs?.seats ?? 2,
    exteriorColor: existing.specs?.exteriorColor ?? "—",
    interiorColor: existing.specs?.interiorColor ?? "—",
    kilometers: "—",
    warranty: "—",
  };

  const pricing = input.pricing.length > 0 ? input.pricing : existing.pricing;
  const price24 = pricing.find((p) => p.duration.includes("24 h"))?.price
    ? parseInt(pricing.find((p) => p.duration.includes("24 h"))!.price.replace(/\D/g, ""), 10)
    : parseInt(pricing[0]?.price.replace(/\D/g, "") ?? "0", 10) || 0;

  const vehicle: VehicleData = {
    ...existing,
    name: `${input.brand} ${input.model}`.trim(),
    description: input.description,
    video: input.video ?? existing.video ?? "",
    images: input.images.length > 0 ? input.images : existing.images,
    specs,
    pricing,
    brand: input.brand,
    model: input.model,
    pricePerDay: price24,
    power: powerNum,
    year: input.year,
    category: input.category || "Sport",
    transmission: input.transmission,
    boite: input.transmission,
    location: input.location || "Suisse romande",
    availabilityUrl: input.availabilityUrl?.trim() || undefined,
  };

  list[index] = vehicle;
  saveBaseFleet(list);
  return vehicle;
}
