# Obtenir un lien pour le site (urgent)

**Le site est déjà construit** : le dossier **`dist`** est prêt. Tu peux directement utiliser la méthode 1 (glisser `dist` sur Netlify) ou lancer une des commandes ci-dessous.

---

## Méthode 1 : Netlify Drop (le plus rapide, ~1 min)

1. **Si besoin de reconstruire** (sinon le dossier `dist` existe déjà) :
   ```bash
   npm run build
   ```
2. Un dossier **`dist`** est créé (ou déjà présent).

2. **Aller sur Netlify Drop**  
   Ouvrir : **https://app.netlify.com/drop**

3. **Glisser-déposer**  
   Glisser le dossier **`dist`** (tout le dossier) dans la page.  
   Un lien du type **https://xxx.netlify.app** s’affiche tout de suite.

4. **Compte**  
   Créer un compte Netlify (gratuit) si demandé. Le lien reste actif.

---

## Méthode 2 : Vercel (lien en 1 commande)

1. **Dans ce dossier**, ouvrir un terminal et taper :
   ```bash
   npx vercel
   ```
2. Suivre les questions (connexion Vercel si besoin).
3. À la fin, un lien **https://xxx.vercel.app** est affiché.

---

## Méthode 3 : Surge (très rapide)

1. Construire : `npm run build`
2. Lancer : `npx surge dist`
3. Suivre les instructions (email, mot de passe une première fois).
4. Un lien **https://xxx.surge.sh** est généré.

---

## Résumé

| Méthode   | Commande / action              | Lien obtenu      |
|----------|---------------------------------|-------------------|
| Netlify  | `npm run build` puis glisser `dist` sur app.netlify.com/drop | xxx.netlify.app   |
| Vercel   | `npx vercel`                    | xxx.vercel.app    |
| Surge    | `npm run build` puis `npx surge dist` | xxx.surge.sh      |

**Le plus simple pour un seul lien tout de suite :** Méthode 1 (Netlify Drop).
