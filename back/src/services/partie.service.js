import * as PartieModel from '../models/partie.model.js';

const VIES_PAR_DEFAUT = 20;

export async function demarrerPartie({ id_joueur, id_niveau }) {
  if (!id_niveau) throw new Error('NIVEAU_REQUIS');

  const id_partie = await PartieModel.createPartie({
    id_joueur,
    id_niveau,
    vies_restantes: VIES_PAR_DEFAUT,
  });

  return { id_partie, statut: 'en_cours', vies_restantes: VIES_PAR_DEFAUT };
}

export async function getPartie({ id_partie, id_joueur }) {
  const partie = await PartieModel.findById(id_partie);

  if (!partie) throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');

  return partie;
}

export async function terminerPartie({ id_partie, id_joueur, score }) {
  const partie = await PartieModel.findById(id_partie);

  if (!partie) throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');
  if (partie.statut !== 'en_cours') throw new Error('PARTIE_DEJA_TERMINEE');

  await PartieModel.terminerPartie({ id_partie, ...score });

  return { message: 'Partie terminée', id_partie };
}