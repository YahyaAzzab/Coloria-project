# Coloria Project

Bienvenue sur le dépôt du projet **Coloria** !
Il s'agit d'une application web moderne "Full-Stack" et dynamique, construite avec les dernières technologies de l'écosystème React et optimisée pour la performance et le référencement (SEO).

## 🚀 Technologies utilisées

Ce projet repose sur une architecture robuste et moderne :

- **[TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview)** : Framework full-stack React offrant un routage avancé, du rendu côté serveur (SSR) et une intégration fluide des requêtes de données.
- **[React 19](https://react.dev/)** : Bibliothèque UI principale.
- **[Vite & Nitro](https://vitejs.dev/)** : Outils de compilation ultra-rapides et moteur de serveur de nouvelle génération.
- **[Supabase](https://supabase.com/)** : Backend as a Service open-source utilisé pour la base de données PostgreSQL, l'authentification sécurisée (y compris le tableau de bord Admin) et les interactions serveur.
- **[Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)** : Pour une interface utilisateur magnifique, accessible et totalement responsive.

## 🛠 Prérequis

Avant de lancer le projet en local, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- Un gestionnaire de paquets comme `npm` ou `bun`
- Un compte **Supabase** configuré avec vos tables.

## 💻 Installation et démarrage en local

1. **Cloner le dépôt et installer les dépendances :**
   ```bash
   git clone https://github.com/YahyaAzzab/Coloria-project.git
   cd "Coloria Project mohammed"
   npm install
   ```

2. **Configuration de l'environnement :**
   Créez un fichier `.env.local` à la racine du projet et ajoutez-y vos clés Supabase (qui se trouvent dans les paramètres API de votre projet Supabase) :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique_supabase
   SUPABASE_URL=votre_url_supabase
   SUPABASE_PUBLISHABLE_KEY=votre_cle_publique_supabase
   SUPABASE_SERVICE_ROLE_KEY=votre_cle_secrete_admin_supabase
   ```
   *(La clé `SUPABASE_SERVICE_ROLE_KEY` est obligatoire pour que le panel administrateur fonctionne).*

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   Le projet sera accessible sur `http://localhost:8080` (ou un autre port indiqué dans le terminal).

## 🌍 Déploiement sur Vercel

Ce projet est spécifiquement configuré pour être déployé sur **Vercel** grâce à l'adaptateur Nitro configuré dans `vite.config.ts`.

1. Connectez-vous sur Vercel et importez ce dépôt GitHub.
2. Dans **Settings > Environment Variables**, n'oubliez surtout pas d'ajouter les 5 variables d'environnement listées dans l'étape de configuration locale ci-dessus (y compris la `SERVICE_ROLE_KEY`).
3. Vercel détectera automatiquement le framework et s'occupera du build et du déploiement SSR.
4. Si vous utilisez un nom de domaine personnalisé acheté ailleurs (ex: Hostinger), associez-le dans la section **Domains** de Vercel et mettez à jour votre enregistrement **A** vers l'IP indiquée par Vercel.

## 🔒 Panneau Administrateur

Le projet dispose d'une interface d'administration sécurisée accessible via `/admin/login`. 
Assurez-vous que votre configuration Supabase et l'authentification (Row Level Security et clés Service Role) sont bien en place pour gérer les accès.
