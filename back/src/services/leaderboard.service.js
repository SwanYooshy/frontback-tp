import * as LeaderboardModel from '../models/leaderboard.model.js';

export async function getTopScores({ limit, level_id }) {
  const parsedLimit = Math.min(parseInt(limit) || 10, 100);
  const parsedLevel = level_id ? parseInt(level_id) : null;

  return await LeaderboardModel.getTopScores({
    limit: parsedLimit,
    id_niveau: parsedLevel,
  });
}

export async function getPlayerBest(id_joueur) {
  return await LeaderboardModel.getPlayerBest(id_joueur);
}