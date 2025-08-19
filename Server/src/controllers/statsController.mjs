import { pool } from '../db/pool.mjs';

export async function getMostPlayed(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        p.commander_name,
        c.image,
        COUNT(*) AS games_played
      FROM "players" p
      JOIN "games"   g ON g."game_id" = p."game_id"
      JOIN "commanders" c ON c."commander_name" = p."commander_name" 
      WHERE g."date" >= (CURRENT_DATE - INTERVAL '30 days')
      GROUP BY p.commander_name, c.image 
      ORDER BY games_played DESC
      LIMIT 8;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Query error', err);
    res.status(500).json({ error: 'Query failed' });
  }
}

export async function commanderWinRate(req, res){
    try {
        const result = await pool.query(`
        SELECT
        p.commander_name,
        COUNT(*) FILTER (WHERE g.winner_player_id = p.player_id) AS wins,
        COUNT(DISTINCT p.game_id) AS games
        FROM players AS p
        LEFT JOIN games AS g
        ON g.winner_player_id = p.player_id
        GROUP BY p.commander_name
        ORDER BY wins DESC
        `);
        res.json(result.rows);
    } catch (err) {
    console.error('Query error', err);
    res.status(500).json({ error: 'Query failed' });
  }
};

export async function playerWinRate(req, res) {
  try {
    const { name } = req.query; // or req.params depending on how you call it

    let query = `
      SELECT
        p.player_name,
        COUNT(*) FILTER (WHERE g.winner_player_id = p.player_id) AS wins,
        COUNT(*) AS games,
        ROUND(
          (COUNT(*) FILTER (WHERE g.winner_player_id = p.player_id)::numeric / NULLIF(COUNT(*), 0)) * 100, 
          2
        ) AS win_rate
      FROM players AS p
      JOIN games AS g
        ON g.game_id = p.game_id
    `;

    const values = [];

    if (name) {
      query += ` WHERE p.player_name = $1`;
      values.push(name);
    }

    query += `
      GROUP BY p.player_name
      ORDER BY wins DESC
    `;

    const result = await pool.query(query, values);

    if (name) {
      res.json(result.rows[0] || { error: 'Player not found' });
    } else {
      res.json(result.rows);
    }
  } catch (err) {
    console.error('Query error', err);
    res.status(500).json({ error: 'Query failed' });
  }
};

export async function getColorFreq(req, res){
    try {
        const result = await pool.query(`
        SELECT
        col AS color,
        COUNT(*) AS freq
        FROM players p
        JOIN commanders c
        ON c.commander_name = p.commander_name
        CROSS JOIN LATERAL unnest(c.color_id) AS u(col)
        WHERE c.color_id IS NOT NULL
        AND col IN ('W','U','B','R','G')
        GROUP BY col
        ORDER BY array_position(ARRAY['W','U','B','R','G'], col);
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Query error', err);
        res.status(500).json({ error: 'Query failed' });
    }
};
