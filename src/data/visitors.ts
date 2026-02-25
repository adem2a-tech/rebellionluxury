/**
 * Historique des visiteurs identifiés sur le site.
 * Stocké en localStorage pour l'Espace pro.
 */

const STORAGE_KEY = "rebellion_visitors";

export interface VisitorEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string; // ISO
}

function loadVisitors(): VisitorEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveVisitors(visitors: VisitorEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
}

export function addVisitor(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}): VisitorEntry {
  const list = loadVisitors();
  const entry: VisitorEntry = {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  saveVisitors(list);
  return entry;
}

export function getAllVisitors(): VisitorEntry[] {
  return loadVisitors();
}

/** Réinitialise la liste des visiteurs (remet à 0). */
export function clearVisitors(): void {
  saveVisitors([]);
}
