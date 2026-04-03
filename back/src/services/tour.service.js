import * as TourModel from '../models/tour.model.js';
import * as PartieModel from '../models/partie.model.js';

async function verifierAcces({ id_partie, id_joueur }) {
  const partie = await PartieModel.findById(id_partie);
  if (!partie)                        throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');
  if (partie.statut !== 'en_cours')   throw new Error('PARTIE_TERMINEE');
  return partie;
}

export async function placerTour({ id_partie, id_joueur, id_tour_type, pos_x, pos_y }) {
  await verifierAcces({ id_partie, id_joueur });

  const id_tour_placee = await TourModel.placerTour({ id_partie, id_tour_type, pos_x, pos_y });
  return { id_tour_placee, pos_x, pos_y };
}

export async function supprimerTour({ id_partie, id_joueur, id_tour_placee }) {
  await verifierAcces({ id_partie, id_joueur });
  await TourModel.supprimerTour({ id_tour_placee, id_partie });
  return { message: 'Tour supprimée' };
}

export async function upgraderTour({ id_partie, id_joueur, id_tour_placee }) {
  await verifierAcces({ id_partie, id_joueur });
  return await TourModel.upgraderTour({ id_tour_placee, id_partie });
}

export async function listerTours({ id_partie, id_joueur }) {
  const partie = await PartieModel.findById(id_partie);
  if (!partie)                        throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');
  return await TourModel.getToursByPartie(id_partie);
}