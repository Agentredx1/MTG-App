import express from 'express';
import gamesRouter from './routes/games.mjs';
import statsRouter from './routes/stats.mjs';
import { pool } from './db/pool.mjs';

const server = express();
const PORT = 3000;

server.use(express.json());

//ROOT
server.get('/', (req, res) => {
  console.log('Request to root received');
  res.status(200).set({ 'Content-Type': 'text/plain' }).send("I'm the responnse!");
});


server.use('/api/v1', gamesRouter);
server.use('/api/v1/stats', statsRouter);

// Centralized error handler
server.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
