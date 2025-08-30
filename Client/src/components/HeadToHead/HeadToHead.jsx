import { useState, useEffect } from 'react';
import './HeadToHead.css';
import GameRow from '../GameRow/GameRow.jsx';

export default function HeadToHead({ playerName }) {
  const [headToHeadData, setHeadToHeadData] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [detailedMatchup, setDetailedMatchup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    if (!playerName) return;
    
    const fetchHeadToHead = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/stats/players/head-to-head/${encodeURIComponent(playerName)}`);
        if (!res.ok) throw new Error('Failed to fetch head-to-head data');
        
        const data = await res.json();
        setHeadToHeadData(data);
      } catch (err) {
        console.error('Error fetching head-to-head data:', err);
        setHeadToHeadData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadToHead();
  }, [playerName]);

  const fetchDetailedMatchup = async (opponent) => {
    try {
      const res = await fetch(
        `/api/v1/stats/players/head-to-head/${encodeURIComponent(playerName)}?vs=${encodeURIComponent(opponent)}`
      );
      if (!res.ok) throw new Error('Failed to fetch detailed matchup');
      
      const data = await res.json();
      setDetailedMatchup(data[0]);
      setSelectedOpponent(opponent);
    } catch (err) {
      console.error('Error fetching detailed matchup:', err);
    }
  };

  const toggleRowExpansion = (gameId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const handleCommanderClick = (commanderName, playerName) => {
    console.log('Commander clicked:', commanderName, playerName);
  };

  if (loading) return <div>Loading head-to-head records...</div>;
  if (!headToHeadData.length) return <div>No head-to-head data available</div>;

  return (
    <div className="head-to-head">
      <h2>Head-to-Head Records</h2>
      
      <div className="h2h-overview">
        <table className="h2h-table">
          <thead>
            <tr>
              <th>Opponent</th>
              <th>Games</th>
              <th>Record</th>
              <th>Win Rate</th>
              <th>Last Played</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {headToHeadData.map((record, index) => (
              <tr key={index}>
                <td>{record.opponent}</td>
                <td>{record.games_played}</td>
                <td>{record.wins}W - {record.losses}L</td>
                <td>{record.win_rate}%</td>
                <td>{new Date(record.last_played).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => fetchDetailedMatchup(record.opponent)}
                    className="details-btn"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailedMatchup && (
        <div className="detailed-matchup">
          <h3>{playerName} vs {selectedOpponent}</h3>
          <div className="matchup-summary">
            <div className="stat">
              <label>Total Games:</label>
              <span>{detailedMatchup.total_games}</span>
            </div>
            <div className="stat">
              <label>Record:</label>
              <span>{detailedMatchup.player1_wins}W - {detailedMatchup.player2_wins}L</span>
            </div>
            <div className="stat">
              <label>Win Rate:</label>
              <span>{detailedMatchup.player1_win_rate}%</span>
            </div>
          </div>

          <h4>Recent Games</h4>
          <div className="recent-games-table">
            <table className="h2h-games-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Players</th>
                  <th>Turns</th>
                  <th>Win Condition</th>
                </tr>
              </thead>
              <tbody>
                {detailedMatchup.recent_games?.slice(0, 10).map((game, index) => {
                  const gameData = {
                    game_id: game.game_id || `h2h-${index}`,
                    date: game.date,
                    turns: game.turns,
                    wincon: game.wincon,
                    winner_name: game.winner_name,
                    participants: game.participants
                  };
                  
                  // Determine if this was a win/loss for the main comparison players
                  const mainPlayerWon = game.participants?.some(p => 
                    p.player_name === playerName && p.is_winner
                  );
                  const opponentWon = game.participants?.some(p => 
                    p.player_name === selectedOpponent && p.is_winner
                  );
                  
                  let gameOutcome = 'other';
                  if (mainPlayerWon) gameOutcome = 'win';
                  else if (opponentWon) gameOutcome = 'loss';
                  
                  return (
                    <GameRow
                      key={index}
                      game={gameData}
                      isExpanded={expandedRows.has(gameData.game_id)}
                      onToggle={toggleRowExpansion}
                      onCommanderClick={handleCommanderClick}
                      className={`h2h-game-row ${gameOutcome}`}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          <button 
            onClick={() => setDetailedMatchup(null)}
            className="close-btn"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}