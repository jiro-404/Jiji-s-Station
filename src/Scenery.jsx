// An original pixel-art style night room, drawn in code: a window over a city,
// a sleepy black cat on the sill, a desk with a glowing laptop and a warm lamp,
// a bookshelf, and string lights. Every "pixel" is a rect on a 320x180 grid.
// Purely decorative. Subtle motion is handled in theme.css.

const rand = (i, n) => {
  const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// A filled disc built from one-pixel rows, so it stays pixelated.
function Disc({ cx, cy, r, fill }) {
  const rows = [];
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy));
    rows.push(<rect key={dy} x={cx - half} y={cy + dy} width={half * 2 + 1} height={1} fill={fill} />);
  }
  return <g>{rows}</g>;
}

const SKY = [
  [26, 8, '#16204d'], [34, 8, '#1b2858'], [42, 10, '#23306a'], [52, 10, '#2f3d80'],
  [62, 10, '#3d4a92'], [72, 10, '#53559f'], [82, 10, '#7a5fa0'], [92, 8, '#b06b8c'], [100, 12, '#d98a7a'],
];

function Sky() {
  const stars = Array.from({ length: 16 }, (_, i) => ({
    x: 98 + Math.floor(rand(i, 1) * 100),
    y: 28 + Math.floor(rand(i, 2) * 32),
    d: 2 + rand(i, 3) * 3,
    dl: -rand(i, 4) * 4,
  }));
  return (
    <g>
      {SKY.map(([y, h, c]) => (
        <rect key={y} x="96" y={y} width="112" height={h} fill={c} />
      ))}
      {stars.map((s, i) => (
        <rect key={i} className="tw" x={s.x} y={s.y} width="1" height="1" fill="#fff" style={{ '--d': `${s.d}s`, '--dl': `${s.dl}s` }} />
      ))}
      <circle cx="190" cy="42" r="24" fill="url(#moonGlow)" />
      <Disc cx={190} cy={42} r={6} fill="#f4e9c8" />
      <rect x="188" y="41" width="2" height="2" fill="#e0d3ad" />
      <rect x="191" y="45" width="2" height="1" fill="#e0d3ad" />
    </g>
  );
}

function City() {
  const els = [];
  let k = 0;
  for (let x = 96; x < 208; ) {
    const w = 6 + Math.floor(rand(x, 1) * 8);
    const h = 14 + Math.floor(rand(x, 2) * 16);
    els.push(<rect key={`f${k++}`} x={x} y={112 - h} width={w} height={h} fill="#262d66" />);
    x += w;
  }
  for (let x = 96, i = 0; x < 208; i++) {
    const w = 7 + Math.floor(rand(i, 3) * 9);
    const h = 10 + Math.floor(rand(i, 4) * 26);
    const top = 112 - h;
    els.push(<rect key={`b${k++}`} x={x} y={top} width={w} height={h} fill="#151b44" />);
    for (let wx = x + 1; wx < x + w - 1; wx += 3) {
      for (let wy = top + 2; wy < 110; wy += 4) {
        if (rand(wx * 7 + wy, 5) < 0.38) {
          const c = rand(wx + wy * 3, 6);
          const fill = c < 0.6 ? '#ffd98a' : c < 0.85 ? '#ffb86b' : '#8fe0ff';
          const twinkle = rand(wx * 3 + wy, 7) < 0.3;
          els.push(
            <rect
              key={`w${k++}`}
              className={twinkle ? 'tw' : undefined}
              x={wx}
              y={wy}
              width="2"
              height="2"
              fill={fill}
              style={twinkle ? { '--d': `${2 + rand(wx, 8) * 4}s`, '--dl': `${-rand(wy, 9) * 5}s` } : undefined}
            />
          );
        }
      }
    }
    x += w + (rand(i, 8) < 0.3 ? 1 : 0);
  }
  return <g>{els}</g>;
}

const BOOK_COLORS = ['#b5524a', '#4a6fa5', '#d9a441', '#5aa58a', '#8a5aa5', '#c9c3e0', '#d9803a'];

function Books() {
  const out = [];
  [60, 84, 108, 133].forEach((base, r) => {
    for (let x = 10, i = 0; x < 76; i++) {
      const w = 3 + Math.floor(rand(i + r * 20, 1) * 3);
      const h = 14 + Math.floor(rand(i + r * 20, 2) * 8);
      if (rand(i + r * 20, 3) < 0.12) {
        x += 4; // a gap
        continue;
      }
      const c = BOOK_COLORS[Math.floor(rand(i + r * 20, 4) * BOOK_COLORS.length)];
      out.push(<rect key={`${r}-${i}`} x={x} y={base - h} width={w} height={h} fill={c} opacity="0.85" />);
      x += w;
    }
  });
  return <g>{out}</g>;
}

