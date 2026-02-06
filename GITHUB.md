# Mettre le site sur GitHub (wessence2a-ux/site)

Ce guide explique comment connecter ce projet au dépôt **https://github.com/wessence2a-ux/site** et y pousser le code.

## Prérequis

- Git installé sur votre machine : [https://git-scm.com/downloads](https://git-scm.com/downloads)
- Un compte GitHub avec accès au dépôt `wessence2a-ux/site` (droits en écriture)

## Option A : Ce dossier n’a pas encore de dépôt Git

Ouvrez un terminal (PowerShell ou CMD) dans ce dossier, puis exécutez :

```bash
cd "c:\Users\sdiri\Videos\MIRA BOUTIQUE\btp-ui\rebellion-ai-concierge-main"

git init
git remote add origin https://github.com/wessence2a-ux/site.git
git add .
git commit -m "Rebellion Luxury - site avec identification, popup IA, véhicules"
git branch -M main
git push -u origin main
```

Si le dépôt distant existe déjà et contient des fichiers (ex. un README), Git peut refuser le push. Dans ce cas :

```bash
git pull origin main --allow-unrelated-histories
# Résolvez les conflits s’il y en a, puis :
git add .
git commit -m "Fusion avec le dépôt distant"
git push -u origin main
```

## Option B : Ce dossier a déjà un dépôt Git

Si vous avez déjà fait `git init` ou cloné un autre dépôt :

```bash
cd "c:\Users\sdiri\Videos\MIRA BOUTIQUE\btp-ui\rebellion-ai-concierge-main"

git remote -v
```

- Si `origin` pointe vers un autre dépôt et que vous voulez **remplacer** par le dépôt site :

  ```bash
  git remote remove origin
  git remote add origin https://github.com/wessence2a-ux/site.git
  git add .
  git commit -m "Rebellion Luxury - mise à jour"   # si vous avez des changements
  git push -u origin main
  ```

- Si vous voulez **ajouter** ce dépôt sous un autre nom (ex. `site`) :

  ```bash
  git remote add site https://github.com/wessence2a-ux/site.git
  git push -u site main
  ```

## Authentification GitHub

Lors du `git push`, GitHub peut demander un identifiant et un mot de passe. Utilisez de préférence un **Personal Access Token** (PAT) au lieu du mot de passe :

1. GitHub → Settings → Developer settings → Personal access tokens
2. Créer un token avec au moins la permission `repo`
3. Lors du push, utiliser ce token comme mot de passe

## Résumé

| Action              | Commande principale                                      |
|---------------------|----------------------------------------------------------|
| Lier ce projet au dépôt | `git remote add origin https://github.com/wessence2a-ux/site.git` |
| Envoyer le code     | `git add .` puis `git commit -m "..."` puis `git push -u origin main` |

Une fois le push terminé, le code du site Rebellion Luxury sera sur **https://github.com/wessence2a-ux/site**.
