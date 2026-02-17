import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Car, MapPin } from "lucide-react";
import { Button } from "./ui/button";
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
import { calculateTotalPrice } from "@/utils/priceCalculation";

export default function PriceCalculator() {
  const [vehicleSlug, setVehicleSlug] = useState<string>("");
  const [days, setDays] = useState<string>("1");
  const [extraKm, setExtraKm] = useState<string>("");
  const [transportKm, setTransportKm] = useState<string>("");

  const daysNum = Math.max(1, parseInt(days, 10) || 1);
  const extraKmNum = Math.max(0, parseInt(extraKm, 10) || 0);
  const transportKmNum = Math.max(0, parseInt(transportKm, 10) || 0);

  const vehicle = vehicleSlug ? getAllVehicles().find((v) => v.slug === vehicleSlug) : null;
  const breakdown = vehicleSlug
    ? calculateTotalPrice(vehicleSlug, daysNum, extraKmNum, transportKmNum)
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
        Estimation selon le véhicule, la durée, les km supplémentaires et le transport (A Evionnaz → B client → C Evionnaz à 2 CHF/km).
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
          <Label>Nombre de jours</Label>
          <Input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            onBlur={() => {
              const v = parseInt(days, 10);
              if (Number.isNaN(v) || v < 1) setDays("1");
            }}
            className="bg-background"
          />
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
            {vehicle?.specs?.extraKmPriceChf ? `${vehicle.specs.extraKmPriceChf} CHF/km` : "Tarif selon véhicule"} au-delà des km inclus.
          </p>
        </div>
        <div className="space-y-2">
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
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Car className="w-4 h-4 text-primary" />
              Location ({breakdown.days} j)
            </span>
            <span className="font-semibold">{breakdown.locationPrice} CHF</span>
          </div>
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
          <div className="flex justify-between pt-2 border-t border-border font-bold text-primary">
            <span>Total estimé</span>
            <span>{breakdown.total} CHF</span>
          </div>
        </div>
      )}
    </motion.section>
  );
}
