import React, { useState } from 'react';
import './GameRow.css';
import ExpandableRow from '../ExpandableRow/ExpandableRow';
import CommanderCard from '../CommanderCard/CommanderCard.jsx';

function GameRow({ 
  game, 
  isExpanded, 
  onToggle, 
  onCommanderClick,
  className = ""
}) {
  const [expandedCommanderId, setExpandedCommanderId] = useState(null);

  const handleCommanderCardClick = (participantId) => {
    setExpandedCommanderId(prev => prev === participantId ? null : participantId);
  };

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
            const isExpanded = expandedCommanderId === participant.player_id;
            
            return (
              <CommanderCard
                key={index}
                participant={participant}
                isWinner={isWinner}
                isExpanded={isExpanded}
                onToggleExpansion={handleCommanderCardClick}
              />
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