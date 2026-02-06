import * as React from "react";
import { RangeSlider } from "./slider";
import { cn } from "@/lib/utils";

export interface FilterRangeSliderProps {
  /** Label au-dessus du slider (ex. "Prix journalier") */
  label: string;
  /** Valeur courante [min, max] */
  value: [number, number];
  /** Callback à chaque changement (mise à jour en direct) */
  onValueChange: (value: [number, number]) => void;
  /** Borne min du slider */
  min: number;
  /** Borne max du slider */
  max: number;
  /** Pas (step) */
  step?: number;
  /** Formater l’affichage des valeurs (ex. v => `${v} CHF`) */
  formatValue?: (v: number) => string;
  /** Texte d’aide sous le slider (optionnel) */
  hint?: string;
  className?: string;
}

/**
 * Slider de plage (min/max) réutilisable pour les filtres.
 * Glisser les poignées à la souris ou au doigt ; la valeur se met à jour en temps réel.
 */
const FilterRangeSlider = React.forwardRef<HTMLDivElement, FilterRangeSliderProps>(
  (
    {
      label,
      value,
      onValueChange,
      min,
      max,
      step = 1,
      formatValue = (v) => String(v),
      hint = "Glisser pour ajuster",
      className,
    },
    ref,
  ) => (
    <div ref={ref} className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatValue(value[0])} – {formatValue(value[1])}
        </span>
      </div>
      <RangeSlider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
      />
      {hint && (
        <p className="text-xs text-muted-foreground" aria-hidden>
          {hint}
        </p>
      )}
    </div>
  ),
);
FilterRangeSlider.displayName = "FilterRangeSlider";

export { FilterRangeSlider };
