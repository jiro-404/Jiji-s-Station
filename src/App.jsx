import { useEffect, useMemo, useState } from 'react';
import { useStore } from './store.js';
import { today } from './dates.js';
import { currentStreak, longestStreak, dayTotals, metDays, formatMinutes } from './streaks.js';
import { awardFor, balance } from './rewards.js';
import Heatmap from './Heatmap.jsx';
import SubjectList from './SubjectList.jsx';
import Rewards from './Rewards.jsx';
import FocusTimer from './FocusTimer.jsx';
import DataPanel from './DataPanel.jsx';

export default function App() {
  const [state, dispatch] = useStore();
  const [timer, setTimer] = useState(null); // { subjectId } while the timer is open
  const [view, setView] = useState('all');
  const [, setTick] = useState(0);
  const todayKey = today();

  // Re-render each minute so "today" rolls over at midnight.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const goal = state.settings.dailyGoal;
  const totals = useMemo(() => dayTotals(state.focus), [state.focus]);
  const met = useMemo(() => metDays(totals, goal), [totals, goal]);
  const streak = currentStreak(met, todayKey);
  const best = longestStreak(met);
  const todayMin = totals[todayKey] || 0;
  const allTime = Object.values(totals).reduce((a, b) => a + b, 0);
  const points = balance(state);

  const selected = view === 'all' || view === '_free' || state.subjects.some((s) => s.id === view) ? view : 'all';

  const completeSession = (subjectId, minutes) => {
    const date = today();
    const award = awardFor(state, minutes, date);
    dispatch({ type: 'session', id: subjectId || '_free', minutes, date });
    return award;
  };

  return (
    <>
      <div className="page">
        <header className="top">
          <div>
            <h1>Jiji's Station</h1>
            <p className="date">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn primary" onClick={() => setTimer({ subjectId: '' })}>
            Start focus timer
          </button>
        </header>

        <section className="stats" aria-label="Summary">
          <div className="stat wide">
            <span className="num">{todayMin}</span>
            <span className="cap">of {goal} min goal today</span>
            <i className="meter" aria-hidden="true">
              <b style={{ width: `${Math.min(100, (todayMin / goal) * 100)}%` }} />
            </i>
          </div>
          <div className="stat">
            <span className="num">{streak}</span>
            <span className="cap">day streak</span>
          </div>
          <div className="stat">
            <span className="num">{best}</span>
            <span className="cap">best streak</span>
          </div>
          <div className="stat">
            <span className="num">{formatMinutes(allTime)}</span>
            <span className="cap">studied in total</span>
          </div>
          <div className="stat">
            <span className="num">{points}</span>
            <span className="cap">points</span>
          </div>
        </section>

        <Heatmap
          subjects={state.subjects}
          focus={state.focus}
          totals={totals}
          goal={goal}
          view={selected}
          onView={setView}
          todayKey={todayKey}
        />
        <SubjectList
          state={state}
          dispatch={dispatch}
          todayKey={todayKey}
          allTime={allTime}
          onFocus={(subjectId) => setTimer({ subjectId })}
        />
        <Rewards state={state} dispatch={dispatch} todayKey={todayKey} points={points} />
        <DataPanel state={state} dispatch={dispatch} />
      </div>

      {timer && (
        <FocusTimer
          subjects={state.subjects}
          settings={state.settings}
          initialSubjectId={timer.subjectId}
          onComplete={completeSession}
          onClose={() => setTimer(null)}
        />
      )}
    </>
  );
}
