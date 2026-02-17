/**
 * Calcul des prix : location (véhicule + km) et transport.
 * Utilise les forfaits réels du site (Lundi au vendredi, Week-end, etc.)
 */

import { getAllVehicles, getVehicleBySlug, type VehicleData, type PricingTier } from "@/data/vehicles";

export const TRANSPORT_PRICE_PER_KM = 2; // CHF
export const DEFAULT_EXTRA_KM_PRICE = 5; // CHF/km par défaut si non spécifié

export interface PriceBreakdown {
  vehicleName: string;
  locationPrice: number;
  extraKmPrice: number;
  transportPrice: number;
  total: number;
  caution: string;
  days: number;
  extraKm: number;
  transportKm: number;
  forfaitLabel?: string;
  kmInclus?: number;
}

/** Extrait le montant numérique d'un prix "4'490 CHF" ou "950 CHF" */
function parsePriceValue(priceStr: string): number {
  return parseInt(priceStr.replace(/[\s']/g, ""), 10) || 0;
}

/** Extrait le nombre de km d'une string "1'000 km" ou "200 km" */
function parseKmValue(kmStr: string): number {
  return parseInt(kmStr.replace(/[\s']/g, ""), 10) || 0;
}

/** Heures par jour pour mapping jours → forfait (grille officielle: 3h, 6h, 12h, 24h, 48h, 72h) */
const HOURS_BY_DAYS: Record<number, number> = {
  1: 24,
  2: 48,
  3: 72,
};

/** Cherche un forfait par nombre d'heures (ex: 24, 48, 72) — priorité vendredi-dimanche (weekend), puis lundi-jeudi */
function findTierByHours(pricing: PricingTier[], hours: number): PricingTier | null {
  const hStr = `${hours} h`;
  const d = (p: PricingTier) => p.duration.toLowerCase();
  const weekend = pricing.find((p) => d(p).includes("vendredi") && d(p).includes(hStr));
  if (weekend) return weekend;
  const weekday = pricing.find((p) => d(p).includes("lundi") && d(p).includes(hStr));
  return weekday || null;
}

function findMatchingTier(vehicle: VehicleData, durationKeyOrDays: string | number): { tier: PricingTier; label: string } | null {
  const pricing = vehicle.pricing;
  if (!pricing?.length) return null;

  if (typeof durationKeyOrDays === "number") {
    const days = durationKeyOrDays;
    const hours = HOURS_BY_DAYS[days] ?? Math.min(72, days * 24);
    const tier = findTierByHours(pricing, hours) ?? findTierByHours(pricing, 24) ?? pricing.find((p) => p.duration.toLowerCase().includes("24 h")) ?? pricing[0];
    return { tier, label: tier.duration };
  }

  const key = durationKeyOrDays.toLowerCase();
  for (const p of pricing) {
    if (p.duration.toLowerCase().includes(key) || key.includes(p.duration.toLowerCase().split(" ")[0])) {
      return { tier: p, label: p.duration };
    }
  }
  return null;
}

function getExtraKmPrice(vehicle: VehicleData): number {
  return vehicle.specs?.extraKmPriceChf ?? DEFAULT_EXTRA_KM_PRICE;
}

/** Calcule le prix en utilisant les forfaits réels du site */
export function calculatePriceFromSite(
  vehicleSlug: string,
  durationKeyOrDays: string | number,
  requestedKmOrExtra: number,
  transportKm: number,
  isExtraKm = false
): Omit<PriceBreakdown, "days" | "extraKm"> & { forfaitLabel: string; kmInclus: number; extraKm: number } | null {
  const vehicle = getVehicleBySlug(vehicleSlug);
  if (!vehicle) return null;
  const matched = findMatchingTier(vehicle, durationKeyOrDays);
  if (!matched) return null;
  const { tier, label } = matched;
  const locationPrice = parsePriceValue(tier.price);
  const kmInclus = parseKmValue(tier.km);
  const extraKm = isExtraKm ? requestedKmOrExtra : Math.max(0, requestedKmOrExtra - kmInclus);
  const pricePerKm = getExtraKmPrice(vehicle);
  const extraKmPrice = Math.round(extraKm * pricePerKm);
  const transportPrice = transportKm * TRANSPORT_PRICE_PER_KM;
  const total = locationPrice + extraKmPrice + transportPrice;
  const days = typeof durationKeyOrDays === "number" ? durationKeyOrDays : 1;
  return {
    vehicleName: vehicle.name,
    locationPrice,
    extraKmPrice,
    transportPrice,
    total,
    caution: vehicle.specs.caution,
    days,
    transportKm,
    forfaitLabel: label,
    kmInclus,
    extraKm,
  };
}

export function calculateRentalPrice(
  vehicleSlug: string,
  days: number,
  extraKm: number
): { locationPrice: number; extraKmPrice: number; caution: string; vehicleName: string } | null {
  const vehicle = getVehicleBySlug(vehicleSlug);
  if (!vehicle) return null;
  const result = calculatePriceFromSite(vehicleSlug, days, 0, 0);
  if (!result) return null;
  const pricePerKm = getExtraKmPrice(vehicle);
  const extraKmPrice = Math.round(extraKm * pricePerKm);
  return {
    locationPrice: result.locationPrice,
    extraKmPrice,
    caution: result.caution,
    vehicleName: result.vehicleName,
  };
}

export function calculateTransportPrice(km: number): number {
  return km * TRANSPORT_PRICE_PER_KM;
}

export function calculateTotalPrice(
  vehicleSlug: string,
  days: number,
  extraKm: number,
  transportKm: number
): PriceBreakdown | null {
  const result = calculatePriceFromSite(vehicleSlug, days, extraKm, transportKm, true);
  if (!result) return null;
  return {
    vehicleName: result.vehicleName,
    locationPrice: result.locationPrice,
    extraKmPrice: result.extraKmPrice,
    transportPrice: result.transportPrice,
    total: result.total,
    caution: result.caution,
    days: result.days,
    extraKm: result.extraKm,
    transportKm: result.transportKm,
    forfaitLabel: result.forfaitLabel,
    kmInclus: result.kmInclus,
  };
}

/** Trouve un véhicule par nom (Audi, R8, McLaren, 570...) */
export function findVehicleByQuery(query: string): { slug: string; name: string } | null {
  const q = query.toLowerCase().trim();
  const vehicles = getAllVehicles();
  for (const v of vehicles) {
    const vn = v.name.toLowerCase();
    if (vn.includes(q) || v.slug.includes(q.replace(/\s/g, "-"))) return { slug: v.slug, name: v.name };
    if ((q.includes("audi") || q.includes("r8")) && vn.includes("audi")) return { slug: v.slug, name: v.name };
    if ((q.includes("mclaren") || q.includes("570")) && vn.includes("mclaren")) return { slug: v.slug, name: v.name };
    if ((q.includes("maserati") || q.includes("quattroporte")) && vn.includes("maserati")) return { slug: v.slug, name: v.name };
  }
  return null;
}

/** Résultat du parsing d'une requête prix */
export interface ParsedPriceQuery {
  days?: number;
  requestedKm?: number;
  extraKm?: number;
  transportKm?: number;
  vehicleQuery?: string;
  durationKey?: string;
}

/** Extrait jours, km, transport, forfait du message (pour l'IA) */
export function parsePriceQuery(message: string): ParsedPriceQuery {
  const m = message.toLowerCase().trim();
  const result: ParsedPriceQuery = {};

  // Forfait par mots-clés : "lundi à vendredi", "week-end", etc.
  if (/lundi\s*(au|à|a)\s*vendredi|5\s*j(?:our)?s?|5j/.test(m)) result.durationKey = "Lundi au vendredi";
  else if (/lundi\s*(au|à|a)\s*lundi|semaine|7\s*j(?:our)?s?|7j/.test(m)) result.durationKey = "Lundi au lundi";
  else if (/vendredi\s*(au|à|a)\s*dimanche|week[- ]?end|weekend|3\s*j(?:our)?s?|3j/.test(m)) result.durationKey = "Vendredi au dimanche";
  else if (/vendredi\s*(au|à|a)\s*lundi|4\s*j(?:our)?s?|4j/.test(m)) result.durationKey = "Vendredi au lundi";
  else if (/mois|30\s*j(?:our)?s?/.test(m)) result.durationKey = "Mois (30 jours)";

  // Jours : "6j", "6 jours", "mclaren 6", etc.
  const dayMatch =
    m.match(/(\d+)\s*j(?:our)?s?\b/i) ||
    m.match(/(\d+)\s*(?:jour|jours|day|days)\b/i) ||
    m.match(/(?:pour|pendant)\s+(\d+)\s*(?:j|jour|jours)?/i) ||
    m.match(/(\d+)\s*(?:j\b)/) ||
    m.match(/(?:mclaren|audi|r8|570)\s+(\d{1,2})\b/i) ||
    m.match(/\b(\d{1,2})\s+(?:mclaren|audi|r8|570)/i);
  if (dayMatch) result.days = Math.min(365, Math.max(1, parseInt(dayMatch[1], 10)));

  const transportMatch =
    m.match(/(?:transport|livraison|liver?)\s*(?:de\s*)?(\d+)\s*km/i) ||
    m.match(/(\d+)\s*km\s*(?:de\s*)?(?:transport|livraison)/i) ||
    m.match(/(\d+)\s*km\s*(?:pour\s+)?(?:le\s+)?transport/i);
  if (transportMatch) result.transportKm = Math.max(0, parseInt(transportMatch[1], 10));

  // "400 km" = km total souhaités ; "200 km en plus" = km supplémentaires
  const extraKmMatch = m.match(/(\d+)\s*km\s*(?:en\s+plus|suppl|sup\.|supplémentaire)/i);
  if (extraKmMatch) result.extraKm = Math.max(0, parseInt(extraKmMatch[1], 10));
  else if (m.match(/(\d+)\s*km/i) && !result.transportKm && !/transport|livraison/.test(m)) {
    const val = parseInt(m.match(/(\d+)\s*km/)?.[1] || "0", 10);
    if (val > 0) result.requestedKm = val;
  }

  if (m.includes("audi") || m.includes("r8")) result.vehicleQuery = "audi r8";
  if (m.includes("mclaren") || m.includes("570")) result.vehicleQuery = "mclaren 570";
  if (m.includes("maserati") || m.includes("quattroporte")) result.vehicleQuery = "maserati";
  return result;
}
