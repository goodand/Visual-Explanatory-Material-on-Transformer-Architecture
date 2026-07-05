// U01 Scenes B — Scene 06~09 시각화
const { U01C: C, stepP, lerp, clamp01, stag, DarkGrid, TChip, CardBox, Flow, Callout, Lbl, Packet } = window.U01Shared;

// S06 ID 공간 vs 임베딩 공간 — before_after_contrast (4 steps)
function Scene06({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const ly = 430;
  return (
    <g>
      {P(0) > 0 && (
        <g opacity={P(0)}>
          <rect x={110} y={180} width={620} height={520} rx="14" fill="rgba(255,255,255,0.02)" stroke={C.cardBorder} strokeWidth="1.5" />
          <Lbl x={420} y={230} text="ID 공간" p={1} size={28} fill={C.text} weight={700} />
          <line x1={180} y1={ly} x2={660} y2={ly} stroke={C.line} strokeWidth="2.5" />
          <circle cx={370} cy={ly} r="9" fill={C.amber} />
          <circle cx={450} cy={ly} r="9" fill={C.amber} />
          <Lbl x={370} y={ly - 40} text="영화 120" p={1} size={24} fill={C.text} />
          <Lbl x={450} y={ly + 56} text="양말 121" p={1} size={24} fill={C.text} />
          <Lbl x={420} y={620} text="간격 1 — 의미 없음 ✗" p={1} size={25} fill={C.amber} weight={600} />
        </g>
      )}
      {P(1) > 0 && (
        <g opacity={P(1)}>
          <rect x={870} y={180} width={620} height={520} rx="14" fill="rgba(255,255,255,0.02)" stroke={C.cardBorder} strokeWidth="1.5" />
          <Lbl x={1180} y={230} text="학습된 임베딩 공간" p={1} size={28} fill={C.text} weight={700} />
          <circle cx={1030} cy={330} r="10" fill={C.teal} />
          <circle cx={1330} cy={560} r="10" fill={C.teal} />
          <Lbl x={1030} y={300} text="영화" p={1} size={24} fill={C.text} />
          <Lbl x={1330} y={600} text="양말" p={1} size={24} fill={C.text} />
          <line x1={1030} y1={330} x2={1330} y2={560} stroke={C.teal} strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
          <Lbl x={1180} y={620} text="거리 = 의미 유사 ○" p={1} size={25} fill={C.teal} weight={600} />
        </g>
      )}
      {P(2) > 0 && (
        <g opacity={P(2)}>
          <Flow x1={745} y1={430} x2={855} y2={430} p={P(2)} color={C.accent} />
          <Lbl x={800} y={400} text="E[id]" p={P(2)} mono size={24} fill={C.accent} weight={700} />
        </g>
      )}
      <Callout x={350} y={760} w={900} p={P(3)} tone="teal" text="의미 거리는 학습된 embedding 이후에 생긴다" />
    </g>
  );
}

// S07 special tokens — packet_flow (5 steps)
function Scene07({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const mk = (x, y, w, text, pp, kind) => (
    <TChip x={x} y={y} w={w} text={text} p={pp}
      accent={kind === "bos" || kind === "eos"} dashed={kind === "pad"} dim={kind === "pad"} fontSize={23} />
  );
  const y1 = 290, y2 = 520, cw = 148, g = 10;
  const row = (x0, y, items) => items.map((it, i) => ({ ...it, x: x0 + i * (cw + g), y }));
  const r1 = row(360, y1, [
    { t: "[BOS]", k: "bos", s: 1 }, { t: "나는", k: "w", s: 0 }, { t: "영화를", k: "w", s: 0 },
    { t: "[EOS]", k: "eos", s: 2 }, { t: "[PAD]", k: "pad", s: 3 }, { t: "[PAD]", k: "pad", s: 3 },
  ]);
  const r2 = row(360, y2, [
    { t: "[BOS]", k: "bos", s: 1 }, { t: "나는", k: "w", s: 0 }, { t: "어제", k: "w", s: 0 },
    { t: "영화를", k: "w", s: 0 }, { t: "봤다", k: "w", s: 0 }, { t: "[EOS]", k: "eos", s: 2 },
  ]);
  return (
    <g>
      <Lbl x={200} y={y1 + 38} text="문장 A (짧음)" p={P(0)} size={23} anchor="start" />
      <Lbl x={200} y={y2 + 38} text="문장 B (김)" p={P(0)} size={23} anchor="start" />
      {[...r1, ...r2].map((c, i) => {
        const pp = c.s === 0 ? P(0) : c.s === 1 ? P(1) : c.s === 2 ? P(2) : P(3);
        return <g key={i}>{mk(c.x, c.y, cw, c.t, pp, c.k)}</g>;
      })}
      {P(4) > 0 && (
        <g opacity={P(4)}>
          <Lbl x={800} y={720} text="[BOS] 시작 신호 · [EOS] 종료 신호 · [PAD] 길이 맞춤" p={P(4)} size={26} fill={C.text} />
          <Lbl x={800} y={762} text="→ decoder 시작 · 생성 종료 판단 · batch 정렬 · masking에 사용" p={P(4)} size={22} />
        </g>
      )}
    </g>
  );
}

// S08 padding & mask — before_after_contrast (4 steps)
function Scene08({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const seq = ["[BOS]", "나는", "영화를", "[EOS]", "[PAD]", "[PAD]"];
  const mask = ["1", "1", "1", "1", "0", "0"];
  const x0 = 330, cw = 150, g = 10, ySeq = 300, yMask = 470;
  return (
    <g>
      <Lbl x={x0 - 20} y={ySeq + 38} text="sequence" p={P(0)} size={21} anchor="end" mono />
      {seq.map((t, i) => {
        const isPad = i >= 4;
        const dimNow = isPad && P(2) > 0;
        return <TChip key={i} x={x0 + i * (cw + g)} y={ySeq} w={cw} text={t}
          p={stag(P(0), i, 6)} dashed={isPad} dim={dimNow} fontSize={23} />;
      })}
      <Lbl x={x0 - 20} y={yMask + 38} text="mask" p={P(1)} size={21} anchor="end" mono />
      {mask.map((m, i) => (
        <TChip key={i} x={x0 + i * (cw + g)} y={yMask} w={cw} h={56} text={m}
          p={stag(P(1), i, 6)} mono accent={m === "1"} dim={m === "0"} fontSize={26} />
      ))}
      {P(2) > 0 && (
        <g opacity={P(2)}>
          <rect x={x0 + 4 * (cw + g) - 8} y={ySeq - 12} width={2 * (cw + g) + 6} height={240} rx="12"
            fill="none" stroke={C.amber} strokeWidth="2" strokeDasharray="8 6" />
          <Lbl x={x0 + 5 * (cw + g)} y={ySeq - 30} text="계산에서 제외" p={P(2)} size={24} fill={C.amber} weight={600} />
        </g>
      )}
      <Callout x={330} y={700} w={940} p={P(3)} tone="teal" text="이 mask가 Attention(U07) · Decoder(U10) · Loss(U11)에서 다시 등장한다" />
    </g>
  );
}

// S09 pipeline formula lock — formula_lock + state_bar_progression (4 steps)
function Scene09({ step, p, onFormula }) {
  const P = (i) => stepP(step, p, i);
  const stations = ["text", "tokens", "ids", "special", "E[id]"];
  const n = stations.length, x0 = 200, xw = 1200 / (n - 1), y = 340;
  const travel = P(1) * (n - 1);
  React.useEffect(() => { if (onFormula) onFormula(P(2) > 0.3); });
  return (
    <g>
      {stations.map((s, i) => (
        <g key={s} opacity={stag(P(0), i, n)}>
          <circle cx={x0 + i * xw} cy={y} r="14" fill={travel >= i ? C.accent : C.card}
            stroke={travel >= i ? C.accent : C.cardBorder} strokeWidth="2" />
          <Lbl x={x0 + i * xw} y={y + 58} text={s} p={1} mono size={25}
            fill={travel >= i ? C.text : C.dim} weight={travel >= i ? 700 : 400} />
          {i < n - 1 && (
            <line x1={x0 + i * xw + 20} y1={y} x2={x0 + (i + 1) * xw - 20} y2={y}
              stroke={clamp01(travel - i) > 0.5 ? C.accent : C.line} strokeWidth="2.5" />
          )}
        </g>
      ))}
      {P(1) > 0 && P(1) < 1 && (
        <Packet cx={x0 + travel * xw} cy={y - 60} p={1} text="x_t" w={100} h={48} />
      )}
      <Lbl x={800} y={180} text="파이프라인 전체 — 이미 본 움직임의 압축" p={P(0)} size={28} fill={C.text} weight={600} />
      {/* formula 패널은 HTML 오버레이(KaTeX)가 담당 — onFormula 콜백으로 표시 신호 */}
      {P(3) > 0 && (
        <g opacity={P(3)}>
          <Lbl x={800} y={640} text="↓ 하단 5-Unit frame — '표현' slot이 채워졌다" p={P(3)} size={25} fill={C.teal} weight={600} />
        </g>
      )}
    </g>
  );
}

window.U01ScenesB = { Scene06, Scene07, Scene08, Scene09 };
