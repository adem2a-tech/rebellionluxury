import { useState, useEffect } from "react";
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
import { calculateTotalPrice, getDurationOptionsForVehicle, type DurationKey } from "@/utils/priceCalculation";

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const DURATION_DAYS: Record<DurationKey, number> = {
  "24h": 1,
  "we_court": 3,
  "we_long": 4,
  "semaine_courte": 5,
  "semaine_complete": 7,
  "mois": 30,
};

/** Formate un montant en CHF (ex. 1350 → "1'350 CHF") */
function formatChf(value: number): string {
  const s = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${s} CHF`;
}

/** Calcule la date de restitution à partir de la date de début + forfait */
function getReturnDate(startDate: Date, durationKey: DurationKey): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + DURATION_DAYS[durationKey]);
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
  const [durationKey, setDurationKey] = useState<DurationKey>("24h");
  const [extraKm, setExtraKm] = useState<string>("");
  const [transportKm, setTransportKm] = useState<string>("");

  const extraKmNum = Math.max(0, parseInt(extraKm, 10) || 0);
  const transportKmNum = Math.max(0, parseInt(transportKm, 10) || 0);
  const startDateObj = new Date();

  const vehicle = vehicleSlug ? getAllVehicles().find((v) => v.slug === vehicleSlug) : null;
  const durationOptions = getDurationOptionsForVehicle(vehicle);

  // Valeur affichée dans le Select : toujours une option valide (évite dropdown vide / Radix bug)
  const effectiveDurationKey = durationOptions.some((o) => o.value === durationKey)
    ? durationKey
    : (durationOptions[0]?.value ?? "24h");

  // Garder durationKey synchrone avec les options du véhicule (ex. Maserati sans "Mois")
  useEffect(() => {
    if (effectiveDurationKey !== durationKey) setDurationKey(effectiveDurationKey);
  }, [effectiveDurationKey, durationKey]);

  const breakdown = vehicleSlug
    ? calculateTotalPrice(vehicleSlug, durationKey, startDateObj, extraKmNum, transportKmNum)
    : null;

  const extraKmPricePerKm = vehicle?.extraKmPriceChf ?? 5;

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
        Estimation selon le véhicule, le forfait choisi, les km supplémentaires et le transport (Evionnaz → client → Evionnaz à 2 CHF/km).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label>Véhicule</Label>
          <Select value={vehicleSlug} onValueChange={(v) => { setVehicleSlug(v); setDurationKey("24h"); }}>
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
          <Label>Forfait</Label>
          <Select
            value={effectiveDurationKey}
            onValueChange={(v) => setDurationKey(v as DurationKey)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choisir un forfait" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((opt) => (
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

      {vehicleSlug && !breakdown && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-200/90">
          Impossible d&apos;afficher le détail pour ce véhicule. Consultez la fiche du véhicule pour les tarifs.
        </div>
      )}

      {breakdown && (
        <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
          <div className="pb-3 border-b border-border space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {breakdown.vehicleName}
            </p>
            <p className="text-sm text-foreground">
              Forfait {durationOptions.find((o) => o.value === durationKey)?.label ?? durationKey} — {formatChf(breakdown.locationPrice)}
            </p>
            <p className="text-xs text-muted-foreground">
              {breakdown.kmInclus != null && breakdown.kmInclus > 0
                ? `${breakdown.kmInclus.toLocaleString("de-CH")} km inclus dans le forfait. Au-delà : ${extraKmPricePerKm} CHF/km`
                : "Km selon forfait"}
            </p>
            <p className="text-xs text-muted-foreground">
              À rendre le {formatReturnDate(getReturnDate(startDateObj, durationKey))}
            </p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Car className="w-4 h-4 text-primary" />
              Location
            </span>
            <span className="font-semibold">{formatChf(breakdown.locationPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Caution (à bloquer)</span>
            <span className="font-semibold">{breakdown.caution}</span>
          </div>
          {breakdown.extraKm > 0 && breakdown.extraKmPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Km supplémentaires ({breakdown.extraKm} km × {extraKmPricePerKm} CHF/km)
              </span>
              <span className="font-semibold">{formatChf(breakdown.extraKmPrice)}</span>
            </div>
          )}
          {breakdown.transportKm > 0 && breakdown.transportPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                Transport ({breakdown.transportKm} km × 2 CHF/km)
              </span>
              <span className="font-semibold">{formatChf(breakdown.transportPrice)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-border font-bold text-primary text-base">
            <span>Total à payer</span>
            <span>{formatChf(breakdown.total)}</span>
          </div>
        </div>
      )}
    </motion.section>
  );
}
