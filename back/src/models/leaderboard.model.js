import pool from '../config/db.js';

export async function getTopScores({ limit = 10, id_niveau = null }) {
  const params = [];
  let whereClause = '';

  if (id_niveau) {
    whereClause = 'WHERE p.id_niveau = ?';
    params.push(id_niveau);
  }

  params.push(limit);

  const [rows] = await pool.query(
    `SELECT
       s.points,
       s.blobs_elimines,
       s.vagues_passees,
       s.or_depense,
       j.pseudo,
       n.nom        AS level_name,
       p.date_fin   AS played_at,
       p.id_niveau
     FROM score s
     JOIN partie p ON p.id_partie = s.id_partie
     JOIN joueur j ON j.id_joueur = p.id_joueur
     JOIN niveau n ON n.id_niveau = p.id_niveau
     ${whereClause}
     WHERE p.statut = 'terminee'
     ORDER BY s.points DESC
     LIMIT ?`,
    params
  );

  return rows;
}

export async function getPlayerBest(id_joueur) {
  const [rows] = await pool.query(
    `SELECT
       s.points,
       s.blobs_elimines,
       s.vagues_passees,
       n.nom   AS level_name,
       p.date_fin AS played_at
     FROM score s
     JOIN partie p ON p.id_partie = s.id_partie
     JOIN niveau n ON n.id_niveau = p.id_niveau
     WHERE p.id_joueur = ?
       AND p.statut = 'terminee'
     ORDER BY s.points DESC
     LIMIT 10`,
    [id_joueur]
  );

  return rows;
}