// Special Visualizers — _generic fallback을 대체하는 전용 시각화 4종
// value_squash_curve / row_to_weighted_sum / parallel_heads / heatmap_focus
const { U01C: C, lerp, clamp01, stag, TChip, CardBox, Flow, Callout, Lbl, Packet } = window.U01Shared;
const spr = (g, a, b) => clamp01((g - a) / (b - a));

// ── 함수 곡선: sigmoid / tanh / ReLU — 곡선 draw + 샘플 점 이동 ──
function VSquashCurve({ g, params }) {
  const kindStr = (params && params.kind || "").toLowerCase();
  const fn = kindStr.includes("tanh") ? "tanh" : kindStr.includes("relu") ? "relu" : "sigmoid";
  const f = fn === "tanh" ? Math.tanh : fn === "relu" ? ((z) => Math.max(0, z)) : ((z) => 1 / (1 + Math.exp(-z)));
  const yMin = fn === "tanh" ? -1.2 : fn === "relu" ? -0.5 : -0.12;
  const yMax = fn === "tanh" ? 1.2 : fn === "relu" ? 5.2 : 1.12;
  const ox = 400, oy = 150, w = 800, h = 560;
  const X = (z) => ox + ((z + 5) / 10) * w;
  const Y = (v) => oy + h - ((v - yMin) / (yMax - yMin)) * h;
  const axP = spr(g, 0, 0.2), cvP = spr(g, 0.18, 0.5);
  // 곡선 path (부분 draw)
  const N = 60, pts = [];
  for (let i = 0; i <= N * cvP; i++) { const z = -5 + (i / N) * 10; pts.push(`${X(z)},${Y(f(z))}`); }
  const samples = [-3, 0, 3];
  const fmt = (v) => (Math.abs(v) < 0.005 ? "0" : v.toFixed(fn === "relu" ? 0 : 2));
  return (
    <g>
      <g opacity={axP}>
        <line x1={ox} y1={Y(0)} x2={ox + w} y2={Y(0)} stroke={C.line} strokeWidth="2" />
        <line x1={X(0)} y1={oy} x2={X(0)} y2={oy + h} stroke={C.line} strokeWidth="2" />
        <Lbl x={ox + w + 24} y={Y(0) + 8} text="z" p={axP} mono size={24} fill={C.faint} />
        {fn !== "relu" && <g>
          <line x1={ox} y1={Y(1)} x2={ox + w} y2={Y(1)} stroke={C.faint} strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
          <Lbl x={ox - 30} y={Y(1) + 7} text="1" p={axP} mono size={20} fill={C.faint} />
        </g>}
        {fn === "tanh" && <g>
          <line x1={ox} y1={Y(-1)} x2={ox + w} y2={Y(-1)} stroke={C.faint} strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
          <Lbl x={ox - 42} y={Y(-1) + 7} text="−1" p={axP} mono size={20} fill={C.faint} />
        </g>}
      </g>
      {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={C.accent} strokeWidth="4" strokeLinecap="round" />}
      <Lbl x={ox + w - 60} y={oy + 40} text={fn} p={cvP} mono size={28} fill={C.accent} weight={700} />
      {samples.map((z, i) => {
        const sp = stag(spr(g, 0.5, 0.95), i, 3, 0.35);
        if (sp <= 0) return null;
        const v = f(z);
        return (
          <g key={z} opacity={Math.min(1, sp * 1.5)}>
            <line x1={X(z)} y1={Y(0)} x2={X(z)} y2={Y(v)} stroke={C.teal} strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />
            <circle cx={X(z)} cy={lerp(Y(0), Y(v), sp)} r="10" fill={C.teal} />
            <Lbl x={X(z)} y={Y(0) + 34} text={`z=${z}`} p={sp} mono size={21} fill={C.dim} />
            <Lbl x={X(z) + (z >= 3 ? -80 : 68)} y={Y(v) - 14} text={fmt(v)} p={sp} mono size={22} fill={C.teal} weight={700} />
          </g>
        );
      })}
    </g>
  );
}

