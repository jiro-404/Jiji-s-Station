// Points: 1 per minute of a finished focus session, plus a bonus the first time
// each day's total reaches the daily goal. Claiming a treat subtracts its cost.

const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);

export function dayMinutes(focus, date) {
  let n = 0;
  for (const id in focus) n += (focus[id] || {})[date] || 0;
  return n;
}

export function earned(s) {
  let minutes = 0;
  for (const id in s.focus) minutes += sum(s.focus[id]);
  return minutes + sum(s.bonuses);
}

export const spent = (s) => s.claims.reduce((a, c) => a + c.cost, 0);
export const balance = (s) => earned(s) - spent(s);

// What a finished session of `minutes` earns on `date`, given the state before it is added.
export function awardFor(s, minutes, date) {
  const before = dayMinutes(s.focus, date);
  const goal = s.settings.dailyGoal;
  const bonus = !(s.bonuses || {})[date] && before < goal && before + minutes >= goal ? s.settings.bonus : 0;
  return { points: minutes + bonus, bonus };
}
