import { useState, useEffect, useRef } from 'react';
import ColorTable from '../ColorTable/ColorTable.jsx';
import './Hero.css';

export function Hero() {
  const [rows, setRows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false); // pause when hovered/focused
  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/most_played');
        const data = await res.json();
        setRows(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const prevSlide = () => {
    setCurrentIndex((idx) => (idx === 0 ? rows.length - 1 : idx - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((idx) => (idx === rows.length - 1 ? 0 : idx + 1));
  };

  // Auto-advance every 8s
  useEffect(() => {
    if (rows.length < 2) return; // don’t loop if only one image

    if (!paused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((idx) => (idx === rows.length - 1 ? 0 : idx + 1));
      }, 8000);
    }

    return () => clearInterval(intervalRef.current);
  }, [rows, paused]);

  return (
    <div>
      {rows.length === 0 ? (
        <p>Loading…</p>
      ) : (
        <>
          <h3>Most played commanders last 30 days:</h3>
          <div
            className="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* Side (left) */}
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex - 1 < 0 ? rows.length - 1 : currentIndex - 1].image}
                alt={rows[currentIndex - 1 < 0 ? rows.length - 1 : currentIndex - 1].commander_name}
                className="carousel-side"
              />
            )}

            {/* Center */}
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex].image}
                alt={rows[currentIndex].commander_name}
                className="carousel-center"
              />
            )}

            {/* Side (right) */}
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex + 1 > rows.length - 1 ? 0 : currentIndex + 1].image}
                alt={rows[currentIndex + 1 > rows.length - 1 ? 0 : currentIndex + 1].commander_name}
                className="carousel-side"
              />
            )}

            <div className="carousel-caption" aria-live="polite">
              <strong>
                {currentIndex + 1}. {rows[currentIndex].commander_name}
              </strong>
              {typeof rows[currentIndex].games_played !== 'undefined' && (
                <span> – {rows[currentIndex].games_played} games</span>
              )}
            </div>

            {rows.length > 1 && (
              <div className="carousel-nav">
                <button onClick={prevSlide} aria-label="Previous commander">
                  &lt;
                </button>
                <button onClick={nextSlide} aria-label="Next commander">
                  &gt;
                </button>
              </div>
            )}
          </div>
        </>
      )}
      <ColorTable />
    </div>
  );
}
