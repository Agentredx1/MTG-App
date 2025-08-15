import { useState, useRef } from 'react';
import './AddGameForm.css'

export default function AddGameForm(){
    const [players, setPlayers] = useState([]);
    const nextId = useRef(1);
    
    
    function addPlayer() {
        setPlayers(ps => [...ps,
            {
                id: nextId.current++,
                name: "",
                commander: "",
                turnOrder: ps.length + 1
            }
        ]);
    };

    function removePlayer(id) {
        setPlayers(
            ps => ps.filter(p => p.id !== id).map((p,i) => ({...p, turnOrder: i + 1}))
        );
    };

    function update(id, field, value) {
        setPlayers(ps => ps.map(p => (p.id === id ? { ...p, [field]: value } : p)));
    }
    
    async function handleSubmit(e){
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const payload = {
            date: form.get('date'),
            turns: Number(form.get('turns')),
            wincon: form.get('wincon'),
            winner: form.get('winner'),
            num_players: players.length,
            players: players.map(p => ({
                name: p.name.trim(),
                commander: p.commander.trim(),
                turnOrder: Number(p.turnOrder)
            }))
        }
        console.log(payload);
        try {
            const res = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            if(!res.ok){
                const err = await res.json().catch(()=>({}));
                throw new Error(err.error || 'Save game failed');
            }        
        } catch (err) {
            console.log(err);
        }
    }

    return(
    <form onSubmit={handleSubmit}>
      <label>
        Game Date:
        <input type="date" name="date" />
      </label>

      <label>
        Turn Count:
        <input type="number" name="turns" min="1" />
      </label>

      <label>
        Win Con:
        <select name="wincon" className="form__select">
          <option value="Combat">Combat</option>
          <option value="Combo">Combo</option>
          <option value="Commander Damage">Commander Damage</option>
          <option value="Ping/Burn">Ping/Burn</option>
          <option value="Scoops">Scoops</option>
          <option value="NULL">Not Recorded</option>
        </select>
      </label>

    <label>
        Winner:
        <input type="text" name="winner"></input>
    </label>

        <button type="button" onClick={addPlayer}>
            + Add Player
        </button>

      <div className="players">
        {players.map((p, i) => (
          <fieldset key={p.id} className="player">
            <legend>Player {i + 1}</legend>

            <label>
              Name:
              <input
                type="text"
                name={`players[${i}].name`}
                value={p.name}
                onChange={e => update(p.id, "name", e.target.value)}
                required
              />
            </label>

            <label>
              Commander:
              <input
                type="text"
                name={`players[${i}].commander`}
                value={p.commander}
                onChange={e => update(p.id, "commander", e.target.value)}
              />
            </label>

            <label>
              Turn order:
              <input
                type="number"
                min="1"
                name={`players[${i}].turnOrder`}
                value={p.turnOrder}
                onChange={e => update(p.id, "turnOrder", Number(e.target.value))}
              />
            </label>

            <button type="button" onClick={() => removePlayer(p.id)}>
              Remove Player
            </button>
          </fieldset>
        ))}
      </div>

      <div>
        <button type="submit">
          Save Game
        </button>
      </div>
    </form>
    )
}