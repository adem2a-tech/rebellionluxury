import { Link } from "react-router-dom";
import { ChevronDown, Car, FileText, LogOut, CalendarCheck } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/data/chatKnowledge";

type UserAccountDropdownProps = {
  className?: string;
};

export default function UserAccountDropdown({ className }: UserAccountDropdownProps) {
  const { user, resetIdentification } = useUser();

  if (!user) return null;

  const displayName = "EDUARDO";
  const initial = displayName.charAt(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-white/5 text-foreground ${className ?? ""}`}
          aria-label="Mon compte"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">{initial}</span>
          </div>
          <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
            {displayName}
          </span>
          <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 border-border/80 bg-black/95 backdrop-blur-xl rounded-xl shadow-xl shadow-black/30"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="font-display font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 cursor-pointer focus:bg-white/10"
          >
            <CalendarCheck className="w-4 h-4 text-primary" />
            <div className="flex flex-col items-start">
              <span>Mes réservations</span>
              <span className="text-xs text-muted-foreground">
                Voir l&apos;historique sur WhatsApp
              </span>
            </div>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/verifier-ma-demande"
            className="flex items-center gap-3 cursor-pointer focus:bg-white/10"
          >
            <FileText className="w-4 h-4 text-primary" />
            <div className="flex flex-col items-start">
              <span>Mes demandes</span>
              <span className="text-xs text-muted-foreground">
                Loue ton véhicule
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/vehicules"
            className="flex items-center gap-3 cursor-pointer focus:bg-white/10"
          >
            <Car className="w-4 h-4 text-primary" />
            <div className="flex flex-col items-start">
              <span>Louer un véhicule</span>
              <span className="text-xs text-muted-foreground">
                Catalogue & tarifs
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={resetIdentification}
          className="flex items-center gap-3 cursor-pointer text-amber-400/90 focus:bg-white/10 focus:text-amber-400"
        >
          <LogOut className="w-4 h-4" />
          <span>Se réidentifier</span>
          <span className="text-xs text-muted-foreground ml-auto">
            Changer de compte
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
