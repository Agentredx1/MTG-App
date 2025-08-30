import React, { useState, useEffect } from 'react';
import './GameFeed.css';
import LoadMore from '../LoadMore/LoadMore';
import CommanderModal from '../CommanderModal/CommanderModal.jsx';

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const openCommanderModal = (commanderName, playerName) => {
    setSelectedCommander({ commanderName, playerName });
  };

  const closeCommanderModal = () => {
    setSelectedCommander(null);
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

  const renderExpandedContent = (game) => {
    const sortedParticipants = game.participants.sort((a, b) => a.turn_order - b.turn_order);
    
    return (
      <div className="expanded-content">
        <div className="commander-images">
          {sortedParticipants.map((participant, index) => {
            const isWinner = participant.player_name === game.winner_name;
            const commanderName = participant.commander_name || 'Unknown';
            // Scryfall API URL for commander images
            const imageUrl = commanderName !== 'Unknown' 
              ? `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}&format=image&version=art_crop`
              : null;
            
            return (
              <div key={index} className={`commander-card ${isWinner ? 'winner' : ''}`}>
                <div className="commander-info">
                  <h4 className="commander-player-name">{participant.player_name}</h4>
                  <p className="commander-card-name">{commanderName}</p>
                </div>
                {imageUrl ? (
                  <div 
                    className="commander-image-container clickable"
                    onClick={() => openCommanderModal(commanderName, participant.player_name)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={commanderName}
                      className="commander-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-placeholder" style={{display: 'none'}}>
                      <span>Image not available</span>
                    </div>
                    <div className="click-overlay">
                      <span>Click to view details</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="image-placeholder clickable"
                    onClick={() => openCommanderModal(commanderName, participant.player_name)}
                  >
                    <span>No commander</span>
                    <small>Click to view details</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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
              <React.Fragment key={game.game_id}>
                <tr 
                  className={`game-row ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleRowExpansion(game.game_id)}
                >
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
                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="4" className="expanded-cell">
                      {renderExpandedContent(game)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
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