function StringLights() {
  const bulbs = [];
  const pts = [];
  for (let x = 90; x <= 214; x += 2) pts.push(`${x},${14 + Math.round(6 * Math.sin((Math.PI * (x - 90)) / 124))}`);
  const colors = ['#ffd98a', '#ff9a6b', '#9ad8ff'];
  for (let x = 98, i = 0; x <= 210; x += 8, i++) {
    const y = 14 + Math.round(6 * Math.sin((Math.PI * (x - 90)) / 124));
    bulbs.push(
      <rect key={i} className="tw" x={x} y={y + 1} width="2" height="3" fill={colors[i % 3]} style={{ '--d': `${2 + (i % 4)}s`, '--dl': `${-i * 0.6}s` }} />
    );
  }
  return (
    <g>
      <polyline points={pts.join(' ')} fill="none" stroke="#2a2e55" strokeWidth="1" />
      {bulbs}
    </g>
  );
}

export default function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
        <defs>
          <radialGradient id="moonGlow"><stop offset="0" stopColor="#fff4cf" stopOpacity="0.35" /><stop offset="1" stopColor="#fff4cf" stopOpacity="0" /></radialGradient>
          <radialGradient id="lampGlow"><stop offset="0" stopColor="#ffb35a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffb35a" stopOpacity="0" /></radialGradient>
          <radialGradient id="screenGlow"><stop offset="0" stopColor="#4aa3ff" stopOpacity="0.45" /><stop offset="1" stopColor="#4aa3ff" stopOpacity="0" /></radialGradient>
          <clipPath id="glass"><rect x="96" y="26" width="112" height="86" /></clipPath>
        </defs>

        {/* Room */}
        <rect width="320" height="180" fill="#1b1f3b" />
        <rect y="100" width="320" height="38" fill="#171a35" />
        <rect y="100" width="320" height="1" fill="#262a52" />
        <rect width="320" height="8" fill="#0f1124" />
        <rect y="138" width="320" height="42" fill="#111328" />
        <rect y="136" width="320" height="3" fill="#2a2e5c" />
        {[148, 158, 168].map((y) => (
          <rect key={y} y={y} width="320" height="1" fill="#1a1d3c" />
        ))}
        <rect x="100" y="156" width="110" height="16" fill="#3a2a5a" />
        <rect x="104" y="153" width="102" height="3" fill="#3a2a5a" />
        <rect x="104" y="172" width="102" height="3" fill="#3a2a5a" />
        <rect x="106" y="158" width="98" height="12" fill="#4b3470" />
        <polygon points="96,118 208,118 270,180 60,180" fill="#8c9fff" opacity="0.07" />

        {/* Bookshelf and plant on top */}
        <rect x="6" y="34" width="76" height="104" fill="#2a2442" />
        <rect x="9" y="37" width="70" height="98" fill="#1a1630" />
        {[60, 84, 108, 133].map((y) => (
          <rect key={y} x="9" y={y} width="70" height="2" fill="#3a3158" />
        ))}
        <Books />
        <rect x="58" y="16" width="4" height="9" fill="#2f7a5a" />
        <rect x="62" y="12" width="4" height="13" fill="#3fa070" />
        <rect x="66" y="17" width="4" height="8" fill="#2f7a5a" />
        <rect x="58" y="25" width="12" height="9" fill="#b5523a" />
        <rect x="57" y="25" width="14" height="2" fill="#d0694a" />

        {/* Picture frame */}
        <rect x="224" y="34" width="30" height="40" fill="#3a2f5a" />
        <rect x="227" y="37" width="24" height="34" fill="#2f3d80" />
        <rect x="227" y="48" width="24" height="12" fill="#7a5fa0" />
        <rect x="227" y="60" width="24" height="11" fill="#151b44" />
        <rect x="232" y="54" width="8" height="6" fill="#151b44" />
        <rect x="240" y="57" width="6" height="3" fill="#151b44" />
        <rect x="243" y="41" width="3" height="3" fill="#f4e9c8" />

        {/* Window */}
        <rect x="92" y="22" width="120" height="96" fill="#6b4331" />
        <rect x="92" y="22" width="1" height="96" fill="#d9803a" opacity="0.6" />
        <g clipPath="url(#glass)">
          <Sky />
          <City />
        </g>
        <polygon points="104,26 124,26 100,112 96,112 96,60" fill="#fff" opacity="0.035" />
        <rect x="150" y="26" width="4" height="86" fill="#6b4331" />
        <rect x="96" y="66" width="112" height="3" fill="#6b4331" />
        <rect x="86" y="112" width="132" height="6" fill="#8a5a3c" />
        <rect x="86" y="112" width="132" height="1" fill="#d9803a" />

        {/* Jiji, asleep-ish on the sill */}
        <g fill="#07070f">
          <rect x="123" y="105" width="15" height="7" />
          <rect x="124" y="102" width="13" height="3" />
          <rect x="125" y="94" width="10" height="8" />
          <rect x="125" y="91" width="3" height="3" />
          <rect x="132" y="91" width="3" height="3" />
          <rect x="138" y="109" width="6" height="2" />
          <rect x="143" y="102" width="2" height="9" />
        </g>
        <g className="blink" fill="#ffe27a">
          <rect x="127" y="97" width="1" height="2" />
          <rect x="132" y="97" width="1" height="2" />
        </g>

        <StringLights />

        {/* Desk */}
        <rect x="212" y="120" width="108" height="5" fill="#5a3d52" />
        <rect x="212" y="120" width="108" height="1" fill="#8a5a6a" />
        <rect x="212" y="125" width="108" height="12" fill="#2e2036" />
        <rect x="216" y="137" width="5" height="32" fill="#231a2a" />
        <rect x="311" y="137" width="5" height="32" fill="#231a2a" />

        {/* Plant */}
        <rect x="222" y="100" width="2" height="12" fill="#2f7a5a" />
        <rect x="225" y="96" width="2" height="16" fill="#3fa070" />
        <rect x="227" y="102" width="2" height="10" fill="#2f7a5a" />
        <rect x="219" y="104" width="2" height="8" fill="#3fa070" />
        <rect x="221" y="112" width="8" height="8" fill="#b5523a" />
        <rect x="220" y="111" width="10" height="2" fill="#d0694a" />

        {/* Laptop */}
        <rect x="234" y="118" width="26" height="2" fill="#3b4170" />
        <rect x="237" y="96" width="20" height="22" fill="#20233f" />
        <rect className="screen" x="239" y="98" width="16" height="18" fill="#3f8cff" />
        <g fill="#cfe8ff" opacity="0.8">
          <rect x="241" y="101" width="8" height="1" />
          <rect x="241" y="104" width="11" height="1" />
          <rect x="241" y="107" width="6" height="1" />
          <rect x="241" y="110" width="10" height="1" />
        </g>

        {/* Books, lamp, mug */}
        <rect x="262" y="117" width="14" height="3" fill="#4a6fa5" />
        <rect x="264" y="114" width="12" height="3" fill="#b5523a" />
        <rect x="263" y="111" width="11" height="3" fill="#d9a441" />
        <rect x="278" y="117" width="10" height="3" fill="#2a2a44" />
        <rect x="283" y="100" width="2" height="17" fill="#2a2a44" />
        <rect x="276" y="92" width="16" height="3" fill="#ffb35a" />
        <rect x="274" y="95" width="20" height="3" fill="#e0803a" />
        <rect x="272" y="98" width="24" height="2" fill="#b8602c" />
        <rect x="281" y="100" width="6" height="2" fill="#fff0c0" />
        <rect x="298" y="112" width="7" height="8" fill="#c9c3e0" />
        <rect x="305" y="114" width="2" height="4" fill="#c9c3e0" />
        <rect x="299" y="112" width="5" height="1" fill="#5a3a2a" />
        {[0, 1, 2].map((i) => (
          <rect key={i} className="steam" x={300 + (i % 2) * 2} y={108 - i * 3} width="1" height="2" fill="#fff" style={{ '--dl': `${-i * 0.9}s` }} />
        ))}

        {/* Light */}
        <polygon className="lamp" points="274,100 294,100 312,120 256,120" fill="#ffb35a" opacity="0.16" />
        <circle className="lamp" cx="284" cy="104" r="46" fill="url(#lampGlow)" />
        <circle className="screen-glow" cx="247" cy="107" r="30" fill="url(#screenGlow)" />
      </svg>
    </div>
  );
}
