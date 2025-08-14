import { Router } from 'express';
import { createGame } from '../controllers/gamesController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/game', asyncHandler(createGame));
export default router;