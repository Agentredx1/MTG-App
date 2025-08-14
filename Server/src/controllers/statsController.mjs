// NEW: moved /api/most_played here
import { pool } from '../db/pool.mjs';

export async function getMostPlayed(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        p.commander_name,
        COUNT(*) AS games_played
      FROM "players" p
      JOIN "games"   g ON g."game_id" = p."game_id"
      WHERE g."date" >= (CURRENT_DATE - INTERVAL '30 days')
      GROUP BY p.commander_name
      ORDER BY games_played DESC
      LIMIT 8;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Query error', err);
    res.status(500).json({ error: 'Query failed' });
  }
}
