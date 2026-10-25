import { useCallback, useEffect, useRef, useState } from 'react';

const LABEL = { focus: 'Focus', short: 'Short break', long: 'Long break' };

const clockText = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// Every character gets a fixed-width cell, so the time never jitters as digits change.
function Clock({ text }) {
  return (
    <div className="clock" role="timer" aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} className={c === ':' ? 'colon' : 'digit'} aria-hidden="true">
          {c}
        </span>
      ))}
    </div>
  );
}

function beep(ctx) {
  if (!ctx) return;
  try {
    [0, 0.28, 0.56].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const at = ctx.currentTime + t;
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(at);
      o.stop(at + 0.24);
    });
  } catch {
    /* sound is optional */
  }
}

export default function FocusTimer({ subjects, settings, initialSubjectId, onComplete, onClose }) {
  const [mode, setMode] = useState('focus');
  const [left, setLeft] = useState(settings.focus * 60000);
  const [endAt, setEndAt] = useState(0);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [subjectId, setSubjectId] = useState(initialSubjectId || '');
  const [view, setView] = useState('setup'); // 'setup' | 'run' (full screen, time only)
  const [award, setAward] = useState(null); // points from the last finished focus session
  const audio = useRef(null);
  const api = useRef({});

  const dur = useCallback((m) => settings[m] * 60000, [settings]);

  const switchMode = useCallback(
    (m) => {
      setMode(m);
      setRunning(false);
      setLeft(settings[m] * 60000);
    },
    [settings]
  );

  const finish = useCallback(() => {
    setRunning(false);
    beep(audio.current);
    if (mode === 'focus') {
      setAward(onComplete(subjectId, settings.focus));
      const n = cycles + 1;
      setCycles(n);
      switchMode(n % settings.longEvery === 0 ? 'long' : 'short');
    } else {
      switchMode('focus');
    }
  }, [mode, subjectId, settings, cycles, onComplete, switchMode]);

  // The clock comes from an end timestamp, so it stays accurate even when the
  // browser slows timers in a background tab.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remaining = endAt - Date.now();
      if (remaining <= 0) finish();
      else setLeft(remaining);
    }, 250);
    return () => clearInterval(id);
  }, [running, endAt, finish]);

  const startClock = () => {
    setEndAt(Date.now() + left);
    setRunning(true);
  };
  const pauseClock = () => {
    setLeft(Math.max(0, endAt - Date.now()));
    setRunning(false);
  };

  // Start and Resume open the full-screen, time-only view.
    const prepare = () => {
    if (!audio.current) {
      try {
        audio.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        /* no audio support */
      }
    }
    audio.current?.resume?.();
    if (mode === 'focus') setAward(null);
  };

  // Start or resume on the normal screen
  const startNormal = () => {
    prepare();
    startClock();
  };

  // Open the full-screen, time-only view (keeps the clock running if it already is)
  const begin = () => {
    prepare();
    Promise.resolve(document.documentElement.requestFullscreen?.()).catch(() => {});
    if (!running) startClock();
    setView('run');
  };

  // Esc: pause and go back to the setup screen.
    // Esc: go back to the setup screen. The timer keeps running.
  const leaveRun = () => {
    if (view !== 'run') return;
    setView('setup');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  const reset = () => {
    setRunning(false);
    setLeft(dur(mode));
  };
  const skip = () => switchMode(mode === 'focus' ? 'short' : 'focus');

  const close = () => {
    if (mode === 'focus' && left < dur('focus') && !window.confirm('Close the timer? This session will not be counted.'))
      return;
    onClose();
  };

  // Handlers registered once read the latest functions through this ref.
  api.current = { leaveRun, toggle: () => (running ? pauseClock() : startClock()), view };

  useEffect(() => {
    const onKey = (e) => {
      if (api.current.view !== 'run') return;
      if (e.code === 'Space') {
        e.preventDefault();
        api.current.toggle();
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        api.current.leaveRun();
      }
    };
    // In full screen the browser handles Esc itself and only reports that full screen ended.
    const onFs = () => {
      if (!document.fullscreenElement) api.current.leaveRun();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Lock page scrolling behind the timer so no scrollbar shows beside it.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  // Browser tab title shows the countdown while it runs.
  useEffect(() => {
    const original = document.title;
    if (running) document.title = `${clockText(left)} ${LABEL[mode]}`;
    return () => {
      document.title = original;
    };
  }, [left, running, mode]);

  // Keep the screen awake while the timer runs in full screen.
  useEffect(() => {
    if (view !== 'run' || !running || !navigator.wakeLock) return;
    let lock;
    navigator.wakeLock
      .request('screen')
      .then((l) => (lock = l))
      .catch(() => {});
    return () => {
      Promise.resolve(lock?.release?.()).catch(() => {});
    };
  }, [view, running]);

  if (view === 'run') {
    return (
      <div className={`timer run${running ? '' : ' paused'}`} data-mode={mode}>
        <Clock text={clockText(left)} />
      </div>
    );
  }

  const filled =
    cycles > 0 && cycles % settings.longEvery === 0 && mode === 'long' ? settings.longEvery : cycles % settings.longEvery;

  return (
    <div className="timer setup" role="dialog" aria-modal="true" aria-label="Focus timer">
      <div className="timer-top">
        <div className="modes">
          {Object.keys(LABEL).map((m) => (
            <button key={m} className={m === mode ? 'on' : ''} onClick={() => switchMode(m)}>
              {LABEL[m]}
            </button>
          ))}
        </div>
        <button onClick={close}>Close</button>
      </div>

      <div className="setup-center">
        <Clock text={clockText(left)} />
        {award && (
          <p className="award" role="status">
            +{award.points} points{award.bonus ? ` (includes ${award.bonus} bonus for reaching your daily goal)` : ''}
          </p>
        )}
        <label className="for">
          Studying
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="dots" aria-label={`${filled} of ${settings.longEvery} sessions before a long break`}>
          {Array.from({ length: settings.longEvery }, (_, i) => (
            <i key={i} className={i < filled ? 'on' : ''} />
          ))}
        </div>
                <button className="go" onClick={running ? pauseClock : startNormal} autoFocus>
          {running ? 'Pause' : left < dur(mode) ? 'Resume' : 'Start'}
        </button>
        <div className="setup-row">
          <button onClick={begin}>Full screen</button>
          <button onClick={reset}>Reset</button>
          <button onClick={skip}>Skip</button>
        </div>
        <p className="timer-hint">Full screen shows only the time. Press space to pause and Esc to exit.</p>
      </div>
    </div>
  );
}
