import { useState, useEffect } from 'react';

function StatTable(){
  const [players, setPlayers] = useState([]);
  const [commanders, setCommanders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const player_res = await fetch('/api/playerWinRate');
        const player_data = await player_res.json();
        setPlayers(player_data || []);
        const commander_res = await fetch('/api/commanderWinRate');
        const commander_data = await commander_res.json();
        setCommanders(commander_data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Games Played</th>
            <th>Wins</th>
            <th>WR</th>
          </tr>
        </thead>
        {console.log(players)}
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              <td data-label="name">{player.player_name}</td>
              <td data-label="Games Played">{player.games}</td>
              <td data-label="Wins">{player.wins}</td>
              <td data-label="Win Rate (%)">{Math.ceil((player.wins / player.games) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatTable;