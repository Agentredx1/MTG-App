import { useState } from 'react';
import './CommanderModal.css';

export default function CommanderModal({ 
  isOpen, 
  onClose, 
  commanderName, 
  playerName = null 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toKebabCase = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove commas, apostrophes, etc.
      .trim()
      .replace(/\s+/g, '-'); // replace spaces with hyphens
  };

  const createScryfallUrl = (name) => {
    const encodedName = encodeURIComponent(name);
    return `https://scryfall.com/search?q=${encodedName}`;
  };

  const createEdhrecUrl = (name) => {
    const kebabName = toKebabCase(name);
    return `https://edhrec.com/commanders/${kebabName}`;
  };

  const createImageUrl = (name) => {
    const encodedName = encodeURIComponent(name);
    return `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image`;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div 
      className="modal-overlay commander-modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal commander-modal">
        <div className="commander-modal-header">
          <h3>{commanderName}</h3>
          {playerName && (
            <p className="commander-player">Played by {playerName}</p>
          )}
          <button 
            className="commander-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="commander-modal-content">
          <div className="commander-image-section">
            {imageLoading && !imageError && (
              <div className="commander-image-loading">
                <span>Loading image...</span>
              </div>
            )}
            
            {!imageError ? (
              <img
                src={createImageUrl(commanderName)}
                alt={commanderName}
                className="commander-modal-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            ) : (
              <div className="commander-image-placeholder">
                <span>Image not available</span>
                <small>{commanderName}</small>
              </div>
            )}
          </div>

          <div className="commander-modal-actions">
            <a
              href={createScryfallUrl(commanderName)}
              target="_blank"
              rel="noopener noreferrer"
              className="commander-link-btn scryfall-btn"
            >
              View on Scryfall
            </a>
            
            <a
              href={createEdhrecUrl(commanderName)}
              target="_blank"
              rel="noopener noreferrer"
              className="commander-link-btn edhrec-btn"
            >
              View on EDHREC
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}