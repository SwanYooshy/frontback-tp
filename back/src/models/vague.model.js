import pool from '../config/db.js';

export async function createVague({ id_partie, numero_vague, blobs_restants }) {
  const [result] = await pool.query(
    `INSERT INTO vague (id_partie, numero_vague, statut, blobs_restants)
     VALUES (?, ?, 'en_attente', ?)`,
    [id_partie, numero_vague, blobs_restants]
  );
  return result.insertId;
}

export async function findVague({ id_partie, numero_vague }) {
  const [rows] = await pool.query(
    `SELECT * FROM vague WHERE id_partie = ? AND numero_vague = ?`,
    [id_partie, numero_vague]
  );
  return rows[0] ?? null;
}

export async function updateVagueStatut({ id_vague, statut, blobs_restants }) {
  await pool.query(
    `UPDATE vague SET statut = ?, blobs_restants = ? WHERE id_vague = ?`,
    [statut, blobs_restants, id_vague]
  );
}

export async function getComposition(id_vague) {
  const [rows] = await pool.query(
    `SELECT cv.quantite, cv.delai_spawn, bt.*
     FROM composition_vague cv
     JOIN blob_type bt ON bt.id_blob_type = cv.id_blob_type
     WHERE cv.id_vague = ?`,
    [id_vague]
  );
  return rows;
}