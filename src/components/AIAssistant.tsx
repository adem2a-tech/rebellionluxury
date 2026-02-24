import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IoLogoWhatsapp } from "react-icons/io5";
import { useUser } from "@/contexts/UserContext";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "./ui/button";
import { CONTACT, CONDITIONS, BOBOLOC_VEHICLES_URL, SITE_INFO } from "@/data/chatKnowledge";
import { getAllVehicles, getVehicleBySlug, type VehicleData } from "@/data/vehicles";
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

/** Dernier véhicule mentionné dans la conversation (pour les questions de suivi sans le redire). */
function getLastMentionedVehicle(messages: { role: string; content: string }[]): { slug: string; name: string } | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const match = findVehicleByQuery(messages[i].content);
    if (match) return match;
  }
  return null;
}

/** Message court / suivi (prix, durée, réservation) sans nom de véhicule → on garde le contexte. */
function looksLikeFollowUp(text: string, hasPriceOrRentIntent: boolean): boolean {
  const t = text.toLowerCase().trim();
  if (t.length > 55) return false;
  if (hasPriceOrRentIntent) return true;
  const followUpStart = /^(et |pour |combien|le prix|son prix|ça fait|et pour|pour 2 jours|pour 3 jours|et pour 2|réserver|louer|tarif|estimation|dis[- ]?moi|c'est quoi le)\b/i;
  const followUpWord = /\b(prix|tarif|combien|coût|cout|réserver|louer|2 jours|3 jours|week-?end|semaine|caution|dispo|chevaux|ch\b|cv\b|boîte|boite|transmission|auto|manuel)\b/i;
  return followUpStart.test(t) || followUpWord.test(t);
}

/** Formatte les infos complètes d’un véhicule (flotte base + Espace pro) pour l’IA. */
function formatVehicleFullInfo(v: VehicleData): string {
  const power = v.specs?.power ?? "—";
  const transmission = v.specs?.transmission || v.transmission || v.boite || "—";
  const year = v.specs?.year ?? v.year ?? "—";
  const category = v.specs?.type || v.category || "—";
  const caution = v.specs?.caution ?? "—";
  const priceDay = v.pricePerDay ? `Dès **${v.pricePerDay} CHF**/jour` : "Sur demande";
  const p24 = v.pricing?.[0];
  const kmInclus = p24?.km ?? "200 km";
  const extraKm = v.extraKmPriceChf ?? 5;
  const desc = (v.description || "").slice(0, 140) + (v.description && v.description.length > 140 ? "…" : "");
  const lines = [
    desc ? `${desc}\n\n` : "",
    `• **Puissance :** ${power}`,
    `• **Boîte / transmission :** ${transmission}`,
    `• **Année :** ${year}`,
    `• **Type :** ${category}`,
    `• **Prix :** ${priceDay} — forfaits 24h, week-end, semaine, mois sur la fiche`,
    `• **Caution :** ${caution}`,
    `• **Km inclus (24h) :** ${kmInclus} — au-delà : **${extraKm} CHF/km**`,
  ].filter(Boolean);
  return lines.join("\n");
}

// Réponses IA basées sur les données du site (chatKnowledge)
// Point #3 : L'IA guide vers les pages du site au lieu d'inventer des infos
const sendMessageToAI = async (
  messages: { role: string; content: string }[],
  vehicleName?: string | null
): Promise<{ content: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const lastMessage = messages[messages.length - 1].content.toLowerCase().trim();
  const lm = lastMessage;
  const fleet = getAllVehicles();
  let vehicleMatch = findVehicleByQuery(messages[messages.length - 1].content);
  const hasPriceIntent = /combien|prix|tarif|coût|cout|estimation|cher/.test(lm);
  const hasRentIntent = /louer|réserver|reserver|louez/.test(lm);
  const contextVehicle = getLastMentionedVehicle(messages.slice(0, -1));
  if (!vehicleMatch && contextVehicle && looksLikeFollowUp(messages[messages.length - 1].content, hasPriceIntent || hasRentIntent)) {
    vehicleMatch = contextVehicle;
  }

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

  // Qui es-tu / que peux-tu faire / aide — flotte à jour (base + véhicules ajoutés via Espace pro)
  if (
    lm.includes("qui es-tu") ||
    lm.includes("qui es tu") ||
    lm.includes("que peux-tu") ||
    /^(aide|help|\?|aider moi)[\s!.]*$/i.test(lm)
  ) {
    const vehicleList = fleet.length ? fleet.map((v) => v.name).join(", ") : "Audi R8, McLaren 570S, Maserati…";
    return {
      content: `Je suis **Rebellion IA**, votre assistant. Je connais tout le site sur le bout des doigts ! Je peux vous renseigner sur : véhicules (${vehicleList}), tarifs, réservations, disponibilités, transport, conditions. Posez-moi vos questions !`,
    };
  }

  // Prix pour un véhicule précis — utilise la flotte dynamique (ou le véhicule en contexte)
  if (vehicleMatch && hasPriceIntent) {
    const v = getVehicleBySlug(vehicleMatch.slug);
    if (v) {
      const priceDay = v.pricePerDay ? `**Dès ${v.pricePerDay} CHF/jour**` : "sur demande";
      const caution = v.specs?.caution ?? "—";
      const p24 = v.pricing?.[0];
      const km = p24?.km ?? "200 km";
      const extraKm = v.extraKmPriceChf ?? 5;
      const summary = `Pour la **${v.name}** : ${priceDay} — caution ${caution} — ${km} inclus, au-delà ${extraKm} CHF/km.`;
      return {
        content: `💰 **Prix de la ${v.name}**\n\n${summary}\n\nTous les forfaits (24h, week-end, semaine, mois) sont sur la fiche :\n👉 **Menu "Véhicules" → ${v.name}**\n\nOu **Calculez le prix** pour une estimation selon la durée.` + whatsappCta(),
      };
    }
    return {
      content: `💰 **Prix**\n\nConsultez la fiche du véhicule pour les tarifs détaillés :\n👉 **Menu "Véhicules" → ${vehicleMatch.name}**\n\nOu utilisez **Calculez le prix** pour une estimation.` + whatsappCta(),
    };
  }

  // ——— 1. LOUER SON PROPRE VÉHICULE (particulier : rentabiliser sa voiture) ———
  const wantsToRentHisOwn =
    lm.includes("louer mon") ||
    lm.includes("louer ma ") ||
    lm.includes("louer le mien") ||
    lm.includes("rentabiliser mon") ||
    lm.includes("rentabiliser ma") ||
    lm.includes("mettre mon véhicule") ||
    lm.includes("mettre ma voiture") ||
    lm.includes("mettre ma supercar") ||
    lm.includes("louer ma voiture") ||
    lm.includes("louer ma supercar") ||
    lm.includes("proposer mon véhicule") ||
    lm.includes("particulier") && (lm.includes("louer") || lm.includes("rentabiliser")) ||
    lm.includes("j ai une") && (lm.includes("louer") || lm.includes("rentabiliser")) ||
    lm.includes("j'ai une") && (lm.includes("louer") || lm.includes("rentabiliser"));
  if (wantsToRentHisOwn) {
    return {
      content: `🚗 **Louer votre propre véhicule**\n\nVous voulez **rentabiliser votre supercar** ? Rebellion Luxury gère tout pour vous :\n\n• Revenus passifs • Gestion complète • Shooting photo/vidéo • Forte visibilité\n\n👉 **Menu « Loue ton véhicule »** — remplissez le formulaire et envoyez les photos de votre véhicule. Nous vous recontactons par WhatsApp.\n\n📱 Ou contactez-nous au **${CONTACT.phone}** pour en parler.` + whatsappCta(),
    };
  }

  // Bloc existant "Loue ton véhicule" (rentabiliser, catalogue particuliers, etc.)
  if (
    lm.includes("loue ton") || lm.includes("rentabiliser") ||
    lm.includes("mettre en location") || lm.includes("particulier") || lm.includes("catalogue des particuliers") ||
    lm.includes("véhicule hors") || lm.includes("hors rebellion")
  ) {
    return { content: `🚗 **Loue ton véhicule**\n\nVous souhaitez **rentabiliser votre véhicule** ? Rebellion Luxury propose un service de conciergerie automobile premium :\n\n• Revenus passifs mensuels\n• Gestion complète (location, sinistres, nettoyage)\n• Shooting photo & vidéo offerts\n• Forte visibilité sur nos réseaux\n• Conditions : véhicule homologué, assuré, expertisé\n\n📋 **Comment procéder :**\n1. Remplissez le formulaire sur **Loue ton véhicule**\n2. Envoyez des photos de votre véhicule\n3. Nous vous recontactons par WhatsApp ou téléphone\n\n• Maximum 3 demandes par jour\n• Consultez vos demandes sur **Voir mes demandes**\n\n📱 **WhatsApp** : **${CONTACT.phone}**` + whatsappCta() };
  }

  // ——— 2. LOUER NOS VÉHICULES (client veut réserver une supercar Rebellion) ———
  const wantsToRent =
    lm.includes("louer") ||
    lm.includes("louez") ||
    lm.includes("réserver") ||
    lm.includes("reserver") ||
    (lm.includes("oui") && (lm.includes("louer") || lm.includes("réserver"))) ||
    (lm.includes("souhaite") && (lm.includes("louer") || lm.includes("réserver"))) ||
    (lm.includes("comment") && (lm.includes("faire") || lm.includes("réserver"))) ||
    lm.includes("vos véhicules") ||
    lm.includes("votre flotte") ||
    lm.includes("une de vos");

  if (vehicleName && wantsToRent) {
    const list = RESERVATION_DOCS.map((d) => `• **${d}**`).join("\n");
    return { content: `📋 **Formulaire pour réserver le véhicule**\n\nVoici ce dont nous avons besoin :\n\n${list}\n\nUne fois tout rempli, **une personne vous contactera par WhatsApp ou par téléphone** pour confirmer votre réservation.\n\n📱 Envoyez-nous vos documents sur **WhatsApp** au **${CONTACT.phone}** ou cliquez sur le bouton vert en bas pour nous joindre.` };
  }

  if ((lm.includes("louer") || lm.includes("louez")) && vehicleMatch) {
    const isBestSeller = vehicleMatch.name.toLowerCase().includes("mclaren") && vehicleMatch.name.includes("570");
    const extra = isBestSeller ? " (notre best seller)" : "";
    return { content: `📱 **Pour louer la ${vehicleMatch.name}**${extra}, contactez-nous sur **WhatsApp** au **${CONTACT.phone}**.\n\n**Disponibilités :** [Voir les disponibilités](${BOBOLOC_VEHICLES_URL})\n\n👉 Menu **Véhicules** → ${vehicleMatch.name} pour les tarifs. Nous vous accompagnons pour finaliser ! 🏎️` + whatsappCta() };
  }

  if (wantsToRent) {
    const vehicleList = fleet.length ? fleet.map((v) => v.name).join(", ") : "Audi R8, McLaren 570S, Maserati…";
    return {
      content: `🏎️ **Louer une de nos supercars**\n\nNotre flotte : **${vehicleList}**.\n\n👉 **Menu « Véhicules »** — catalogue, fiches détaillées et tarifs\n👉 **Disponibilités :** [Voir les disponibilités](${BOBOLOC_VEHICLES_URL})\n\n📱 Pour réserver : **WhatsApp** au **${CONTACT.phone}** — nous finalisons avec vous !` + whatsappCta(),
    };
  }

  // Contact WhatsApp
  if (lm.includes("whatsapp") || (lm.includes("contact") && lm.includes("whatsapp"))) {
    return { content: `📱 **Contact WhatsApp**\n\nEnvoyez-nous un message au **${CONTACT.phone}** ou cliquez sur le bouton vert « Contacter par WhatsApp » en bas du chat — nous répondons rapidement !` + whatsappCta() };
  }

  // Contact Instagram
  if (lm.includes("instagram")) {
    return { content: `📸 **Nous suivre sur Instagram**\n\nRetrouvez nos supercars et l'actualité Rebellion Luxury : ${CONTACT.instagramUrl}\n\n📱 **Pour réserver :** WhatsApp au **${CONTACT.phone}** — le plus simple pour finaliser une location !` + whatsappCta() };
  }

  // Questions ciblées sur un véhicule (chevaux, boîte, transmission, caractéristiques) — flotte + Espace pro → TOUT donner
  const asksSpecs =
    /\b(chevaux|ch\b|cv\b|puissance|puissant)\b/i.test(lm) ||
    /\b(boîte|boite|transmission|auto|manuel|automatique|manuelle|séquentielle|vitesses)\b/i.test(lm) ||
    /\b(caractéristiques|caracteristiques|fiche|specs|spec\b|année|annee|type)\b/i.test(lm) ||
    /\b(combien de ch|elle a quoi|il a quoi|c'est quoi la boîte)\b/i.test(lm);
  if (vehicleMatch && asksSpecs) {
    const v = getVehicleBySlug(vehicleMatch.slug);
    if (v) {
      const fullInfo = formatVehicleFullInfo(v);
      return { content: `🏎️ **${v.name}** — tout ce que j'ai :\n\n${fullInfo}\n\n👉 Fiche complète et dispo : Menu "Véhicules" → ${v.name}.` + whatsappCta() };
    }
  }

  // Info sur un véhicule — reconnu dynamiquement (flotte base + véhicules Espace pro) → fiche complète avec chevaux, boîte, prix, tout
  if (vehicleMatch) {
    const v = getVehicleBySlug(vehicleMatch.slug);
    if (v) {
      const fullInfo = formatVehicleFullInfo(v);
      return { content: `🏎️ **${v.name}**\n\n${fullInfo}\n\n👉 **Fiche complète et disponibilités :** Menu "Véhicules" → ${v.name}\n\nPour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
    }
  }

  // Calcul de prix / estimation — guide vers l'outil dédié
  const asksPriceCalc =
    lm.includes("calcul") ||
    lm.includes("combien") ||
    lm.includes("estimation") ||
    lm.includes("prix pour") ||
    lm.includes("coût") ||
    lm.includes("cout ");
  if (asksPriceCalc) {
    return {
      content: `💰 **Calculer le prix**\n\nJe n'ai pas le détail des tarifs ici. **Allez ici** pour une estimation précise :\n\n👉 **Menu "Véhicules" → Calculez le prix** (véhicule, date, durée, km, transport)\n\nOu consultez la fiche du véhicule pour les forfaits. Pour une question précise : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta(),
    };
  }

  // Tarifs — guide vers les pages véhicules + liste dynamique de la flotte
  if (lm.includes("prix") || lm.includes("tarif")) {
    const vehicleNames = fleet.length ? fleet.map((v) => v.name).join(", ") : "Audi R8, McLaren 570S, Maserati…";
    return { content: `💰 **Nos tarifs**\n\nJe n'ai pas les grilles ici. **Voici où les voir :**\n\n👉 **Menu "Véhicules"** — fiches (${vehicleNames}) et **Calculez le prix** pour une estimation\n\n📱 **WhatsApp** au **${CONTACT.phone}** pour une estimation sur mesure.` + whatsappCta() };
  }

  // Disponibilités — si un véhicule est mentionné → lien direct vers SES dispo (ou page générale)
  const asksAvailability =
    lm.includes("disponib") ||
    lm.includes("dispo") ||
    lm.includes("libre") ||
    lm.includes("disponible") ||
    (lm.includes("date") && (lm.includes("réserver") || lm.includes("louer")));
  if (asksAvailability && vehicleMatch) {
    const v = getVehicleBySlug(vehicleMatch.slug);
    const dispoUrl = v?.availabilityUrl || BOBOLOC_VEHICLES_URL;
    if (v?.availabilityUrl) {
      return {
        content: `📅 **Dispo de la ${v.name}**\n\nJe n'ai pas les dispos en direct ici. **Ouvrez ce lien** pour voir les disponibilités en temps réel de la **${v.name}** :\n\n👉 [Voir les disponibilités ${v.name}](${dispoUrl})\n\nVous verrez le calendrier sur Boboloc. Pour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta(),
      };
    }
    return {
      content: `📅 **Dispo de la ${v?.name ?? vehicleMatch.name}**\n\nJe n'ai pas les dispos en direct ici. **Ouvrez ce lien** pour voir toutes nos disponibilités (la **${v?.name ?? vehicleMatch.name}** est dans la liste) :\n\n👉 [Voir toutes les disponibilités](${BOBOLOC_VEHICLES_URL})\n\nPour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta(),
    };
  }
  if (asksAvailability) {
    return {
      content: `📅 **Disponibilités en temps réel**\n\nJe n'ai pas les dispos ici. **Ouvrez ce lien** pour voir le calendrier sur Boboloc :\n\n👉 [Voir les disponibilités](${BOBOLOC_VEHICLES_URL})\n\nPour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta(),
    };
  }

  // Flotte / véhicules / supercars — liste à jour avec chevaux, boîte, prix (base + Espace pro)
  if (lm.includes("véhicule") || lm.includes("vehicule") || lm.includes("flotte") || lm.includes("supercar") || lm.includes("voiture") || lm.includes("quels véhicules")) {
    const lines = fleet.length
      ? fleet.map((v, i) => {
          const power = v.specs?.power ?? "—";
          const trans = v.specs?.transmission || v.transmission || v.boite || "—";
          const price = v.pricePerDay ? `Dès ${v.pricePerDay} CHF/jour` : "Sur demande";
          return `${i + 1}️⃣ **${v.name}** — ${power} • Boîte **${trans}** • ${price} • ${(v.description || "").slice(0, 45)}…`;
        }).join("\n\n")
      : "Consultez le menu **Véhicules** pour le catalogue à jour.";
    return { content: `🚗 **Notre flotte:**\n\n${lines}\n\nBasés en **${CONTACT.location}**. Chaque véhicule a sa fiche (chevaux, boîte, tarifs, caution, km).` + whatsappCta() };
  }

  // Questions générales : "vous avez des manuelles ?", "quelles voitures en auto ?", "liste des véhicules avec leur boîte"
  const asksBoiteGeneral = /\b(auto|manuel|automatique|manuelle|boîte|boite|transmission)\b/i.test(lm) && !vehicleMatch;
  if (asksBoiteGeneral && fleet.length > 0) {
    const byTrans = fleet.map((v) => {
      const trans = v.specs?.transmission || v.transmission || v.boite || "—";
      const power = v.specs?.power ?? "—";
      return `• **${v.name}** — ${power} • Boîte **${trans}**`;
    }).join("\n");
    return { content: `🏎️ **Par véhicule :**\n\n${byTrans}\n\nDétails complets : Menu **Véhicules** → fiche de chaque modèle.` + whatsappCta() };
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

  // Âge minimum / permis — cautions depuis la flotte
  if (lm.includes("âge") || lm.includes("age") || lm.includes("ans") && (lm.includes("minimum") || lm.includes("avoir")) || lm.includes("permis") && lm.includes("année")) {
    const cautionLine = fleet.length
      ? fleet.slice(0, 3).map((v) => `${v.name} : ${v.specs?.caution ?? "—"}`).join(", ")
      : "Audi R8 : 3'000 CHF, McLaren 570S : 10'000 CHF";
    return { content: `📋 **Conditions d'âge & permis**\n\n• **Âge minimum :** ${SITE_INFO.minAge} ans\n• **Permis de conduire :** valide, détenu depuis au moins ${SITE_INFO.minPermitYears} ans\n• **Documents requis :** pièce d'identité, permis, justificatif de domicile\n• **Caution :** par carte bancaire (${cautionLine})\n\n📱 Pour réserver : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Caution / garantie — flotte dynamique
  if (lm.includes("caution") || lm.includes("garantie") || lm.includes("dépôt") || lm.includes("depot")) {
    const cautions = fleet.length
      ? fleet.map((v) => `• **${v.name}** : ${v.specs?.caution ?? "À définir"}`).join("\n")
      : "• **Audi R8** : 3'000 CHF\n• **McLaren 570S** : 10'000 CHF";
    return { content: `🔒 **Caution**\n\n${cautions}\n\nLa caution est bloquée par carte bancaire. Elle est libérée à la restitution du véhicule dans l'état convenu.\n\n📱 Questions ? **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Km inclus / kilométrage — flotte dynamique
  if (lm.includes("km") && (lm.includes("inclus") || lm.includes("forfait") || lm.includes("kilom")) || lm.includes("kilometrage")) {
    const kmInfo = fleet.length
      ? fleet.map((v) => {
          const p24 = v.pricing?.[0];
          const km = p24?.km ?? "200 km";
          const extra = v.extraKmPriceChf ?? 5;
          return `• **${v.name}** — 24 h : ${km} inclus. Km suppl. : ${extra} CHF/km`;
        }).join("\n")
      : "Consultez les fiches véhicules pour les km inclus.";
    return { content: `📏 **Kilométrage inclus**\n\n${kmInfo}\n\nForfaits : 24 h, week-end court/long, semaine courte/complète, mois. Utilisez le calculateur pour une estimation précise.\n\n📱 **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
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

  // À propos / qui êtes-vous / rebellion luxury — flotte à jour
  if (
    lm.includes("à propos") || lm.includes("a propos") || lm.includes("qui êtes-vous") || lm.includes("c est quoi") ||
    lm.includes("rebellion luxury") || lm.includes("rebellion luxe") || lm.includes("présentation")
  ) {
    const flotteList = fleet.length ? fleet.map((v) => v.name).join(", ") + " (+ catalogue particuliers)" : "Audi R8, McLaren 570S (+ catalogue particuliers)";
    return { content: `🏎️ **Rebellion Luxury**\n\nEntreprise de **location de véhicules haut de gamme** en Valais, spécialisée en supercars et sportives.\n\n• **Flotte :** ${flotteList}\n• **Zone :** Suisse romande — siège à Evionnaz\n• **Services :** location, transport sur plateau, conciergerie (Loue ton véhicule)\n• **Assurance & entretien** inclus, qualité premium\n\nPage complète : **À propos**` + whatsappCta() };
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

  // Paiement / acompte — cautions depuis la flotte
  if (lm.includes("paiement") || lm.includes("payer") || lm.includes("acompte") || lm.includes("carte bancaire")) {
    const cautionLine = fleet.length
      ? fleet.slice(0, 3).map((v) => `${v.name} : ${v.specs?.caution ?? "—"}`).join(", ")
      : "Audi : 3'000 CHF, McLaren : 10'000 CHF";
    return { content: `💳 **Paiement**\n\n• **Acompte obligatoire** pour réserver le véhicule\n• **Caution** par carte bancaire (${cautionLine})\n• Détails des modalités lors de la réservation\n\n📱 **WhatsApp** au **${CONTACT.phone}** pour convenir des détails.` + whatsappCta() };
  }

  // Assurance
  if (lm.includes("assurance")) {
    return { content: `🛡️ **Assurance**\n\nTous nos véhicules sont **entièrement assurés**. Mécanique et entretien inclus pour une tranquillité d'esprit totale.\n\n📱 Questions spécifiques : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Suisse / étranger / frontière
  if (lm.includes("suisse") || lm.includes("étranger") || lm.includes("etranger") || lm.includes("frontière") || lm.includes("sortir")) {
    return { content: `🇨🇭 **Zone de circulation**\n\nLe véhicule doit **rester en Suisse** sauf accord préalable.\n\nNous sommes basés en **Suisse romande** (Evionnaz, Valais). Livraison possible partout en Suisse romande (transport au km).\n\n📱 Pour une exception (sortie Suisse) : contactez-nous au **${CONTACT.phone}**.` + whatsappCta() };
  }

  // Comparaison entre deux véhicules — données depuis la flotte
  if ((lm.includes("audi") || lm.includes("r8")) && (lm.includes("mclaren") || lm.includes("570")) && !lm.includes("louer")) {
    const audi = fleet.find((v) => v.name.toLowerCase().includes("audi"));
    const mclaren = fleet.find((v) => v.name.toLowerCase().includes("mclaren"));
    const aLine = audi ? `**${audi.name}** — Dès ${audi.pricePerDay || "?"} CHF/jour • ${audi.specs?.power ?? "—"} • Portes conventionnelles` : "**Audi R8 V8** — Dès 470 CHF/jour • 420 CH";
    const mLine = mclaren ? `**${mclaren.name}** — Dès ${mclaren.pricePerDay || "?"} CHF/jour • ${mclaren.specs?.power ?? "—"} • Portes papillon` : "**McLaren 570S** — Dès 950 CHF/jour • 570 CH";
    return { content: `⚖️ **Comparaison**\n\n${aLine}\n\n${mLine}\n\nDétails et tarifs complets sur **Véhicules**.\n\n📱 Pour choisir selon vos dates : **WhatsApp** au **${CONTACT.phone}**.` + whatsappCta() };
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

  // Fallback — on n'a pas reconnu la question : guider clairement, jamais sans issue
  const vehicleList = fleet.length ? fleet.map((v) => v.name).join(", ") : "Audi R8, McLaren 570S, Maserati…";
  return {
    content: `Désolé, je n'ai pas plus d'info sur ça ici. **Voici où aller :**\n\n• **Véhicules / tarifs / dispo** → Menu **Véhicules** ou [Voir les disponibilités](${BOBOLOC_VEHICLES_URL})\n• **Louer une supercar** (${vehicleList}) → **WhatsApp** au **${CONTACT.phone}**\n• **Rentabiliser votre voiture** → Menu **Loue ton véhicule**\n\nPour une question précise, écrivez-moi (ex. « prix R8 », « dispo McLaren », « contact ») ou contactez-nous au **${CONTACT.phone}**.` + whatsappCta(),
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggle}
              className="relative w-14 h-14 min-w-[56px] min-h-[56px] sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center touch-manipulation
                bg-transparent shadow-[0_4px_20px_rgba(0,0,0,.4)]
                hover:shadow-[0_8px_28px_rgba(0,0,0,.5)] transition-all duration-300"
            >
              <span className="logo-round w-full h-full flex items-center justify-center">
                <img
                  src="/rebellion-luxury-logo.png"
                  alt="Rebellion Luxury"
                  className="w-full h-full object-contain"
                />
              </span>
            </motion.button>
            <span className="font-sans text-xs font-medium tracking-wide text-white/80 whitespace-nowrap">
              Rebellion IA
            </span>
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
              boxShadow: isMobile ? "none" : "0 0 0 1px hsl(0 0% 100% / 0.08), 0 24px 48px -12px rgba(0,0,0,0.5)",
              border: isMobile ? "none" : "1px solid hsl(0 0% 100% / 0.06)"
            }}
          >
            {/* Header — premium sobriété */}
            <div className="flex items-center justify-between p-4 sm:p-5 pt-[max(1rem,env(safe-area-inset-top))] border-b border-white/[0.06] bg-black/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="logo-round flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-transparent p-0">
                  <img
                    src="/rebellion-luxury-logo.png"
                    alt="Rebellion Luxury"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold tracking-wide text-white">
                    Rebellion Luxury
                  </h3>
                  <span className="font-sans text-[11px] text-white/50 flex items-center gap-1.5 tracking-wide uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                    Assistant IA
                  </span>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                      message.role === "user"
                        ? "bg-white/10 border border-white/[0.08]"
                        : "logo-round border border-white/[0.08] bg-transparent"
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
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-white/10 text-foreground rounded-br-md"
                        : "bg-white/[0.04] border border-white/[0.06] text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="font-sans text-sm leading-relaxed whitespace-pre-line">
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
                  <div className="logo-round w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-white/[0.08] bg-transparent">
                    <img src="/rebellion-luxury-logo.png" alt="Rebellion Luxury" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-white/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                      />
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-white/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                      />
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-white/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions rapides — visible au démarrage */}
            {messages.length <= 1 && (
              <div className="px-4 pt-1 pb-2 flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage("Question sur notre nouveau véhicule")}
                  className="font-sans text-xs px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Question sur notre nouveau véhicule
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Quels véhicules proposez-vous ?")}
                  className="font-sans text-xs px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Quels véhicules proposez-vous ?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Quels sont vos tarifs ?")}
                  className="font-sans text-xs px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Quels sont vos tarifs ?
                </button>
              </div>
            )}

            {/* Input — premium sobriété */}
            <div className="border-t border-white/[0.06] bg-black/30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  autoComplete="off"
                  className="font-sans flex-1 rounded-xl border border-white/[0.08] bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/40 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white/20 touch-manipulation"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-[44px] min-h-[44px] w-12 shrink-0 rounded-xl bg-white text-black hover:bg-white/95 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] touch-manipulation"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>

              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium text-sm transition-colors touch-manipulation"
                aria-label="Contacter par WhatsApp"
              >
                <IoLogoWhatsapp className="h-5 w-5 shrink-0" />
                Contacter par WhatsApp
              </a>

              <p className="font-sans mt-2 text-center text-[11px] tracking-wide text-white/40">
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
