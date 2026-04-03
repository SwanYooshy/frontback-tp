import pool from '../config/db.js';

export async function createPartie({ id_joueur, id_niveau, vies_restantes }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [partieResult] = await conn.query(
      `INSERT INTO partie (id_joueur, id_niveau, vies_restantes)
       VALUES (?, ?, ?)`,
      [id_joueur, id_niveau, vies_restantes]
    );
    const id_partie = partieResult.insertId;

    await conn.query(
      `INSERT INTO score (id_partie, points, blobs_elimines, or_depense, vagues_passees)
       VALUES (?, 0, 0, 0, 0)`,
      [id_partie]
    );

    await conn.commit();
    return id_partie;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function findById(id_partie) {
  const [rows] = await pool.query(
    `SELECT p.*, s.points, s.blobs_elimines, s.or_depense, s.vagues_passees
     FROM partie p
     LEFT JOIN score s ON s.id_partie = p.id_partie
     WHERE p.id_partie = ?`,
    [id_partie]
  );
  return rows[0] ?? null;
}

export async function terminerPartie({ id_partie, points, blobs_elimines, or_depense, vagues_passees }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE partie SET statut = 'terminee', date_fin = NOW()
       WHERE id_partie = ?`,
      [id_partie]
    );

    await conn.query(
      `UPDATE score
       SET points = ?, blobs_elimines = ?, or_depense = ?, vagues_passees = ?
       WHERE id_partie = ?`,
      [points, blobs_elimines, or_depense, vagues_passees, id_partie]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}