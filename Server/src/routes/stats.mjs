import { Router } from 'express';
import { getMostPlayed } from '../controllers/statsController.mjs';

const router = Router();
router.get('/most_played', getMostPlayed); // MOVED from server.mjs
export default router;
