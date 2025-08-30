import { useState, useEffect } from 'react';
import './GameFeed.css';
import LoadMore from '../LoadMore/LoadMore';

function GameFeed({ playerName = null }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const url = playerName 
          ? `/api/v1/stats/game-feed/${encodeURIComponent(playerName)}`
          : '/api/v1/stats/game-feed';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setGames(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [playerName]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPlayerGrid = (participants, winnerName) => {
    const sortedParticipants = participants.sort((a, b) => a.turn_order - b.turn_order);
    return sortedParticipants.map((participant, index) => {
      const isWinner = participant.player_name === winnerName;
      return (
        <div key={index} className={`player-cell ${isWinner ? 'winner' : ''}`}>
          <span className="player-name">{participant.player_name}</span>
          <span className="commander-name">{participant.commander_name || 'Unknown'}</span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="game-feed-container">
        <div className="loading">Loading recent games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-feed-container">
        <div className="error">Error loading games: {error}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="game-feed-container">
        <div className="no-games">
          {playerName ? `No games found for ${playerName}` : 'No games found'}
        </div>
      </div>
    );
  }

  const displayedGames = games.slice(0, displayCount);

  return (
    <div className="game-feed-container">
      <table className="game-feed-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Players</th>
            <th>Turns</th>
            <th>Win Condition</th>
          </tr>
        </thead>
        <tbody>
          {displayedGames.map((game) => (
            <tr key={game.game_id}>
              <td data-label="Date">{formatDate(game.date)}</td>
              <td data-label="Players" className="players-grid">
                <div className="player-grid">
                  {formatPlayerGrid(game.participants, game.winner_name)}
                </div>
              </td>
              <td data-label="Turns">{game.turns || '-'}</td>
              <td data-label="Win Condition" className="wincon">
                {game.wincon || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <LoadMore 
        onLoadMore={() => setDisplayCount(prev => prev + 10)}
        remainingCount={games.length - displayCount}
      />
    </div>
  );
}

export default GameFeed;