/**
 * Leads — demandes de contact pour rentabiliser un véhicule (formulaire Rentabilité).
 * Personnes qui veulent un appel pour louer leur véhicule.
 * Stocké en localStorage pour l'Espace pro.
 */

const STORAGE_KEY = "rebellion_leads";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  message: string;
  createdAt: string; // ISO
  status: "pending" | "contacted";
}

function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLeads(leads: Lead[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function addLead(data: Omit<Lead, "id" | "createdAt" | "status">): Lead {
  const list = loadLeads();
  const entry: Lead = {
    ...data,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  list.push(entry);
  saveLeads(list);
  return entry;
}

export function getAllLeads(): Lead[] {
  return loadLeads();
}

export function getPendingLeads(): Lead[] {
  return loadLeads().filter((l) => l.status === "pending");
}

export function markLeadContacted(id: string): void {
  const list = loadLeads().map((l) => (l.id === id ? { ...l, status: "contacted" as const } : l));
  saveLeads(list);
}
