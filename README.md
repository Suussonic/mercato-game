
# Mercato

Mercato est un jeu web compétitif inspiré du mercato sportif, où les joueurs s'affrontent pour constituer la meilleure équipe de personnages issus de différents univers (par exemple Dragon Ball, One Piece, etc.). Le but est de drafter, parier, voter et gérer des équipes dans des salles multijoueurs, le tout en temps réel.

## Fonctionnalités principales
- Création et gestion de salles de jeu multijoueurs
- Sélection (draft) de personnages
- Système de paris et de votes
- Interface en temps réel (WebSocket)
- Support multilingue (français/anglais)
- Interface moderne et responsive

## Technologies utilisées
- **Next.js** (React 18, App Router)
- **TypeScript**
- **Tailwind CSS** (pour le style)
- **Ant Design** (certains composants UI)
- **i18next** (internationalisation)
- **WebSocket** (temps réel)

## Prérequis
- Node.js (v18 ou supérieur recommandé)
- npm (v9 ou supérieur recommandé)

## Installation
1. Clonez le dépôt :
	```bash
	git clone <url-du-repo>
	cd mercato-game
	```
2. Installez les dépendances :
	```bash
	npm install
	```

## Lancement du projet
Pour démarrer le serveur de développement :
```bash
npm run dev
```
Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

## Structure du projet
- `app/` : Pages et API Next.js (App Router)
- `components/` : Composants React réutilisables
- `customdata/` : Données personnalisées (APIs, types)
- `data/` : Jeux de données (personnages, etc.)
- `lib/` : Fonctions utilitaires, contextes, i18n
- `public/` : Fichiers statiques (favicon, images)
- `types/` : Types TypeScript globaux

## Personnalisation
- Ajoutez vos propres personnages dans le dossier `data/` ou via l'interface DatasetBuilder.
- Modifiez les styles via Tailwind dans `app/globals.css`.