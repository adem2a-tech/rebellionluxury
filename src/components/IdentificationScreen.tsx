import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Format téléphone par pays : placeholder + tailles des groupes (ex. [2,3,2,2] → 79 123 45 67) */
const PHONE_FORMAT_BY_COUNTRY: Record<string, { placeholder: string; groups: number[] }> = {
  "+41": { placeholder: "79 123 45 67", groups: [2, 3, 2, 2] },       // Suisse (mobile)
  "+33": { placeholder: "6 12 34 56 78", groups: [1, 2, 2, 2, 2] },    // France (mobile sans 0)
  "+32": { placeholder: "456 12 34 56", groups: [3, 2, 2, 2] },       // Belgique
  "+352": { placeholder: "661 123 456", groups: [3, 3, 3] },           // Luxembourg
  "+49": { placeholder: "151 12345678", groups: [3, 4, 4] },           // Allemagne (mobile)
  "+39": { placeholder: "312 345 6789", groups: [3, 3, 4] },          // Italie (mobile)
  "+44": { placeholder: "7700 123456", groups: [4, 6] },              // Royaume-Uni
  "+34": { placeholder: "612 34 56 78", groups: [3, 2, 2, 2] },        // Espagne
  "+351": { placeholder: "912 345 678", groups: [3, 3, 3] },          // Portugal
  "+43": { placeholder: "650 1234567", groups: [3, 3, 4] },           // Autriche
  "+31": { placeholder: "6 12 34 56 78", groups: [1, 2, 2, 2, 2] },    // Pays-Bas
  "+1": { placeholder: "(201) 555-0123", groups: [3, 3, 4] },         // USA/Canada
  "+971": { placeholder: "50 123 4567", groups: [2, 3, 4] },          // EAU
  "+212": { placeholder: "612 34 56 78", groups: [3, 2, 2, 2] },       // Maroc
  "+213": { placeholder: "551 23 45 67", groups: [3, 2, 2, 2] },      // Algérie
  "+20": { placeholder: "100 123 4567", groups: [3, 3, 4] },          // Égypte
  "+216": { placeholder: "20 123 456", groups: [2, 3, 3] },            // Tunisie
};

/** Formate les chiffres selon les groupes du pays (ex. [2,3,2,2] → "79 123 45 67") */
function formatPhoneByGroups(digits: string, groups: number[], maxDigits = 12): string {
  const d = digits.replace(/\D/g, "").slice(0, maxDigits);
  if (d.length === 0) return "";
  const parts: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= d.length) break;
    parts.push(d.slice(i, i + g));
    i += g;
  }
  if (i < d.length) parts.push(d.slice(i)); // reste en un bloc
  return parts.join(" ").trim();
}

