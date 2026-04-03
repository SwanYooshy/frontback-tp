import pool from '../config/db.js';

export async function placerTour({ id_partie, id_tour_type, pos_x, pos_y }) {
  // Vérifie qu'aucune tour n'occupe déjà cette case
  const [existing] = await pool.query(
    `SELECT id_tour_placee FROM tour_placee
     WHERE id_partie = ? AND pos_x = ? AND pos_y = ? AND actif = 1`,
    [id_partie, pos_x, pos_y]
  );
  if (existing.length > 0) throw new Error('CASE_OCCUPEE');

  const [result] = await pool.query(
    `INSERT INTO tour_placee (id_partie, id_tour_type, pos_x, pos_y, niveau_upgrade, actif)
     VALUES (?, ?, ?, ?, 1, 1)`,
    [id_partie, id_tour_type, pos_x, pos_y]
  );
  return result.insertId;
}

export async function supprimerTour({ id_tour_placee, id_partie }) {
  const [rows] = await pool.query(
    `SELECT * FROM tour_placee WHERE id_tour_placee = ? AND id_partie = ?`,
    [id_tour_placee, id_partie]
  );
  if (!rows[0]) throw new Error('TOUR_INTROUVABLE');
  if (!rows[0].actif) throw new Error('TOUR_DEJA_SUPPRIMEE');

  await pool.query(
    `UPDATE tour_placee SET actif = 0 WHERE id_tour_placee = ?`,
    [id_tour_placee]
  );
}

export async function upgraderTour({ id_tour_placee, id_partie }) {
  const [rows] = await pool.query(
    `SELECT * FROM tour_placee WHERE id_tour_placee = ? AND id_partie = ? AND actif = 1`,
    [id_tour_placee, id_partie]
  );
  if (!rows[0]) throw new Error('TOUR_INTROUVABLE');
  if (rows[0].niveau_upgrade >= 3) throw new Error('UPGRADE_MAX');

  await pool.query(
    `UPDATE tour_placee SET niveau_upgrade = niveau_upgrade + 1 WHERE id_tour_placee = ?`,
    [id_tour_placee]
  );

  return { niveau_upgrade: rows[0].niveau_upgrade + 1 };
}

export async function getToursByPartie(id_partie) {
  const [rows] = await pool.query(
    `SELECT tp.*, tt.nom, tt.degats_base, tt.portee, tt.vitesse_attaque, tt.cout_or
     FROM tour_placee tp
     JOIN tour_type tt ON tt.id_tour_type = tp.id_tour_type
     WHERE tp.id_partie = ? AND tp.actif = 1`,
    [id_partie]
  );
  return rows;
}