import * as LeaderboardService from '../services/leaderboard.service.js';

export async function getTopScores(req, res) {
  const { limit, level_id } = req.query;

  try {
    const scores = await LeaderboardService.getTopScores({ limit, level_id });
    return res.status(200).json(scores);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getPlayerBest(req, res) {
  const id_joueur = req.joueur.id;

  try {
    const scores = await LeaderboardService.getPlayerBest(id_joueur);
    return res.status(200).json(scores);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
}