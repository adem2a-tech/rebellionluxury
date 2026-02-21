/**
 * Calcul des prix : location (véhicule + km) et transport.
 * Grille tarifaire officielle : Lundi–Jeudi (moins cher) vs Vendredi–Dimanche.
 * Durées : 3h, 6h, 12h, 24h, 48h, 72h.
 */

import { getAllVehicles, getVehicleBySlug, VEHICLES_DATA, type VehicleData, type PricingTier } from "@/data/vehicles";

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

export type DurationKey = "24h" | "we_court" | "we_long" | "semaine_courte" | "semaine_complete" | "mois";

/** Préfixes des duration dans pricing (pour matcher le forfait) */
const FORFAIT_PREFIX: Record<DurationKey, string> = {
  "24h": "24 heures",
  "we_court": "Week-end court",
  "we_long": "Week-end long",
  "semaine_courte": "Semaine courte",
  "semaine_complete": "Semaine complète",
  "mois": "Mois",
};

/** Durées disponibles (ordre pour le sélecteur) */
export const DURATION_OPTIONS: { value: DurationKey; label: string }[] = [
  { value: "24h", label: "24 h (1 jour)" },
  { value: "we_court", label: "Week-end court (Ven–Dim)" },
  { value: "we_long", label: "Week-end long (Ven–Lun)" },
  { value: "semaine_courte", label: "Semaine courte (5 jours)" },
  { value: "semaine_complete", label: "Semaine complète (7 jours)" },
  { value: "mois", label: "Mois (30 jours)" },
];

/** Retourne les forfaits disponibles pour un véhicule (ex. Maserati sans "Mois"). Jamais vide. */
export function getDurationOptionsForVehicle(vehicle: { pricing: PricingTier[] } | null) {
  if (!vehicle?.pricing?.length) return DURATION_OPTIONS;
  const filtered = DURATION_OPTIONS.filter((opt) =>
    vehicle.pricing.some((t) => t.duration.startsWith(FORFAIT_PREFIX[opt.value]))
  );
  return filtered.length > 0 ? filtered : DURATION_OPTIONS;
}

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

/** Trouve le forfait correspondant au forfait sélectionné (24h, week-end, semaine, mois) */
function findMatchingTier(
  vehicle: VehicleData,
  durationKey: DurationKey
): { tier: PricingTier; label: string } | null {
  const pricing = vehicle.pricing;
  if (!pricing?.length) return null;
  const prefix = FORFAIT_PREFIX[durationKey];
  const tier = pricing.find((p) => p.duration.startsWith(prefix));
  return tier ? { tier, label: tier.duration } : null;
}

const FORFAIT_DAYS: Record<DurationKey, number> = {
  "24h": 1,
  "we_court": 3,
  "we_long": 4,
  "semaine_courte": 5,
  "semaine_complete": 7,
  "mois": 30,
};

/** Détecte si la grille est au format forfaits (24h, week-end, etc.) */
function hasNewFormatPricing(pricing: PricingTier[] | undefined): boolean {
  return !!pricing?.some((t) => t.duration.startsWith("24 heures"));
}

/** Calcule le prix en utilisant la grille officielle (forfaits) */
export function calculatePriceFromSite(
  vehicleSlug: string,
  durationKey: DurationKey,
  _startDate: Date,
  requestedKmOrExtra: number,
  transportKm: number,
  isExtraKm = false
): (Omit<PriceBreakdown, "days" | "extraKm"> & { forfaitLabel: string; kmInclus: number; extraKm: number }) | null {
  const vehicle = getVehicleBySlug(vehicleSlug);
  if (!vehicle) return null;
  // Utiliser les tarifs canoniques si la flotte (ex. localStorage) a encore l'ancien format
  const canonical = VEHICLES_DATA.find((v) => v.slug === vehicleSlug);
  const pricing =
    canonical && !hasNewFormatPricing(vehicle.pricing)
      ? canonical.pricing
      : vehicle.pricing;
  const vehicleForCalc: VehicleData = { ...vehicle, pricing };
  const matched = findMatchingTier(vehicleForCalc, durationKey);
  if (!matched) return null;
  const { tier, label } = matched;
  const locationPrice = parsePriceValue(tier.price);
  const kmInclus = parseKmValue(tier.km);
  const extraKm = isExtraKm ? requestedKmOrExtra : Math.max(0, requestedKmOrExtra - kmInclus);
  const extraKmPricePerKm = getExtraKmPrice(vehicle);
  const extraKmPrice = Math.round(extraKm * extraKmPricePerKm);
  const transportPrice = transportKm * TRANSPORT_PRICE_PER_KM;
  const total = locationPrice + extraKmPrice + transportPrice;
  const days = FORFAIT_DAYS[durationKey];
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

  // Durée : forfaits 24h, week-end, semaine, mois
  if (/\b24\s*h|24h|1\s*jour|journée|journee/.test(m)) result.durationKey = "24h";
  else if (/week[- ]?end\s*court|we\s*court|vendredi\s*dimanche/.test(m)) result.durationKey = "we_court";
  else if (/week[- ]?end\s*long|we\s*long|vendredi\s*lundi/.test(m)) result.durationKey = "we_long";
  else if (/semaine\s*courte|5\s*jours?/.test(m)) result.durationKey = "semaine_courte";
  else if (/semaine\s*complète|semaine\s*complete|7\s*jours?/.test(m)) result.durationKey = "semaine_complete";
  else if (/\bmois\b|30\s*jours?/.test(m)) result.durationKey = "mois";

  result.startDate = new Date();

  // Jours (mapping vers forfait)
  const dayMatch =
    m.match(/(\d+)\s*j(?:our)?s?\b/i) ||
    m.match(/(\d+)\s*(?:jour|jours|day|days)\b/i) ||
    m.match(/(?:pour|pendant)\s+(\d+)\s*(?:j|jour|jours)?/i) ||
    m.match(/(\d+)\s*(?:j\b)/);
  if (dayMatch && !result.durationKey) {
    const n = parseInt(dayMatch[1], 10);
    if (n <= 1) result.durationKey = "24h";
    else if (n <= 3) result.durationKey = "we_court";
    else if (n <= 4) result.durationKey = "we_long";
    else if (n <= 5) result.durationKey = "semaine_courte";
    else if (n <= 7) result.durationKey = "semaine_complete";
    else if (n >= 30) result.durationKey = "mois";
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
