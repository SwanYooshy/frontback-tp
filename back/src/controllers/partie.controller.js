import * as PartieService from '../services/partie.service.js';

export async function demarrer(req, res) {
  const { id_niveau } = req.body;
  const id_joueur = req.joueur.id;

  try {
    const result = await PartieService.demarrerPartie({ id_joueur, id_niveau });
    return res.status(201).json(result);
  } catch (err) {
    if (err.message === 'NIVEAU_REQUIS') {
      return res.status(400).json({ message: 'id_niveau est requis' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function getPartie(req, res) {
  const id_partie = parseInt(req.params.id);
  const id_joueur = req.joueur.id;

  try {
    const partie = await PartieService.getPartie({ id_partie, id_joueur });
    return res.status(200).json(partie);
  } catch (err) {
    if (err.message === 'PARTIE_INTROUVABLE') {
      return res.status(404).json({ message: 'Partie introuvable' });
    }
    if (err.message === 'ACCES_INTERDIT') {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function terminer(req, res) {
  const id_partie = parseInt(req.params.id);
  const id_joueur = req.joueur.id;
  const { score } = req.body;

  if (!score) {
    return res.status(400).json({ message: 'Score requis' });
  }

  try {
    const result = await PartieService.terminerPartie({ id_partie, id_joueur, score });
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === 'PARTIE_INTROUVABLE') {
      return res.status(404).json({ message: 'Partie introuvable' });
    }
    if (err.message === 'ACCES_INTERDIT') {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    if (err.message === 'PARTIE_DEJA_TERMINEE') {
      return res.status(409).json({ message: 'Cette partie est déjà terminée' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}