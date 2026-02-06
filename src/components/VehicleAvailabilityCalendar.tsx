import { useMemo, useDeferredValue, memo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useReservations } from "@/contexts/ReservationContext";
import { getUnavailableDates } from "@/data/vehicleReservations";

interface VehicleAvailabilityCalendarProps {
  vehicleName?: string | null;
  className?: string;
  /** Incrémenter pour forcer un recalcul sans remonter le composant (évite le freeze) */
  refreshTrigger?: number;
}

/** Calendrier avec dates indisponibles — refreshTrigger évite remontage / freeze */
function VehicleAvailabilityCalendarInner({
  vehicleName = null,
  className,
  refreshTrigger = 0,
}: VehicleAvailabilityCalendarProps) {
  const { version } = useReservations();
  const deferredVersion = useDeferredValue(version);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const disabledDates = useMemo(() => getUnavailableDates(vehicleName), [vehicleName, deferredVersion, refreshTrigger]);
  const disabled = useMemo(
    () => [{ before: today }, ...disabledDates],
    [today, disabledDates]
  );

  return (
    <Calendar
      mode="single"
      className={className}
      disabled={disabled}
    />
  );
}

export const VehicleAvailabilityCalendar = memo(VehicleAvailabilityCalendarInner);
