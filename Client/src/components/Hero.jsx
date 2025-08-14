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
            <table>
            <thead>
                <tr>
                <th>Commander</th>
                <th>Games</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                <tr key={row.commander_name}>
                    <td>{row.commander_name}</td>
                    <td>{row.games_played}</td>
                </tr>
                ))}
            </tbody>
            </table>

        </>
      )}
    </div>
  );
}

