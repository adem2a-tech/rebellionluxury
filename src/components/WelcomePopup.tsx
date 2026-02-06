import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, X } from "lucide-react";

const POPUP_SEEN_KEY = "rebellion_popup_seen";
const TITLE_ID = "welcome-popup-title";

type WelcomePopupProps = {
  defaultOpen: boolean;
  onTryIA?: () => void;
};

export default function WelcomePopup({ defaultOpen, onTryIA }: WelcomePopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!defaultOpen) return;
    const t = setTimeout(() => setOpen(true), 100);
    return () => clearTimeout(t);
  }, [defaultOpen]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      try {
        localStorage.setItem(POPUP_SEEN_KEY, "true");
      } catch {
        // ignore
      }
    }
    setOpen(next);
  };

  const handleTryIA = () => {
    onTryIA?.();
    handleOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClick={() => handleOpenChange(false)}
    >
      <div
        className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="welcome-popup-led rounded-xl p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h2
                id={TITLE_ID}
                className="welcome-popup-title-led flex items-center gap-2 text-xl font-semibold"
              >
                <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
                Venez tester notre IA
              </h2>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-left text-sm text-muted-foreground">
              Rebellion IA vous répond sur les véhicules, tarifs et réservations.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="sm:order-first"
                onClick={() => handleOpenChange(false)}
              >
                Fermer
              </Button>
              <Button
                type="button"
                variant="hero"
                size="lg"
                className="w-full sm:w-auto animate-glow-pulse"
                onClick={handleTryIA}
              >
                <MessageCircle className="h-5 w-5" />
                Tester l&apos;IA maintenant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
