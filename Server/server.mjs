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

function assert(cond, msg) {
    if (!cond) {
        const e = new Error(msg);
        e.status = 400;
        throw e;
    }
}

server.get('/', (request, response) => {
    console.log("Request to root received");
    response.status(200).set({'Content-Type': 'text/plain' }).send("I'm the responnse!");
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

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});