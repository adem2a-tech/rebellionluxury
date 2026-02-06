/**
 * Analytics — suivi des visites pour le dashboard admin.
 * Léger, localStorage uniquement.
 */

const STORAGE_KEY = "rebellion_admin_visits";

export interface VisitEntry {
  path: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

function loadVisits(): VisitEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveVisits(visits: VisitEntry[]) {
  const trimmed = visits.slice(-5000); // garder les 5000 derniers
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function recordVisit(path: string) {
  const d = new Date();
  const date = d.toISOString().slice(0, 10);
  const list = loadVisits();
  list.push({ path, date, timestamp: d.getTime() });
  saveVisits(list);
}

export function getDailyVisits(days = 14): { date: string; count: number }[] {
  const visits = loadVisits();
  const result: { date: string; count: number }[] = [];
  const today = new Date().toISOString().slice(0, 10);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const count = visits.filter((v) => v.date === date).length;
    result.push({ date: date.slice(5), count });
  }
  return result;
}

export function getTopPages(limit = 5): { path: string; count: number }[] {
  const visits = loadVisits();
  const map = new Map<string, number>();
  for (const v of visits) {
    const p = v.path || "/";
    map.set(p, (map.get(p) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, count]) => ({ path, count }));
}
