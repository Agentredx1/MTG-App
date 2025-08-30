import React, { useState, useEffect } from 'react';
import './GameFeed.css';
import LoadMore from '../LoadMore/LoadMore';
import CommanderModal from '../CommanderModal/CommanderModal.jsx';
import GameRow from '../GameRow/GameRow.jsx';

function GameFeed({ playerName = null }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedCommander, setSelectedCommander] = useState(null);

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

  const openCommanderModal = (commanderName, playerName) => {
    setSelectedCommander({ commanderName, playerName });
  };

  const closeCommanderModal = () => {
    setSelectedCommander(null);
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
          {displayedGames.map((game) => {
            const isExpanded = expandedRows.has(game.game_id);
            return (
              <GameRow
                key={game.game_id}
                game={game}
                isExpanded={isExpanded}
                onToggle={toggleRowExpansion}
                onCommanderClick={openCommanderModal}
              />
            );
          })}
        </tbody>
      </table>
      <LoadMore 
        onLoadMore={() => setDisplayCount(prev => prev + 10)}
        remainingCount={games.length - displayCount}
      />
      
      {selectedCommander && (
        <CommanderModal
          isOpen={!!selectedCommander}
          onClose={closeCommanderModal}
          commanderName={selectedCommander.commanderName}
          playerName={selectedCommander.playerName}
        />
      )}
    </div>
  );
}

export default GameFeed;