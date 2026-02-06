import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  BarChart3,
  FileText,
  Calendar,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addReservation,
  getAllReservations,
  removeReservation,
  type VehicleReservation,
} from "@/data/vehicleReservations";
import { useReservations } from "@/contexts/ReservationContext";

// Données mock pour le tableau de bord admin
const MOCK_STATS = {
  totalClients: 42,
  totalProspects: 128,
  iaConversations: 356,
  iaClicksByRegion: [
    { region: "Valais", count: 145 },
    { region: "Vaud", count: 98 },
    { region: "Genève", count: 67 },
    { region: "Fribourg", count: 28 },
    { region: "Autres", count: 18 },
  ],
};

const MOCK_PROSPECTS = [
  { name: "Jean D.", email: "jean.d@email.ch", phone: "+41 79 111 22 33", source: "Rentabilité" },
  { name: "Marie L.", email: "marie.l@email.ch", phone: "+41 79 222 33 44", source: "Véhicules" },
  { name: "Pierre M.", email: "pierre.m@email.ch", phone: "+41 79 333 44 55", source: "Transport" },
];

const MOCK_CLIENTS = [
  { name: "Adem R.", email: "adem@email.ch", phone: "+41 79 444 55 66", lastRental: "Audi R8 V8" },
  { name: "Sophie B.", email: "sophie@email.ch", phone: "+41 79 555 66 77", lastRental: "McLaren 570S" },
];

const VEHICLE_OPTIONS = ["Audi R8 V8", "McLaren 570S"];

const Admin = () => {
  const { refresh } = useReservations();
  const [reservations, setReservations] = useState<VehicleReservation[]>(() => getAllReservations());
  const [newVehicle, setNewVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStart || !newEnd) return;
    addReservation({
      vehicleName: newVehicle,
      startDate: newStart,
      endDate: newEnd,
    });
    setReservations(getAllReservations());
    setNewStart("");
    setNewEnd("");
    refresh();
  };

  const handleRemove = (id: string) => {
    removeReservation(id);
    setReservations(getAllReservations());
    refresh();
  };

  return (
    <div className="pt-24 lg:pt-28 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au site
            </Link>
          </Button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl md:text-4xl font-bold mb-2"
        >
          Tableau de bord admin
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground mb-10"
        >
          Statistiques, agent IA, prospects et clients (données de démonstration).
        </motion.p>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{MOCK_STATS.totalClients}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-border bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prospects</CardTitle>
                <FileText className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{MOCK_STATS.totalProspects}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversations IA</CardTitle>
                <MessageCircle className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{MOCK_STATS.iaConversations}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Clics IA par région */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-10">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Clics / conversations IA par région
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {MOCK_STATS.iaClicksByRegion.map((r, i) => (
                  <li key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {r.region}
                    </span>
                    <span className="font-semibold">{r.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendrier — gestion des réservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-10"
        >
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Réservations véhicules (calendrier à mémoire)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Les dates ajoutées sont indisponibles sur tous les calendriers et pour l'IA.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddReservation} className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>Véhicule</Label>
                  <select
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {VEHICLE_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Du (YYYY-MM-DD)</Label>
                  <Input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    required
                    className="w-[160px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Au (YYYY-MM-DD)</Label>
                  <Input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    required
                    className="w-[160px]"
                  />
                </div>
                <Button type="submit">Ajouter</Button>
              </form>
              {reservations.length > 0 && (
                <ul className="space-y-2">
                  <Label>Réservations enregistrées</Label>
                  {reservations.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <span className="text-sm">
                        <strong>{r.vehicleName}</strong> — du {r.startDate} au {r.endDate}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(r.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prospects & Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle>Prospects (exemples)</CardTitle>
                <p className="text-sm text-muted-foreground">Mail, téléphone, source</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {MOCK_PROSPECTS.map((p, i) => (
                    <li key={i} className="rounded-lg border border-border p-3 space-y-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {p.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {p.phone}
                      </p>
                      <p className="text-xs text-primary">{p.source}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle>Clients (exemples)</CardTitle>
                <p className="text-sm text-muted-foreground">Mail, téléphone, dernière location</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {MOCK_CLIENTS.map((c, i) => (
                    <li key={i} className="rounded-lg border border-border p-3 space-y-1">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {c.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </p>
                      <p className="text-xs text-primary">Dernière location : {c.lastRental}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
