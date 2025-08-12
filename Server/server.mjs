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


server.get('/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM players LIMIT 5;');
        res.json(result.rows);
    } catch {
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