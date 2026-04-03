import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import * as TourController from '../controllers/tour.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticateToken);

router.get('/',                     TourController.lister);
router.post('/',                    TourController.placer);
router.delete('/:idTour',           TourController.supprimer);
router.patch('/:idTour/upgrade',    TourController.upgrader);

export default router;