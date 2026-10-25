# Jiji's Station

A study tracker with a GitHub-style green streak heatmap and a full-screen Pomodoro timer.
React + Vite. No backend; data lives in your browser (localStorage). Black theme.

## Run it

```bash
npm install
npm run dev      # development
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

## How it works

- Add the subjects you study. Pick one in the timer and every finished focus session adds its minutes to that subject.
- Set a daily study goal (default 30 minutes, total across subjects). A day that reaches the goal counts toward your streak.
- Heatmap: lightest green is some study below the goal, then the goal, 1.5x and 2x the goal. Switch it to one subject with the dropdown.
- Each subject shows minutes today, last 7 days, total and days studied.
- Timer: set up on the first screen (mode, subject), then Start opens full screen with only the time on a black background.
  Space pauses or resumes. Esc exits full screen and pauses, so you can resume or close from the setup screen.
  A dimmed time means paused. Break time is a slightly softer white.
- Rewards: 1 point per minute of a finished focus session, plus bonus points the first time you reach your daily goal each day (default 20, changeable). Add treats with a point cost and claim them when you have enough; claiming subtracts the cost.
- Download a JSON backup and restore it later or on another device.

## Notes

- Only completed focus sessions count. Closing a focus session early discards it.
- Deleting a subject keeps its minutes in your totals, streaks and heatmap under "No subject".
- Data is saved under the earlier storage key, so your existing subjects and study time carry over. Study time from before the rewards update counts as points too (1 per minute, no bonuses).
- Dates use your local midnight.

## Files

| File | Job |
| --- | --- |
| `src/store.js` | State, reducer, localStorage save/load |
| `src/streaks.js` | Streak and study-time maths |
| `src/dates.js` | Local-date helpers |
| `src/Heatmap.jsx` | The year grid |
| `src/SubjectList.jsx` | Subjects: add, rename, delete, per-subject time |
| `src/FocusTimer.jsx` | Setup screen and full-screen timer |
| `src/Rewards.jsx` | Treats, claiming, claim history |
| `src/rewards.js` | Points maths |
| `src/DataPanel.jsx` | Goal and timer settings, backup and restore |
