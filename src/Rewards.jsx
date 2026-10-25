import { useState } from 'react';
import { parse } from './dates.js';

function TreatRow({ treat, points, dispatch, todayKey }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(treat.name);
  const [cost, setCost] = useState(treat.cost);

  if (editing) {
    const save = (e) => {
      e.preventDefault();
      const c = Math.round(Number(cost));
      if (!name.trim() || !(c >= 1)) return;
      dispatch({ type: 'treatEdit', id: treat.id, name: name.trim(), cost: c });
      setEditing(false);
    };
    return (
      <li className="treat editing">
        <form className="inline-form" onSubmit={save}>
          <label>
            Treat
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label>
            Cost (points)
            <input type="number" min="1" value={cost} onChange={(e) => setCost(e.target.value)} />
          </label>
          <button className="btn primary" type="submit">
            Save treat
          </button>
          <button className="btn" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  const ready = points >= treat.cost;
  return (
    <li className={`treat${ready ? ' ready' : ''}`}>
      <div className="info">
        <div className="name">{treat.name}</div>
        <div className="share" aria-hidden="true">
          <b style={{ width: `${Math.min(100, Math.max(0, (points / treat.cost) * 100))}%` }} />
        </div>
      </div>
      <div className="figures">
        <span>
          <b>{treat.cost}</b> points
        </span>
        <span>{ready ? 'Ready to claim' : `${treat.cost - Math.max(0, points)} more to go`}</span>
      </div>
      <div className="actions">
        <button
          className="btn small primary"
          disabled={!ready}
          onClick={() => {
            if (window.confirm(`Claim "${treat.name}" for ${treat.cost} points?`))
              dispatch({ type: 'claim', id: treat.id, date: todayKey });
          }}
        >
          Claim
        </button>
        <button className="btn small ghost" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          className="btn small ghost"
          onClick={() => {
            if (window.confirm(`Delete "${treat.name}"? Treats you already claimed stay in your history.`))
              dispatch({ type: 'treatRemove', id: treat.id });
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function Rewards({ state, dispatch, todayKey, points }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const { dailyGoal, bonus } = state.settings;
  const recent = [...state.claims].reverse().slice(0, 8);

  const add = (e) => {
    e.preventDefault();
    const c = Math.round(Number(cost));
    if (!name.trim() || !(c >= 1)) return;
    dispatch({ type: 'treatAdd', name: name.trim(), cost: c });
    setName('');
    setCost('');
  };

  return (
    <section className="rewards">
      <div className="rewards-head">
        <h2>Rewards</h2>
        <p className="balance">
          <b>{points}</b> points to spend
        </p>
      </div>
      <p className="hint-text">
        You earn 1 point for every minute of a finished focus session, plus {bonus} bonus points the first time you
        reach {dailyGoal} minutes in a day. Claiming a treat takes its cost off your points.
      </p>

      {state.treats.length === 0 ? (
        <p className="empty">No treats yet. Add something you'd enjoy, like “Ice cream” for 200 points.</p>
      ) : (
        <ul>
          {state.treats.map((t) => (
            <TreatRow key={t.id} treat={t} points={points} dispatch={dispatch} todayKey={todayKey} />
          ))}
        </ul>
      )}

      <form className="inline-form add" onSubmit={add}>
        <label>
          New treat
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name a treat" />
        </label>
        <label>
          Cost (points)
          <input type="number" min="1" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="200" />
        </label>
        <button className="btn primary" type="submit">
          Add treat
        </button>
      </form>

      {recent.length > 0 && (
        <div className="claims">
          <h3>Claimed</h3>
          <ul>
            {recent.map((c) => (
              <li key={c.id}>
                <span>{c.name}</span>
                <span>{c.cost} points</span>
                <span>
                  {parse(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