// ── Distribution × V → weighted sum (scene별 params 주입: weights/vlabels/result) ──
function VRowWeightedSum({ g, params }) {
  const p = params || {};
  const ws = Array.isArray(p.weights) && p.weights.length ? p.weights : [0.18, 0.04, 0.63, 0.15];
  const vlabels = Array.isArray(p.vlabels) && p.vlabels.length ? p.vlabels : ws.map((_, i) => `V_${i + 1}`);
  const resultText = p.result || "합산 → 새 representation vector";
  const PALETTE = [C.accent, C.teal, C.amber, C.red];
  const n = ws.length;
  const gap = Math.min(105, 316 / Math.max(1, n - 1));
  const rows = ws.map((w, i) => ({ w, y: 190 + i * gap, c: PALETTE[i % PALETTE.length], label: vlabels[i] }));
  const sumP = spr(g, 0.72, 0.95);
  let acc = 0;
  return (
    <g>
      <Lbl x={330} y={140} text="distribution" p={spr(g, 0, 0.15)} mono size={21} fill={C.dim} />
      <Lbl x={620} y={140} text="V vectors" p={spr(g, 0.1, 0.25)} mono size={21} fill={C.dim} />
      <Lbl x={1090} y={140} text="weight × V" p={spr(g, 0.35, 0.5)} mono size={21} fill={C.dim} />
      {rows.map((r, i) => {
        const rp = stag(spr(g, 0, 0.38), i, n, 0.4);
        const mp = stag(spr(g, 0.38, 0.72), i, n, 0.4);
        const barW = 30 + 360 * r.w * mp;
        return (
          <g key={i} opacity={rp}>
            <TChip x={270} y={r.y} w={120} h={54} text={String(r.w)} p={rp} mono accent={r.w >= 0.5} fontSize={23} />
            <Lbl x={445} y={r.y + 34} text="×" p={mp} size={26} fill={C.faint} />
            <rect x={490} y={r.y} width={260} height={54} rx="9" fill={C.card} stroke={C.cardBorder} strokeWidth="1.5" />
            <text x={620} y={r.y + 35} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="22" fill={C.text}>{r.label}</text>
            <Lbl x={790} y={r.y + 34} text="=" p={mp} size={26} fill={C.faint} />
            {mp > 0 && <rect x={830} y={r.y + 7} width={barW} height={40} rx="7" fill={r.c} opacity={Math.min(1, 0.25 + r.w)} />}
            {mp > 0.6 && <Lbl x={840 + barW + 34} y={r.y + 34} text={`${Math.round(r.w * 100)}%`} p={(mp - 0.6) / 0.4} mono size={20} fill={r.w < 0.08 ? C.dim : r.c} />}
          </g>
        );
      })}
      {sumP > 0 && (
        <g opacity={Math.min(1, sumP * 1.4)}>
          <Flow x1={800} y1={600} x2={800} y2={640} p={sumP} color={C.accent} />
          <Lbl x={800} y={690} text={resultText} p={sumP} size={24} fill={C.text} weight={600} />
          <g transform="translate(520 710)">
            {rows.map((r, i) => {
              const segW = 560 * r.w * sumP;
              const x = acc; acc += segW;
              return <rect key={i} x={x} y={0} width={segW} height={46} rx={i === 0 ? 8 : 0} fill={r.c} opacity={0.85} />;
            })}
            <rect x={0} y={0} width={560 * sumP} height={46} rx="8" fill="none" stroke={C.accent} strokeWidth="2" />
          </g>
        </g>
      )}
    </g>
  );
}

// ── Parallel heads: X → head 분기 → 패턴 상이한 heatmap → outputs ──
function VParallelHeads({ g, params }) {
  const m = (params && params.kind || "").match(/(\d+)\s*heads/);
  const H = m ? Math.min(4, parseInt(m[1], 10)) : 3;
  const hy = (i) => 190 + i * (520 / H);
  const cell = 26;
  const pattern = (h, r, c) => {
    if (h === 0) return Math.abs(r - c) <= 0 ? 0.95 : Math.abs(r - c) === 1 ? 0.45 : 0.08;
    if (h === 1) return Math.abs(r - c) >= 3 ? 0.9 : 0.12;
    return (r * 7 + c * 13 + h * 5) % 5 === 0 ? 0.85 : 0.15;
  };
  return (
    <g>
      <TChip x={130} y={410} w={170} h={70} text="X" p={spr(g, 0, 0.15)} accent fontSize={28} />
      {Array.from({ length: H }).map((_, h) => {
        const bp = stag(spr(g, 0.12, 0.4), h, H, 0.4);
        const hp = stag(spr(g, 0.35, 0.75), h, H, 0.4);
        const op = stag(spr(g, 0.72, 0.95), h, H, 0.4);
        const y = hy(h);
        return (
          <g key={h}>
            <Flow x1={306} y1={445} x2={430} y2={y + 60} p={bp} />
            <g opacity={Math.min(1, bp * 1.5)}>
              <rect x={440} y={y} width={330} height={120} rx="12" fill={C.card} stroke={C.cardBorder} strokeWidth="1.5" />
              <Lbl x={520} y={y + 40} text={`Head ${h + 1}`} p={1} size={22} fill={C.text} weight={600} anchor="start" />
              <Lbl x={520} y={y + 72} text={`W_Q${h + 1} W_K${h + 1} W_V${h + 1}`} p={1} mono size={17} fill={C.faint} anchor="start" />
              <Lbl x={520} y={y + 100} text="same type · 다른 파라미터" p={1} size={15} fill={C.faint} anchor="start" />
            </g>
            {hp > 0 && (
              <g opacity={hp}>
                {Array.from({ length: 4 }).map((_, r) =>
                  Array.from({ length: 4 }).map((_, c) => (
                    <rect key={r + "-" + c} x={830 + c * cell} y={y + 8 + r * cell} width={cell - 3} height={cell - 3} rx="3"
                      fill={C.accent} opacity={pattern(h, r, c) * stag(hp, r * 4 + c, 16, 0.8)} />
                  )))}
              </g>
            )}
            <Flow x1={950} y1={y + 60} x2={1030} y2={y + 60} p={op} />
            <TChip x={1040} y={y + 30} w={150} h={58} text={`out_${h + 1}`} p={op} mono fontSize={21} />
          </g>
        );
      })}
      {spr(g, 0.93, 1) > 0 && (
        <g opacity={spr(g, 0.93, 1)}>
          <rect x={1260} y={370} width={200} height={150} rx="12" fill={C.accentSoft} stroke={C.accent} strokeWidth="2" />
          <Lbl x={1360} y={435} text="Concat" p={1} size={23} fill={C.accent} weight={700} />
          <Lbl x={1360} y={468} text="→ W_O" p={1} mono size={19} fill={C.dim} />
        </g>
      )}
      <Lbl x={800} y={800} text="같은 입력 X — 서로 다른 projection 공간 — 서로 다른 관계 패턴" p={spr(g, 0.75, 1)} size={23} fill={C.dim} />
    </g>
  );
}

