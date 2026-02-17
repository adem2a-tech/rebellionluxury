/**
 * Calcul des prix : location (véhicule + km) et transport.
 * Grille tarifaire officielle : Lundi–Jeudi (moins cher) vs Vendredi–Dimanche.
 * Durées : 3h, 6h, 12h, 24h, 48h, 72h.
 */

import { getAllVehicles, getVehicleBySlug, type VehicleData, type PricingTier } from "@/data/vehicles";

export const TRANSPORT_PRICE_PER_KM = 2; // CHF
const DEFAULT_EXTRA_KM_PRICE = 5; // CHF/km si non défini par véhicule

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

export type DurationKey = "3 h" | "6 h" | "12 h" | "24 h" | "48 h" | "72 h";

/** Durées disponibles (ordre pour le sélecteur) */
export const DURATION_OPTIONS: { value: DurationKey; label: string }[] = [
  { value: "3 h", label: "3 heures" },
  { value: "6 h", label: "6 heures" },
  { value: "12 h", label: "12 heures" },
  { value: "24 h", label: "24 h (1 jour)" },
  { value: "48 h", label: "48 h (2 jours)" },
  { value: "72 h", label: "72 h (3 jours)" },
];

/** Extrait le montant numérique d'un prix "4'490 CHF" ou "950 CHF" */
function parsePriceValue(priceStr: string): number {
  return parseInt(priceStr.replace(/[\s']/g, ""), 10) || 0;
}

/** Extrait le nombre de km d'une string "1'000 km" ou "200 km" */
function parseKmValue(kmStr: string): number {
  return parseInt(kmStr.replace(/[\s']/g, ""), 10) || 0;
}

/** Retourne si une date tombe en week-end (Vendredi–Dimanche = tarif plus élevé) */
export function isWeekend(date: Date): boolean {
  const d = date.getDay(); // 0=Dim, 5=Ven, 6=Sam
  return d === 0 || d === 5 || d === 6;
}

function getExtraKmPrice(vehicle: VehicleData): number {
  return vehicle.extraKmPriceChf ?? DEFAULT_EXTRA_KM_PRICE;
}

/** Trouve le forfait correspondant : jour (lundi–jeudi vs vendredi–dimanche) + durée */
function findMatchingTier(
  vehicle: VehicleData,
  durationKey: DurationKey,
  isWeekendPricing: boolean
): { tier: PricingTier; label: string } | null {
  const pricing = vehicle.pricing;
  if (!pricing?.length) return null;

  const dayPattern = isWeekendPricing ? "vendredi au dimanche" : "lundi au jeudi";
  const durationPattern = durationKey; // "3 h", "6 h", etc.

  for (const p of pricing) {
    const d = p.duration.toLowerCase();
    if (d.includes(dayPattern) && d.includes(durationPattern)) {
      return { tier: p, label: p.duration };
    }
  }
  return null;
}

/** Calcule le prix en utilisant la grille officielle (date + durée) */
export function calculatePriceFromSite(
  vehicleSlug: string,
  durationKey: DurationKey,
  startDate: Date,
  requestedKmOrExtra: number,
  transportKm: number,
  isExtraKm = false
): (Omit<PriceBreakdown, "days" | "extraKm"> & { forfaitLabel: string; kmInclus: number; extraKm: number }) | null {
  const vehicle = getVehicleBySlug(vehicleSlug);
  if (!vehicle) return null;
  const isWeekendPricing = isWeekend(startDate);
  const matched = findMatchingTier(vehicle, durationKey, isWeekendPricing);
  if (!matched) return null;
  const { tier, label } = matched;
  const locationPrice = parsePriceValue(tier.price);
  const kmInclus = parseKmValue(tier.km);
  const extraKm = isExtraKm ? requestedKmOrExtra : Math.max(0, requestedKmOrExtra - kmInclus);
  const extraKmPricePerKm = getExtraKmPrice(vehicle);
  const extraKmPrice = Math.round(extraKm * extraKmPricePerKm);
  const transportPrice = transportKm * TRANSPORT_PRICE_PER_KM;
  const total = locationPrice + extraKmPrice + transportPrice;
  const days = durationKey === "24 h" ? 1 : durationKey === "48 h" ? 2 : durationKey === "72 h" ? 3 : 0.125;
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
  durationKey: DurationKey,
  startDate: Date,
  extraKm: number
): { locationPrice: number; extraKmPrice: number; caution: string; vehicleName: string; extraKmPricePerKm: number } | null {
  const result = calculatePriceFromSite(vehicleSlug, durationKey, startDate, 0, 0);
  if (!result) return null;
  const vehicle = getVehicleBySlug(vehicleSlug);
  const extraKmPricePerKm = vehicle ? getExtraKmPrice(vehicle) : DEFAULT_EXTRA_KM_PRICE;
  const extraKmPrice = Math.round(extraKm * extraKmPricePerKm);
  return {
    locationPrice: result.locationPrice,
    extraKmPrice,
    caution: result.caution,
    vehicleName: result.vehicleName,
    extraKmPricePerKm,
  };
}

export function calculateTransportPrice(km: number): number {
  return km * TRANSPORT_PRICE_PER_KM;
}

export function calculateTotalPrice(
  vehicleSlug: string,
  durationKey: DurationKey,
  startDate: Date,
  extraKm: number,
  transportKm: number
): PriceBreakdown | null {
  const result = calculatePriceFromSite(vehicleSlug, durationKey, startDate, extraKm, transportKm, true);
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
  durationKey?: DurationKey;
  startDate?: Date;
}

/** Extrait jours, km, transport, forfait, date du message (pour l'IA) */
export function parsePriceQuery(message: string): ParsedPriceQuery {
  const m = message.toLowerCase().trim();
  const result: ParsedPriceQuery = {};

  // Durée : 3h, 6h, 12h, 24h, 48h, 72h
  if (/\b3\s*h(?:eure)?s?\b|3h/.test(m)) result.durationKey = "3 h";
  else if (/\b6\s*h(?:eure)?s?\b|6h/.test(m)) result.durationKey = "6 h";
  else if (/\b12\s*h(?:eure)?s?\b|12h/.test(m)) result.durationKey = "12 h";
  else if (/\b24\s*h|24h|1\s*jour|journée|journee/.test(m)) result.durationKey = "24 h";
  else if (/\b48\s*h|48h|2\s*jours?/.test(m)) result.durationKey = "48 h";
  else if (/\b72\s*h|72h|3\s*jours?/.test(m)) result.durationKey = "72 h";

  // Date : lundi–jeudi vs vendredi–dimanche
  if (/lundi\s*(au|à|a)\s*jeudi|en\s*semaine| semaine\b/.test(m)) {
    // Prochain jour lundi–jeudi
    const d = new Date();
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() + 1); // lundi
    else if (day >= 5) d.setDate(d.getDate() + (8 - day)); // lundi suivant
    result.startDate = d;
  } else if (/vendredi\s*(au|à|a)\s*dimanche|week[- ]?end|weekend/.test(m)) {
    const d = new Date();
    const day = d.getDay();
    if (day < 5) d.setDate(d.getDate() + (5 - day)); // prochain vendredi
    result.startDate = d;
  } else {
    result.startDate = new Date();
  }

  // Jours (legacy pour mapping)
  const dayMatch =
    m.match(/(\d+)\s*j(?:our)?s?\b/i) ||
    m.match(/(\d+)\s*(?:jour|jours|day|days)\b/i) ||
    m.match(/(?:pour|pendant)\s+(\d+)\s*(?:j|jour|jours)?/i) ||
    m.match(/(\d+)\s*(?:j\b)/);
  if (dayMatch && !result.durationKey) {
    const n = parseInt(dayMatch[1], 10);
    if (n === 1) result.durationKey = "24 h";
    else if (n === 2) result.durationKey = "48 h";
    else if (n === 3) result.durationKey = "72 h";
  }

  const transportMatch =
    m.match(/(?:transport|livraison|liver?)\s*(?:de\s*)?(\d+)\s*km/i) ||
    m.match(/(\d+)\s*km\s*(?:de\s*)?(?:transport|livraison)/i) ||
    m.match(/(\d+)\s*km\s*(?:pour\s+)?(?:le\s+)?transport/i);
  if (transportMatch) result.transportKm = Math.max(0, parseInt(transportMatch[1], 10));

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