/** Formate le numéro selon le pays (ou paires par défaut) */
function formatPhoneDisplay(digits: string, countryCode: string, maxDigits = 12): string {
  const config = PHONE_FORMAT_BY_COUNTRY[countryCode];
  if (config?.groups) return formatPhoneByGroups(digits, config.groups, maxDigits);
  const d = digits.replace(/\D/g, "").slice(0, maxDigits);
  return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

function getPhonePlaceholder(countryCode: string): string {
  return PHONE_FORMAT_BY_COUNTRY[countryCode]?.placeholder ?? "79 123 45 67";
}

/** Pays les plus connus en premier (short = libellé court dans le sélecteur), puis liste complète */
const COUNTRY_PHONE_LIST: { dialCode: string; name: string; short?: string }[] = [
  { dialCode: "+41", name: "Suisse", short: "Sui" },
  { dialCode: "+33", name: "France", short: "Fra" },
  { dialCode: "+32", name: "Belgique", short: "Bel" },
  { dialCode: "+352", name: "Luxembourg", short: "Lux" },
  { dialCode: "+49", name: "Allemagne", short: "All" },
  { dialCode: "+39", name: "Italie", short: "Ita" },
  { dialCode: "+44", name: "Royaume-Uni", short: "R.-U." },
  { dialCode: "+34", name: "Espagne", short: "Esp" },
  { dialCode: "+351", name: "Portugal", short: "Por" },
  { dialCode: "+43", name: "Autriche", short: "Aut" },
  { dialCode: "+31", name: "Pays-Bas", short: "P-B" },
  { dialCode: "+1", name: "États-Unis / Canada", short: "USA" },
  { dialCode: "+971", name: "Émirats arabes unis", short: "EAU" },
  { dialCode: "+852", name: "Hong Kong", short: "HK" },
  { dialCode: "+213", name: "Algérie" },
  { dialCode: "+54", name: "Argentine" },
  { dialCode: "+61", name: "Australie" },
  { dialCode: "+55", name: "Brésil" },
  { dialCode: "+86", name: "Chine" },
  { dialCode: "+57", name: "Colombie" },
  { dialCode: "+243", name: "RD Congo" },
  { dialCode: "+358", name: "Finlande" },
  { dialCode: "+30", name: "Grèce" },
  { dialCode: "+91", name: "Inde" },
  { dialCode: "+353", name: "Irlande" },
  { dialCode: "+972", name: "Israël" },
  { dialCode: "+81", name: "Japon" },
  { dialCode: "+212", name: "Maroc" },
  { dialCode: "+52", name: "Mexique" },
  { dialCode: "+48", name: "Pologne" },
  { dialCode: "+7", name: "Russie" },
  { dialCode: "+966", name: "Arabie saoudite" },
  { dialCode: "+27", name: "Afrique du Sud" },
  { dialCode: "+82", name: "Corée du Sud" },
  { dialCode: "+46", name: "Suède" },
  { dialCode: "+216", name: "Tunisie" },
  { dialCode: "+90", name: "Turquie" },
  { dialCode: "+380", name: "Ukraine" },
  { dialCode: "+20", name: "Égypte" },
  { dialCode: "+45", name: "Danemark" },
  { dialCode: "+47", name: "Norvège" },
  { dialCode: "+64", name: "Nouvelle-Zélande" },
  { dialCode: "+65", name: "Singapour" },
  { dialCode: "+93", name: "Afghanistan" },
  { dialCode: "+355", name: "Albanie" },
  { dialCode: "+376", name: "Andorre" },
  { dialCode: "+244", name: "Angola" },
  { dialCode: "+994", name: "Azerbaïdjan" },
  { dialCode: "+973", name: "Bahreïn" },
  { dialCode: "+880", name: "Bangladesh" },
  { dialCode: "+375", name: "Biélorussie" },
  { dialCode: "+229", name: "Bénin" },
  { dialCode: "+673", name: "Brunei" },
  { dialCode: "+359", name: "Bulgarie" },
  { dialCode: "+226", name: "Burkina Faso" },
  { dialCode: "+257", name: "Burundi" },
  { dialCode: "+238", name: "Cap-Vert" },
  { dialCode: "+56", name: "Chili" },
  { dialCode: "+357", name: "Chypre" },
  { dialCode: "+506", name: "Costa Rica" },
  { dialCode: "+385", name: "Croatie" },
  { dialCode: "+53", name: "Cuba" },
  { dialCode: "+253", name: "Djibouti" },
  { dialCode: "+593", name: "Équateur" },
  { dialCode: "+291", name: "Érythrée" },
  { dialCode: "+372", name: "Estonie" },
  { dialCode: "+251", name: "Éthiopie" },
  { dialCode: "+679", name: "Fidji" },
  { dialCode: "+995", name: "Géorgie" },
  { dialCode: "+233", name: "Ghana" },
  { dialCode: "+224", name: "Guinée" },
  { dialCode: "+36", name: "Hongrie" },
  { dialCode: "+354", name: "Islande" },
  { dialCode: "+962", name: "Jordanie" },
  { dialCode: "+254", name: "Kenya" },
  { dialCode: "+686", name: "Kiribati" },
  { dialCode: "+383", name: "Kosovo" },
  { dialCode: "+965", name: "Koweït" },
  { dialCode: "+856", name: "Laos" },
  { dialCode: "+371", name: "Lettonie" },
  { dialCode: "+961", name: "Liban" },
  { dialCode: "+370", name: "Lituanie" },
  { dialCode: "+389", name: "Macédoine du Nord" },
  { dialCode: "+261", name: "Madagascar" },
  { dialCode: "+265", name: "Malawi" },
  { dialCode: "+60", name: "Malaisie" },
  { dialCode: "+960", name: "Maldives" },
  { dialCode: "+223", name: "Mali" },
  { dialCode: "+356", name: "Malte" },
  { dialCode: "+222", name: "Mauritanie" },
  { dialCode: "+230", name: "Maurice" },
  { dialCode: "+373", name: "Moldavie" },
  { dialCode: "+377", name: "Monaco" },
  { dialCode: "+976", name: "Mongolie" },
  { dialCode: "+382", name: "Monténégro" },
  { dialCode: "+258", name: "Mozambique" },
  { dialCode: "+264", name: "Namibie" },
  { dialCode: "+674", name: "Nauru" },
  { dialCode: "+977", name: "Népal" },
  { dialCode: "+505", name: "Nicaragua" },
  { dialCode: "+227", name: "Niger" },
  { dialCode: "+234", name: "Nigeria" },
  { dialCode: "+850", name: "Corée du Nord" },
  { dialCode: "+968", name: "Oman" },
  { dialCode: "+256", name: "Ouganda" },
  { dialCode: "+998", name: "Ouzbékistan" },
  { dialCode: "+507", name: "Panama" },
  { dialCode: "+595", name: "Paraguay" },
  { dialCode: "+51", name: "Pérou" },
  { dialCode: "+63", name: "Philippines" },
  { dialCode: "+250", name: "Rwanda" },
  { dialCode: "+221", name: "Sénégal" },
  { dialCode: "+381", name: "Serbie" },
  { dialCode: "+232", name: "Sierra Leone" },
  { dialCode: "+421", name: "Slovaquie" },
  { dialCode: "+386", name: "Slovénie" },
  { dialCode: "+252", name: "Somalie" },
  { dialCode: "+211", name: "Soudan du Sud" },
  { dialCode: "+249", name: "Soudan" },
  { dialCode: "+94", name: "Sri Lanka" },
  { dialCode: "+963", name: "Syrie" },
  { dialCode: "+992", name: "Tadjikistan" },
  { dialCode: "+886", name: "Taïwan" },
  { dialCode: "+255", name: "Tanzanie" },
  { dialCode: "+66", name: "Thaïlande" },
  { dialCode: "+228", name: "Togo" },
  { dialCode: "+676", name: "Tonga" },
  { dialCode: "+1868", name: "Trinidad et Tobago" },
  { dialCode: "+235", name: "Tchad" },
  { dialCode: "+420", name: "Rép. tchèque" },
  { dialCode: "+993", name: "Turkménistan" },
  { dialCode: "+598", name: "Uruguay" },
  { dialCode: "+678", name: "Vanuatu" },
  { dialCode: "+58", name: "Venezuela" },
  { dialCode: "+84", name: "Viêt Nam" },
  { dialCode: "+967", name: "Yémen" },
  { dialCode: "+260", name: "Zambie" },
  { dialCode: "+263", name: "Zimbabwe" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const DEFAULT_COUNTRY = "+41";
const LAST_CONTACT_KEY = "rebellion_last_contact";

type LastContact = {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
};

function loadLastContact(): Partial<LastContact> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_CONTACT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastContact;
    if (parsed && typeof parsed.email === "string") {
      return {
        firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
        lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
        email: parsed.email,
        countryCode: typeof parsed.countryCode === "string" && parsed.countryCode ? parsed.countryCode : DEFAULT_COUNTRY,
        phone: typeof parsed.phone === "string" ? parsed.phone : "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveLastContact(data: LastContact) {
  try {
    localStorage.setItem(LAST_CONTACT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function IdentificationScreen() {
  const { identify, tryRestoreFromDevice } = useUser();
  const [checkingDevice, setCheckingDevice] = useState(true);
  const [prefill] = useState(() => loadLastContact());
  const [firstName, setFirstName] = useState(() => prefill?.firstName ?? "");
  const [lastName, setLastName] = useState(() => prefill?.lastName ?? "");
  const [email, setEmail] = useState(() => prefill?.email ?? "");
  const [countryCode, setCountryCode] = useState(() => prefill?.countryCode ?? DEFAULT_COUNTRY);
  const [phone, setPhone] = useState(() => formatPhoneDisplay(prefill?.phone ?? "", prefill?.countryCode ?? DEFAULT_COUNTRY));
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; phone?: string }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!checkingDevice) return;
    const restored = tryRestoreFromDevice();
    if (restored) return;
    const t = setTimeout(() => setCheckingDevice(false), 700);
    return () => clearTimeout(t);
  }, [checkingDevice, tryRestoreFromDevice]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "Le prénom est requis.";
    if (!lastName.trim()) next.lastName = "Le nom est requis.";
    if (!email.trim()) next.email = "L'email est requis.";
    else if (!EMAIL_REGEX.test(email.trim())) next.email = "Email invalide.";
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 6) next.phone = "Un numéro de téléphone valide est requis.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const dialOnly = countryCode.replace(/\D/g, "");
    const nationalNumber = digitsOnly.startsWith(dialOnly) ? digitsOnly.slice(dialOnly.length) : digitsOnly;
    const fullPhone = `${countryCode.replace(/\s/g, "")}${nationalNumber || digitsOnly}`;
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: fullPhone,
    };
    identify(userData);
    saveLastContact({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      countryCode,
      phone: nationalNumber || digitsOnly,
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPhone(formatPhoneDisplay(digits, countryCode));
  };

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    const digits = phone.replace(/\D/g, "");
    if (digits.length > 0) setPhone(formatPhoneDisplay(digits, newCode));
  };

  if (checkingDevice) {
    return (
      <div className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center bg-black px-4" role="dialog" aria-modal="true" aria-label="Reconnexion">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black to-white/[0.02]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.04),transparent)]" aria-hidden />
        <motion.div
          className="relative z-10 w-full max-w-[420px] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <h1 className="font-luxury text-2xl font-semibold tracking-[0.2em] text-white md:text-3xl">
              Rebellion Luxury
            </h1>
            <p className="mt-6 font-luxury text-lg font-medium tracking-wide text-white/95">
              C&apos;est bien vous ?
            </p>
            <p className="mt-2 font-sans text-sm text-white/70">
              Reconnexion en cours…
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center bg-black px-4" role="dialog" aria-modal="true" aria-label="Créer un compte ou se connecter">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black to-white/[0.02]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.04),transparent)]" aria-hidden />

      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04]" aria-hidden />
          <div className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden />

          <div className="relative">
            <h1 className="font-luxury text-center text-3xl font-semibold tracking-[0.2em] text-white md:text-4xl">
              Rebellion Luxury
            </h1>
            <motion.span
              className="mx-auto mt-2 block h-px w-16 bg-white/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
            <p className="mt-4 text-center font-sans text-sm font-medium text-white/90">
              Créer un compte ou se connecter
            </p>
          </div>

          <motion.form
            name="identification"
            onSubmit={handleSubmit}
            className="relative mt-8 space-y-5"
            variants={container}
            initial="hidden"
            animate="show"
            autoComplete="on"
          >
            <motion.div className="space-y-2" variants={item}>
              <Label htmlFor="firstName" className="font-luxury text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
                Prénom
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Votre prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`h-11 rounded-lg border-white/15 bg-white/5 px-4 font-medium text-white placeholder:text-white/30 focus-visible:ring-white/30 ${errors.firstName ? "border-red-400/50" : ""}`}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-xs text-red-400/90">{errors.firstName}</p>
              )}
            </motion.div>
            <motion.div className="space-y-2" variants={item}>
              <Label htmlFor="lastName" className="font-luxury text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
                Nom
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Votre nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`h-11 rounded-lg border-white/15 bg-white/5 px-4 font-medium text-white placeholder:text-white/30 focus-visible:ring-white/30 ${errors.lastName ? "border-red-400/50" : ""}`}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-xs text-red-400/90">{errors.lastName}</p>
              )}
            </motion.div>
            <motion.div className="space-y-2" variants={item}>
              <Label htmlFor="email" className="font-luxury text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 rounded-lg border-white/15 bg-white/5 px-4 font-medium text-white placeholder:text-white/30 focus-visible:ring-white/30 ${errors.email ? "border-red-400/50" : ""}`}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-400/90">{errors.email}</p>
              )}
            </motion.div>
            <motion.div className="space-y-2" variants={item}>
              <Label htmlFor="phone" className="font-luxury text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
                Téléphone
              </Label>
              <div className="flex gap-3">
                <div className="relative flex h-12 w-[120px] shrink-0 items-center">
                  <select
                    id="phone-country"
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="h-full w-full appearance-none rounded-xl border border-white/15 bg-white/[0.06] pl-4 pr-10 font-medium text-white outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10"
                    aria-label="Indicatif pays"
                  >
                    {COUNTRY_PHONE_LIST.map((c) => (
                      <option key={c.dialCode + c.name} value={c.dialCode} className="bg-zinc-900 text-white">
                        {c.dialCode} {c.short ?? c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-white/50" aria-hidden />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder={getPhonePlaceholder(countryCode)}
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={18}
                  className={`h-12 flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-4 font-medium tracking-wide text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-white/10 ${errors.phone ? "border-red-400/50" : ""}`}
                  autoComplete="tel-national"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-400/90">{errors.phone}</p>
              )}
            </motion.div>
            <motion.div className="pt-2 space-y-3" variants={item}>
              <Button
                type="submit"
                size="lg"
                className="font-sans h-12 w-full rounded-lg bg-white px-6 font-semibold text-black transition-all duration-300 hover:bg-white/95 hover:shadow-[0_0_32px_rgba(255,255,255,0.12)]"
              >
                Se connecter
              </Button>
              <p className="text-center font-sans text-xs text-white/50">
                Vos informations sont enregistrées pour votre prochaine visite.
              </p>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
