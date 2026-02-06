import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { getAllVisitors } from "@/data/visitors";
import { getAllRequests, updateRequestStatus, acceptRequestWithPricing } from "@/data/vehicleRequests";
import { getAllLeads } from "@/data/leads";
import { getDailyVisits, getTopPages } from "@/data/adminAnalytics";
import type { PricingTier } from "@/data/vehicles";

const DEFAULT_PRICING: PricingTier[] = [
  { duration: "24h", km: "200 km", price: "" },
  { duration: "48h", km: "400 km", price: "" },
  { duration: "7 jours", km: "700 km", price: "" },
];

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login(email, password)) setError("Email ou mot de passe incorrect.");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-amber-500/30 rounded-xl p-6 bg-zinc-900/80">
        <h1 className="text-xl font-bold text-amber-400 mb-4">Admin Rebellion</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-600 text-white placeholder:text-zinc-500 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-600 text-white placeholder:text-zinc-500 text-sm"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black">
            Connexion
          </Button>
        </form>
        <Button variant="ghost" size="sm" asChild className="w-full mt-3 text-zinc-400">
          <Link to="/">Retour au site</Link>
        </Button>
      </div>
    </div>
  );
}

function SimpleBarChart({ data, max }: { data: { label: string; value: number }[]; max?: number }) {
  const m = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-amber-500/80 rounded-t min-h-[2px] transition-all"
            style={{ height: `${(d.value / m) * 100}%` }}
          />
          <span className="text-[10px] text-zinc-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardTab() {
  const visitors = getAllVisitors();
  const requests = getAllRequests();
  const leads = getAllLeads();
  const daily = getDailyVisits(7);
  const topPages = getTopPages(5);
  const conversion = visitors.length > 0 ? ((requests.length + leads.length) / visitors.length * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-amber-500/20">
          <CardHeader className="py-3"><CardTitle className="text-sm text-zinc-400">Visiteurs</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-400">{visitors.length}</p></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-amber-500/20">
          <CardHeader className="py-3"><CardTitle className="text-sm text-zinc-400">Demandes location</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-400">{requests.length}</p></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-amber-500/20">
          <CardHeader className="py-3"><CardTitle className="text-sm text-zinc-400">Leads</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-400">{leads.length}</p></CardContent>
        </Card>
        <Card className="bg-zinc-900 border-amber-500/20">
          <CardHeader className="py-3"><CardTitle className="text-sm text-zinc-400">Conversion</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-400">{conversion}%</p></CardContent>
        </Card>
      </div>
      <Card className="bg-zinc-900 border-amber-500/20">
        <CardHeader><CardTitle className="text-amber-400">Visites (7 jours)</CardTitle></CardHeader>
        <CardContent>
          <SimpleBarChart data={daily.map((d) => ({ label: d.date, value: d.count }))} />
        </CardContent>
      </Card>
      <Card className="bg-zinc-900 border-amber-500/20">
        <CardHeader><CardTitle className="text-amber-400">Pages populaires</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topPages.map((p, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-zinc-300">{p.path || "/"}</span>
                <span className="text-amber-400">{p.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function DemandesTab() {
  const [requests, setRequests] = useState(() => getAllRequests());
  const [pricing, setPricing] = useState<Record<string, string[]>>({});

  const refresh = () => setRequests(getAllRequests());

  const handleAccept = (id: string) => {
    const p = pricing[id] ?? DEFAULT_PRICING.map((d) => d.price || "0");
    const formatted: PricingTier[] = DEFAULT_PRICING.map((d, i) => ({
      ...d,
      price: `${p[i] || "0"} CHF`,
    }));
    acceptRequestWithPricing(id, formatted);
    refresh();
  };

  const handleReject = (id: string) => {
    updateRequestStatus(id, "rejected");
    refresh();
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-amber-400">Demandes en attente ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="text-zinc-500 text-sm">Aucune demande en attente.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((r) => (
            <Card key={r.id} className="bg-zinc-900 border-amber-500/20">
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4">
                  {r.images.slice(0, 2).map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
                <p className="mt-2 font-medium text-white">{r.vehicle.brand} {r.vehicle.model} ({r.vehicle.year})</p>
                <p className="text-sm text-zinc-400">{r.depositor.email} · {r.depositor.phone}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleAccept(r.id)} className="bg-green-600 hover:bg-green-700">
                    Accepter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(r.id)} className="border-red-500/50 text-red-400">
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminLayout() {
  const { logout } = useAdminAuth();
  const [tab, setTab] = useState<"dashboard" | "demandes" | "analytics" | "settings">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "demandes" as const, label: "Demandes Espace Pro", icon: FileText },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "settings" as const, label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-56 bg-zinc-900 border-r border-amber-500/20 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
        <div className="p-4 flex items-center justify-between lg:justify-center">
          <span className="font-bold text-amber-400">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => { setTab(n.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm ${tab === n.id ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:bg-zinc-800"}`}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" size="sm" onClick={logout} className="w-full text-zinc-400">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-4 mb-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "demandes" && <DemandesTab />}
        {tab === "analytics" && <DashboardTab />}
        {tab === "settings" && (
          <Card className="bg-zinc-900 border-amber-500/20 max-w-md">
            <CardHeader><CardTitle className="text-amber-400">Paramètres</CardTitle></CardHeader>
            <CardContent>
              <p className="text-zinc-400 text-sm">Aucun paramètre pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) return <AdminLogin />;
  return <AdminLayout />;
}
