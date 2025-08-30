import './LoadMore.css';

function LoadMore({ onLoadMore, remainingCount, incrementBy = 10, className = '' }) {
  if (remainingCount <= 0) {
    return null;
  }

  return (
    <div className={`load-more-container ${className}`}>
      <button 
        className="load-more-btn" 
        onClick={onLoadMore}
      >
        Show More ({remainingCount} remaining)
      </button>
    </div>
  );
}

export default LoadMore;