async function backfillGamesFromPlayers() {
  try {
    // Example: fill winner_player_name from players.player_name.
    // Add more SET lines if you have more winner_* columns to backfill.
    const { rowCount } = await pool.query(`
      UPDATE games AS g
      SET
        winner_name = p.player_name
        commander_name = p.commander_name
      FROM players AS p
      WHERE g.winner_id = p.player_id
        AND (
          g.winner_name IS NULL
          OR g.winner_player_name = ''
        );
    `);
  } catch (err) {
    console.error('Backfill failed:', err.message);
  } finally {
    await pool.end();
  }
}