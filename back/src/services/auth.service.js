import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as JoueurModel from '../models/joueur.model.js';

export async function register({ pseudo, email, password }) {
  if (await JoueurModel.findByEmail(email)) {
    throw new Error('EMAIL_TAKEN');
  }
  if (await JoueurModel.findByPseudo(pseudo)) {
    throw new Error('PSEUDO_TAKEN');
  }

  const mdp_hash = await bcrypt.hash(password, 12);
  const id = await JoueurModel.createJoueur({ pseudo, email, mdp_hash });
  return { id, pseudo, email };
}

export async function login({ email, password }) {
  const joueur = await JoueurModel.findByEmail(email);
  if (!joueur) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, joueur.mdp_hash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const token = jwt.sign(
    { id: joueur.id_joueur, pseudo: joueur.pseudo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, joueur: { id: joueur.id_joueur, pseudo: joueur.pseudo, email: joueur.email } };
}