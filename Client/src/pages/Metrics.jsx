import { useState, useEffect } from 'react';
import StatTable from '../components/StatTable/StatTable.jsx';
import { useGameMeta } from '../contexts/GameMetaProvider';

export default function Metrics(){
  const { players, commanders } = useGameMeta();

    return(
        <div>
            <StatTable type='Player' data={players}></StatTable>
            <StatTable type='Commander' data={commanders}></StatTable>
        </div>
    )
}