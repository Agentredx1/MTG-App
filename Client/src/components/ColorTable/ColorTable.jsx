import { useState, useEffect } from 'react';
import './ColorTable.css';

const WUBRG = ['W', 'U', 'B', 'R', 'G'];
const LETTER_TO_NAME = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' };

export default function ColorTable({name}) {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/stats/colors/frequency/${name ? name : ''}`);

        const raw = await res.json(); // [{ color: 'W', freq: '12' }, ...]
        const byLetter = new Map();

        for (const row of Array.isArray(raw) ? raw : []) {
          const letter = String(row.color || '').toUpperCase();
          if (!WUBRG.includes(letter)) continue;
          const count = Number(row.freq) || 0;
          byLetter.set(letter, count);
        }

        const total = WUBRG.reduce((sum, l) => sum + (byLetter.get(l) || 0), 0);

        const normalized = WUBRG.map(l => {
          const count = byLetter.get(l) || 0;
          const percentage = total ? (count / total) * 100 : 0;
          return {
            color_code: l,
            color_name: LETTER_TO_NAME[l],
            count,
            percentage,
            className: LETTER_TO_NAME[l].toLowerCase(), // "white", "blue", ...
          };
        });

        setColors(normalized);
      } catch (e) {
        console.error('Failed to load color frequencies', e);
        setColors([]);
      }
    })();
  }, []);

  if (!Array.isArray(colors) || colors.length === 0) {
    return (
      <section className="color-analysis">
        <div className="no-color-data">No color data available</div>
      </section>
    );
  }

  return (
    <section>
      <h2>Color Frequency</h2>
      <ul className="chart">
        {colors.map((c) => (
          <li
            key={c.color_code}
            className={c.className}
            style={{ '--pct': `${c.percentage}%` }}
          >
            <span className="bar" aria-hidden="true" />
            <span className="label">
              {c.color_name}: <span className="count">{Math.round(c.percentage)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
