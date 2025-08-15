import { useState, useEffect } from 'react';

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
      {/* move this <style> block to your CSS later */}
      <style>{`
        .carousel {
          position: relative;
          max-width: 400px;
          margin: 1rem auto;
          overflow: hidden;
        }
        .carousel-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .carousel-nav {
          position: absolute;
          top: 50%;
          width: 100%;
          display: flex;
          justify-content: space-between;
          transform: translateY(-50%);
        }
        .carousel-nav button {
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          cursor: pointer;
        }
        .carousel-caption {
          text-align: center;
          margin-top: 0.5rem;
        }
      `}</style>

      {rows.length === 0 ? (
        <p>Loading…</p>
      ) : (
        <>
          <h3>Most played commanders last 30 days:</h3>
          <div className="carousel">
            {rows[currentIndex].image && (
              <img
                src={rows[currentIndex].image}
                alt={rows[currentIndex].commander_name}
                className="carousel-img"
              />
            )}
            <div className="carousel-nav">
              <button onClick={prevSlide} aria-label="Previous commander">&lt;</button>
              <button onClick={nextSlide} aria-label="Next commander">&gt;</button>
            </div>
          </div>
          <div className="carousel-caption">
            <strong>{rows[currentIndex].commander_name}</strong>
            {typeof rows[currentIndex].games_played !== 'undefined' && (
              <span> – {rows[currentIndex].games_played} games</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}


