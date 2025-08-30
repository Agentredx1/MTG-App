import React from 'react';
import './GameRow.css';
import ExpandableRow from '../ExpandableRow/ExpandableRow';

function GameRow({ 
  game, 
  isExpanded, 
  onToggle, 
  onCommanderClick,
  className = ""
}) {
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

  const renderExpandedContent = () => {
    const sortedParticipants = game.participants.sort((a, b) => a.turn_order - b.turn_order);
    
    return (
      <div className="expanded-content">
        <div className="commander-images">
          {sortedParticipants.map((participant, index) => {
            const isWinner = participant.player_name === game.winner_name;
            const commanderName = participant.commander_name || 'Unknown';
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
                    onClick={() => onCommanderClick(commanderName, participant.player_name)}
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
                    onClick={() => onCommanderClick(commanderName, participant.player_name)}
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

  return (
    <ExpandableRow
      id={game.game_id}
      isExpanded={isExpanded}
      onToggle={onToggle}
      colSpan={4}
      className={`game-row ${className}`.trim()}
      expandedContent={renderExpandedContent()}
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
    </ExpandableRow>
  );
}

export default GameRow;