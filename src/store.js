import { useEffect, useReducer } from 'react';
import { awardFor, balance } from './rewards.js';

// Kept as-is so data saved by earlier versions is still found.
const STORAGE_KEY = 'streakline:v2';

const DEFAULT = {
  version: 2,
  subjects: [], // { id, name, createdAt }
  focus: {}, // { [subjectId | '_free']: { [date]: minutes } }
  bonuses: {}, // { [date]: points } daily-goal bonuses already awarded
  treats: [], // { id, name, cost }
  claims: [], // { id, name, cost, date } treats already claimed
  settings: { focus: 25, short: 5, long: 15, longEvery: 4, dailyGoal: 30, bonus: 20 },
};

export function normalize(d) {
  return {
    ...DEFAULT,
    ...d,
    version: 2,
    subjects: Array.isArray(d.subjects) ? d.subjects : [],
    focus: d.focus && typeof d.focus === 'object' ? d.focus : {},
    bonuses: d.bonuses && typeof d.bonuses === 'object' ? d.bonuses : {},
    treats: Array.isArray(d.treats) ? d.treats : [],
    claims: Array.isArray(d.claims) ? d.claims : [],
    settings: { ...DEFAULT.settings, ...(d.settings || {}) },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function reducer(s, a) {
  switch (a.type) {
    case 'add':
      return {
        ...s,
        subjects: [...s.subjects, { id: crypto.randomUUID(), name: a.name, createdAt: a.today }],
      };
    case 'rename':
      return { ...s, subjects: s.subjects.map((x) => (x.id === a.id ? { ...x, name: a.name } : x)) };
    case 'remove': {
      // Study time stays in your totals, streaks and heatmap under "No subject".
      const focus = { ...s.focus };
      const moved = focus[a.id] || {};
      delete focus[a.id];
      const free = { ...(focus._free || {}) };
      for (const [d, m] of Object.entries(moved)) free[d] = (free[d] || 0) + m;
      if (Object.keys(free).length) focus._free = free;
      return { ...s, subjects: s.subjects.filter((x) => x.id !== a.id), focus };
    }
    case 'session': {
      const { bonus } = awardFor(s, a.minutes, a.date);
      const f = { ...(s.focus[a.id] || {}) };
      f[a.date] = (f[a.date] || 0) + a.minutes;
      const next = { ...s, focus: { ...s.focus, [a.id]: f } };
      if (bonus > 0) next.bonuses = { ...s.bonuses, [a.date]: bonus };
      return next;
    }
    case 'treatAdd':
      return { ...s, treats: [...s.treats, { id: crypto.randomUUID(), name: a.name, cost: a.cost }] };
    case 'treatEdit':
      return { ...s, treats: s.treats.map((t) => (t.id === a.id ? { ...t, name: a.name, cost: a.cost } : t)) };
    case 'treatRemove':
      return { ...s, treats: s.treats.filter((t) => t.id !== a.id) };
    case 'claim': {
      const t = s.treats.find((x) => x.id === a.id);
      if (!t || balance(s) < t.cost) return s;
      return { ...s, claims: [...s.claims, { id: crypto.randomUUID(), name: t.name, cost: t.cost, date: a.date }] };
    }
    case 'settings':
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case 'replace':
      return normalize(a.data);
    default:
      return s;
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: the app still works for this session */
    }
  }, [state]);
  return [state, dispatch];
}
