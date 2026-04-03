import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import * as LeaderboardController from '../controllers/leaderboard.controller.js';

const router = Router();

// Public — pas besoin d'être connecté pour voir le leaderboard global
router.get('/', LeaderboardController.getTopScores);

// Privé — meilleurs scores du joueur connecté
router.get('/me', authenticateToken, LeaderboardController.getPlayerBest);

export default router;