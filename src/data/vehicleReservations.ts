/**
 * Calendrier à mémoire — réservations véhicules (localStorage).
 * Si la R8 part le 22 janvier, elle est indisponible ce jour-là et les suivants selon la durée.
 */

const STORAGE_KEY = "rebellion_vehicle_reservations";

export interface VehicleReservation {
  id: string;
  vehicleName: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  customerName?: string;
  customerPhone?: string;
  note?: string;
}

function loadReservations(): VehicleReservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReservations(reservations: VehicleReservation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

/** Dates ISO en YYYY-MM-DD pour comparaison */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Vérifie si une date est dans l'intervalle [start, end] (inclus) */
function isDateInRange(dateKey: string, start: string, end: string): boolean {
  return dateKey >= start && dateKey <= end;
}

/** Liste des dates indisponibles pour un véhicule (ou tous si vehicleName null) */
export function getUnavailableDates(vehicleName?: string | null): Date[] {
  const reservations = loadReservations();
  const now = new Date();
  const todayKey = toDateKey(now);
  const dates = new Set<string>();

  for (const r of reservations) {
    if (vehicleName && r.vehicleName !== vehicleName) continue;
    // Ignorer les réservations passées
    if (r.endDate < todayKey) continue;

    let current = r.startDate;
    while (current <= r.endDate) {
      if (current >= todayKey) dates.add(current);
      const d = parseDateKey(current);
      d.setDate(d.getDate() + 1);
      current = toDateKey(d);
    }
  }

  return Array.from(dates).map((k) => parseDateKey(k));
}

/** Vérifie si une date est indisponible */
export function isDateUnavailable(date: Date, vehicleName?: string | null): boolean {
  const key = toDateKey(date);
  const reservations = loadReservations();

  for (const r of reservations) {
    if (vehicleName && r.vehicleName !== vehicleName) continue;
    if (isDateInRange(key, r.startDate, r.endDate)) return true;
  }
  return false;
}

/** Vérifie si un véhicule est dispo à une date donnée (pour l'IA) */
export function checkVehicleAvailableOnDate(vehicleName: string, date: Date): boolean {
  return !isDateUnavailable(date, vehicleName);
}

/** Retourne la date de fin (YYYY-MM-DD) si le véhicule est indisponible aujourd'hui, null sinon */
export function getUnavailableUntil(vehicleName: string): string | null {
  const today = toDateKey(new Date());
  const reservations = loadReservations().filter(
    (r) => r.vehicleName === vehicleName && isDateInRange(today, r.startDate, r.endDate)
  );
  if (reservations.length === 0) return null;
  return reservations.reduce((max, r) => (r.endDate > max ? r.endDate : max), reservations[0].endDate);
}

/** Résumé texte des indisponibilités pour l'IA */
export function getAvailabilitySummary(vehicleName?: string | null): string {
  const reservations = loadReservations();
  const now = new Date();
  const todayKey = toDateKey(now);

  const relevant = reservations.filter((r) => {
    if (vehicleName && r.vehicleName !== vehicleName) return false;
    return r.endDate >= todayKey;
  });

  if (relevant.length === 0) {
    return vehicleName
      ? `${vehicleName} : disponible selon le calendrier. Aucune réservation enregistrée.`
      : "Tous les véhicules : disponibles selon le calendrier. Aucune réservation enregistrée.";
  }

  const lines = relevant.map((r) => {
    const start = r.startDate.split("-").reverse().join("/");
    const end = r.endDate.split("-").reverse().join("/");
    return `• **${r.vehicleName}** : indisponible du ${start} au ${end}`;
  });
  return lines.join("\n");
}

/** Ajouter une réservation */
export function addReservation(res: Omit<VehicleReservation, "id">): VehicleReservation {
  const list = loadReservations();
  const newOne: VehicleReservation = {
    ...res,
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  list.push(newOne);
  saveReservations(list);
  return newOne;
}

/** Supprimer une réservation */
export function removeReservation(id: string): void {
  const list = loadReservations().filter((r) => r.id !== id);
  saveReservations(list);
}

/** Toutes les réservations (pour admin) */
export function getAllReservations(): VehicleReservation[] {
  return loadReservations();
}
