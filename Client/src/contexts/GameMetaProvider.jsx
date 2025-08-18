// GameMetaProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const GameMetaCtx = createContext(null);

export function GameMetaProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const [commanders, setCommanders] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch once on mount
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [playerRes, commanderRes, colorRes] = await Promise.all([
          fetch('/api/playerWinRate', { signal: ac.signal }),
          fetch('/api/commanderWinRate', { signal: ac.signal }),
          fetch('/api/ColorFreq', { signal: ac.signal})
        ]);

        if (!playerRes.ok) throw new Error(`playerWinRate ${playerRes.status}`);
        if (!commanderRes.ok) throw new Error(`commanderWinRate ${commanderRes.status}`);
        if (!colorRes.ok) throw new Error (`ColorFreq ${colorRes}`);

        const [playerData, commanderData, colorData] = await Promise.all([
          playerRes.json(),
          commanderRes.json(),
          colorRes.json()
        ]);

        setPlayers(Array.isArray(playerData) ? playerData : []);
        setCommanders(Array.isArray(commanderData) ? commanderData : []);
        setColors(Array.isArray(colorData) ? colorData : []);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load metadata');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // unique name lists
  const playerNames = useMemo(() => {
    const list = (players || [])
      .map(p => (p.player_name ?? p.name ?? '').trim())
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [players]);

  const commanderNames = useMemo(() => {
    const list = (commanders || [])
      .map(c => (c.commander_name ?? c.name ?? '').trim())
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [commanders]);

  const value = {
    loading,
    error,
    players,
    commanders,
    playerNames,
    commanderNames,
    // manual refresh
    refresh: async () => {
      const [pr, cr] = await Promise.all([fetch('/api/playerWinRate'), fetch('/api/commanderWinRate')]);
      setPlayers(pr.ok ? await pr.json() : []);
      setCommanders(cr.ok ? await cr.json() : []);
    }
  };

  return <GameMetaCtx.Provider value={value}>{children}</GameMetaCtx.Provider>;
}

export function useGameMeta() {
  const ctx = useContext(GameMetaCtx);
  if (!ctx) throw new Error('useGameMeta must be used within GameMetaProvider');
  return ctx;
}
