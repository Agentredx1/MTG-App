import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StatTable from '../components/StatTable/StatTable.jsx';
import ColorTable from '../components/ColorTable/ColorTable.jsx';

export default function PlayerPage() {
  const { name } = useParams();
  const [playerData, setPlayerData] = useState([]);
  const [commanderData, setCommanderData] = useState([]); // if you have this endpoint

  // Player win rate(s)
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const url = `/api/v1/stats/players/win-rate/${name ? name : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!ignore) {
          // API returns a single object when name is provided; normalize to an array for StatTable
          const rows = Array.isArray(data) ? data : data ? [data] : [];
          setPlayerData(rows);
        }
      } catch (e) {
        console.error(e);
        if (!ignore) setPlayerData([]);
      }
    })();

    return () => { ignore = true; };
  }, [name]);

  useEffect(() => {
    if (!name) return;
    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/v1/stats/commanders/win-rate/${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setCommanderData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!ignore) setCommanderData([]);
      }
    })();

    return () => { ignore = true; };
  }, [name]);

  return (
    <div>
      <StatTable type="player" data={playerData}/>
      <StatTable type="commander" data={commanderData}/>
      <ColorTable name={name}></ColorTable>
    </div>
  );
}
