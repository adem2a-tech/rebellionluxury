/**
 * Demandes de location (véhicules proposés par des particuliers).
 * Stocké en localStorage. Les véhicules acceptés apparaissent sur le site.
 */

import type { VehicleData, VehicleSpec, PricingTier } from "./vehicles";

const STORAGE_KEY = "rebellion_vehicle_requests";

export type VehicleRequestStatus = "pending" | "accepted" | "rejected";

export interface VehicleRequest {
  id: string;
  status: VehicleRequestStatus;
  submittedAt: string; // ISO
  decidedAt?: string; // ISO, optionnel
  /** Grille tarifaire définie par le patron lors de l'acceptation */
  pricing?: PricingTier[];
  depositor: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    power: string; // ex: "420 CH"
    transmission: string;
    description: string;
    pricePerDay: string; // ex: "500 CHF"
    location: string; // ville ou adresse de mise à disposition
    /** Lien disponibilités (Boboloc ou autre) — optionnel, selon le déposant */
    availabilityUrl?: string;
  };
  images: string[]; // base64 data URLs
  /** Infos détaillées renseignées par l'Espace Pro (caution, type, moteur, etc.) — utilisé pour la fiche publique */
  editedSpecs?: VehicleSpec;
}

function loadRequests(): VehicleRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRequests(requests: VehicleRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function addRequest(data: Omit<VehicleRequest, "id" | "status" | "submittedAt">): VehicleRequest | null {
  const email = data.depositor.email;
  if (!canAddRequestToday(email)) {
    return null;
  }
  const list = loadRequests();
  const entry: VehicleRequest = {
    ...data,
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  list.push(entry);
  saveRequests(list);
  return entry;
}

/** Formate le téléphone pour le lien WhatsApp (sans espaces, avec indicatif) */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "41" + digits.slice(1);
  if (digits.length === 9 && !digits.startsWith("41")) return "41" + digits;
  return digits;
}

export function updateRequestStatus(
  id: string,
  status: "accepted" | "rejected"
): VehicleRequest | null {
  const list = loadRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  list[idx].status = status;
  list[idx].decidedAt = new Date().toISOString();
  saveRequests(list);
  return list[idx];
}

/** Accepte une demande avec la grille tarifaire définie par le patron */
export function acceptRequestWithPricing(
  id: string,
  pricing: PricingTier[]
): VehicleRequest | null {
  const list = loadRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  list[idx].status = "accepted";
  list[idx].decidedAt = new Date().toISOString();
  list[idx].pricing = pricing;
  saveRequests(list);
  return list[idx];
}

/** Met à jour la grille tarifaire d'une demande acceptée */
export function updateRequestPricing(
  id: string,
  pricing: PricingTier[]
): VehicleRequest | null {
  const list = loadRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  list[idx].pricing = pricing;
  saveRequests(list);
  return list[idx];
}

/** Met à jour les caractéristiques affichées (Espace Pro) pour une demande acceptée */
export function updateRequestSpecs(
  id: string,
  specs: VehicleSpec
): VehicleRequest | null {
  const list = loadRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  list[idx].editedSpecs = specs;
  saveRequests(list);
  return list[idx];
}

/** Supprime une demande (tous statuts). Retourne true si supprimée. */
export function deleteRequest(id: string): boolean {
  const list = loadRequests().filter((r) => r.id !== id);
  if (list.length === loadRequests().length) return false;
  saveRequests(list);
  return true;
}

export function getRequestsByStatus(status: VehicleRequestStatus): VehicleRequest[] {
  return loadRequests().filter((r) => r.status === status);
}

export function getAllRequests(): VehicleRequest[] {
  return loadRequests();
}

export function getRequestById(id: string): VehicleRequest | undefined {
  return loadRequests().find((r) => r.id === id);
}

export function getRequestsByEmail(email: string): VehicleRequest[] {
  const normalized = email.trim().toLowerCase();
  return loadRequests().filter((r) => r.depositor.email.trim().toLowerCase() === normalized);
}

const MAX_REQUESTS_PER_DAY = 3;

function isSameDay(iso1: string, iso2: string): boolean {
  const d1 = new Date(iso1);
  const d2 = new Date(iso2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Nombre de demandes soumises aujourd'hui par cet email */
export function getRequestsCountTodayByEmail(email: string): number {
  const normalized = email.trim().toLowerCase();
  const today = new Date().toISOString();
  return loadRequests().filter(
    (r) =>
      r.depositor.email.trim().toLowerCase() === normalized &&
      isSameDay(r.submittedAt, today)
  ).length;
}

/** Nombre de demandes restantes aujourd'hui pour cet email (max 3/jour) */
export function getRemainingRequestsToday(email: string): number {
  const count = getRequestsCountTodayByEmail(email);
  return Math.max(0, MAX_REQUESTS_PER_DAY - count);
}

export function canAddRequestToday(email: string): boolean {
  return getRemainingRequestsToday(email) > 0;
}

/**
 * Convertit une demande acceptée en VehicleData pour l'affichage sur le site.
 */
function requestToVehicleData(req: VehicleRequest): VehicleData {
  const v = req.vehicle;
  const name = `${v.brand} ${v.model}`.trim();
  const slug = `demande-${req.id}`;
  const powerNum = parseInt((req.editedSpecs?.power ?? v.power).replace(/\D/g, ""), 10) || 0;

  const baseSpecs: VehicleSpec = {
    caution: "À définir",
    power: v.power,
    type: "Particulier",
    transmission: v.transmission,
    boite: v.transmission,
    year: v.year,
    doors: 2,
    seats: 2,
    exteriorColor: "—",
    interiorColor: "—",
    kilometers: "—",
    warranty: "—",
  };
  const specs: VehicleSpec = req.editedSpecs ? { ...baseSpecs, ...req.editedSpecs } : baseSpecs;

  const pricing: PricingTier[] = (req.pricing && req.pricing.length > 0)
    ? req.pricing
    : [
        { duration: "Journée (24h)", km: "200 km", price: v.pricePerDay || "Sur demande" },
        { duration: "Lundi au lundi", km: "1'000 km", price: "Sur demande" },
        { duration: "Mois (30 jours)", km: "2'000 km", price: "Sur demande" },
      ];

  const price24 = pricing[0]?.price ? parseInt(pricing[0].price.replace(/\D/g, ""), 10) : 0;

  return {
    slug,
    name,
    description: v.description,
    video: "",
    images: req.images,
    specs,
    pricing,
    brand: v.brand,
    model: v.model,
    pricePerDay: price24 || parseInt((v.pricePerDay || "").replace(/\D/g, ""), 10) || 0,
    power: powerNum,
    year: v.year,
    category: "Particulier",
    transmission: v.transmission,
    boite: v.transmission,
    location: v.location,
    availabilityUrl: v.availabilityUrl,
  };
}

export function getApprovedVehicles(): VehicleData[] {
  const accepted = getRequestsByStatus("accepted");
  return accepted.map(requestToVehicleData);
}
