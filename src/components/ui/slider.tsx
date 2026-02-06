import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

/** Styles pour les poignées du RangeSlider : grandes, visibles, glissables (souris + tactile) */
const rangeThumbClassName = cn(
  "block h-7 w-7 shrink-0 rounded-full border-2 border-primary bg-background",
  "shadow-md hover:shadow-lg active:scale-95 transition-shadow transition-transform",
  "cursor-grab active:cursor-grabbing",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-50",
  "touch-none select-none",
);

interface RangeSliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "value" | "onValueChange" | "defaultValue"
  > {
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  defaultValue?: [number, number];
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, value, onValueChange, defaultValue, min = 0, max = 100, step, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation="horizontal"
    className={cn(
      "relative flex w-full touch-none select-none items-center py-4 overflow-visible",
      "min-h-[2.5rem]",
      className,
    )}
    value={value ? [value[0], value[1]] : undefined}
    defaultValue={defaultValue ? [defaultValue[0], defaultValue[1]] : undefined}
    onValueChange={(v) => onValueChange?.(v.length === 2 ? [v[0], v[1]] : [min, max])}
    min={min}
    max={max}
    step={step ?? 1}
    minStepsBetweenThumbs={1}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-3.5 w-full grow rounded-full bg-secondary",
        "cursor-pointer touch-none",
      )}
    >
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={rangeThumbClassName} aria-label="Valeur minimum" />
    <SliderPrimitive.Thumb className={rangeThumbClassName} aria-label="Valeur maximum" />
  </SliderPrimitive.Root>
));
RangeSlider.displayName = "RangeSlider";

export { Slider, RangeSlider };
