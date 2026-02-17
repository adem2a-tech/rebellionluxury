import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Car, MapPin } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getAllVehicles } from "@/data/vehicles";
import { calculateTotalPrice, DURATION_OPTIONS, type DurationKey } from "@/utils/priceCalculation";

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Retourne une date lundi (semaine) ou vendredi (week-end) pour le calcul */
function getDateForPeriod(period: "weekday" | "weekend"): Date {
  const d = new Date();
  const day = d.getDay();
  if (period === "weekend") {
    if (day < 5) d.setDate(d.getDate() + (5 - day));
    return d;
  }
  if (day === 0) d.setDate(d.getDate() + 1);
  else if (day >= 5) d.setDate(d.getDate() + (8 - day));
  return d;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  if (isToday) return `aujourd'hui (${day} ${month})`;
  const dayName = DAY_NAMES[date.getDay()];
  return `le ${dayName} ${day} ${month}`;
}

/** Calcule la date de restitution à partir de la date de début + durée */
function getReturnDate(startDate: Date, durationKey: DurationKey): Date {
  const d = new Date(startDate);
  if (durationKey === "24 h") d.setDate(d.getDate() + 1);
  else if (durationKey === "48 h") d.setDate(d.getDate() + 2);
  else if (durationKey === "72 h") d.setDate(d.getDate() + 3);
  return d;
}

function formatReturnDate(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const dayName = DAY_NAMES[date.getDay()];
  return `${dayName} ${day} ${month}`;
}

export default function PriceCalculator() {
  const [vehicleSlug, setVehicleSlug] = useState<string>("");
  const [period, setPeriod] = useState<"weekday" | "weekend">("weekday");
  const [durationKey, setDurationKey] = useState<DurationKey>("24 h");
  const [extraKm, setExtraKm] = useState<string>("");
  const [transportKm, setTransportKm] = useState<string>("");

  const extraKmNum = Math.max(0, parseInt(extraKm, 10) || 0);
  const transportKmNum = Math.max(0, parseInt(transportKm, 10) || 0);
  const startDateObj = getDateForPeriod(period);

  const vehicle = vehicleSlug ? getAllVehicles().find((v) => v.slug === vehicleSlug) : null;
  const breakdown = vehicleSlug
    ? calculateTotalPrice(vehicleSlug, durationKey, startDateObj, extraKmNum, transportKmNum)
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border bg-card/50 p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-primary" />
        <h2 className="font-display text-xl md:text-2xl font-bold">
          Calculez le prix
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Estimation selon le véhicule, la date de début (Lundi–Jeudi moins cher que Vendredi–Dimanche), la durée, les km supplémentaires et le transport (Evionnaz → client → Evionnaz à 2 CHF/km).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label>Véhicule</Label>
          <Select value={vehicleSlug} onValueChange={setVehicleSlug}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choisir un véhicule" />
            </SelectTrigger>
            <SelectContent>
              {getAllVehicles().map((v) => (
                <SelectItem key={v.slug} value={v.slug}>
                  {v.name} — dès {v.pricePerDay} CHF/j
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Période</Label>
          <Select value={period} onValueChange={(v) => setPeriod(v as "weekday" | "weekend")}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekday">Lundi–Jeudi (moins cher)</SelectItem>
              <SelectItem value="weekend">Vendredi–Dimanche</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Durée</Label>
          <Select value={durationKey} onValueChange={(v) => setDurationKey(v as DurationKey)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Km supplémentaires (optionnel)</Label>
          <Input
            type="number"
            min={0}
            value={extraKm}
            onChange={(e) => setExtraKm(e.target.value)}
            placeholder="0"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            {vehicle?.extraKmPriceChf ? `${vehicle.extraKmPriceChf} CHF/km au-delà du forfait` : "Tarif selon véhicule"}
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Km transport (A→B→C)</Label>
          <Input
            type="number"
            min={0}
            value={transportKm}
            onChange={(e) => setTransportKm(e.target.value)}
            placeholder="0"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">2 CHF/km — Evionnaz → client → Evionnaz.</p>
        </div>
      </div>

      {breakdown && (
        <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2">
          <div className="space-y-1 pb-2 border-b border-border">
            <p className="text-sm text-foreground font-medium">
              Si vous louez {formatDateLabel(startDateObj)} pour {DURATION_OPTIONS.find((o) => o.value === durationKey)?.label ?? durationKey} → {breakdown.locationPrice} CHF
            </p>
            <p className="text-sm text-muted-foreground">
              À rendre le {formatReturnDate(getReturnDate(startDateObj, durationKey))}
            </p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Car className="w-4 h-4 text-primary" />
              Location ({breakdown.forfaitLabel || `${breakdown.days} j`})
            </span>
            <span className="font-semibold">{breakdown.locationPrice} CHF</span>
          </div>
          {breakdown.kmInclus !== undefined && breakdown.kmInclus > 0 && (
            <p className="text-xs text-muted-foreground">— {breakdown.kmInclus} km inclus</p>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Caution (à bloquer)</span>
            <span className="font-semibold">{breakdown.caution}</span>
          </div>
          {breakdown.extraKmPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Km supplémentaires ({breakdown.extraKm} km)</span>
              <span className="font-semibold">{breakdown.extraKmPrice} CHF</span>
            </div>
          )}
          {breakdown.transportPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                Transport ({breakdown.transportKm} km)
              </span>
              <span className="font-semibold">{breakdown.transportPrice} CHF</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border font-bold text-primary text-base">
            <span>En gros</span>
            <span>{breakdown.total} CHF</span>
          </div>
        </div>
      )}
    </motion.section>
  );
}
