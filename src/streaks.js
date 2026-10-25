import { addDays } from './dates.js';

// `days` is an object like { "2026-10-24": true } for streaks,
// or { "2026-10-24": 45 } (minutes) for totals.

// Counts back from today. If today hasn't reached the goal yet, the streak is
// still alive and counts back from yesterday.
export function currentStreak(days, todayKey) {
  let k = days[todayKey] ? todayKey : addDays(todayKey, -1);
  let n = 0;
  while (days[k]) {
    n++;
    k = addDays(k, -1);
  }
  return n;
}

export function longestStreak(days) {
  const keys = Object.keys(days).filter((k) => days[k]).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

// { subjectId: { date: minutes } } -> { date: total minutes across subjects }
export function dayTotals(focus) {
  const totals = {};
  for (const id in focus) {
    for (const [date, m] of Object.entries(focus[id])) totals[date] = (totals[date] || 0) + m;
  }
  return totals;
}

// Days whose total reached the daily goal.
export function metDays(totals, goal) {
  const met = {};
  for (const d in totals) if (totals[d] >= goal) met[d] = true;
  return met;
}

export function sumRange(days, todayKey, n) {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += days[addDays(todayKey, -i)] || 0;
  return sum;
}

export function formatMinutes(m) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
