import { useRef, useState } from 'react';
import { today } from './dates.js';

const FIELDS = [
  { k: 'dailyGoal', label: 'Daily study goal (minutes)', min: 1, max: 720 },
  { k: 'bonus', label: 'Daily goal bonus (points)', min: 0, max: 1000 },
  { k: 'focus', label: 'Focus (minutes)', min: 1, max: 180 },
  { k: 'short', label: 'Short break (minutes)', min: 1, max: 60 },
  { k: 'long', label: 'Long break (minutes)', min: 1, max: 120 },
  { k: 'longEvery', label: 'Sessions before a long break', min: 2, max: 8 },
];

export default function DataPanel({ state, dispatch }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');

  const setSetting = (f, value) => {
    const n = Math.min(f.max, Math.max(f.min, Math.round(Number(value)) || f.min));
    dispatch({ type: 'settings', patch: { [f.k]: n } });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jijis-station-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Backup downloaded.');
  };

  const importData = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.habits) && !data.subjects) {
        setMsg('That backup is from the older habit version and cannot be restored here.');
        return;
      }
      if (!Array.isArray(data.subjects) || !data.focus || typeof data.focus !== 'object') throw new Error('bad file');
      if (!window.confirm(`Replace your current data with this backup (${data.subjects.length} subjects)?`)) return;
      dispatch({ type: 'replace', data });
      setMsg('Backup restored.');
    } catch {
      setMsg("That file is not a Jiji's Station backup.");
    }
  };

  return (
    <section className="data">
      <div>
        <h2>Goal, points and timer</h2>
        <div className="settings">
          {FIELDS.map((f) => (
            <label key={f.k}>
              {f.label}
              <input
                type="number"
                min={f.min}
                max={f.max}
                defaultValue={state.settings[f.k]}
                key={state.settings[f.k]}
                onBlur={(e) => setSetting(f, e.target.value)}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2>Your data</h2>
        <p className="hint-text">Everything is saved in this browser. Download a backup to keep it safe or move it to another device.</p>
        <div className="row">
          <button className="btn" onClick={exportData}>
            Download backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Restore from backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
        </div>
        {msg && (
          <p className="hint-text" role="status">
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}
