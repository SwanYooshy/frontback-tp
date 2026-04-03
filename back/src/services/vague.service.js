import * as VagueModel from '../models/vague.model.js';
import * as PartieModel from '../models/partie.model.js';
import pool from '../config/db.js';

// Composition fixe par défaut — sera rendu dynamique avec le niveau plus tard
const COMPOSITION_PAR_VAGUE = [
  { id_blob_type: 1, quantite: 5,  delai_spawn: 1.0 }, // blobs verts
  { id_blob_type: 2, quantite: 2,  delai_spawn: 1.5 }, // blobs rouges
];

export async function demarrerVague({ id_partie, id_joueur }) {
  const partie = await PartieModel.findById(id_partie);
  if (!partie)                        throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');
  if (partie.statut !== 'en_cours')   throw new Error('PARTIE_TERMINEE');

  // Numéro de la prochaine vague
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM vague WHERE id_partie = ?`,
    [id_partie]
  );
  const numero_vague = rows[0].total + 1;

  const blobs_restants = COMPOSITION_PAR_VAGUE.reduce((acc, c) => acc + c.quantite, 0);
  const id_vague = await VagueModel.createVague({ id_partie, numero_vague, blobs_restants });

  // Insérer la composition
  for (const comp of COMPOSITION_PAR_VAGUE) {
    await pool.query(
      `INSERT INTO composition_vague (id_vague, id_blob_type, quantite, delai_spawn)
       VALUES (?, ?, ?, ?)`,
      [id_vague, comp.id_blob_type, comp.quantite, comp.delai_spawn]
    );
  }

  const composition = await VagueModel.getComposition(id_vague);

  return { id_vague, numero_vague, blobs_restants, composition };
}

export async function getVague({ id_partie, id_joueur, numero_vague }) {
  const partie = await PartieModel.findById(id_partie);
  if (!partie)                        throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');

  const vague = await VagueModel.findVague({ id_partie, numero_vague });
  if (!vague) throw new Error('VAGUE_INTROUVABLE');

  const composition = await VagueModel.getComposition(vague.id_vague);
  return { ...vague, composition };
}

export async function terminerVague({ id_partie, id_joueur, numero_vague, blobs_elimines, or_gagne }) {
  const partie = await PartieModel.findById(id_partie);
  if (!partie)                        throw new Error('PARTIE_INTROUVABLE');
  if (partie.id_joueur !== id_joueur) throw new Error('ACCES_INTERDIT');

  const vague = await VagueModel.findVague({ id_partie, numero_vague });
  if (!vague)                       throw new Error('VAGUE_INTROUVABLE');
  if (vague.statut === 'terminee')  throw new Error('VAGUE_DEJA_TERMINEE');

  await VagueModel.updateVagueStatut({
    id_vague: vague.id_vague,
    statut: 'terminee',
    blobs_restants: 0,
  });

  // Mise à jour du score partiel
  await pool.query(
    `UPDATE score
     SET blobs_elimines = blobs_elimines + ?,
         points         = points + ?,
         vagues_passees = vagues_passees + 1
     WHERE id_partie = ?`,
    [blobs_elimines, blobs_elimines * 10 + or_gagne, id_partie]
  );

  return { message: 'Vague terminée', numero_vague };
}