import { Router } from 'express';
import { getMostPlayed, commanderWinRate, playerWinRate, getColorFreq } from '../controllers/statsController.mjs';

const router = Router();

router.get('/most-played', getMostPlayed);

router.get('/commanders/win-rate', commanderWinRate);
router.get('/commanders/win-rate/:name', commanderWinRate);

router.get('/players/win-rate', playerWinRate);
router.get('/players/win-rate/:name', playerWinRate);

router.get('/colors/frequency', getColorFreq);
router.get('/colors/frequency/:name', getColorFreq);

export default router;


