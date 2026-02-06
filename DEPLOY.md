# Mettre le site en ligne

Ce projet est prêt à être déployé. Voici les options les plus simples (gratuites).

---

## Option 1 : Vercel (recommandé)

1. **Crée un compte** sur [vercel.com](https://vercel.com) (gratuit avec GitHub/GitLab/Email).

2. **Pousse ton code sur GitHub** (si ce n’est pas déjà fait) :
   - Crée un dépôt sur [github.com](https://github.com/new)
   - Dans le dossier du projet, exécute :
   ```bash
   git init
   git add .
   git commit -m "Prêt pour déploiement"
   git branch -M main
   git remote add origin https://github.com/TON-USERNAME/TON-REPO.git
   git push -u origin main
   ```

3. **Déploie sur Vercel** :
   - Va sur [vercel.com/new](https://vercel.com/new)
   - Clique sur **Import Git Repository** et choisis ton dépôt
   - Vercel détecte automatiquement Vite (le fichier `vercel.json` est déjà configuré)
   - Clique sur **Deploy**

4. Ton site sera en ligne à une adresse du type : `https://ton-projet.vercel.app`

---

## Option 2 : Netlify

1. **Crée un compte** sur [netlify.com](https://netlify.com).

2. **Déploie** :
   - Va sur [app.netlify.com/start](https://app.netlify.com/start)
   - Connecte ton dépôt GitHub/GitLab (ou utilise **Drag & drop** avec le dossier `dist` après un build)
   - Si tu connectes Git : Netlify utilisera `netlify.toml` (commande : `npm run build`, dossier : `dist`)
   - Clique sur **Deploy**

3. Ton site sera en ligne à une adresse du type : `https://nom-aleatoire.netlify.app`

---

## Build local (à faire avant un déploiement manuel)

Si tu déploies en « drag & drop » (Netlify ou autre), génère d’abord le build :

```bash
npm install
npm run build
```

Le site prêt à déployer se trouve dans le dossier **`dist`**. Uploade tout le contenu de `dist` sur ton hébergeur.

---

## Résumé des fichiers ajoutés

| Fichier        | Rôle                                      |
|----------------|-------------------------------------------|
| `vercel.json`  | Config Vercel (build + routage SPA)       |
| `netlify.toml` | Config Netlify (build + redirections SPA) |
| `public/_redirects` | Redirections Netlify pour SPA      |

Ton application React (Vite + React Router) est une SPA : toutes les URLs doivent renvoyer vers `index.html`. Les configurations ci-dessus s’en occupent.
