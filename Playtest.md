# 🎮 Guide de Playtest - Blob Tower Defense

Ce document décrit les scénarios de test à réaliser avant chaque démo ou release.  
Chaque scénario précise les prérequis, les étapes et le résultat attendu.

---

## Prérequis avant de commencer

- [ ] WAMP démarré, base `blob_tower_defense` importée (`back/sql/init.sql`). Ou du moins une base de données initialisé (pas forcément WAMP)
- [ ] Ollama lancé avec le modèle LLaMA 3.1 (`ollama pull llama3.1`)
- [ ] Back démarré : `cd back && npm run dev` → `http://localhost:3000`
- [ ] Front démarré : `cd front && npm run dev` → `http://localhost:5173`
- [ ] Vérification de la connexion BDD : `GET http://localhost:3000/health` → `{"status":"ok","db":"connected"}`

---

## Scénarios de test

---

### Scénario 1 - Inscription d'un nouveau joueur

**Prérequis :** Aucun compte existant avec cet email.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Aller sur `http://localhost:5173/register` | Formulaire d'inscription affiché |
| 2 | Remplir pseudo, email, mot de passe, confirmation | Champs acceptent la saisie |
| 3 | Cliquer sur "S'inscrire" | Redirection automatique vers `/game` |
| 4 | Vérifier dans phpMyAdmin → table `joueur` | Ligne créée avec mot de passe hashé |

**Cas d'erreur à tester :**
- Email déjà utilisé → message `Email déjà utilisé`
- Mots de passe différents → message `Les mots de passe ne correspondent pas`
- Champ vide → message `Tous les champs sont requis`

---

### Scénario 2 - Connexion et déconnexion

**Prérequis :** Avoir un compte existant.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Aller sur `http://localhost:5173/login` | Formulaire de connexion affiché |
| 2 | Saisir email + mot de passe corrects | Redirection vers `/game` |
| 3 | Vérifier la navbar | Boutons "Jouer" et "Déconnexion" visibles |
| 4 | Cliquer sur "Déconnexion" | Redirection vers `/`, token supprimé |
| 5 | Tenter d'accéder à `/game` sans être connecté | Redirection vers `/login` |

**Cas d'erreur à tester :**
- Mauvais mot de passe → message `Identifiants incorrects`
- Email inconnu → message `Identifiants incorrects`

---

### Scénario 3 - Démarrer une partie et placer des tours

**Prérequis :** Être connecté.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Aller sur `/game` | Grille Phaser affichée, HUD visible (20 vies, 200 or, vague 0/10) |
| 2 | Cliquer sur "Archer" dans le panneau de droite | Tour sélectionnée (bordure blanche) |
| 3 | Cliquer sur une case vide de la grille | Tour verte apparaît, or diminue de 50 |
| 4 | Cliquer sur "Magicien" puis une case vide | Tour violette apparaît, or diminue de 120 |
| 5 | Cliquer sur une case du chemin (grise) | Rien ne se passe |
| 6 | Cliquer sur une case déjà occupée | Erreur `Une tour occupe déjà cette case` |
| 7 | Vérifier phpMyAdmin → table `tour_placee` | Lignes créées avec les bonnes coordonnées |

---

### Scénario 4 - Lancer une vague et vérifier le commentaire IA

**Prérequis :** Être sur `/game` avec un tour qui se termine.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Cliquer sur "Lancer la partie" | Bouton remplacé par "Vague en cours..." |
| 2 | Observer la grille | Cercles colorés (blobs) se déplacent sur le chemin |
| 3 | Attendre la fin de la vague | Bouton "Lancer la vague 2" apparaît |
| 4 | Observer le bandeau sous le HUD | Commentaire narratif généré par LLaMA 3.1 affiché |
| 5 | Attendre 8 secondes | Commentaire disparaît automatiquement |
| 6 | Vérifier phpMyAdmin → table `vague` | Ligne avec `statut = terminee` |
| 7 | Vérifier phpMyAdmin → table `score` | `blobs_elimines` et `points` mis à jour |

---

### Scénario 5 - Upgrade et vente d'une tour

**Prérequis :** Avoir une tour placée sur la grille.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Cliquer sur une tour placée | Panneau "Tour sélectionnée" apparaît à droite |
| 2 | Cliquer sur "Upgrade" | Chiffre sur la tour passe de 1 à 2, or diminue |
| 3 | Upgrader une deuxième fois | Chiffre passe à 3 |
| 4 | Tenter un 3ème upgrade | Bouton "Upgrade" disparaît (niveau max atteint) |
| 5 | Cliquer sur "Vendre" | Tour disparaît de la grille, or remboursé à 50% |
| 6 | Vérifier phpMyAdmin → table `tour_placee` | `actif = 0` pour la tour vendue |

---

### Scénario 6 - Fin de partie et page résultats

**Prérequis :** Être en cours de partie.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Laisser des blobs passer jusqu'à 0 vies **OU** terminer les 10 vagues | Redirection automatique vers `/results/:id` |
| 2 | Vérifier la page résultats | Score, blobs éliminés, vagues passées, or dépensé affichés |
| 3 | Cliquer sur "Rejouer" | Nouvelle partie démarre sur `/game` |
| 4 | Cliquer sur "Voir le classement" | Redirection vers `/leaderboard` |
| 5 | Vérifier phpMyAdmin → table `partie` | `statut = terminee`, `date_fin` renseignée |
| 6 | Vérifier phpMyAdmin → table `score` | Score final persisté correctement |

---

### Scénario 7 - Leaderboard

**Prérequis :** Au moins une partie terminée en base.

| Étape | Action | Résultat attendu |
|-------|--------|-----------------|
| 1 | Aller sur `/leaderboard` sans être connecté | Tableau global affiché, section "Mes scores" absente |
| 2 | Se connecter et revenir sur `/leaderboard` | Section "Mes meilleurs scores" apparaît en bas |
| 3 | Utiliser le filtre "Filtrer par niveau" | Tableau filtré sur le niveau sélectionné |
| 4 | Vérifier que les scores sont triés par points décroissants | Tri correct |
| 5 | Vérifier que la ligne du joueur connecté est surlignée | Fond légèrement différent + "(vous)" |

---

## Bugs connus

| Bug | Impact | Contournement |
|-----|--------|---------------|
| Simulation de combat approximative | Les blobs ne meurent pas toujours de façon réaliste | Placer plusieurs tours proches du chemin |
| Snapshot des tours pendant la vague | Tours placées juste avant la vague parfois ignorées | Placer les tours avant de lancer la vague |
| Commentaire IA lent (~3-5s) | Délai visible entre la fin de vague et l'affichage | Normal au premier appel (chargement du modèle) |

---

## Grille d'observation

| Scénario | Testé le | Résultat | Commentaire |
|----------|----------|----------|-------------|
| 1 - Inscription | | OK / KO | |
| 2 - Connexion | | OK / KO | |
| 3 - Placement tours | | OK / KO | |
| 4 - Vague + IA | | OK / KO | |
| 5 - Upgrade / Vente | | OK / KO | |
| 6 - Fin de partie | | OK / KO | |
| 7 - Leaderboard | | OK / KO | |