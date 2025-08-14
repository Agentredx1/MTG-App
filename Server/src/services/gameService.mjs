// Inserts game + players inside a transaction client
export async function createGameWithPlayers(client, payload) {
  const { date, turns, wincon, winner, players, num_players } = payload;

  const gameIns = await client.query(
    `INSERT INTO games (date, num_players, turns, wincon)
     VALUES ($1,$2,$3,$4)
     RETURNING game_id`,
    [date, num_players, turns, wincon]
  );
  const gameId = gameIns.rows[0].game_id;

  const playerRows = [];
  for (const p of players) {
    const { rows } = await client.query(
      `INSERT INTO players (game_id, player_name, commander_name, turn_order)
       VALUES ($1,$2,$3,$4)
       RETURNING player_id, player_name`,
      [gameId, p.name.trim(), p.commander?.trim() || null, p.turnOrder]
    );
    playerRows.push(rows[0]);
  }

  const winnerRow = playerRows.find(
    r => r.player_name.trim().toLowerCase() === (winner || '').trim().toLowerCase()
  );
  if (winnerRow) {
    await client.query(
      `UPDATE games SET winner_player_id = $1 WHERE game_id = $2`,
      [winnerRow.player_id, gameId]
    );
  }

  return { gameId, playersInserted: playerRows.length, winnerSet: Boolean(winnerRow) };
}
