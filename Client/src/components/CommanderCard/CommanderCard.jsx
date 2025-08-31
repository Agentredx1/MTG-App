import React, { useState, useEffect } from 'react';
import './CommanderCard.css';

function CommanderCard({ 
  participant, 
  isWinner, 
  isExpanded, 
  onToggleExpansion 
}) {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldLoadDetails, setShouldLoadDetails] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const commanderName = participant.commander_name || 'Unknown';
  const imageUrl = commanderName !== 'Unknown' 
    ? `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}&format=image&version=art_crop`
    : null;

  useEffect(() => {
    if (isExpanded) {
      // Delay loading details until after the transition (400ms)
      const timer = setTimeout(() => {
        setShouldLoadDetails(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setShouldLoadDetails(false);
      setShowDetails(false);
      setCardData(null);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (shouldLoadDetails && commanderName !== 'Unknown' && !cardData && !loading) {
      setLoading(true);
      fetch(`/api/v1/cards/details/${encodeURIComponent(commanderName)}`)
        .then(res => res.json())
        .then(data => {
          setCardData(data);
          // Short delay before showing details for fade-in effect
          setTimeout(() => setShowDetails(true), 50);
        })
        .catch(err => {
          console.error('Failed to fetch card details:', err);
          setTimeout(() => setShowDetails(true), 50);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [shouldLoadDetails, commanderName, cardData, loading]);

  const handleClick = () => {
    onToggleExpansion(participant.player_id);
  };

  const getManaPipImage = (symbol) => {
    const colorMap = {
      'w': '/src/assets/mana-pips/pip-w.webp',
      'u': '/src/assets/mana-pips/pip-u.webp', 
      'b': '/src/assets/mana-pips/pip-b.webp',
      'r': '/src/assets/mana-pips/pip-r.webp',
      'g': '/src/assets/mana-pips/pip-g.webp'
    };
    return colorMap[symbol.toLowerCase()] || null;
  };

  const renderManaCost = (manaCost) => {
    if (!manaCost) return null;
    
    // Convert mana cost string to mana symbols
    const symbols = manaCost.match(/{[^}]+}/g) || [];
    return symbols.map((symbol, index) => {
      const cleanSymbol = symbol.replace(/{|}/g, '').toLowerCase();
      const pipImage = getManaPipImage(cleanSymbol);
      
      if (pipImage) {
        return (
          <img 
            key={index} 
            src={pipImage} 
            alt={cleanSymbol.toUpperCase()} 
            title={symbol}
            className="mana-pip"
          />
        );
      } else {
        // For numeric/other symbols, use text display
        return (
          <span key={index} className="mana-symbol-text" title={symbol}>
            {cleanSymbol.toUpperCase()}
          </span>
        );
      }
    });
  };

  const renderColorIdentity = (colorIdentity) => {
    if (!colorIdentity || !colorIdentity.length) return null;
    
    return colorIdentity.map((color, index) => {
      const pipImage = getManaPipImage(color);
      
      if (pipImage) {
        return (
          <img 
            key={index} 
            src={pipImage} 
            alt={color} 
            title={color}
            className="mana-pip"
          />
        );
      } else {
        return (
          <span key={index} className="mana-symbol-text" title={color}>
            {color}
          </span>
        );
      }
    });
  };

  return (
    <div 
      className={`commander-card ${isWinner ? 'winner' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      <div className="commander-left">
        <div className="commander-info">
          <h4 className="commander-player-name">{participant.player_name}</h4>
          <p className="commander-card-name">{commanderName}</p>
        </div>
        {imageUrl ? (
          <div className="commander-image-container">
            <img 
              src={imageUrl} 
              alt={commanderName}
              className="commander-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="image-placeholder" style={{display: 'none'}}>
              <span>Image not available</span>
            </div>
            <div className="click-overlay">
              <span>Click to expand</span>
            </div>
          </div>
        ) : (
          <div className="image-placeholder">
            <span>No commander</span>
            <small>Click to expand</small>
          </div>
        )}
      </div>
      {isExpanded && (
        <div className={`commander-details ${showDetails ? 'visible' : ''}`}>
          {loading ? (
            <div className="loading-details">Loading card details...</div>
          ) : cardData ? (
            <>
              <div className="card-header">
                <div className="mana-cost">
                  {renderManaCost(cardData.mana_cost)}
                </div>
                <div className="cmc">CMC: {cardData.cmc}</div>
              </div>
              
              <div className="card-type">
                {cardData.type_line}
              </div>
              
              <div className="color-identity">
                <strong>Color Identity:</strong>
                <div className="color-symbols">
                  {renderColorIdentity(cardData.color_identity)}
                </div>
              </div>
              
              <div className="oracle-text">
                {cardData.oracle_text.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </>
          ) : shouldLoadDetails ? (
            <div className="error-details">Failed to load card details</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default CommanderCard;