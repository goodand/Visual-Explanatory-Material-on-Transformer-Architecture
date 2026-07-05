// Generic Visualizers — sketch.kind 기반 범용 scene 애니메이션 (Unit 02~11)
// 전체 진행도 g = (step + p) / nSteps 를 각 kind의 구간 애니메이션으로 분배
const { U01C: C, lerp, clamp01, stag, TChip, CardBox, Flow, Callout, Lbl, Packet } = window.U01Shared;

const pr = (g, a, b) => clamp01((g - a) / (b - a));
const lines = (t) => String(t || "").split("\n");

function MultiText({ x, y, text, size = 24, fill = C.dim, lh = 1.5, p = 1, anchor = "middle", weight = 500 }) {
  if (p <= 0) return null;
  return (
    <g opacity={p}>
      {lines(text).map((ln, i) => (
        <text key={i} x={x} y={y + i * size * lh} textAnchor={anchor} fontFamily="var(--font-sans)"
          fontSize={size} fontWeight={weight} fill={fill}>{ln}</text>
      ))}
    </g>
  );
}

// ── packet_flow: stations 체인 + packet 이동 ──
function VPacketFlow({ g, params }) {
  const st = params.stations || [];
  const n = st.length;
  const w = Math.min(340, 1300 / n - 20), gap = (1360 - n * w) / Math.max(1, n - 1);
  const xs = st.map((_, i) => 120 + i * (w + gap));
  const y = 360, labels = params.labels || [];
  const travel = pr(g, 0.45, 0.95) * (n - 1);
  return (
    <g>
      {st.map((s, i) => (
        <g key={i}>
          <TChip x={xs[i]} y={y} w={w} h={86} text={s} p={stag(pr(g, 0, 0.45), i, n)} fontSize={s.length > 14 ? 20 : 24}
            accent={travel >= i && travel > 0} />
          {labels[i] && <Lbl x={xs[i] + w / 2} y={y + 130} text={labels[i]} p={stag(pr(g, 0, 0.45), i, n)} size={20} />}
          {i < n - 1 && <Flow x1={xs[i] + w + 4} y1={y + 43} x2={xs[i + 1] - 6} y2={y + 43} p={stag(pr(g, 0.1, 0.5), i, n - 1)} />}
        </g>
      ))}
      {travel > 0 && travel < n - 1 && (
        <Packet cx={lerp(xs[0] + w / 2, xs[n - 1] + w / 2, travel / (n - 1))} cy={y - 60} p={1} text={params.packet} w={Math.max(110, (params.packet || "").length * 16 + 40)} h={50} />
      )}
    </g>
  );
}

// ── matrix_build: 셀 스태거 + row 하이라이트/추출 ──
function VMatrixBuild({ g, params }) {
  const rows = params.rows || [], cols = params.cols || [];
  const r = rows.length, c = cols.length;
  const cw = Math.min(170, 980 / c), ch = 62;
  const x0 = 800 - (c * cw - 130) / 2, y0 = 240;
  const hlR = params.highlightRow, hl = params.highlight;
  const hp = pr(g, 0.55, 0.78), pp = params.pullRow ? pr(g, 0.78, 1) : 0;
  return (
    <g>
      <CardBox x={x0 - 150} y={y0 - 60} w={c * cw + 190} h={r * ch + 100} p={pr(g, 0, 0.15)} label={params.caption} />
      {cols.map((cl, j) => (
        <Lbl key={j} x={x0 + j * cw + cw / 2} y={y0 - 14} text={cl} p={pr(g, 0.05, 0.2)} mono size={19} fill={C.faint} />
      ))}
      {rows.map((rw, i) => {
        const isHl = i === hlR;
        const dy = isHl ? pp * 90 : 0;
        return (
          <g key={i} transform={`translate(0 ${dy})`}>
            {isHl && hp > 0 && (
              <rect x={x0 - 140} y={y0 + i * ch + 2} width={c * cw + 170} height={ch - 8} rx="8"
                fill={C.accentSoft} stroke={C.accent} strokeWidth="2" opacity={hp} />
            )}
            <Lbl x={x0 - 80} y={y0 + i * ch + 40} text={rw} p={stag(pr(g, 0.1, 0.55), i, r)} mono size={21}
              fill={isHl && hp > 0.5 ? C.accent : C.faint} />
            {(params.cells && params.cells[i] || []).map((cell, j) => {
              const cellHl = hl && hl[0] === i && hl[1] === j && hp > 0;
              return (
                <g key={j}>
                  {cellHl && <rect x={x0 + j * cw + 6} y={y0 + i * ch + 4} width={cw - 12} height={ch - 12} rx="6" fill={C.accentSoft} stroke={C.accent} strokeWidth="2" opacity={hp} />}
                  <Lbl x={x0 + j * cw + cw / 2} y={y0 + i * ch + 40} text={cell} p={stag(pr(g, 0.1, 0.55), i * c + j, r * c, 0.75)}
                    mono size={21} fill={(isHl && hp > 0.5) || cellHl ? C.text : C.dim} weight={(isHl && hp > 0.5) || cellHl ? 700 : 400} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

// ── before_after_contrast: 좌/우 패널 + 중앙 화살표 ──
function VBeforeAfter({ g, params }) {
  const L = params.left || {}, R = params.right || {};
  const pl = pr(g, 0, 0.32), pa = pr(g, 0.32, 0.5), prr = pr(g, 0.45, 0.8), done = pr(g, 0.85, 1);
  const panel = (x, d, p, hl) => (
    <g style={{ opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <rect x={x} y={230} width={580} height={430} rx="14" fill="rgba(255,255,255,0.02)"
        stroke={hl ? C.accent : C.cardBorder} strokeWidth={hl ? 2 : 1.5} />
      <MultiText x={x + 290} y={310} text={d.title} size={29} fill={C.text} weight={700} p={p} />
      <MultiText x={x + 290} y={400} text={d.note} size={24} fill={C.dim} p={p} lh={1.65} />
    </g>
  );
  return (
    <g>
      {panel(120, L, pl, done > 0.5)}
      {panel(900, R, prr, done > 0.5)}
      {pa > 0 && (
        <g opacity={pa}>
          <Flow x1={712} y1={445} x2={888} y2={445} p={pa} color={C.accent} />
          <MultiText x={800} y={398} text={params.arrow} size={23} fill={C.accent} weight={700} p={pa} lh={1.3} />
        </g>
      )}
    </g>
  );
}

// ── xy_transform: 평면 + 점 배치 + pair 연결 ──
function VXYTransform({ g, params }) {
  const pts = params.points || [];
  const ox = 350, oy = 170, w = 900, h = 560;
  const pair = params.pair;
  const pp = pr(g, 0.78, 1);
  return (
    <g>
      <g opacity={pr(g, 0, 0.25)}>
        <rect x={ox} y={oy} width={w} height={h} rx="14" fill="rgba(255,255,255,0.02)" stroke={C.cardBorder} strokeWidth="1.5" />
        <line x1={ox + 50} y1={oy + h - 50} x2={ox + w - 40} y2={oy + h - 50} stroke={C.line} strokeWidth="2" />
        <line x1={ox + 50} y1={oy + h - 50} x2={ox + 50} y2={oy + 40} stroke={C.line} strokeWidth="2" />
      </g>
      {pts.map((pt, i) => {
        const p = stag(pr(g, 0.25, 0.78), i, pts.length);
        const px = ox + 60 + pt.x * (w - 120), py = oy + 40 + pt.y * (h - 110);
        return (
          <g key={i} opacity={p}>
            <circle cx={px} cy={py} r={10 * Math.min(1, p * 1.4)} fill={pt.near ? C.teal : C.dim} />
            <Lbl x={px} y={py - 24} text={pt.label} p={p} size={25} fill={C.text} weight={600} />
          </g>
        );
      })}
      {pair && pp > 0 && (() => {
        const a = pts[pair[0]], b = pts[pair[1]];
        const ax = ox + 60 + a.x * (w - 120), ay = oy + 40 + a.y * (h - 110);
        const bx = ox + 60 + b.x * (w - 120), by = oy + 40 + b.y * (h - 110);
        return <line x1={ax} y1={ay} x2={lerp(ax, bx, pp)} y2={lerp(ay, by, pp)} stroke={C.teal} strokeWidth="3" strokeDasharray="8 6" />;
      })()}
    </g>
  );
}

// ── zoom_hierarchy: 레벨 컬럼 3개 + focus ──
function VZoomHierarchy({ g, params }) {
  const lv = params.levels || [];
  const n = lv.length, cw = Math.min(430, 1360 / n - 30);
  const gap = (1360 - n * cw) / Math.max(1, n - 1);
  return (
    <g>
      <Lbl x={800} y={150} text={params.breadcrumb} p={pr(g, 0, 0.2)} mono size={22} fill={C.dim} />
      {lv.map((l, i) => {
        const p = stag(pr(g, 0.1, 0.85), i, n, 0.4);
        const x = 120 + i * (cw + gap), focus = i === params.focus;
        return (
          <g key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
            <rect x={x} y={210} width={cw} height={480} rx="14" fill="rgba(255,255,255,0.02)"
              stroke={focus ? C.accent : C.cardBorder} strokeWidth={focus ? 2 : 1.5} />
            <Lbl x={x + cw / 2} y={250} text={l.scope} p={p} mono size={20} fill={focus ? C.accent : C.faint} />
            {(l.blocks || []).map((b, j) => (
              <TChip key={j} x={x + 25} y={285 + j * 76} w={cw - 50} h={62} text={b.label}
                p={stag(p, j, (l.blocks || []).length, 0.4)} accent={b.focus} fontSize={b.label.length > 16 ? 19 : 22} />
            ))}
            {l.content && <MultiText x={x + cw / 2} y={330} text={l.content} size={22} fill={C.dim} p={p} lh={1.7} />}
            {i < n - 1 && <Flow x1={x + cw + 6} y1={450} x2={x + cw + gap - 6} y2={450} p={stag(pr(g, 0.2, 0.9), i, n - 1)} />}
          </g>
        );
      })}
    </g>
  );
}

// ── formula_lock: stations 여정 + 하단 잠금 힌트 (수식은 KaTeX 오버레이) ──
function VFormulaLock({ g, params }) {
  const st = params.stations || [];
  const n = st.length, x0 = 200, xw = 1200 / Math.max(1, n - 1), y = 340;
  const travel = pr(g, 0.12, 0.68) * (n - 1);
  const fp = pr(g, 0.7, 0.95);
  return (
    <g>
      {st.map((s, i) => (
        <g key={i} opacity={stag(pr(g, 0, 0.4), i, n)}>
          <circle cx={x0 + i * xw} cy={y} r="14" fill={travel >= i ? C.accent : C.card}
            stroke={travel >= i ? C.accent : C.cardBorder} strokeWidth="2" />
          <Lbl x={x0 + i * xw} y={y + 56} text={s} p={1} mono size={s.length > 12 ? 19 : 23}
            fill={travel >= i ? C.text : C.dim} weight={travel >= i ? 700 : 400} />
          {i < n - 1 && <line x1={x0 + i * xw + 20} y1={y} x2={x0 + (i + 1) * xw - 20} y2={y}
            stroke={clamp01(travel - i) > 0.5 ? C.accent : C.line} strokeWidth="2.5" />}
        </g>
      ))}
      {travel > 0 && travel < n - 1 && <Packet cx={x0 + travel * xw} cy={y - 58} p={1} text="●" w={54} h={44} />}
      {fp > 0 && (
        <g opacity={fp}>
          <rect x={400} y={560} width={800} height={90} rx="12" fill={C.accentSoft} stroke={C.accent} strokeWidth="1.5" />
          <Lbl x={800} y={615} text={params.formula} p={fp} mono size={params.formula && params.formula.length > 40 ? 22 : 27} fill={C.text} weight={600} />
        </g>
      )}
    </g>
  );
}

// ── gate_mask: 값 막대 + 라벨 ──
function VGateMask({ g, params }) {
  const vals = params.values || [], labels = params.labels || [];
  const n = vals.length, w = 150, gap = 40;
  const x0 = 800 - (n * w + (n - 1) * gap) / 2, base = 560;
  return (
    <g>
      {vals.map((v, i) => {
        const p = stag(pr(g, 0.05, 0.8), i, n);
        const h = (40 + 240 * v) * p;
        return (
          <g key={i} opacity={Math.min(1, p * 1.5)}>
            <rect x={x0 + i * (w + gap)} y={base - h} width={w} height={h} rx="8"
              fill={C.accentSoft} stroke={C.accent} strokeWidth="1.5" opacity={0.35 + v * 0.65} />
            <Lbl x={x0 + i * (w + gap) + w / 2} y={base - h - 16} text={String(v)} p={p} mono size={24} fill={C.text} weight={700} />
            <TChip x={x0 + i * (w + gap)} y={base + 24} w={w} h={54} text={labels[i]} p={p} fontSize={22} />
          </g>
        );
      })}
      {params.caption && <Callout x={350} y={730} w={900} p={pr(g, 0.8, 1)} tone="teal" text={params.caption} />}
    </g>
  );
}

// ── fallback ──
function VGeneric({ g, params, scene }) {
  return (
    <g>
      <g opacity={pr(g, 0, 0.3)}>
        <rect x={400} y={280} width={800} height={280} rx="16" fill="rgba(255,255,255,0.02)"
          stroke={C.faint} strokeWidth="1.5" strokeDasharray="10 8" />
        <Lbl x={800} y={390} text={params && params.kind || "visual"} p={1} mono size={30} fill={C.accent} weight={700} />
        <MultiText x={800} y={460} text={scene ? scene.moving_object : ""} size={22} fill={C.dim} p={1} />
      </g>
    </g>
  );
}

const KIND_MAP = {
  packet_flow: VPacketFlow,
  matrix_build: VMatrixBuild,
  before_after_contrast: VBeforeAfter,
  xy_transform: VXYTransform,
  zoom_hierarchy: VZoomHierarchy,
  formula_lock: VFormulaLock,
  gate_mask: VGateMask,
  _generic: VGeneric,
};

// scene → 범용 시각화 (correction/prereq 배지 포함)
function GenericScene({ scene, step, p }) {
  const n = scene.animation_steps.length;
  const g = clamp01((step + p) / n);
  const sk = scene.sketch || { kind: "_generic", params: {} };
  // scene_id 전용 override → KIND_MAP → SpecialVis → fallback
  let V = (window.SceneVisOverrides && window.SceneVisOverrides[scene.scene_id]) || KIND_MAP[sk.kind] || VGeneric;
  if (V === VGeneric && window.SpecialVis) {
    const SV = window.SpecialVis.match(sk.params && sk.params.kind);
    if (SV) V = SV;
  }
  return (
    <g>
      <V g={g} params={sk.params || {}} scene={scene} />
      {scene.correction && (
        <Callout x={250} y={90} w={1100} p={pr(g, 0.12, 0.3)} tone="amber" text={"교정: " + scene.correction} fontSize={22} />
      )}
      {(scene.prereqs || []).map((pq, i) => (
        <Lbl key={i} x={130} y={64 + i * 32} text={`참조 ${pq.label}: ${pq.concept}`} p={pr(g, 0.05, 0.2)}
          mono size={18} fill={C.faint} anchor="start" />
      ))}
    </g>
  );
}

window.GenericVis = { GenericScene };
