import pool from '../config/db.js';

export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM joueur WHERE email = ?', [email]
  );
  return rows[0] ?? null;
}

export async function findByPseudo(pseudo) {
  const [rows] = await pool.query(
    'SELECT * FROM joueur WHERE pseudo = ?', [pseudo]
  );
  return rows[0] ?? null;
}

export async function createJoueur({ pseudo, email, mdp_hash }) {
  const [result] = await pool.query(
    'INSERT INTO joueur (pseudo, email, mdp_hash) VALUES (?, ?, ?)',
    [pseudo, email, mdp_hash]
  );
  return result.insertId;
}