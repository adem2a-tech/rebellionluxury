# Déployer le site sur Google (Firebase Hosting)

Firebase Hosting est le service d'hébergement de Google. Gratuit, rapide, avec CDN mondial.

## Étapes

### 1. Créer un projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. Clique sur **Ajouter un projet** (ou utilise un projet existant)
3. Donne un nom (ex. : Rebellion Luxury)
4. Désactive Google Analytics si tu n'en as pas besoin
5. Clique sur **Créer le projet**

### 2. Activer Firebase Hosting

1. Dans le menu gauche : **Général** → **Hosting**
2. Clique sur **Commencer**
3. (Tu peux fermer la fenêtre, on va déployer via la ligne de commande)

### 3. Installer Firebase CLI et te connecter

Ouvre un terminal dans le dossier du projet :

```bash
npm install -g firebase-tools
firebase login
```

Une fenêtre navigateur s’ouvre pour te connecter avec ton compte Google.

### 4. Associer ton projet Firebase

Si ton projet s’appelle autre chose que `rebellion-luxury`, modifie le fichier `.firebaserc` et remplace `rebellion-luxury` par l’ID de ton projet Firebase (visible dans les paramètres du projet).

Ou exécute :

```bash
firebase use ton-id-projet
```

### 5. Déployer le site

```bash
npm run deploy:firebase
```

Le site sera en ligne sur : `https://ton-id-projet.web.app` ou `https://ton-id-projet.firebaseapp.com`

### 6. (Optionnel) Domaine personnalisé

Dans la console Firebase → Hosting → Ajouter un domaine personnalisé (ex. : rebellionluxury.ch).

---

## Commande rapide

```bash
npm run deploy:firebase
```

Build du site + déploiement sur Firebase en une seule commande.
