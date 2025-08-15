export async function createGameWithPlayers(client, payload) {
  const { date, turns, wincon, winner, players, num_players } = payload;

  for(p in players){}

  const gameIns = await client.query(
    `INSERT INTO games (date, num_players, turns, wincon)
     VALUES ($1, $2, $3, $4)
     RETURNING game_id`,
    [date, num_players, turns, wincon]
  );
  const gameId = gameIns.rows[0].game_id;

  const playerRows = [];
  for (const p of players) {
    const { rows } = await client.query(
      `INSERT INTO players (game_id, player_name, commander_name, turn_order)
       VALUES ($1, $2, $3, $4)
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
      `UPDATE games 
        SET winner_player_id = $1
        winner_name = $2
        commander_name = $3
        WHERE game_id = $4`,
      [winnerRow.player_id, winnerRow.winner_name, winnerRow.commander_name, gameId]
    );
  } else {
    // Optional: leave NULL if unmatched
    console.warn('Winner name did not match any inserted player; leaving winner_player_id NULL');
  }

  return { gameId, playersInserted: playerRows.length, winnerSet: Boolean(winnerRow) };
}
