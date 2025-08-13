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

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});