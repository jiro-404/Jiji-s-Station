import { useEffect, useMemo, useRef } from 'react';
import { addDays, parse } from './dates.js';
import { formatMinutes } from './streaks.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS = 53;

// Level 1: some study, below the goal. Level 2: goal reached. 3 and 4: 1.5x and 2x the goal.
function levelFor(m, goal) {
  if (m <= 0) return 0;
  if (m < goal) return 1;
  if (m < goal * 1.5) return 2;
  if (m < goal * 2) return 3;
  return 4;
}

export default function Heatmap({ subjects, focus, totals, goal, view, onView, todayKey }) {
  const scroller = useRef(null);

  // Start scrolled to today on narrow screens.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);

  const hasFree = !!focus._free && Object.keys(focus._free).length > 0;

  const { cells, months, total, activeDays } = useMemo(() => {
    const start = addDays(todayKey, -(52 * 7 + parse(todayKey).getDay())); // a Sunday
    const source = view === 'all' ? totals : focus[view] || {};
    const cells = [];
    let total = 0;
    let activeDays = 0;

    for (let i = 0; i < WEEKS * 7; i++) {
      const date = addDays(start, i);
      if (date > todayKey) {
        cells.push(null);
        continue;
      }
      const minutes = source[date] || 0;
      if (minutes > 0) {
        total += minutes;
        activeDays++;
      }
      cells.push({ date, minutes, level: levelFor(minutes, goal) });
    }

    const months = [];
    for (let w = 0; w < WEEKS; w++) {
      const m = parse(addDays(start, w * 7)).getMonth();
      const prev = w ? parse(addDays(start, (w - 1) * 7)).getMonth() : null;
      const next = w < WEEKS - 1 ? parse(addDays(start, (w + 1) * 7)).getMonth() : null;
      const isNew = prev === null ? next === m : prev !== m;
      months.push(isNew ? MONTHS[m] : '');
    }
    return { cells, months, total, activeDays };
  }, [focus, totals, goal, view, todayKey]);

  const label = (c) => {
    const when = parse(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return c.minutes ? `${formatMinutes(c.minutes)} on ${when}` : `No study on ${when}`;
  };

  return (
    <section className="heat" aria-label="Study time over the past year">
      <div className="heat-head">
        <p className="heat-sum">
          <strong>{formatMinutes(total)}</strong> studied on <strong>{activeDays}</strong> days in the past year
        </p>
        <label className="select-label">
          Showing
          <select value={view} onChange={(e) => onView(e.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            {hasFree && <option value="_free">No subject</option>}
          </select>
        </label>
      </div>

      <div className="heat-scroll" ref={scroller}>
        <div className="heat-body">
          <div className="dow" aria-hidden="true">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div>
            <div className="months" aria-hidden="true">
              {months.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
            <div className="grid">
              {cells.map((c, i) =>
                c ? (
                  <div key={i} className={`cell l${c.level}${c.date === todayKey ? ' now' : ''}`} title={label(c)} />
                ) : (
                  <div key={i} className="cell empty" />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="legend">
        <span>
          A day counts toward your streak at {goal} min. Darker green means more.
        </span>
        <span className="legend-scale" aria-hidden="true">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className={`cell l${l}`} />
          ))}
          <span>More</span>
        </span>
      </div>
    </section>
  );
}
