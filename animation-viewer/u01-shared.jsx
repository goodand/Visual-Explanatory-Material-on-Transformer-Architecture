// U01 Shared — 다크 캔버스 SVG 프리미티브 + 헬퍼
// 모든 scene 컴포넌트가 공유. window.U01Shared로 export.

const U01C = {
  bg: "#0F1110",
  card: "#171A18",
  cardBorder: "#2C312E",
  text: "#E8EAE7",
  dim: "#9BA29D",
  faint: "#5A615C",
  line: "#3A403C",
  accent: "#8B78F0",        // topic-1 violet (dark canvas)
  accentSoft: "rgba(139,120,240,0.16)",
  teal: "#22B8A5",
  tealSoft: "rgba(34,184,165,0.15)",
  amber: "#E5B84B",
  amberSoft: "rgba(229,184,75,0.14)",
  red: "#E5716B",
};

// step progress helper — i번째 step의 로컬 진행도
// step > i → 1 (완료), step === i → p (진행 중), step < i → 0 (대기)
function stepP(step, p, i) {
  return step > i ? 1 : step === i ? p : 0;
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
// stagger: 전체 진행도 t를 n개 항목에 분배, i번째 항목의 로컬 진행도
function stag(t, i, n, overlap = 0.55) {
  const per = 1 / (n - (n - 1) * overlap || 1);
  const start = i * per * (1 - overlap);
  return clamp01((t - start) / per);
}

// fade+rise 공통 transform
const riseStyle = (p, dy = 16) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dy}px)`,
});

function DarkGrid() {
  const dots = [];
  for (let x = 80; x < 1600; x += 80)
    for (let y = 80; y < 900; y += 80)
      dots.push(<circle cx={x} cy={y} r="1.5" fill="#fff" opacity="0.04" key={x + "-" + y} />);
  return <g>{dots}</g>;
}

// 토큰 칩 — rect + text
function TChip({ x, y, w = 150, h = 62, text, p = 1, accent, mono, dashed, dim, fontSize = 26 }) {
  if (p <= 0) return null;
  const stroke = accent ? U01C.accent : dashed ? U01C.faint : U01C.cardBorder;
  const fill = accent ? U01C.accentSoft : U01C.card;
  return (
    <g style={riseStyle(p)} opacity={dim ? 0.35 : 1}>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={fill} stroke={stroke}
        strokeWidth={accent ? 2 : 1.5} strokeDasharray={dashed ? "6 5" : "none"} />
      <text x={x + w / 2} y={y + h / 2 + fontSize * 0.35} textAnchor="middle"
        fontFamily={mono ? "var(--font-mono)" : "var(--font-sans)"}
        fontSize={fontSize} fontWeight="600" fill={accent ? U01C.accent : U01C.text}>{text}</text>
    </g>
  );
}

// 큰 카드 (문장, 표 컨테이너 등)
function CardBox({ x, y, w, h, p = 1, label, children, accent }) {
  if (p <= 0) return null;
  return (
    <g style={riseStyle(p)}>
      <rect x={x} y={y} width={w} height={h} rx="14" fill={U01C.card}
        stroke={accent ? U01C.accent : U01C.cardBorder} strokeWidth={accent ? 2 : 1.5} />
      {label && (
        <text x={x + 18} y={y - 14} fontFamily="var(--font-mono)" fontSize="20"
          fill={U01C.dim} letterSpacing="0.06em">{label}</text>
      )}
      {children}
    </g>
  );
}

// 흐름 화살표
function Flow({ x1, y1, x2, y2, p = 1, dashed, color }) {
  if (p <= 0) return null;
  const c = color || U01C.line;
  const mx = lerp(x1, x2, p), my = lerp(y1, y2, p);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a = 11;
  return (
    <g opacity={Math.min(1, p * 2)}>
      <line x1={x1} y1={y1} x2={mx} y2={my} stroke={c} strokeWidth="2.5"
        strokeDasharray={dashed ? "7 6" : "none"} />
      {p > 0.15 && (
        <polygon
          points={`${mx},${my} ${mx - a * Math.cos(ang - 0.42)},${my - a * Math.sin(ang - 0.42)} ${mx - a * Math.cos(ang + 0.42)},${my - a * Math.sin(ang + 0.42)}`}
          fill={c} />
      )}
    </g>
  );
}

// 캡션형 콜아웃 (하단 보조 설명)
function Callout({ x, y, w, text, p = 1, tone = "dim", fontSize = 24 }) {
  if (p <= 0) return null;
  const color = tone === "amber" ? U01C.amber : tone === "teal" ? U01C.teal : U01C.dim;
  const bg = tone === "amber" ? U01C.amberSoft : tone === "teal" ? U01C.tealSoft : "rgba(255,255,255,0.04)";
  return (
    <g style={riseStyle(p, 12)}>
      <rect x={x} y={y} width={w} height={58} rx="10" fill={bg}
        stroke={color} strokeWidth="1" opacity="0.9" strokeDasharray="none" />
      <text x={x + w / 2} y={y + 37} textAnchor="middle" fontFamily="var(--font-sans)"
        fontSize={fontSize} fill={color}>{text}</text>
    </g>
  );
}

// 자유 라벨
function Lbl({ x, y, text, p = 1, size = 24, fill, anchor = "middle", mono, weight = 500 }) {
  if (p <= 0) return null;
  return (
    <text x={x} y={y} textAnchor={anchor} opacity={p}
      fontFamily={mono ? "var(--font-mono)" : "var(--font-sans)"}
      fontSize={size} fontWeight={weight} fill={fill || U01C.dim}>{text}</text>
  );
}

// 이동 packet (작은 강조 사각형)
function Packet({ cx, cy, p = 1, text, w = 120, h = 50 }) {
  if (p <= 0) return null;
  return (
    <g opacity={p}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="9"
        fill={U01C.accentSoft} stroke={U01C.accent} strokeWidth="2" />
      {text && (
        <text x={cx} y={cy + 8} textAnchor="middle" fontFamily="var(--font-sans)"
          fontSize="24" fontWeight="600" fill={U01C.accent}>{text}</text>
      )}
    </g>
  );
}

window.U01Shared = { U01C, stepP, lerp, clamp01, stag, riseStyle, DarkGrid, TChip, CardBox, Flow, Callout, Lbl, Packet };
