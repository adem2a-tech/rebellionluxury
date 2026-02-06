import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IdentificationScreen() {
  const { identify } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "Le prénom est requis.";
    if (!lastName.trim()) next.lastName = "Le nom est requis.";
    if (!email.trim()) next.email = "L'email est requis.";
    else if (!EMAIL_REGEX.test(email.trim())) next.email = "Email invalide.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    identify({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-background"
      style={{ backgroundColor: "#000", color: "#e5e5e5" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5"
        aria-hidden
      />
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        style={{ pointerEvents: "auto" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div
          className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-xl backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.95)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground" style={{ color: "#e5e5e5" }}>
            Rebellion Luxury
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground" style={{ color: "#a3a3a3" }}>
            Identifiez-vous pour accéder au site
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Votre prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? "border-destructive" : ""}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Votre nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Accéder au site
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
