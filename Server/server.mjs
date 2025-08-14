import express from 'express';
import { Pool } from 'pg';

const server = express()
const PORT = 3000;

const pool = new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'appdb',
    password: 'magicthegathering',
    port: 5432,
});

server.get('/', (req, res) => {
    console.log("Request to root received");
    res.status(200).set({'Content-Type': 'text/plain' }).send("I'm the responnse!");
})


server.get('/api/most_played', async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT
            p.commander_name,
            COUNT(*) AS games_played
        FROM "players" p
        JOIN "games"   g ON g."game_id" = p."game_id"
        WHERE
            g."date" >= (CURRENT_DATE - INTERVAL '30 days')
        GROUP BY p.commander_name
        ORDER BY games_played DESC
        LIMIT 8;
        `);
        res.json(result.rows);
        console.log('test API route hit!')
    } catch(err) {
        console.error('Query error', err);
        res.status(500).json({ error: 'Query failed'});
    }
});

server.use(express.json());  
server.post('/api/game', async (req, res) => {
    const client = await pool.connect();
    try {
        console.log(req.body);
        const { date, turns, wincon, winner, players, num_players } = req.body;

        await client.query('BEGIN');

        const gameInsert = await client.query(
            `INSERT INTO games (date, num_players, turns, wincon)
            VALUES ($1, $2, $3, $4)
            RETURNING game_id`,
            [date, num_players, turns, wincon]
        );
        const gameId = gameInsert.rows[0].game_id;

        const playerRows = [];
        for (const p of players) {
            const pr = await client.query(
                `INSERT INTO players (game_id, player_name, commander_name, turn_order)
                VALUES ($1, $2, $3, $4)
                RETURNING player_id, player_name`,
                [gameId, p.name.trim(), p.commander?.trim() || null, p.turnOrder]
            );
            playerRows.push(pr.rows[0]);
        }

        const winnerRow = playerRows.find(
            r => r.player_name.trim().toLowerCase() === winner.trim().toLowerCase()
        );

        await client.query(
        `UPDATE games SET winner_player_id = $1 WHERE game_id = $2`,
        [winnerRow.player_id, gameId]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            gameId,
            playersInserted: playerRows.length,
            winnerSet: Boolean(winner && winner.trim())
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error saving game:', err);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error'});

    } finally {
        client.release();
    }
});


//REVIEW
// GET /api/test/scryfall?name=Card+Name
server.get('/api/test/scryfall', async (req, res) => {
  const name = (req.query.name || '').toString().trim();
  if (!name) {
    return res.status(400).json({ error: 'Missing ?name=' });
  }

  // Build Scryfall "named" endpoint (fuzzy match is more forgiving)
  const url = new URL('https://api.scryfall.com/cards/named');
  url.searchParams.set('fuzzy', name);

  // Optional: timeout to avoid hanging
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Courtesy header (not required but recommended)
        'User-Agent': 'mtg-library/1.0 (+https://example.com)'
      }
    });

    // Scryfall returns JSON error bodies on non-2xx
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(r.status).json({
        error: err.details || err.message || 'Scryfall lookup failed'
      });
    }

    const card = await r.json();

    // Colors come straight from Scryfall
    const color_identity = Array.isArray(card.color_identity) ? card.color_identity : [];

    // Pick a representative image URL.
    // Prefer the main face's "normal" size; fall back sensibly for multi-face cards.
    let image = null;
    if (card.image_uris?.normal) {
      image = card.image_uris.normal;
    } else if (Array.isArray(card.card_faces) && card.card_faces.length) {
      const faceWithImage = card.card_faces.find(f => f.image_uris?.normal) || card.card_faces[0];
      image = faceWithImage?.image_uris?.normal || null;
    }

    return res.json({
      name: card.name,
      color_identity,
      image,
      // Helpful extras (optional)
      set: card.set,
      type_line: card.type_line,
      scryfall_uri: card.scryfall_uri,
      id: card.id
    });
  } catch (e) {
    const aborted = e?.name === 'AbortError';
    return res.status(502).json({ error: aborted ? 'Scryfall request timed out' : 'Upstream request failed' });
  } finally {
    clearTimeout(timeout);
  }
});


process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});