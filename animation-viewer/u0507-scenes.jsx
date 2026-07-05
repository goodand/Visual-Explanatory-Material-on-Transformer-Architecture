// U05/U07 전용 승격 Scene — scene_id 기반 override
// window.SceneVisOverrides[scene_id] → GenericScene에서 KIND_MAP보다 우선 디스패치
const { U01C: C, lerp, clamp01, stag, TChip, CardBox, Flow, Callout, Lbl, Packet } = window.U01Shared;
const gpr = (g, a, b) => clamp01((g - a) / (b - a));
const fmtV = (v) => (v < 0 ? "−" + Math.abs(v).toFixed(2).replace(/0$/, "") : String(v));

// ════════════════════════════════════════════════════
// VLstmGate — LSTM gate 공통 (forget / input / output)
// gate 생성(σ) → gate bar → ⊙ 요소별 곱 → 결과 벡터
// ════════════════════════════════════════════════════
const GATE_PRESETS = {
  u05_s03: {
    fnSub: "W_f", gateName: "f_t",
    gate: [0.9, 0.1, 0.7, 0.3],
    source: [0.8, -0.3, 1.2, 0.5], sourceName: "C_{t−1}", sourceFrom: null, srcInputLabel: null,
    result: [0.72, -0.03, 0.84, 0.15], resultName: "f_t ⊙ C_{t−1}",
    verdict: ["유지", "폐기", "유지", "일부"],
    caption: "sigmoid 0~1 연속값 mask — 각 값을 '얼마나' 남길지 (이진 결정이 아니다)",
  },
  u05_s04: {
    fnSub: "W_i", gateName: "i_t",
    gate: [0.2, 0.8, 0.5, 0.1],
    source: [0.6, -0.9, 0.3, 0.8], sourceName: "C̃_t", sourceFrom: { fn: "tanh", sub: "W_C" }, srcInputLabel: null,
    result: [0.12, -0.72, 0.15, 0.08], resultName: "i_t ⊙ C̃_t",
    verdict: ["약간", "많이", "반", "거의×"],
    caption: "tanh는 '무엇을 넣을 수 있는지' — sigmoid는 '그 중 얼마나 넣을지'",
  },
  u05_s06: {
    fnSub: "W_o", gateName: "o_t",
    gate: [0.8, 0.4, 0.9, 0.2],
    source: [0.69, -0.64, 0.76, 0.23], sourceName: "tanh(C_t)", sourceFrom: { fn: "tanh", sub: "" }, srcInputLabel: "C_t",
    result: [0.55, -0.26, 0.68, 0.05], resultName: "h_t",
    verdict: ["내보냄", "일부", "내보냄", "거의×"],
    caption: "h_t = o_t ⊙ tanh(C_t) → ① 현재 출력 y_t ② 다음 시점 입력",
  },
};

function VLstmGate({ g, preset: T }) {
  const cols = [645, 875, 1105, 1335], CW = 180;
  const pSrc = gpr(g, 0, 0.16);
  const pIn = gpr(g, 0.14, 0.3);
  const pGate = gpr(g, 0.3, 0.52);
  const pMul = gpr(g, 0.54, 0.8);
  const pEnd = gpr(g, 0.82, 1);
  const barBase = 330, barMax = 110;
  return (
    <g>
      {/* 좌측 기계부: 입력 → σ (+ tanh) */}
      <g opacity={pIn}>
        <TChip x={80} y={320} w={220} h={64} text="[h_{t−1}, x_t]" p={pIn} mono fontSize={22} />
        <Flow x1={252} y1={330} x2={332} y2={258} p={pIn} />
        <rect x={330} y={215} width={110} height={64} rx="10" fill={C.card} stroke={C.accent} strokeWidth="1.5" strokeDasharray="6 5" />
        <Lbl x={385} y={243} text="σ" p={pIn} size={26} fill={C.accent} weight={700} />
        <Lbl x={385} y={268} text={T.fnSub} p={pIn} mono size={15} fill={C.faint} />
        <Lbl x={385} y={196} text="same type · U02" p={pIn} mono size={13} fill={C.amber} />
        <Flow x1={444} y1={247} x2={540} y2={247} p={pIn} />
        <Lbl x={470} y={225} text={T.gateName} p={pIn} mono size={23} fill={C.accent} weight={700} anchor="start" />
      </g>
      {/* source 생성부 (S04: tanh box, S06: C_t → tanh) */}
      {T.sourceFrom && (
        <g opacity={pSrc}>
          {T.srcInputLabel
            ? <g>
                <TChip x={80} y={428} w={170} h={64} text={T.srcInputLabel} p={pSrc} mono fontSize={24} />
                <Flow x1={254} y1={460} x2={326} y2={460} p={pSrc} />
              </g>
            : <Flow x1={252} y1={390} x2={332} y2={448} p={Math.min(pSrc, pIn)} />}
          <rect x={330} y={428} width={110} height={64} rx="10" fill={C.card} stroke={C.teal} strokeWidth="1.5" strokeDasharray="6 5" />
          <Lbl x={385} y={456} text={T.sourceFrom.fn} p={pSrc} mono size={21} fill={C.teal} weight={700} />
          {T.sourceFrom.sub && <Lbl x={385} y={480} text={T.sourceFrom.sub} p={pSrc} mono size={14} fill={C.faint} />}
          <Flow x1={444} y1={460} x2={540} y2={460} p={pSrc} />
        </g>
      )}
      {/* gate bar row */}
      {cols.map((cx, i) => {
        const bp = stag(pGate, i, 4, 0.45);
        const v = T.gate[i], h = barMax * v * bp;
        return (
          <g key={"b" + i} opacity={Math.min(1, bp * 1.5)}>
            <rect x={cx - 32} y={barBase - h} width={64} height={h} rx="6"
              fill={C.accent} opacity={0.25 + v * 0.6} />
            <Lbl x={cx} y={barBase - h - 14} text={String(v)} p={bp} mono size={23} fill={v >= 0.5 ? C.accent : C.dim} weight={700} />
          </g>
        );
      })}
      {/* source row */}
      <Lbl x={T.sourceFrom ? 1445 : 540} y={468} text={T.sourceName} p={pSrc} mono size={21} fill={C.teal}
        anchor={T.sourceFrom ? "start" : "end"} />
      {cols.map((cx, i) => (
        <TChip key={"s" + i} x={cx - CW / 2} y={430} w={CW} h={64} text={fmtV(T.source[i])}
          p={stag(pSrc, i, 4, 0.5)} mono fontSize={26} />
      ))}
      {/* ⊙ + 곱 흐름 + result */}
      {cols.map((cx, i) => {
        const mp = stag(pMul, i, 4, 0.45);
        const keep = T.gate[i] >= 0.5;
        return (
          <g key={"m" + i}>
            <Lbl x={cx} y={400} text="⊙" p={mp} size={30} fill={C.amber} weight={700} />
            <Flow x1={cx} y1={500} x2={cx} y2={584} p={mp} dashed color={keep ? C.teal : C.faint} />
            <g opacity={keep ? 1 : 0.45}>
              <TChip x={cx - CW / 2} y={590} w={CW} h={64} text={fmtV(T.result[i])} p={mp} mono
                accent={keep} fontSize={26} />
            </g>
            <Lbl x={cx} y={700} text={T.verdict[i]} p={stag(pEnd, i, 4, 0.4)} size={21}
              fill={keep ? C.teal : C.amber} weight={600} />
          </g>
        );
      })}
      <Lbl x={540} y={628} text={T.resultName} p={pMul} mono size={21} fill={C.text} anchor="end" />
      <Callout x={300} y={760} w={1000} p={pEnd} tone="teal" text={T.caption} fontSize={23} />
    </g>
  );
}

// ════════════════════════════════════════════════════
// VQKDot — u07_s04: Q₂가 각 K와 dot product → score row
// ════════════════════════════════════════════════════
function VQKDot({ g }) {
  const scores = [2.1, 0.5, 3.8, 1.2];
  const kx = [530, 810, 1090, 1370], KW = 190;
  const cellY = 540, kY = 240;
  const pSet = gpr(g, 0, 0.12);
  const dotP = (i) => gpr(g, 0.12 + i * 0.135, 0.12 + (i + 1) * 0.135);
  const pScale = gpr(g, 0.68, 0.84);
  const pDone = gpr(g, 0.86, 1);
  return (
    <g>
      <TChip x={130} y={360} w={160} h={72} text="Q₂" p={pSet} accent mono fontSize={30} />
      <Lbl x={210} y={330} text="query" p={pSet} mono size={17} fill={C.faint} />
      {kx.map((x, i) => (
        <g key={i}>
          <TChip x={x - KW / 2} y={kY} w={KW} h={68} text={`K_${i + 1}`} p={stag(pSet, i, 4, 0.5)} mono fontSize={26} />
          {/* dot product 진행 */}
          {(() => {
            const d = dotP(i);
            if (d <= 0) return null;
            const done = d >= 1;
            return (
              <g>
                <Flow x1={294} y1={396} x2={x - 30} y2={cellY - 10} p={Math.min(1, d * 2)} dashed color={C.teal} />
                <Flow x1={x} y1={kY + 72} x2={x} y2={cellY - 12} p={Math.min(1, d * 2)} color={C.line} />
                {d > 0.3 && d < 0.95 && <Lbl x={x - 40} y={cellY - 40} text="·" p={1} size={44} fill={C.teal} weight={700} />}
                <rect x={x - KW / 2} y={cellY} width={KW} height={72} rx="10"
                  fill={done || pScale > 0 ? C.accentSoft : C.card}
                  stroke={done || pScale > 0 ? C.accent : C.cardBorder} strokeWidth={done ? 2 : 1.5}
                  strokeDasharray={d < 0.55 ? "7 6" : "none"} />
                {d > 0.55 && <Lbl x={x} y={cellY + 46} text={String(scores[i])} p={gpr(d, 0.55, 1)} mono size={30} fill={C.text} weight={700} />}
                <Lbl x={x} y={cellY + 96} text={`s_2${i + 1}`} p={gpr(d, 0.6, 1)} mono size={17} fill={C.faint} />
              </g>
            );
          })()}
          {dotP(i) <= 0 && (
            <rect x={x - KW / 2} y={cellY} width={KW} height={72} rx="10" fill="none"
              stroke={C.cardBorder} strokeWidth="1.5" strokeDasharray="7 6" opacity={pSet * 0.5} />
          )}
        </g>
      ))}
      {/* ÷√d_k scaling */}
      {pScale > 0 && (
        <g opacity={pScale}>
          <rect x={640} y={438} width={220} height={54} rx="10" fill={C.amberSoft} stroke={C.amber} strokeWidth="1.5" />
          <Lbl x={750} y={472} text="÷ √d_k" p={pScale} mono size={25} fill={C.amber} weight={700} />
          <Lbl x={1140} y={470} text="극단적 softmax 방지" p={pScale} size={19} fill={C.dim} anchor="start" />
        </g>
      )}
      {pDone > 0 && (
        <g opacity={pDone}>
          <rect x={kx[0] - KW / 2 - 14} y={cellY - 12} width={kx[3] - kx[0] + KW + 28} height={96} rx="14"
            fill="none" stroke={C.accent} strokeWidth="2" />
          <Callout x={400} y={700} w={800} p={pDone} text="score row [2.1, 0.5, 3.8, 1.2] 완성 — 다음: softmax" />
        </g>
      )}
    </g>
  );
}

// ════════════════════════════════════════════════════
// VSoftmaxDist — u07_s05: score → softmax → distribution (Σ=1)
// ════════════════════════════════════════════════════
function VSoftmaxDist({ g }) {
  const scores = [2.1, 0.5, 3.8, 1.2];
  const dist = [0.18, 0.04, 0.63, 0.15];
  const segColors = ["#8B78F0", "#5A615C", "#22B8A5", "#E5B84B"]; // S06 weighted sum과 동일 인덱스
  const base = 560;
  const pScore = gpr(g, 0, 0.28);
  const pBox = gpr(g, 0.28, 0.46);
  const pDist = gpr(g, 0.48, 0.75);
  const pSum = gpr(g, 0.76, 0.92);
  const pEnd = gpr(g, 0.9, 1);
  return (
    <g>
      <Lbl x={430} y={200} text="score row" p={pScore} mono size={21} fill={C.dim} />
      {scores.map((v, i) => {
        const p = stag(pScore, i, 4, 0.45);
        const h = (v / 3.8) * 240 * p;
        const x = 260 + i * 115;
        return (
          <g key={i} opacity={Math.min(1, p * 1.5)}>
            <rect x={x} y={base - h} width={80} height={h} rx="6" fill={C.faint} opacity="0.55" />
            <Lbl x={x + 40} y={base - h - 14} text={String(v)} p={p} mono size={22} fill={C.dim} weight={600} />
            <Lbl x={x + 40} y={base + 32} text={`s_2${i + 1}`} p={p} mono size={17} fill={C.faint} />
          </g>
        );
      })}
      {/* softmax box — collapsed reuse */}
      <g opacity={pBox}>
        <Flow x1={725} y1={450} x2={775} y2={450} p={pBox} />
        <rect x={780} y={395} width={150} height={104} rx="12" fill={C.card} stroke={C.cardBorder} strokeWidth="1.5" strokeDasharray="7 6" />
        <Lbl x={855} y={438} text="softmax" p={pBox} mono size={22} fill={C.text} weight={600} />
        <Lbl x={855} y={468} text="same op · U02" p={pBox} mono size={14} fill={C.amber} />
        <Flow x1={935} y1={450} x2={985} y2={450} p={pBox} />
      </g>
      <Lbl x={1180} y={200} text="attention distribution" p={pDist} mono size={21} fill={C.accent} />
      {dist.map((v, i) => {
        const p = stag(pDist, i, 4, 0.45);
        const h = v * 380 * p;
        const x = 1010 + i * 115;
        return (
          <g key={i} opacity={Math.min(1, p * 1.5)}>
            <rect x={x} y={base - h} width={80} height={h} rx="6" fill={C.accent} opacity={0.35 + v} />
            <Lbl x={x + 40} y={base - h - 14} text={String(v)} p={p} mono size={22} fill={v > 0.5 ? C.accent : C.dim} weight={700} />
            <Lbl x={x + 40} y={base + 32} text={`V_${i + 1}`} p={p} mono size={17} fill={C.faint} />
          </g>
        );
      })}
      {/* Σ=1 segment bar */}
      {pSum > 0 && (
        <g opacity={Math.min(1, pSum * 1.4)}>
          {(() => {
            let acc = 990; const W = 460;
            return dist.map((v, i) => {
              const w = v * W * pSum, x = acc; acc += w;
              return <rect key={i} x={x} y={640} width={w} height={40} fill={segColors[i]} opacity="0.85" rx={i === 0 ? 7 : 0} />;
            });
          })()}
          <rect x={990} y={640} width={460 * pSum} height={40} rx="7" fill="none" stroke={C.accent} strokeWidth="1.5" />
          <Lbl x={1220} y={716} text="Σ = 1" p={pSum} mono size={22} fill={C.text} weight={700} />
        </g>
      )}
      <Callout x={300} y={780} w={1000} p={pEnd} tone="amber" text="이 숫자는 '중요도 표시'가 아니라 V를 섞는 비율이다" fontSize={23} />
    </g>
  );
}

// scene_id → override 컴포넌트 (props: { g, params, scene })
window.SceneVisOverrides = {
  u05_s03: (p) => <VLstmGate {...p} preset={GATE_PRESETS.u05_s03} />,
  u05_s04: (p) => <VLstmGate {...p} preset={GATE_PRESETS.u05_s04} />,
  u05_s06: (p) => <VLstmGate {...p} preset={GATE_PRESETS.u05_s06} />,
  u07_s04: VQKDot,
  u07_s05: VSoftmaxDist,
};
