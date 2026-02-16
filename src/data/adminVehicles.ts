/**
 * Véhicules ajoutés par le patron dans l'Espace pro.
 * Affichés automatiquement sur le site avec les véhicules statiques.
 */

import type { VehicleData, VehicleSpec, PricingTier } from "./vehicles";

const STORAGE_KEY = "rebellion_admin_vehicles";

export interface AdminVehicleInput {
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
  /** Grille tarifaire saisie par le patron (24h, 48h, forfaits...) */
  pricing: PricingTier[];
  /** Lien Boboloc pour les disponibilités en temps réel */
  availabilityUrl?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadAdminVehicles(): VehicleData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminVehicles(vehicles: VehicleData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

/** Ajoute un véhicule (patron) */
export function addAdminVehicle(input: AdminVehicleInput): VehicleData {
  const list = loadAdminVehicles();
  const baseSlug = slugify(`${input.brand} ${input.model}`);
  let slug = baseSlug;
  let i = 0;
  while (list.some((v) => v.slug === slug)) {
    i++;
    slug = `${baseSlug}-${i}`;
  }

  const powerNum = parseInt(input.power.replace(/\D/g, ""), 10) || 0;
  const specs: VehicleSpec = {
    caution: input.caution || "À définir",
    power: input.power,
    type: input.category || "Sport",
    transmission: input.transmission,
    boite: input.transmission,
    year: input.year,
    doors: 2,
    seats: 2,
    exteriorColor: "—",
    interiorColor: "—",
    kilometers: "—",
    warranty: "—",
  };

  const pricing = input.pricing.length > 0 ? input.pricing : [
    { duration: "Journée (24h)", km: "200 km", price: "Sur demande" },
  ];
  const price24 = pricing[0]?.price ? parseInt(pricing[0].price.replace(/\D/g, ""), 10) : 0;

  const vehicle: VehicleData = {
    slug,
    name: `${input.brand} ${input.model}`.trim(),
    description: input.description,
    video: "",
    images: input.images.length > 0 ? input.images : ["/placeholder.svg"],
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

  list.push(vehicle);
  saveAdminVehicles(list);
  return vehicle;
}

/** Met à jour un véhicule admin existant */
export function updateAdminVehicle(slug: string, input: AdminVehicleInput): VehicleData | null {
  const list = loadAdminVehicles();
  const index = list.findIndex((v) => v.slug === slug);
  if (index < 0) return null;

  const powerNum = parseInt(input.power.replace(/\D/g, ""), 10) || 0;
  const specs: VehicleSpec = {
    caution: input.caution || "À définir",
    power: input.power,
    type: input.category || "Sport",
    transmission: input.transmission,
    boite: input.transmission,
    year: input.year,
    doors: 2,
    seats: 2,
    exteriorColor: "—",
    interiorColor: "—",
    kilometers: "—",
    warranty: "—",
  };

  const pricing = input.pricing.length > 0 ? input.pricing : [
    { duration: "Journée (24h)", km: "200 km", price: "Sur demande" },
  ];
  const price24 = pricing[0]?.price ? parseInt(pricing[0].price.replace(/\D/g, ""), 10) : 0;

  const vehicle: VehicleData = {
    ...list[index],
    slug, // garde le slug pour ne pas casser les liens
    name: `${input.brand} ${input.model}`.trim(),
    description: input.description,
    images: input.images.length > 0 ? input.images : list[index].images,
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
  saveAdminVehicles(list);
  return vehicle;
}

/** Supprime un véhicule admin par slug */
export function removeAdminVehicle(slug: string): void {
  const list = loadAdminVehicles().filter((v) => v.slug !== slug);
  saveAdminVehicles(list);
}

/** Liste des véhicules ajoutés par le patron */
export function getAdminVehicles(): VehicleData[] {
  return loadAdminVehicles();
}
