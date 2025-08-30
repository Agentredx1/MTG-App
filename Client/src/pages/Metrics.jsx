import { useState, useEffect } from 'react';
import StatTable from '../components/StatTable/StatTable.jsx';
import { useGameMeta } from '../contexts/GameMetaProvider';
import GameFeed from '../components/GameFeed/GameFeed.jsx';

export default function Metrics(){
  const { players, commanders } = useGameMeta();

    return(
        <div>
            <StatTable type='Player' data={players}></StatTable>
            <StatTable type='Commander' data={commanders}></StatTable>
            <GameFeed></GameFeed>
        </div>
    )
}