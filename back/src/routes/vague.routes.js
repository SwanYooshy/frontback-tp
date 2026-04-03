import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import * as VagueController from '../controllers/vague.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticateToken);

router.post('/',                        VagueController.demarrer);
router.get('/:numVague',                VagueController.getVague);
router.patch('/:numVague/terminer',     VagueController.terminer);

export default router;