/**
 * Calcul des prix : location (véhicule + km) et transport.
 * Utilisé par la page CalculerPrix et l'IA.
 */

import { getAllVehicles, getVehicleBySlug } from "@/data/vehicles";

export const TRANSPORT_PRICE_PER_KM = 2; // CHF
export const EXTRA_KM_PRICE = 0.5; // CHF/km au-delà du forfait inclus

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
}

export function calculateRentalPrice(
  vehicleSlug: string,
  days: number,
  extraKm: number
): { locationPrice: number; extraKmPrice: number; caution: string; vehicleName: string } | null {
  const vehicle = getVehicleBySlug(vehicleSlug);
  if (!vehicle) return null;
  const locationPrice = vehicle.pricePerDay * days;
  const extraKmPrice = extraKm > 0 ? Math.round(extraKm * EXTRA_KM_PRICE) : 0;
  return {
    locationPrice,
    extraKmPrice,
    caution: vehicle.specs.caution,
    vehicleName: vehicle.name,
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
  const rental = calculateRentalPrice(vehicleSlug, days, extraKm);
  if (!rental) return null;
  const transportPrice = calculateTransportPrice(transportKm);
  const total = rental.locationPrice + rental.extraKmPrice + transportPrice;
  return {
    vehicleName: rental.vehicleName,
    locationPrice: rental.locationPrice,
    extraKmPrice: rental.extraKmPrice,
    transportPrice,
    total,
    caution: rental.caution,
    days,
    extraKm,
    transportKm,
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
  }
  return null;
}

/** Extrait jours, km, transport km d'un message (pour l'IA) */
export function parsePriceQuery(message: string): {
  days?: number;
  extraKm?: number;
  transportKm?: number;
  vehicleQuery?: string;
} {
  const m = message.toLowerCase();
  const result: { days?: number; extraKm?: number; transportKm?: number; vehicleQuery?: string } = {};
  const dayMatch = m.match(/(\d+)\s*(?:jour|j(?:our)?s?|day)/i);
  if (dayMatch) result.days = Math.max(1, parseInt(dayMatch[1], 10));
  const transportMatch = m.match(/(?:transport|livraison|liver?)\s*(?:de\s*)?(\d+)\s*km/i) ||
    m.match(/(\d+)\s*km\s*(?:de\s*)?(?:transport|livraison)/i) ||
    m.match(/(\d+)\s*km\s*(?:pour\s+)?(?:le\s+)?transport/i);
  if (transportMatch) result.transportKm = Math.max(0, parseInt(transportMatch[1], 10));
  const extraKmMatch = m.match(/(\d+)\s*km\s*(?:en\s+plus|suppl|sup\.|supplémentaire)/i) ||
    m.match(/(?:plus\s+)?(\d+)\s*km/i);
  if (extraKmMatch && !result.transportKm) result.extraKm = Math.max(0, parseInt(extraKmMatch[1], 10));
  else if (m.includes("km") && !result.transportKm) {
    const anyKm = m.match(/(\d+)\s*km/i);
    if (anyKm) result.extraKm = Math.max(0, parseInt(anyKm[1], 10));
  }
  if (m.includes("audi") || m.includes("r8")) result.vehicleQuery = "audi r8";
  if (m.includes("mclaren") || m.includes("570")) result.vehicleQuery = "mclaren 570";
  return result;
}
