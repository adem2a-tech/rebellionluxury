import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IoLogoWhatsapp } from "react-icons/io5";
import { useUser } from "@/contexts/UserContext";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "./ui/button";
import { CONTACT, VEHICLES, CONDITIONS, BOBOLOC_AVAILABILITY_URLS, SITE_INFO } from "@/data/chatKnowledge";
import { findVehicleByQuery } from "@/utils/priceCalculation";

const RESERVATION_DOCS = [
  "Carte d'identité",
  "Permis de conduire",
  "Justificatif de domicile",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  initialMessage?: string;
}

// Point #2 : Suggestions rapides supprimées — champ texte libre uniquement

const whatsappCta = () =>
  `\n\n📱 **Pour louer :** contactez-nous sur **WhatsApp** au **${CONTACT.phone}** — nous répondons rapidement pour finaliser votre réservation !`;

// Réponses IA basées sur les données du site (chatKnowledge)
// Point #3 : L'IA guide vers les pages du site au lieu d'inventer des infos
const sendMessageToAI = async (
  messages: { role: string; content: string }[],
  vehicleName?: string | null
): Promise<{ content: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const lastMessage = messages[messages.length - 1].content.toLowerCase().trim();
  const lm = lastMessage;

  // Salutations — répondre de manière naturelle
  if (/^(bonjour|salut|coucou|hello|hey|bonsoir|bonne soirée)[\s!.]*$/i.test(lm) || lm === "bjr" || lm === "yo") {
    return {
      content: `Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ? Je connais tout le site sur le bout des doigts — véhicules, tarifs, réservations, transport... Posez-moi vos questions !`,
    };
  }

  // Remerciements
  if (/^(merci|merci beaucoup|super|parfait|ok|d'accord|très bien)[\s!.]*$/i.test(lm) || lm === "thx") {
    return { content: `Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Bonne journée !` };
  }

  // Au revoir
  if (/^(au revoir|a bientôt|bye|à bientôt|bonne journée|ciao)[\s!.]*$/i.test(lm)) {
    return { content: `Au revoir ! À bientôt sur Rebellion Luxury. 🏎️` };
  }

  // Comment ça va
  if (/^(comment ça va|ça va\??|comment vas-tu|comment allez-vous)[\s!.]*$/i.test(lm)) {
    return { content: `Très bien, merci ! 😊 Je suis là pour vous aider. Posez-moi vos questions sur nos véhicules, les tarifs ou les réservations !` };
  }

  // Qui es-tu / que peux-tu faire / aide
  if (
    lm.includes("qui es-tu") ||
    lm.includes("qui es tu") ||
    lm.includes("que peux-tu") ||
    /^(aide|help|\?|aider moi)[\s!.]*$/i.test(lm)
  ) {
    return {
      content: `Je suis **Rebellion IA**, votre assistant. Je connais tout le site sur le bout des doigts ! Je peux vous renseigner sur : véhicules (Audi R8, McLaren 570S), tarifs, réservations, disponibilités, transport, conditions. Posez-moi vos questions !`,
    };
  }

  // Point #3 : L'IA ne calcule plus de prix — elle guide vers les bonnes pages
  const hasPriceIntent = /combien|prix|tarif|coût|cout|estimation|cher/.test(lm);
  const hasVehicle = lm.includes("audi") || lm.includes("r8") || lm.includes("mclaren") || lm.includes("570");
  
  if (hasVehicle && hasPriceIntent) {
    // Guider vers la fiche véhicule au lieu de calculer un prix
    const vehicleName = (lm.includes("mclaren") || lm.includes("570")) ? "McLaren 570S" : "Audi R8 V8";
    const vehicleSlug = (lm.includes("mclaren") || lm.includes("570")) ? "mclaren-570s" : "audi-r8-v8";
    return {
      content: `💰 **Prix de la ${vehicleName}**\n\nJe ne peux pas vous donner un prix exact ici, mais vous trouverez tous les tarifs détaillés (forfaits, km inclus, caution) sur la fiche du véhicule :\n\n👉 **Menu "Véhicules" → ${vehicleName}**\n\nOu utilisez notre calculateur de prix interactif :\n👉 **Menu "Véhicules" → Calculer le prix**\n\nPour toute question, contactez-nous sur WhatsApp !` + whatsappCta(),
    };
  }

  // Contexte véhicule : utilisateur veut louer → on envoie le formulaire réservation (CI, permis, justificatif)
  const wantsToRent =
    lm.includes("louer") ||
    lm.includes("louez") ||
    lm.includes("réserver") ||
    lm.includes("reserver") ||
    (lm.includes("oui") && (lm.includes("louer") || lm.includes("réserver"))) ||
    (lm.includes("souhaite") && (lm.includes("louer") || lm.includes("réserver"))) ||
    (lm.includes("comment") && (lm.includes("faire") || lm.includes("réserver")));

  if (vehicleName && wantsToRent) {
    const list = RESERVATION_DOCS.map((d) => `• **${d}**`).join("\n");
    return { content: `📋 **Formulaire pour réserver le véhicule**\n\nVoici ce dont nous avons besoin :\n\n${list}\n\nUne fois tout rempli, **une personne vous contactera par WhatsApp ou par téléphone** pour confirmer votre réservation.\n\n📱 Envoyez-nous vos documents sur **WhatsApp** au **${CONTACT.phone}** ou cliquez sur le bouton vert en bas pour nous joindre.` };
  }

  // Louer McLaren — guide vers la page sans mentionner de prix
  if (
    (lm.includes("louer") || lm.includes("louez")) &&
    (lm.includes("mclaren") || lm.includes("570"))
  ) {
    return { content: `📱 **Pour louer la McLaren 570S**, contactez-nous sur **WhatsApp** au **${CONTACT.phone}**.\n\nPour voir les tarifs et disponibilités, rendez-vous dans :\n👉 **Menu "Véhicules" → McLaren 570S**\n\nNous vous accompagnons pour finaliser votre réservation ! 🏎️` + whatsappCta() };
  }

  // Louer R8 — guide vers la page sans mentionner de prix
  if (
    (lm.includes("louer") || lm.includes("louez")) &&
    (lm.includes("r8") || lm.includes("audi"))
  ) {
    return { content: `📱 **Pour louer l'Audi R8 V8**, contactez-nous sur **WhatsApp** au **${CONTACT.phone}**.\n\nPour voir les tarifs et disponibilités, rendez-vous dans :\n👉 **Menu "Véhicules" → Audi R8 V8**\n\nNous vous accompagnons pour finaliser votre réservation ! 🏎️` + whatsappCta() };
  }

  // Louer / réserver (général)
  if (wantsToRent) {
    return { content: `📱 **Pour louer de suite**, contactez-nous sur **WhatsApp** au **${CONTACT.phone}**.\n\nNous vérifions les disponibilités, les tarifs et finalisons votre réservation avec vous. À très vite ! 🏎️` + whatsappCta() };
  }

  // Contact WhatsApp
  if (lm.includes("whatsapp") || (lm.includes("contact") && lm.includes("whatsapp"))) {
    return { content: `📱 **Contact WhatsApp**\n\nEnvoyez-nous un message au **${CONTACT.phone}** ou cliquez sur le bouton vert « Contacter par WhatsApp » en bas du chat — nous répondons rapidement !` + whatsappCta() };
  }

  // Contact Instagram
  if (lm.includes("instagram")) {
    return { content: `📸 **Nous suivre sur Instagram**\n\nRetrouvez nos supercars et l'actualité Rebellion Luxury : ${CONTACT.instagramUrl}\n\n📱 **Pour réserver :** WhatsApp au **${CONTACT.phone}** — le plus simple pour finaliser une location !` + whatsappCta() };
  }

  // Info Audi R8 — guide vers la fiche véhicule sans afficher les prix
  if (lm.includes("audi") || lm.includes("r8")) {
    const v = VEHICLES[0];
    return { content: `🏎️ **${v.name}** — ${v.description}\n\n• **Puissance:** ${v.specs.power}\n• **Transmission:** ${v.specs.transmission}\n• **Année:** ${v.specs.year}\n\n💰 **Tarifs et caution :** consultez la fiche complète ici :\n👉 **Menu "Véhicules" → Audi R8 V8**\n\nVous y trouverez tous les forfaits, km inclus et conditions.` + whatsappCta() };
  }

  // Info McLaren — guide vers la fiche véhicule sans afficher les prix
  if (lm.includes("mclaren") || lm.includes("570")) {
    const v = VEHICLES[1];
    return { content: `🦋 **${v.name}** — ${v.description}\n\n• **Puissance:** ${v.specs.power}\n• **Portes papillon** • **Année:** ${v.specs.year}\n\n💰 **Tarifs et caution :** consultez la fiche complète ici :\n👉 **Menu "Véhicules" → McLaren 570S**\n\nVous y trouverez tous les forfaits, km inclus et conditions.` + whatsappCta() };
  }

  // Calcul de prix / estimation — guide vers l'outil dédié (point #3)
  const asksPriceCalc =
    lm.includes("calcul") ||
    lm.includes("combien") ||
    lm.includes("estimation") ||
    lm.includes("prix pour") ||
    lm.includes("coût") ||
    lm.includes("cout ");
  if (asksPriceCalc) {
    return {
      content: `💰 **Calculer le prix**\n\nJe ne peux pas vous donner un prix exact ici. Pour obtenir une estimation précise avec tous les forfaits et options, utilisez notre outil interactif :\n\n👉 **Menu "Véhicules" → Calculer le prix**\n\nVous pourrez y choisir le véhicule, la durée, les km supplémentaires et le transport.\n\nOu consultez directement la fiche du véhicule concerné pour voir ses tarifs.` + whatsappCta(),
    };
  }

  // Tarifs — guide vers les pages véhicules (point #3)
  if (lm.includes("prix") || lm.includes("tarif")) {
    return { content: `💰 **Nos tarifs**\n\nJe ne peux pas afficher les prix ici. Vous trouverez tous les tarifs détaillés sur les fiches véhicules :\n\n👉 **Menu "Véhicules" → Audi R8 V8** ou **McLaren 570S**\n\nChaque fiche présente les forfaits (journée, week-end, semaine, mois), km inclus et caution.` + whatsappCta() };
  }

  // Disponibilités — redirection vers Boboloc (temps réel)
  const asksAvailability =
    lm.includes("disponib") ||
    lm.includes("dispo") ||
    lm.includes("libre") ||
    (lm.includes("date") && (lm.includes("réserver") || lm.includes("louer")));
  if (asksAvailability) {
    let vehicleFilter: string | null = vehicleName ?? null;
    if (!vehicleFilter) {
      const found = findVehicleByQuery(lm);
      if (found) vehicleFilter = found.name;
    }
    const entries = Object.entries(BOBOLOC_AVAILABILITY_URLS);
    const linksText =
      vehicleFilter && BOBOLOC_AVAILABILITY_URLS[vehicleFilter]
        ? `**${vehicleFilter}** — [Voir les disponibilités en temps réel](${BOBOLOC_AVAILABILITY_URLS[vehicleFilter]})`
        : entries
            .map(([name, url]) => `**${name}** — [Voir les disponibilités](${url})`)
            .join("\n\n");
    return {
      content: `📅 **Disponibilités en temps réel**\n\nNos disponibilités sont mises à jour sur **Boboloc**. Consultez le calendrier à jour en cliquant sur le lien du véhicule :\n\n${linksText}\n\nDès que Boboloc est modifié, les infos sont à jour. Pour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta(),
    };
  }

  // Flotte / véhicules / supercars
  if (lm.includes("véhicule") || lm.includes("vehicule") || lm.includes("flotte") || lm.includes("supercar") || lm.includes("voiture") || lm.includes("quels véhicules")) {
    const lines = VEHICLES.map(
      (v, i) => `${i + 1}️⃣ **${v.name}** — Dès ${v.pricePerDay} CHF/jour • ${v.description.slice(0, 50)}…`
    ).join("\n\n");
    return { content: `🚗 **Notre flotte:**\n\n${lines}\n\nBasés en **${CONTACT.location}**.` + whatsappCta() };
  }

  // Conditions
  if (lm.includes("condition") || lm.includes("requis")) {
    const list = CONDITIONS.map((c) => `✅ ${c}`).join("\n");
    return { content: `📋 **Conditions de location:**\n\n${list}` + whatsappCta() };
  }

  // Transport / livraison / Lausanne / Genève
  if (
    lm.includes("transport") ||
    lm.includes("livraison") ||
    lm.includes("livrer") ||
    lm.includes("domicile") ||
    lm.includes("lausanne") ||
    lm.includes("genève") ||
    lm.includes("geneve")
  ) {
    const cityHint = (lm.includes("lausanne") || lm.includes("genève") || lm.includes("geneve"))
      ? `\nNous livrons à **Lausanne**, **Genève** et partout en Suisse romande — tarif au km. `
      : "";
    return { content: `🚚 **Transport & livraison**\n\n• **Tarif :** ${SITE_INFO.transportPricePerKm} CHF / km\n• **Point A** — Evionnaz (siège Rebellion Luxury)\n• **Point B** — Livraison au client (votre adresse)\n• **Point C** — Retour à Evionnaz\n\nPrix = (A → B → C) × ${SITE_INFO.transportPricePerKm} CHF/km.${cityHint}\n\n• Location min. 24h — prix sur demande\n• Location min. 48h — offert si vous avez déjà loué chez nous\n• Acompte obligatoire\n\n📱 Estimation précise : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Localisation / où êtes-vous / Evionnaz / Valais
  if (
    (lm.includes("où") || lm.includes("ou")) && (lm.includes("êtes") || lm.includes("etes") || lm.includes("trouver") || lm.includes("situ") || lm.includes("sont")) ||
    lm.includes("localisation") || lm.includes("evionnaz") || lm.includes("valais") ||
    (lm.includes("adresse") && (lm.includes("siege") || lm.includes("siège")))
  ) {
    return { content: `📍 **Localisation**\n\nNous sommes basés à **${SITE_INFO.location}** (Valais), au cœur de la Suisse romande.\n\n• **Récupération du véhicule :** Evionnaz\n• **Zone de livraison :** Suisse romande (transport au km)\n• **Carte :** [Voir sur Google Maps](${CONTACT.googleMapsUrl})\n\nPour louer ou réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Âge minimum / permis
  if (lm.includes("âge") || lm.includes("age") || lm.includes("ans") && (lm.includes("minimum") || lm.includes("avoir")) || lm.includes("permis") && lm.includes("année")) {
    return { content: `📋 **Conditions d'âge & permis**\n\n• **Âge minimum :** ${SITE_INFO.minAge} ans\n• **Permis de conduire :** valide, détenu depuis au moins ${SITE_INFO.minPermitYears} ans\n• **Documents requis :** pièce d'identité, permis, justificatif de domicile\n• **Caution :** par carte bancaire (Audi R8 : 3'000 CHF, McLaren 570S : 10'000 CHF)\n\n📱 Pour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Caution / garantie
  if (lm.includes("caution") || lm.includes("garantie") || lm.includes("dépôt") || lm.includes("depot")) {
    const cautions = VEHICLES.map((v) => `• **${v.name}** : ${v.specs.caution}`).join("\n");
    return { content: `🔒 **Caution**\n\n${cautions}\n\nLa caution est bloquée par carte bancaire. Elle est libérée à la restitution du véhicule dans l'état convenu.\n\n📱 Questions ? **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Km inclus / kilométrage
  if (lm.includes("km") && (lm.includes("inclus") || lm.includes("forfait") || lm.includes("kilom")) || lm.includes("kilometrage")) {
    const kmInfo = VEHICLES.map((v) => {
      const p = v.pricing[0];
      return `• **${v.name}** — Journée : ${p.km}, forfaits week-end/mois : plus de km inclus`;
    }).join("\n");
    return { content: `📏 **Kilométrage inclus**\n\n${kmInfo}\n\nAu-delà du forfait : 0,50 CHF/km. Détails complets sur la page **Véhicules** ou **Calculez le prix**.\n\n📱 Estimation sur mesure : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Loue ton véhicule / rentabiliser / particuliers
  if (
    lm.includes("loue ton") || lm.includes("louer mon") || lm.includes("rentabiliser") ||
    lm.includes("mettre en location") || lm.includes("particulier") || lm.includes("catalogue des particuliers") ||
    lm.includes("véhicule hors") || lm.includes("hors rebellion")
  ) {
    return { content: `🚗 **Loue ton véhicule**\n\nVous souhaitez **rentabiliser votre véhicule** ? Rebellion Luxury propose un service de conciergerie automobile premium :\n\n• Revenus passifs mensuels\n• Gestion complète (location, sinistres, nettoyage)\n• Shooting photo & vidéo offerts\n• Forte visibilité sur nos réseaux\n• Conditions : véhicule homologué, assuré, expertisé\n\n📋 **Comment procéder :**\n1. Remplissez le formulaire sur **Loue ton véhicule**\n2. Envoyez des photos de votre véhicule\n3. Nous vous recontactons par WhatsApp ou téléphone\n\n• Maximum 3 demandes par jour\n• Consultez vos demandes sur **Voir mes demandes**\n\n📱 **WhatsApp** : **${CONTACT.phone}**` + whatsappCta() };
  }

  // Contact email / téléphone
  if (lm.includes("email") || lm.includes("mail") || lm.includes("téléphone") || lm.includes("telephone") || lm.includes("joindre") || lm.includes("contacter")) {
    if (lm.includes("email") || lm.includes("mail")) {
      return { content: `📧 **Email**\n\n**${CONTACT.email}**\n\nPour une réponse rapide, privilégiez **WhatsApp** au **${CONTACT.phone}** — idéal pour les réservations !` + whatsappCta() };
    }
    if (lm.includes("téléphone") || lm.includes("telephone") || lm.includes("tél") || lm.includes("tel")) {
      return { content: `📞 **Téléphone**\n\n**${CONTACT.phone}**\n\nOu contactez-nous sur **WhatsApp** : c'est le plus simple pour réserver ! → ${CONTACT.whatsappUrl}` + whatsappCta() };
    }
    return { content: `📱 **Nous contacter**\n\n• **WhatsApp** (recommandé) : **${CONTACT.phone}**\n• **Téléphone** : ${CONTACT.phone}\n• **Email** : ${CONTACT.email}\n\nLe plus rapide pour réserver : **WhatsApp** !` + whatsappCta() };
  }

  // Facebook / TikTok
  if (lm.includes("facebook")) {
    return { content: `📘 **Facebook**\n\nSuivez-nous : ${CONTACT.facebookUrl}\n\n📱 Pour réserver : **WhatsApp** au **${CONTACT.phone}** — le plus direct !` + whatsappCta() };
  }
  if (lm.includes("tiktok")) {
    return { content: `🎵 **TikTok**\n\nRetrouvez-nous : ${CONTACT.tiktokUrl}\n\n📱 Pour réserver : **WhatsApp** au **${CONTACT.phone}** !` + whatsappCta() };
  }

  // À propos / qui êtes-vous / rebellion luxury
  if (
    lm.includes("à propos") || lm.includes("a propos") || lm.includes("qui êtes-vous") || lm.includes("c est quoi") ||
    lm.includes("rebellion luxury") || lm.includes("rebellion luxe") || lm.includes("présentation")
  ) {
    return { content: `🏎️ **Rebellion Luxury**\n\nEntreprise de **location de véhicules haut de gamme** en Valais, spécialisée en supercars et sportives.\n\n• **Flotte :** Audi R8, McLaren 570S (+ catalogue particuliers)\n• **Zone :** Suisse romande — siège à Evionnaz\n• **Services :** location, transport sur plateau, conciergerie (Loue ton véhicule)\n• **Assurance & entretien** inclus, qualité premium\n\nPage complète : **À propos**` + whatsappCta() };
  }

  // Plan du site / pages / navigation
  if (lm.includes("plan du site") || lm.includes("pages") || lm.includes("navigation") || lm.includes("menu") && lm.includes("quoi")) {
    return { content: `🗺️ **Plan du site**\n\n• **Accueil** — Présentation\n• **Véhicules** — Catalogue complet\n• **Calculez le prix** — Estimation tarifs\n• **Loue ton véhicule** — Rentabiliser votre voiture\n• **Voir mes demandes** — Suivi des demandes\n• **À propos** — Notre histoire, conditions\n• **Transport** — Livraison à domicile\n• **Réseaux** — Instagram, Facebook, TikTok\n• **Espace pro** — Gestion véhicules\n• **Contact** — Email, téléphone, WhatsApp\n\nQue souhaitez-vous savoir ?` };
  }

  // Calculez le prix (lien)
  if (lm.includes("calculez") || lm.includes("calculer") && lm.includes("prix") || lm.includes("simulateur")) {
    return { content: `💰 **Calculez le prix**\n\nUtilisez la page **Calculez le prix** pour une estimation détaillée : véhicule, durée, km supplémentaires, transport.\n\nOu posez-moi la question : ex. *"Combien pour 2 jours avec l'Audi et 50 km de transport ?"*` };
  }

  // Documents requis / quoi apporter
  if (lm.includes("document") || lm.includes("papier") || lm.includes("apporter") || lm.includes("fournir") || lm.includes("justificatif")) {
    const list = RESERVATION_DOCS.map((d) => `• **${d}**`).join("\n");
    return { content: `📋 **Documents pour réserver**\n\n${list}\n\nAcompte obligatoire. Caution par carte bancaire.\n\n📱 Envoyez vos documents sur **WhatsApp** au **${CONTACT.phone}** pour finaliser.` + whatsappCta() };
  }

  // Paiement / acompte
  if (lm.includes("paiement") || lm.includes("payer") || lm.includes("acompte") || lm.includes("carte bancaire")) {
    return { content: `💳 **Paiement**\n\n• **Acompte obligatoire** pour réserver le véhicule\n• **Caution** par carte bancaire (Audi : 3'000 CHF, McLaren : 10'000 CHF)\n• Détails des modalités lors de la réservation\n\n📱 **WhatsApp** au **${CONTACT.phone}** pour convenir des détails.` + whatsappCta() };
  }

  // Assurance
  if (lm.includes("assurance")) {
    return { content: `🛡️ **Assurance**\n\nTous nos véhicules sont **entièrement assurés**. Mécanique et entretien inclus pour une tranquillité d'esprit totale.\n\n📱 Questions spécifiques : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Suisse / étranger / frontière
  if (lm.includes("suisse") || lm.includes("étranger") || lm.includes("etranger") || lm.includes("frontière") || lm.includes("sortir")) {
    return { content: `🇨🇭 **Zone de circulation**\n\nLe véhicule doit **rester en Suisse** sauf accord préalable.\n\nNous sommes basés en **Suisse romande** (Evionnaz, Valais). Livraison possible partout en Suisse romande (transport au km).\n\n📱 Pour une exception (sortie Suisse) : contactez-nous au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Comparaison Audi vs McLaren
  if ((lm.includes("audi") || lm.includes("r8")) && (lm.includes("mclaren") || lm.includes("570")) && !lm.includes("louer")) {
    return { content: `⚖️ **Audi R8 vs McLaren 570S**\n\n**Audi R8 V8** — Dès 470 CHF/jour • 420 CH • Portes conventionnelles • Idéal week-end\n\n**McLaren 570S** — Dès 950 CHF/jour • 570 CH • Portes papillon • Supercar pure\n\nLes deux : transmission auto, caution (3k/10k CHF). Détails et tarifs complets sur **Véhicules**.\n\n📱 Pour choisir selon vos dates : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Vérifier ma demande / statut
  if (lm.includes("verifier") || lm.includes("vérifier") || lm.includes("demande") && (lm.includes("statut") || lm.includes("suivi")) || lm.includes("mes demandes")) {
    return { content: `📋 **Voir mes demandes**\n\nSi vous avez soumis une demande (Loue ton véhicule), consultez son statut sur la page **Vérifier ma demande**.\n\nVous serez notifié par téléphone ou WhatsApp lors du traitement (en attente, accepté, refusé).\n\n📱 Questions : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Espace pro
  if (lm.includes("espace pro")) {
    return { content: `👔 **Espace pro**\n\nL'Espace Pro permet aux propriétaires de véhicules (catalogue des particuliers) de gérer leurs annonces : fiche détaillée, tarifs, disponibilités, historique des demandes.\n\nAccès après acceptation de votre demande **Loue ton véhicule**.\n\n📱 **WhatsApp** : **${CONTACT.phone}**` + whatsappCta() };
  }

  // Rentabilité
  if (lm.includes("rentabilité") || lm.includes("rentabilite")) {
    return { content: `📈 **Rentabilité**\n\nConsultez la page **Rentabilité** pour une estimation des revenus potentiels de votre véhicule en location.\n\nRebellion Luxury propose une **estimation gratuite et sans engagement**.\n\n📱 Pour en savoir plus : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Réseaux (général)
  if (lm.includes("réseaux") || lm.includes("reseaux") || lm.includes("suivre")) {
    return { content: `📱 **Nos réseaux**\n\n• **Instagram :** ${CONTACT.instagramUrl}\n• **Facebook :** ${CONTACT.facebookUrl}\n• **TikTok :** ${CONTACT.tiktokUrl}\n\nPour **réserver** : **WhatsApp** au **${CONTACT.phone}** — le plus rapide !` + whatsappCta() };
  }

  // Fallback — point #3 : guide vers les bonnes pages du site
  return {
    content: `Je n'ai pas trouvé de réponse précise à votre question.\n\nVoici les principales rubriques du site :\n\n• **Véhicules** : fiches détaillées, tarifs, disponibilités\n• **Calculer le prix** : estimation interactive\n• **Loue ton véhicule** : rentabiliser votre supercar\n• **Transport** : infos livraison\n• **Contact** : nous joindre\n\nReformulez votre question ou consultez directement ces pages via le menu !`,
  };
};

const AIAssistant = ({ isOpen, onToggle, initialMessage }: AIAssistantProps) => {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { vehicleContext } = useChat();

  const welcomeContent = vehicleContext
    ? (user?.firstName
        ? `Bonjour **${user.firstName}**, vous avez cliqué sur la **${vehicleContext.vehicleName}**.\n\nJe connais tout le site sur le bout des doigts — posez-moi toutes les questions imaginables !`
        : `Bonjour, vous avez cliqué sur la **${vehicleContext.vehicleName}**.\n\nJe connais tout le site sur le bout des doigts — posez-moi toutes les questions imaginables !`)
    : user?.firstName
      ? `👋 Bienvenue, **${user.firstName}** ! Je suis **Rebellion IA**.\n\nJe connais tout le site sur le bout des doigts — posez-moi toutes les questions imaginables sur nos supercars, les tarifs, les réservations ou tout autre sujet !`
      : "👋 Bienvenue ! Je suis **Rebellion IA**.\n\nJe connais tout le site sur le bout des doigts — posez-moi toutes les questions imaginables sur nos supercars, les tarifs, les réservations ou tout autre sujet !";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeContent,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (vehicleContext) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: user?.firstName
            ? `Bonjour **${user.firstName}**, vous avez cliqué sur la **${vehicleContext.vehicleName}**.\n\nJe connais tout le site sur le bout des doigts — posez-moi toutes les questions imaginables !`
            : `Bonjour, vous avez cliqué sur la **${vehicleContext.vehicleName}**.\n\nJe connais tout le site sur le bout des doigts — posez-moi toutes les questions imaginables !`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [vehicleContext?.vehicleName]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, isOpen]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      aiMessages.push({ role: "user", content: userMessage.content });

      const result = await sendMessageToAI(aiMessages, vehicleContext?.vehicleName ?? null);
      const content = typeof result === "string" ? result : result.content;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    handleSendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Markdown-like rendering : gras **text** et liens cliquables [text](url)
  const renderContent = (content: string) => {
    const parts: React.ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = re.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
      }
      const seg = match[1];
      if (seg.startsWith("**") && seg.endsWith("**")) {
        parts.push(<strong key={key++} className="font-semibold text-foreground">{seg.slice(2, -2)}</strong>);
      } else if (seg.startsWith("[") && seg.includes("](")) {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(seg);
        if (m) {
          parts.push(
            <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
              {m[1]}
            </a>
          );
        } else parts.push(seg);
      } else parts.push(seg);
      lastIndex = re.lastIndex;
    }
    if (lastIndex < content.length) parts.push(<span key={key++}>{content.slice(lastIndex)}</span>);
    return parts.length > 0 ? <>{parts}</> : content;
  };

  return (
    <>
      {/* Floating Button + label Rebellion IA */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5 pb-[env(safe-area-inset-bottom)]"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggle}
              className="relative w-14 h-14 min-w-[56px] min-h-[56px] sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center touch-manipulation
                bg-black
                border-2 border-black/80
                shadow-[0_4px_24px_rgba(0,0,0,.4),0_0_0_1px_rgba(0,0,0,.1)]
                hover:shadow-[0_8px_32px_rgba(0,0,0,.5),0_0_0_1px_rgba(0,0,0,.15)]
                hover:border-foreground/20 transition-all duration-300"
            >
              {/* Logo Rebellion Luxury — rond noir élégant */}
              <img
                src="/rebellion-luxury-logo.png"
                alt="Rebellion Luxury"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain p-1.5"
              />
            </motion.button>
            <motion.span
              className="label-rebellion-ia text-sm text-primary whitespace-nowrap"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              Rebellion IA
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window — plein écran sur mobile, fenêtre sur desktop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 flex flex-col overflow-hidden touch-manipulation
              sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[min(700px,calc(100dvh-3rem))] sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:glass-card
              inset-0 w-full h-[100dvh] rounded-none bg-background
            `}
            style={{
              boxShadow: isMobile ? "none" : "0 0 40px hsl(0 0% 100% / 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: isMobile ? "none" : "1px solid hsl(0 0% 100% / 0.2)"
            }}
          >
            {/* Header — branding Rebellion Luxury avec logo (point #2) */}
            <div className="flex items-center justify-between p-4 sm:p-5 pt-[max(1rem,env(safe-area-inset-top))] border-b border-border bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shrink-0">
              <div className="flex items-center gap-3">
                {/* Logo Rebellion Luxury au lieu d'une icône générique */}
                <motion.div 
                  className="w-11 h-11 rounded-full overflow-hidden shrink-0
                    bg-gradient-to-br from-white/20 to-white/5
                    border-2 border-white/35
                    ring-2 ring-white/20 ring-offset-2 ring-offset-background
                    shadow-[0_0_16px_hsl(0_0%_100%_/_.2),inset_0_1px_0_hsl(0_0%_100%_/_.1)]"
                  animate={{ 
                    boxShadow: [
                      "0 0 14px hsl(0 0% 100% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
                      "0 0 24px hsl(0 0% 100% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
                      "0 0 14px hsl(0 0% 100% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.1)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <img
                    src="/rebellion-luxury-logo.png"
                    alt="Rebellion Luxury"
                    className="w-full h-full object-contain p-1.5"
                  />
                </motion.div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                    <span className="text-gradient-orange">Rebellion</span> Luxury
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Assistant IA
                  </span>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages — min-h-0 pour que le scroll fonctionne avec flex */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 overscroll-contain">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
                      message.role === "user"
                        ? "bg-muted"
                        : "border border-border"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-foreground" />
                    ) : (
                      <img src="/rebellion-luxury-logo.png" alt="Rebellion Luxury" className="w-full h-full object-contain" />
                    )}
                  </div>
                  {/* Suggestions supprimées des bulles (point #2) */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-muted text-foreground rounded-br-md"
                        : "bg-card border border-border text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {renderContent(message.content)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-border">
                    <img src="/rebellion-luxury-logo.png" alt="Rebellion Luxury" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      />
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                      />
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input — text-base (16px) évite le zoom iOS au focus */}
            {/* Suggestions rapides supprimées (point #2) — champ texte libre uniquement */}
            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border bg-card/50 shrink-0">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez toute question..."
                  autoComplete="off"
                  className="flex-1 bg-muted rounded-xl px-4 py-3.5 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground touch-manipulation"
                />
                <Button
                  variant="hero"
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-[44px] min-h-[44px] w-12 rounded-xl touch-manipulation"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* WhatsApp toujours visible */}
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium text-sm transition-colors touch-manipulation"
                aria-label="Contacter par WhatsApp"
              >
                <IoLogoWhatsapp className="w-5 h-5 shrink-0" />
                Contacter par WhatsApp
              </a>

              <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                Propulsé par Rebellion IA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
