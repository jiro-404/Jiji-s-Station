import { useState } from 'react';
import { formatMinutes, sumRange } from './streaks.js';

function Row({ subject, state, dispatch, todayKey, allTime, onFocus }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(subject.name);

  const days = state.focus[subject.id] || {};
  const today = days[todayKey] || 0;
  const week = sumRange(days, todayKey, 7);
  const total = Object.values(days).reduce((a, b) => a + b, 0);
  const studied = Object.values(days).filter((m) => m > 0).length;
  const share = allTime ? (total / allTime) * 100 : 0;

  if (editing) {
    const save = (e) => {
      e.preventDefault();
      if (!name.trim()) return;
      dispatch({ type: 'rename', id: subject.id, name: name.trim() });
      setEditing(false);
    };
    return (
      <li className="subject editing">
        <form className="inline-form" onSubmit={save}>
          <label>
            Subject name
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <button className="btn primary" type="submit">
            Save name
          </button>
          <button className="btn" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="subject">
      <div className="info">
        <div className="name">{subject.name}</div>
        <div className="share" aria-hidden="true">
          <b style={{ width: `${share}%` }} />
        </div>
      </div>

      <div className="figures">
        <span>
          <b>{formatMinutes(today)}</b> today
        </span>
        <span>
          <b>{formatMinutes(week)}</b> last 7 days
        </span>
        <span>
          <b>{formatMinutes(total)}</b> over {studied} {studied === 1 ? 'day' : 'days'}
        </span>
      </div>

      <div className="actions">
        <button className="btn small" onClick={() => onFocus(subject.id)}>
          Study
        </button>
        <button className="btn small ghost" onClick={() => setEditing(true)}>
          Rename
        </button>
        <button
          className="btn small ghost"
          onClick={() => {
            if (
              window.confirm(
                `Delete "${subject.name}"? Its study time stays in your totals and heatmap under "No subject".`
              )
            )
              dispatch({ type: 'remove', id: subject.id });
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function SubjectList({ state, dispatch, todayKey, allTime, onFocus }) {
  const [name, setName] = useState('');
  const free = state.focus._free || {};
  const freeTotal = Object.values(free).reduce((a, b) => a + b, 0);

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'add', name: name.trim(), today: todayKey });
    setName('');
  };

  return (
    <section className="subjects">
      <h2>Subjects</h2>

      {state.subjects.length === 0 && freeTotal === 0 ? (
        <p className="empty">No subjects yet. Add the ones you study below, like “Physics” or “History”.</p>
      ) : (
        <ul>
          {state.subjects.map((s) => (
            <Row
              key={s.id}
              subject={s}
              state={state}
              dispatch={dispatch}
              todayKey={todayKey}
              allTime={allTime}
              onFocus={onFocus}
            />
          ))}
          {freeTotal > 0 && (
            <li className="subject muted-row">
              <div className="info">
                <div className="name">No subject</div>
                <div className="share" aria-hidden="true">
                  <b style={{ width: `${allTime ? (freeTotal / allTime) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="figures">
                <span>
                  <b>{formatMinutes(free[todayKey] || 0)}</b> today
                </span>
                <span>
                  <b>{formatMinutes(sumFree(free, todayKey))}</b> last 7 days
                </span>
                <span>
                  <b>{formatMinutes(freeTotal)}</b> in total
                </span>
              </div>
              <div className="actions" />
            </li>
          )}
        </ul>
      )}

      <form className="inline-form add" onSubmit={add}>
        <label>
          New subject
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name a subject" />
        </label>
        <button className="btn primary" type="submit">
          Add subject
        </button>
      </form>
      <p className="hint-text">
        Study time comes from finished focus sessions. Pick a subject in the timer and the minutes are added to it.
      </p>
    </section>
  );
}

function sumFree(free, todayKey) {
  return sumRange(free, todayKey, 7);
}
