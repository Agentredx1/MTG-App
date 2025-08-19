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

export async function commanderWinRate(req, res) {
  try {
    const name = req.params.name?.trim();
    const values = [];

    let query = `
      SELECT
        p.commander_name,
        COUNT(*) FILTER (WHERE g.winner_player_id = p.player_id)::int AS wins,
        COUNT(DISTINCT p.game_id)::int AS games,
        ROUND(
          (COUNT(*) FILTER (WHERE g.winner_player_id = p.player_id))::numeric
          / NULLIF(COUNT(DISTINCT p.game_id), 0) * 100
        , 2) AS win_rate
      FROM players AS p
      LEFT JOIN games AS g
        ON g.game_id = p.game_id           -- ✅ join by game, not by winner id
    `;

    if (name) {
      values.push(name);
      query += ` WHERE p.player_name = $1`; // use ILIKE $1 for case-insensitive
    }

    query += `
      GROUP BY p.commander_name
      ORDER BY wins DESC, games DESC
    `;

    const result = await pool.query(query, values);

    if (name) {
      // Return all commanders for that player; avoid dropping rows with [0]
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      return res.json(result.rows);
    }

    return res.json(result.rows);
  } catch (err) {
    console.error('Query error', err);
    return res.status(500).json({ error: 'Query failed' });
  }
}

export async function playerWinRate(req, res) {
  try {
    const name = req.params.name; // or req.params depending on how you call it

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

    res.json(result.rows);
  } catch (err) {
    console.error('Query error', err);
    res.status(500).json({ error: 'Query failed' });
  }
};

export async function getColorFreq(req, res) {
  const nameRaw = req.params.name;
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";

  try {
    const values = [];
    const conditions = ["u.col IS NOT NULL", "UPPER(u.col) = ANY(ARRAY['W','U','B','R','G'])"];

    if (name) {
      values.push(name);
      conditions.push("p.player_name ILIKE $1"); // case-insensitive player match
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const query = `
      SELECT
        UPPER(u.col) AS color,
        COUNT(*)::int AS freq
      FROM players p
      /* Prefer an ID-based join if you have it:
         LEFT JOIN commanders c ON c.id = p.commander_id
         Otherwise, normalize names to tolerate punctuation/case differences: */
      LEFT JOIN commanders c
        ON regexp_replace(lower(c.commander_name), '[^a-z0-9]', '', 'g')
         = regexp_replace(lower(p.commander_name), '[^a-z0-9]', '', 'g')
      LEFT JOIN LATERAL unnest(c.color_id) AS u(col) ON TRUE
      ${where}
      GROUP BY UPPER(u.col)
      ORDER BY array_position(ARRAY['W','U','B','R','G']::text[], UPPER(u.col));
    `;

    const result = await pool.query(query, values);

    if (name && result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    return res.json(result.rows);
  } catch (err) {
    console.error('Query error', err);
    return res.status(500).json({ error: 'Query failed' });
  }
}


