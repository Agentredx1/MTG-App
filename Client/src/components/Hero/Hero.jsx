import { useState, useEffect, useRef } from 'react';
import './Hero.css';

export function Hero() {
  const [rows, setRows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/stats/most-played');
        const data = await res.json();
        setRows(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const slideToIndex = (newIndex) => {
    if (isTransitioning || rows.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? rows.length - 1 : currentIndex - 1;
    slideToIndex(newIndex);
  };

  const nextSlide = () => {
    const newIndex = currentIndex === rows.length - 1 ? 0 : currentIndex + 1;
    slideToIndex(newIndex);
  };

  // Auto-advance every 8s
  useEffect(() => {
    if (rows.length < 2) return;

    if (!paused && !isTransitioning) {
      intervalRef.current = setInterval(() => {
        const newIndex = (currentIndex + 1) % rows.length;
        slideToIndex(newIndex);
      }, 8000);
    }

    return () => clearInterval(intervalRef.current);
  }, [rows, paused, currentIndex, isTransitioning]);

  // Create extended array for seamless looping - only show 3 items at a time
  const getVisibleCards = () => {
    if (rows.length === 0) return [];
    if (rows.length === 1) return [null, rows[0], null]; // Only center item
    if (rows.length === 2) return [rows[1], rows[0], rows[1]]; // Duplicate for sides
    
    const prevIndex = currentIndex === 0 ? rows.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === rows.length - 1 ? 0 : currentIndex + 1;
    
    return [
      rows[prevIndex], // Left (previous)
      rows[currentIndex], // Center (current) 
      rows[nextIndex]  // Right (next)
    ];
  };

  const visibleCards = getVisibleCards();

  return (
    <div>
      {rows.length === 0 ? (
        <p>Loading…</p>
      ) : (
        <>
          <h3>Most played commanders last 30 days:</h3>
          <div
            className="carousel"
            ref={carouselRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="carousel-track">
              {visibleCards.map((card, index) => {
                if (!card) return <div key={`empty-${index}`} className="carousel-item carousel-hidden"></div>;
                
                const positions = ['side-left', 'center', 'side-right'];
                const position = positions[index];
                
                // Get actual index for numbering
                let actualIndex = currentIndex;
                if (position === 'side-left') {
                  actualIndex = currentIndex === 0 ? rows.length - 1 : currentIndex - 1;
                } else if (position === 'side-right') {
                  actualIndex = currentIndex === rows.length - 1 ? 0 : currentIndex + 1;
                }

                const handleSideClick = () => {
                  if (position === 'side-left') {
                    prevSlide();
                  } else if (position === 'side-right') {
                    nextSlide();
                  }
                };

                return (
                  <div 
                    key={`${card.commander_name}-${position}-${actualIndex}`} 
                    className={`carousel-item carousel-${position}`}
                    style={{
                      transition: isTransitioning ? 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'all 0.3s ease'
                    }}
                    onClick={position !== 'center' ? handleSideClick : undefined}
                    role={position !== 'center' ? 'button' : undefined}
                    tabIndex={position !== 'center' ? 0 : undefined}
                    aria-label={position !== 'center' ? 
                      `Go to ${card.commander_name}` : 
                      undefined
                    }
                    onKeyDown={position !== 'center' ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSideClick();
                      }
                    } : undefined}
                  >
                    <img
                      src={card.image}
                      alt={card.commander_name}
                      draggable={false}
                    />
                    {position === 'center' && (
                      <div className="carousel-caption" aria-live="polite">
                        <strong>
                          {actualIndex + 1}. {card.commander_name}
                        </strong>
                        {typeof card.games_played !== 'undefined' && (
                          <span> – {card.games_played} games</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
