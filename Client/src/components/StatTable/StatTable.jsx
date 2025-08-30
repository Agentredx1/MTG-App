import React, { useState, useEffect } from 'react';
import './StatTable.css';
import { Link, generatePath } from 'react-router-dom';
import LoadMore from '../LoadMore/LoadMore';
import ExpandableRow from '../ExpandableRow/ExpandableRow';
import CommanderModal from '../CommanderModal/CommanderModal';
import ColorTable from '../ColorTable/ColorTable';

function StatTable({type, data}){
    const [displayCount, setDisplayCount] = useState(10);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedCommander, setSelectedCommander] = useState(null);
    const [playerExpandedData, setPlayerExpandedData] = useState(new Map());
    
    const displayedData = data.slice(0, displayCount);
    
    const toggleRowExpansion = (rowIndex) => {
      setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(rowIndex)) {
          newSet.delete(rowIndex);
        } else {
          newSet.add(rowIndex);
          // If this is a player type and we're expanding, fetch data if not already loaded
          if (type.toLowerCase() === 'player' && displayedData[rowIndex]) {
            const playerName = displayedData[rowIndex].player_name;
            fetchPlayerExpandedData(playerName, rowIndex);
          }
        }
        return newSet;
      });
    };

    const fetchPlayerExpandedData = async (playerName, rowIndex) => {
      if (playerExpandedData.has(rowIndex)) {
        return; // Already have data for this player
      }

      try {
        // Only fetch commander data - ColorTable handles its own data fetching
        const commandersRes = await fetch(`/api/v1/stats/commanders/win-rate/${encodeURIComponent(playerName)}`);
        const commandersData = commandersRes.ok ? await commandersRes.json() : [];

        setPlayerExpandedData(prev => new Map(prev).set(rowIndex, {
          commanders: Array.isArray(commandersData) ? commandersData : [],
          playerName: playerName // Store playerName for ColorTable
        }));
      } catch (error) {
        console.error('Error fetching player data:', error);
        setPlayerExpandedData(prev => new Map(prev).set(rowIndex, {
          commanders: [],
          playerName: playerName
        }));
      }
    };

    const openCommanderModal = (commanderName) => {
      setSelectedCommander({ commanderName, playerName: null });
    };

    const closeCommanderModal = () => {
      setSelectedCommander(null);
    };

    const renderPlayerExpanded = (playerName, rowIndex) => {
      const expandedData = playerExpandedData.get(rowIndex);
      
      if (!expandedData) {
        return (
          <div className="stat-player-expanded">
            <div className="loading-content">Loading player statistics...</div>
          </div>
        );
      }

      const { commanders } = expandedData;

      return (
        <div className="stat-player-expanded">
          <div className="stat-player-sections">
            {/* Commanders Section */}
            <div className="stat-player-commanders-section">
              <h4>Commander Performance</h4>
              {commanders.length > 0 ? (
                <div className="stat-mini-table">
                  <div className="stat-mini-table-header">
                    <span>Commander</span>
                    <span>Games</span>
                    <span>Wins</span>
                    <span>WR</span>
                  </div>
                  {commanders.slice(0, 5).map((cmd, idx) => {
                    const winRate = Math.round((cmd.wins / cmd.games) * 100);
                    return (
                      <div key={idx} className="stat-mini-table-row">
                        <span className="commander-name">{cmd.commander_name}</span>
                        <span>{cmd.games}</span>
                        <span>{cmd.wins}</span>
                        <span className={winRate >= 50 ? 'high-wr' : ''}>{winRate}%</span>
                      </div>
                    );
                  })}
                  {commanders.length > 5 && (
                    <div className="stat-mini-table-more">
                      <Link to={`/Metrics/${encodeURIComponent(playerName)}`}>
                        View all {commanders.length} commanders →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="stat-no-data">No commander data available</div>
              )}
            </div>

            {/* Colors Section using ColorTable component */}
            <div className="stat-player-colors-section">
              <ColorTable name={playerName} />
            </div>
          </div>
          
          <div className="stat-player-footer">
            <Link to={`/Metrics/${encodeURIComponent(playerName)}`} className="view-full-link">
              View Full Player Page →
            </Link>
          </div>
        </div>
      );
    };

    const renderCommanderExpanded = (commanderName) => {
      const imageUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}&format=image&version=art_crop`;
      
      return (
        <div className="stat-commander-expanded">
          <div className="stat-commander-image-section">
            <div 
              className="stat-commander-image-container clickable"
              onClick={() => openCommanderModal(commanderName)}
            >
              <img
                src={imageUrl}
                alt={commanderName}
                className="stat-commander-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="stat-commander-placeholder" style={{display: 'none'}}>
                <span>Image not available</span>
              </div>
              <div className="stat-click-overlay">
                <span>Click to view details</span>
              </div>
            </div>
          </div>
          <div className="stat-commander-info">
            <h4>{commanderName}</h4>
            <p>Click the image to view card details and external links</p>
          </div>
        </div>
      );
    };
    
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>{type}</th>
            <th>Games Played</th>
            <th>Wins</th>
            <th>WR</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((row, index) => {
            const winRate = Math.round((row.wins / row.games) * 100);
            let className = '';
            if (winRate >= 50 && row.games >= 5 ) {
              className = 'wr-too-high';
            } else if (winRate >= 40 && row.games >= 6 ) {
              className = 'wr-high';
            }

            const displayName =
              type.toLowerCase() === 'player' ? row.player_name : row.commander_name;

            // Use ExpandableRow for both Player and Commander types
            const isExpanded = expandedRows.has(index);
            const isCommander = type.toLowerCase() === 'commander';
            const isPlayer = type.toLowerCase() === 'player';
            
            return (
              <ExpandableRow
                key={index}
                id={index}
                isExpanded={isExpanded}
                onToggle={toggleRowExpansion}
                colSpan={4}
                className={className}
                expandedContent={
                  isCommander 
                    ? renderCommanderExpanded(displayName)
                    : isPlayer 
                      ? renderPlayerExpanded(displayName, index)
                      : null
                }
              >
                <td data-label="name">
                  {isPlayer ? (
                    <Link to={`/Metrics/${encodeURIComponent(displayName)}`}>
                      {displayName}
                    </Link>
                  ) : (
                    displayName
                  )}
                </td>
                <td data-label="Games Played">{row.games}</td>
                <td data-label="Wins">{row.wins}</td>
                <td data-label="Win Rate (%)">{winRate}%</td>
              </ExpandableRow>
            );
          })}
        </tbody>
      </table>
      <LoadMore 
        onLoadMore={() => setDisplayCount(prev => prev + 10)}
        remainingCount={data.length - displayCount}
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
};

export default StatTable;