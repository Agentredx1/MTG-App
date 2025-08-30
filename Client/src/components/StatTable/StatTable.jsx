import { useState, useEffect } from 'react';
import './StatTable.css';
import { Link, generatePath } from 'react-router-dom';
import LoadMore from '../LoadMore/LoadMore';

function StatTable({type, data}){
    const [displayCount, setDisplayCount] = useState(10);
    
    const displayedData = data.slice(0, displayCount);
    
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

            return (
              <tr key={index} className={className}>
                <td data-label="name">{type=="Player" ? (
                  <Link to={`/Metrics/${encodeURIComponent(displayName)}`}>
                    {displayName}
                  </Link>
                ) : ( displayName)}
                </td>
                <td data-label="Games Played">{row.games}</td>
                <td data-label="Wins">{row.wins}</td>
                <td data-label="Win Rate (%)">{winRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <LoadMore 
        onLoadMore={() => setDisplayCount(prev => prev + 10)}
        remainingCount={data.length - displayCount}
      />
    </div>
  );
};

export default StatTable;