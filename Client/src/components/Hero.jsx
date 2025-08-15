import { useState, useEffect } from 'react';
import './Hero.css';

export function Hero() {
  const [rows, setRows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

    return (
    <div>
      {rows.length === 0 ? (
        <p>Loading…</p>
      ) : (
        <>
          <h3>Most played commanders last 30 days:</h3>
          <div className="carousel">
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex - 1 < 0 ? rows.length - 1 : currentIndex - 1].image}
                alt={rows[currentIndex - 1 < 0 ? rows.length - 1 : currentIndex - 1].commander_name}
                className="carousel-left"
              />
            )}
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex].image}
                alt={rows[currentIndex].commander_name}
                className="carousel-center"
              />
            )}
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex + 1 > rows.length - 1 ? 0 : currentIndex + 1].image}
                alt={rows[currentIndex + 1 > rows.length - 1 ? 0 : currentIndex + 1].commander_name}
                className="carousel-right"
              />
            )}
            <div className="carousel-caption">
              <strong>{currentIndex + 1}. {rows[currentIndex].commander_name}</strong>
              {typeof rows[currentIndex].games_played !== 'undefined' && (
                <span> – {rows[currentIndex].games_played} games</span>
              )}
            </div>                        
            <div className="carousel-nav">
              <button onClick={prevSlide} aria-label="Previous commander">&lt;</button>
              <button onClick={nextSlide} aria-label="Next commander">&gt;</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}