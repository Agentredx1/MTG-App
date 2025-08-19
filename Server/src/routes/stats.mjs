import { Router } from 'express';
import { getMostPlayed, commanderWinRate, playerWinRate, getColorFreq } from '../controllers/statsController.mjs';

const router = Router();
router.get('/most_played', getMostPlayed);
router.get('/commanderWinRate', commanderWinRate);
router.get('/playerWinRate', playerWinRate);
router.get('/ColorFreq', getColorFreq);
export default router;

