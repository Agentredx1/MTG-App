import { useState, useEffect } from 'react';
import './StatTable.css';

function StatTable({type, data}){
    
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
          {data.map((row, index) => {
            const winRate = Math.round((row.wins / row.games) * 100);
            let className = '';
            if (winRate >= 50) {
              className = 'wr-too-high';
            } else if (winRate >= 40) {
              className = 'wr-high';
            }
            
            return (
              <tr key={index} className={className}>
                <td data-label="name">{type=="Player" ? row.player_name : row.commander_name}</td>
                <td data-label="Games Played">{row.games}</td>
                <td data-label="Wins">{row.wins}</td>
                <td data-label="Win Rate (%)">{winRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StatTable;