import * as AuthService from '../services/auth.service.js';

export async function register(req, res) {
  const { pseudo, email, password } = req.body;

  if (!pseudo || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const joueur = await AuthService.register({ pseudo, email, password });
    return res.status(201).json({ message: 'Compte créé', joueur });
  } catch (err) {
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    if (err.message === 'PSEUDO_TAKEN') {
      return res.status(409).json({ message: 'Pseudo déjà utilisé' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const result = await AuthService.login({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}