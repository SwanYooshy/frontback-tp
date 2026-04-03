import * as TourService from '../services/tour.service.js';

const ERROR_CODES = {
  PARTIE_INTROUVABLE:  [404, 'Partie introuvable'],
  ACCES_INTERDIT:      [403, 'Accès interdit'],
  PARTIE_TERMINEE:     [409, 'La partie est déjà terminée'],
  TOUR_INTROUVABLE:    [404, 'Tour introuvable'],
  TOUR_DEJA_SUPPRIMEE: [409, 'Tour déjà supprimée'],
  CASE_OCCUPEE:        [409, 'Une tour occupe déjà cette case'],
  UPGRADE_MAX:         [409, 'Niveau maximum atteint (3)'],
};

function handleError(err, res) {
  const [status, message] = ERROR_CODES[err.message] ?? [500, 'Erreur serveur'];
  return res.status(status).json({ message });
}

export async function placer(req, res) {
  const id_partie  = parseInt(req.params.id);
  const id_joueur  = req.joueur.id;
  const { id_tour_type, pos_x, pos_y } = req.body;

  if (!id_tour_type || pos_x === undefined || pos_y === undefined) {
    return res.status(400).json({ message: 'id_tour_type, pos_x et pos_y requis' });
  }

  try {
    const result = await TourService.placerTour({ id_partie, id_joueur, id_tour_type, pos_x, pos_y });
    return res.status(201).json(result);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function supprimer(req, res) {
  const id_partie      = parseInt(req.params.id);
  const id_tour_placee = parseInt(req.params.idTour);
  const id_joueur      = req.joueur.id;

  try {
    const result = await TourService.supprimerTour({ id_partie, id_joueur, id_tour_placee });
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function upgrader(req, res) {
  const id_partie      = parseInt(req.params.id);
  const id_tour_placee = parseInt(req.params.idTour);
  const id_joueur      = req.joueur.id;

  try {
    const result = await TourService.upgraderTour({ id_partie, id_joueur, id_tour_placee });
    return res.status(200).json(result);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function lister(req, res) {
  const id_partie = parseInt(req.params.id);
  const id_joueur = req.joueur.id;

  try {
    const tours = await TourService.listerTours({ id_partie, id_joueur });
    return res.status(200).json(tours);
  } catch (err) {
    return handleError(err, res);
  }
}