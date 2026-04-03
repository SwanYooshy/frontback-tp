import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import * as PartieController from '../controllers/partie.controller.js';

const router = Router();

router.use(authenticateToken); // toutes les routes parties sont protégées

router.post('/',           PartieController.demarrer);
router.get('/:id',         PartieController.getPartie);
router.patch('/:id/terminer', PartieController.terminer);

export default router;