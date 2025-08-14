// NEW: orchestration for POST /api/game
import { pool } from '../db/pool.mjs';
import { withTransaction } from '../db/tx.mjs';
import { ensureCommandersExist } from '../services/commanderService.mjs';
import { createGameWithPlayers } from '../services/gameService.mjs';

export async function createGame(req, res) {
  const { date, turns, wincon, winner, players, num_players } = req.body;

  // LIGHT VALIDATION (kept minimal)
  if (!date || !Number.isInteger(turns) || !wincon || !Array.isArray(players) || players.length < 2) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // 1) Ensure commanders exist (Scryfall done outside the tx)
  const commanderNames = players.map(p => p?.commander || '');
  await ensureCommandersExist(commanderNames);

  // 2) Write game + players in one tx
  const result = await withTransaction(pool, (client) =>
    createGameWithPlayers(client, { date, turns, wincon, winner, players, num_players })
  );

  res.status(201).json(result);
}
