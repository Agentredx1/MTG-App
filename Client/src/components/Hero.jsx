import { useState, useEffect } from 'react';

export function Hero() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/most_played');
        const data = await res.json();
        setRows(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div>
      {rows.length === 0 ? (
        <p>Loading…</p>
      ) : (
        <>
            <h3>Most played commanders last 30 days:</h3>
            <ol>
                {rows.map((row) => (
                    <li key={row.commander_name}>{row.commander_name}: {row.games_played} Games</li>
                ))}
            </ol>
            <p>{rows.toString()}</p>
        </>
      )}
    </div>
  );
}

