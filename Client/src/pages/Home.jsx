import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero.jsx';
import ColorTable from '../components/ColorTable/ColorTable.jsx';
import './Home.css';

export default function Home() {
  const [stats, setStats] = useState({
    totalGames: 0,
    activePlayers: 0,
    avgGameLength: 0,
    uniqueCommanders: 0
  });
  const [recentGames, setRecentGames] = useState([]);
  const [playerSpotlight, setPlayerSpotlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch recent games
        const gamesResponse = await fetch('/api/v1/stats/game-feed');
        const gamesData = await gamesResponse.json();
        setRecentGames(gamesData?.slice(0, 3) || []);

        // Fetch player stats to find top player
        const playersResponse = await fetch('/api/v1/stats/players/win-rate');
        const playersData = await playersResponse.json();
        if (playersData && playersData.length > 0) {
          setPlayerSpotlight(playersData[0]); // Top player by wins
        }

        // Fetch commanders for unique count
        const commandersResponse = await fetch('/api/v1/stats/commanders/win-rate');
        const commandersData = await commandersResponse.json();

        // Calculate average game length from recent games (excluding null/0 turn counts)
        let avgTurns = 0;
        if (gamesData && gamesData.length > 0) {
          const gamesWithTurns = gamesData.filter(game => game.turns && game.turns > 0);
          if (gamesWithTurns.length > 0) {
            const totalTurns = gamesWithTurns.reduce((sum, game) => sum + game.turns, 0);
            avgTurns = Math.round((totalTurns / gamesWithTurns.length) * 10) / 10; // Round to 1 decimal
          }
        }

        // Calculate total games from the game feed (this gives us the most recent games)
        // Note: This is limited by the API's LIMIT, so it's not the true total
        const totalGamesCount = gamesData?.length || 0;

        setStats({
          totalGames: totalGamesCount,
          activePlayers: playersData?.length || 0,
          avgGameLength: avgTurns || 0,
          uniqueCommanders: commandersData?.length || 0
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Welcome Section */}
      <section className="welcome">
        <h1>Welcome to MTG Tracker</h1>
        <p>Track your Commander games, analyze your meta, and discover new strategies</p>
        <div className="quick-actions">
          <Link to="/AddGameForm" className="btn btn-primary">📝 Add New Game</Link>
          <Link to="/Metrics" className="btn btn-secondary">📊 View All Stats</Link>
          <Link to="/Metrics" className="btn btn-secondary">👥 Browse Players</Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-number">{stats.totalGames}</h3>
          <p className="stat-label">Recent Games</p>
          <p className="stat-sublabel">last 20 shown</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">{stats.activePlayers}</h3>
          <p className="stat-label">Active Players</p>
          <p className="stat-sublabel">with recorded games</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">{stats.avgGameLength}</h3>
          <p className="stat-label">Avg Game Length</p>
          <p className="stat-sublabel">turns</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-number">{stats.uniqueCommanders}</h3>
          <p className="stat-label">Unique Commanders</p>
          <p className="stat-sublabel">in database</p>
        </div>
      </section>

      {/* Commander Carousel - Full Width Row */}
      <section className="carousel-section">
        <h2>🔥 Most Played Commanders (Last 30 Days)</h2>
        <Hero />
      </section>

      {/* Content Grid - Three Sections */}
      <div className="content-grid">
        {/* Recent Games */}
        <section className="recent-games-section">
          <div className="card">
            <h3>📺 Recent Games</h3>
            {recentGames.length > 0 ? (
              <>
                {recentGames.map((game, index) => {
                  const otherPlayers = game.participants
                    ?.filter(p => !p.is_winner)
                    ?.map(p => p.player_name)
                    ?.join(', ') || 'Unknown players';
                    
                  return (
                    <div key={game.game_id || index} className="recent-game">
                      <div className="game-info">
                        <div className="game-winner">{game.winner_name} won!</div>
                        <div className="game-players">vs {otherPlayers}</div>
                      </div>
                      <div className="game-date">{formatTimeAgo(game.date)}</div>
                    </div>
                  );
                })}
                <Link 
                  to="/GameFeed" 
                  className="view-all-link"
                >
                  View All Games →
                </Link>
              </>
            ) : (
              <p>No recent games found</p>
            )}
          </div>
        </section>

        {/* Player Spotlight */}
        <section className="player-section">
          {playerSpotlight && (
            <div className="card">
              <h3>🌟 Player of the Month</h3>
              <div className="player-spotlight">
                <div className="spotlight-avatar">
                  {playerSpotlight.player_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="spotlight-name">{playerSpotlight.player_name}</div>
                <div className="spotlight-title">Most Wins</div>
                <div className="spotlight-stats">
                  <div>
                    <div className="spotlight-stat-value">{playerSpotlight.games}</div>
                    <div className="spotlight-stat-label">Games</div>
                  </div>
                  <div>
                    <div className="spotlight-stat-value">{playerSpotlight.win_rate}%</div>
                    <div className="spotlight-stat-label">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Color Distribution */}
        <section className="colors-section">
          <div className="card">
            <h3>🎨 Color Distribution</h3>
            <ColorTable />
          </div>
        </section>
      </div>
    </div>
  );
}