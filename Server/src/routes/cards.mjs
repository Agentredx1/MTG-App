import { Router } from 'express';
import { getCardDetails } from '../controllers/cardsController.mjs';

const router = Router();

router.get('/details/:name', getCardDetails);

export default router;