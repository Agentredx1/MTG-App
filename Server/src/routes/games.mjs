import { Router } from 'express';
import { createGame } from '../controllers/gamesController.mjs';

const router = Router();
router.post('/game', createGame); // MOVED from server.mjs
export default router;
