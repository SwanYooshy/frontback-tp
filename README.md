# Blob Tower Defense

> Jeu de tower defense solo en navigateur - univers médiéval fantasy avec commentateur IA local.

**Repo :** https://github.com/SwanYooshy/frontback-tp  
**Auteur :** Swan Chevalereau
**Formation :** M2 Développement : Ynov Connect  

---

## Présentation

Blob Tower Defense est une application full-stack de jeu en navigateur. Le joueur défend son château contre des vagues de blobs envahisseurs en plaçant et en améliorant des tours de défense sur une grille médiévale. Après chaque vague, un modèle de langage local (Ollama / LLaMA 3.1) génère un commentaire narratif fantasy. Les scores sont persistés en base de données et consultables via un leaderboard mondial.

---

## Structure du projet

```
frontback-tp/
├── back/        ← API REST + WebSocket (Node.js / Express / Socket.io)
└── front/       ← Interface utilisateur (React / Vite / Phaser 3)
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite |
| Moteur de jeu | Phaser 3 |
| Style | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Temps réel | Socket.io |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Base de données | MySQL / MariaDB (via WAMP) |
| IA locale | Ollama + LLaMA 3.1 8B |

---

## Installation & lancement

### Prérequis

- Node.js >= 18
- WAMP (MySQL / MariaDB)
- [Ollama](https://ollama.com) avec le modèle LLaMA 3.1

```bash
ollama pull llama3.1
```

---

### 1. Base de données

Importer le schéma dans phpMyAdmin (ou console MySQL) :

```bash
mysql -u root -e "CREATE DATABASE blob_tower_defense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root blob_tower_defense < back/sql/init.sql
```
> Si ton utilisateur MySQL a un mot de passe, ajoute `-p` après `-u root`.

---

### 2. Backend

```bash
cd back
npm install
cp .env.example .env   # Remplir les variables
npm run dev
```

Variables `.env` à configurer :

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=blob_tower_defense
DB_USER=root
DB_PASSWORD=

JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

---

### 3. Frontend

```bash
cd front
npm install
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

### 4. Ollama (IA locale)

Ollama se lance automatiquement en service sur Windows après installation.  
Si ce n'est pas le cas :

```bash
ollama serve
```

---

## Fonctionnalités

| Priorité | Fonctionnalité |
|----------|---------------|
| ✅ Must have | Inscription / Connexion (JWT) |
| ✅ Must have | Démarrer / terminer une partie |
| ✅ Must have | Placer, vendre et upgrader des tours |
| ✅ Must have | Vagues de blobs avec pathfinding |
| ✅ Must have | Gestion des vies et du score |
| ✅ Must have | Commentateur IA après chaque vague (LLaMA 3.1 via Ollama) |
| ✅ Should have | Leaderboard global et scores personnels |
| ✅ Should have | Plusieurs types de tours (Archer, Magicien, Catapulte) |
| ✅ Should have | Plusieurs types de blobs (vert, rouge, noir) |
| 🔲 Nice to have | Socket.io leaderboard temps réel |
| 🔲 Nice to have | Effets sonores et animations de sprites |

---

## Modèle de données

9 tables relationnelles (MySQL) :

```
joueur · partie · niveau · score · vague · blob_type · tour_type · tour_placee · composition_vague
```

Le script SQL complet est disponible dans `back/sql/init.sql`.

---

## API REST - Endpoints principaux

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/auth/register` | Créer un compte | ❌ |
| POST | `/auth/login` | Connexion + token JWT | ❌ |
| POST | `/parties` | Démarrer une partie | ✅ |
| GET | `/parties/:id` | État d'une partie | ✅ |
| PATCH | `/parties/:id/terminer` | Terminer une partie | ✅ |
| POST | `/parties/:id/vagues` | Lancer une vague | ✅ |
| PATCH | `/parties/:id/vagues/:n/terminer` | Terminer une vague + commentaire IA | ✅ |
| POST | `/parties/:id/tours` | Placer une tour | ✅ |
| PATCH | `/parties/:id/tours/:id/upgrade` | Upgrader une tour | ✅ |
| DELETE | `/parties/:id/tours/:id` | Vendre une tour | ✅ |
| GET | `/leaderboard` | Top scores global | ❌ |
| GET | `/leaderboard/me` | Mes meilleurs scores | ✅ |
| GET | `/tour-types` | Catalogue des tours | ❌ |
| GET | `/blob-types` | Catalogue des blobs | ❌ |

---

### Lancer les tests

```bash
cd back
npm test
```

---

## Fonctionnalité IA

Après chaque vague terminée, le serveur interroge **LLaMA 3.1** via l'API Ollama locale (`http://localhost:11434`) avec le contexte de la vague (blobs éliminés, vies perdues, tours utilisées). Le modèle génère un commentaire narratif de 2-3 phrases dans un style médiéval fantasy affiché en bandeau dans l'interface.

Le modèle tourne entièrement **en local** - aucune donnée n'est envoyée à un service externe.

---

## Architecture back

```
back/src/
├── config/         ← Connexion BDD (mysql2/promise)
├── controllers/    ← Logique des endpoints HTTP
├── middlewares/    ← Auth JWT
├── models/         ← Requêtes SQL
├── routes/         ← Déclaration des routes Express
├── services/       ← Logique métier + appel Ollama
└── app.js          ← Setup Express + Socket.io
```

## Architecture front

```
front/src/
├── api/            ← Instance axios + intercepteurs
├── components/     ← Navbar, Footer, Layout, HUD, TowerPanel, AIComment, PhaserGame
├── context/        ← AuthContext (token + joueur)
├── hooks/          ← useAuth
├── pages/          ← Landing, Login, Register, Game, Results, Leaderboard
└── App.jsx         ← Routing React Router
```

---

## Licence

Projet réalisé dans le cadre d'un TP scolaire - Ynov Connect M2 Dev 2025/2026.