// A quiet forest at dusk behind the whole app: layered hills, round trees,
// a warm glow and drifting fireflies. Purely decorative.

const rand = (i, n) => {
  const x = Math.sin(i * 97.13 + n * 31.7) * 10000;
  return x - Math.floor(x);
};

const FIREFLIES = Array.from({ length: 18 }, (_, i) => ({
  left: 5 + rand(i, 1) * 90,
  top: 25 + rand(i, 2) * 65,
  dur: 6 + rand(i, 3) * 8,
  delay: -rand(i, 4) * 10,
  dx: (rand(i, 5) - 0.5) * 80,
  dy: (rand(i, 6) - 0.5) * 60,
}));

const BACK_TREES = [[110, 190, 1.1], [250, 176, 0.8], [440, 160, 1], [700, 158, 0.9], [960, 166, 1.15], [1190, 160, 0.85], [1340, 168, 1]];
const FRONT_TREES = [[60, 262, 1.5], [330, 270, 1.2], [1060, 275, 1.3], [1390, 255, 1.6]];

function Tree({ x, y, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="0" width="10" height="48" rx="4" fill="#0b1b12" />
      <ellipse cx="0" cy="-8" rx="36" ry="44" fill={fill} />
      <ellipse cx="-20" cy="10" rx="24" ry="30" fill={fill} />
      <ellipse cx="22" cy="12" rx="24" ry="28" fill={fill} />
    </g>
  );
}

export default function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <div className="glow" />
      <svg className="hills" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
        <path fill="#1d4130" d="M0 220 C200 140 380 190 560 150 C760 105 900 190 1100 150 C1260 120 1360 150 1440 130 V400 H0Z" />
        {BACK_TREES.map(([x, y, s]) => (
          <Tree key={x} x={x} y={y} s={s} fill="#234c36" />
        ))}
        <path fill="#173522" d="M0 285 C180 235 320 305 520 265 C720 225 860 305 1060 270 C1220 240 1340 275 1440 255 V400 H0Z" />
        {FRONT_TREES.map(([x, y, s]) => (
          <Tree key={x} x={x} y={y} s={s} fill="#14301f" />
        ))}
        <path fill="#0f2418" d="M0 350 C220 310 420 358 640 332 C860 306 1040 360 1240 335 C1340 323 1400 330 1440 325 V400 H0Z" />
      </svg>
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            '--dur': `${f.dur}s`,
            '--delay': `${f.delay}s`,
            '--dx': `${f.dx}px`,
            '--dy': `${f.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
