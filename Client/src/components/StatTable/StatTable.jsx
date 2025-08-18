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
          {data.map((row, index) => (
            <tr key={index}>
              <td data-label="name">{type=="Player" ? row.player_name : row.commander_name}</td>
              <td data-label="Games Played">{row.games}</td>
              <td data-label="Wins">{row.wins}</td>
              <td data-label="Win Rate (%)">{Math.ceil((row.wins / row.games) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatTable;