import * as VagueService from '../services/vague.service.js';

export async function demarrer(req, res) {
  const id_partie = parseInt(req.params.id);
  const id_joueur = req.joueur.id;

  try {
    const result = await VagueService.demarrerVague({ id_partie, id_joueur });
    return res.status(201).json(result);
  } catch (err) {
    const codes = {
      PARTIE_INTROUVABLE: [404, 'Partie introuvable'],
      ACCES_INTERDIT:     [403, 'Accès interdit'],
      PARTIE_TERMINEE:    [409, 'La partie est déjà terminée'],
    };
    const [status, message] = codes[err.message] ?? [500, 'Erreur serveur'];
    return res.status(status).json({ message });
  }
}

export async function getVague(req, res) {
  const id_partie    = parseInt(req.params.id);
  const numero_vague = parseInt(req.params.numVague);
  const id_joueur    = req.joueur.id;

  try {
    const vague = await VagueService.getVague({ id_partie, id_joueur, numero_vague });
    return res.status(200).json(vague);
  } catch (err) {
    const codes = {
      PARTIE_INTROUVABLE: [404, 'Partie introuvable'],
      ACCES_INTERDIT:     [403, 'Accès interdit'],
      VAGUE_INTROUVABLE:  [404, 'Vague introuvable'],
    };
    const [status, message] = codes[err.message] ?? [500, 'Erreur serveur'];
    return res.status(status).json({ message });
  }
}

export async function terminer(req, res) {
  const id_partie    = parseInt(req.params.id);
  const numero_vague = parseInt(req.params.numVague);
  const id_joueur    = req.joueur.id;
  const { blobs_elimines = 0, or_gagne = 0 } = req.body;

  try {
    const result = await VagueService.terminerVague({
      id_partie, id_joueur, numero_vague, blobs_elimines, or_gagne
    });
    return res.status(200).json(result);
  } catch (err) {
    const codes = {
      PARTIE_INTROUVABLE:  [404, 'Partie introuvable'],
      ACCES_INTERDIT:      [403, 'Accès interdit'],
      VAGUE_INTROUVABLE:   [404, 'Vague introuvable'],
      VAGUE_DEJA_TERMINEE: [409, 'Vague déjà terminée'],
    };
    const [status, message] = codes[err.message] ?? [500, 'Erreur serveur'];
    return res.status(status).json({ message });
  }
}