// ── Heatmap focus: n×n attention 패턴 + row focus ──
function VHeatmapFocus({ g, params }) {
  const kindStr = (params && params.kind || "");
  const isQuery = /query/i.test(kindStr);
  const n = 5, cell = 78;
  const x0 = 800 - (n * cell) / 2, y0 = 420 - (n * cell) / 2;
  const focusRow = 1;
  const val = (r, c) => {
    if (/self/i.test(kindStr)) return Math.abs(r - c) === 0 ? 0.92 : Math.abs(r - c) === 1 ? 0.4 : 0.1;
    return ((r * 7 + c * 11) % 6) / 6 * 0.75 + 0.12;
  };
  const bp = spr(g, 0, 0.5), fp = spr(g, 0.5, 0.8), cp = spr(g, 0.82, 1);
  return (
    <g>
      {Array.from({ length: n }).map((_, r) => (
        <g key={r}>
          <Lbl x={x0 - 36} y={y0 + r * cell + cell / 2 + 8} text={isQuery ? `Q_${r + 1}` : `t_${r + 1}`} p={bp} mono size={20} fill={r === focusRow && fp > 0.3 ? C.accent : C.faint} />
          {Array.from({ length: n }).map((_, c) => {
            const cellP = stag(bp, r * n + c, n * n, 0.85);
            const dimmed = fp > 0.3 && r !== focusRow;
            return (
              <rect key={c} x={x0 + c * cell} y={y0 + r * cell} width={cell - 5} height={cell - 5} rx="6"
                fill={C.accent} opacity={cellP * val(r, c) * (dimmed ? 0.25 : 1)} />
            );
          })}
        </g>
      ))}
      {Array.from({ length: n }).map((_, c) => (
        <Lbl key={c} x={x0 + c * cell + cell / 2 - 2} y={y0 - 20} text={`K_${c + 1}`} p={bp} mono size={20} fill={C.faint} />
      ))}
      {fp > 0 && (
        <rect x={x0 - 8} y={y0 + focusRow * cell - 6} width={n * cell + 12} height={cell + 8} rx="9"
          fill="none" stroke={C.accent} strokeWidth="2.5" opacity={fp} strokeDasharray="none" />
      )}
      <Lbl x={800} y={y0 + n * cell + 70} text={kindStr} p={cp} mono size={22} fill={C.dim} />
    </g>
  );
}

// dispatch: params.kind 문자열 패턴 → 전용 컴포넌트
function match(kindStr) {
  const k = (kindStr || "").toLowerCase();
  if (/(sigmoid|tanh|relu).*(curve)|curve.*(sigmoid|tanh|relu)/.test(k)) return VSquashCurve;
  if (/weighted[_ ]?sum/.test(k)) return VRowWeightedSum;
  if (/parallel[_ ]?heads/.test(k)) return VParallelHeads;
  if (/heatmap|query focus/.test(k)) return VHeatmapFocus;
  return null;
}

window.SpecialVis = { match, VSquashCurve, VRowWeightedSum, VParallelHeads, VHeatmapFocus };
