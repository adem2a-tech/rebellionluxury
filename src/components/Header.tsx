import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onOpenChat: (initialMessage?: string) => void;
}

const vehiculesSubItems = [
  { label: "Catalogue", href: "/vehicules" },
  { label: "Catalogue des particuliers", href: "/vehicules?hors-rebellion=1" },
  { label: "Calculez le prix", href: "/calculer-prix" },
];

const aProposSubItems = [
  { label: "Rentabilité", href: "/rentabilite" },
  { label: "Transport", href: "/transport" },
  { label: "Réseaux", href: "/reseaux" },
];

const loueTonVehiculeSubItems = [
  { label: "Voir mes demandes", href: "/verifier-ma-demande" },
];

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Véhicules", href: "/vehicules", subItems: vehiculesSubItems },
  { label: "Loue ton propre véhicule", href: "/loue-ton-vehicule", subItems: loueTonVehiculeSubItems },
  { label: "À propos", href: "/a-propos", subItems: aProposSubItems },
  { label: "Espace pro", href: "/espace-pro" },
  { label: "Contact", href: "/contact" },
];

const Header = ({ onOpenChat }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-border led-subtle"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            aria-label="Rebellion Luxury - Accueil"
          >
            <div className="rounded-full overflow-hidden h-8 w-8 lg:h-9 lg:w-9 shrink-0 border border-white/25 ring-1 ring-white/10">
              <img
                src="/rebellion-luxury-logo.png"
                alt="Rebellion Luxury"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-sm lg:text-base font-semibold uppercase tracking-[0.2em] text-foreground/95">
              Rebellion Luxury
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                ("subItems" in item && item.subItems.some((s) => location.pathname === s.href));
              if ("subItems" in item && item.subItems) {
                return (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 flex items-center gap-2 rounded-lg hover:bg-white/5 ${
                          isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className="w-3 h-3 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="flex flex-row gap-1 p-2 min-w-0 w-auto border-border/80 bg-black/95 backdrop-blur-xl rounded-xl shadow-xl shadow-black/30"
                    >
                      <Link
                        to={item.href}
                        className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider rounded-lg whitespace-nowrap transition-colors ${
                          location.pathname === item.href ? "text-white bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider rounded-lg whitespace-nowrap transition-colors ${
                            location.pathname === sub.href ? "text-white bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] rounded-lg transition-all duration-200 ${
                    isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Divider + CTA */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <div className="h-6 w-px bg-white/15" aria-hidden />
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenChat()}
              className="h-10 px-6 text-xs font-semibold uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30"
            >
              Louer un véhicule
            </Button>
          </div>

          {/* Mobile menu button — 44px min touch target */}
          <button
            type="button"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-foreground rounded-lg hover:bg-muted active:bg-muted/80 touch-manipulation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>


        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <nav className="flex flex-col gap-0 py-4">
                {navItems.flatMap((item) => {
                  const majorTabClass = "block px-4 py-3 min-h-[44px] flex items-center text-sm font-semibold uppercase tracking-wider text-[#ffffff] hover:text-[#ffffff] hover:bg-muted/50 active:bg-muted touch-manipulation";
                  const subTabClass = "block px-6 py-3 min-h-[44px] flex items-center text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted touch-manipulation";
                  const separator = <div key={`sep-${item.label}`} className="mx-4 my-1 border-b border-white/10" aria-hidden />;
                  if ("subItems" in item && item.subItems) {
                    return [
                      <Link key={item.label} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className={majorTabClass}>
                        {item.label}
                      </Link>,
                      ...item.subItems.map((sub) => (
                        <Link key={sub.label} to={sub.href} onClick={() => setIsMobileMenuOpen(false)} className={subTabClass}>
                          {sub.label}
                        </Link>
                      )),
                      separator,
                    ];
                  }
                  return [
                    <Link key={item.label} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className={majorTabClass}>
                      {item.label}
                    </Link>,
                    separator,
                  ];
                })}
                <div className="px-4 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-primary font-bold uppercase tracking-wider"
                    onClick={() => {
                      onOpenChat();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Louer un véhicule
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
