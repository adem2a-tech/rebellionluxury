import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/glowing-shadow.css";

interface GlowingShadowProps {
  children?: ReactNode;
  className?: string;
  /** "white" = bordures blanches LED ; "default" = dégradé teinte animée */
  color?: "white" | "default";
  /** Remplir le conteneur (grille cartes) au lieu de taille fixe */
  fill?: boolean;
}

export function GlowingShadow({
  children,
  className,
  color = "default",
  fill = false,
}: GlowingShadowProps) {
  return (
    <div
      className={cn(
        "glow-container",
        color === "white" && "glow-container--white",
        fill && "glow-container--fill",
        className,
      )}
    >
      <span className="glow" aria-hidden />
      <div className="glow-content">{children}</div>
    </div>
  );
}
