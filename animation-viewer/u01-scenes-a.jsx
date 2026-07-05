// U01 Scenes A — Scene 01~05 시각화 (1600×900 다크 캔버스)
const { U01C: C, stepP, lerp, clamp01, stag, DarkGrid, TChip, CardBox, Flow, Callout, Lbl, Packet } = window.U01Shared;

// S01 토큰화 — packet_flow (5 steps)
function Scene01({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const tokens = ["나는", "어제", "영화를", "봤다"];
  const rowX = 950, rowW = 150, gap = 12;
  return (
    <g>
      <CardBox x={90} y={340} w={360} h={160} p={P(0)} label="원문">
        <text x={270} y={432} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="30" fontWeight="600" fill={C.text}>"나는 어제 영화를 봤다"</text>
      </CardBox>
      <CardBox x={560} y={340} w={280} h={160} p={P(1)} label="분리 규칙" accent>
        <text x={700} y={432} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="28" fontWeight="600" fill={C.accent}>tokenizer</text>
      </CardBox>
      <Flow x1={452} y1={420} x2={556} y2={420} p={P(1)} />
      <Flow x1={842} y1={420} x2={944} y2={420} p={P(2)} />
      {tokens.map((t, i) => {
        const tp = stag(P(2), i, 4);
        if (tp <= 0) return null;
        const cx = lerp(700, rowX + i * (rowW + gap) + rowW / 2, tp);
        const cy = lerp(420, 420, tp);
        return <Packet key={t} cx={cx} cy={cy} p={Math.min(1, tp * 1.6)} text={t} w={rowW} h={62} />;
      })}
      {P(3) > 0 && (
        <g opacity={P(3)}>
          <line x1={rowX - 8} y1={470} x2={rowX + 4 * (rowW + gap) - gap + 8} y2={470} stroke={C.line} strokeWidth="2" />
          <Lbl x={rowX + (4 * (rowW + gap) - gap) / 2} y={505} text="토큰 리스트 — 처리 단위" p={P(3)} />
        </g>
      )}
      <Callout x={350} y={700} w={900} p={P(4)} text="실제 tokenizer는 단어 단위가 아니라 subword 단위로 자를 수 있다" />
    </g>
  );
}

// S02 vocab lookup — matrix_build (4 steps)
function Scene02({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const rows = [["…", "…"], ["어제", "87"], ["영화를", "210"], ["봤다", "55"], ["…", "…"]];
  const tx = 560, ty = 210, rw = 480, rh = 66;
  const ids = ["1042", "87", "210", "55"];
  return (
    <g>
      <CardBox x={tx} y={ty} w={rw} h={rh * rows.length + 60} p={P(0)} label="vocab — 단어 → index">
        <text x={tx + 140} y={ty + 42} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="20" fill={C.faint}>단어</text>
        <text x={tx + 360} y={ty + 42} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="20" fill={C.faint}>index</text>
        {rows.map((r, i) => {
          const hl = i === 2 && P(2) > 0;
          return (
            <g key={i} opacity={stag(P(0), i, rows.length)}>
              {hl && <rect x={tx + 14} y={ty + 56 + i * rh} width={rw - 28} height={rh - 6} rx="8" fill={C.accentSoft} stroke={C.accent} strokeWidth="2" opacity={P(2)} />}
              <text x={tx + 140} y={ty + 100 + i * rh} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="26" fontWeight={hl ? 700 : 500} fill={hl ? C.accent : C.text}>{r[0]}</text>
              <text x={tx + 360} y={ty + 100 + i * rh} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="26" fontWeight={hl ? 700 : 500} fill={hl ? C.accent : C.dim}>{r[1]}</text>
            </g>
          );
        })}
      </CardBox>
      {P(1) > 0 && P(1) < 1 && <Packet cx={lerp(250, tx + 140, P(1))} cy={lerp(160, ty + 90 + 2 * rh, P(1))} p={1} text="영화를" />}
      <TChip x={150} y={120} w={200} text="영화를" p={P(1) > 0 ? 1 - P(1) * 0.99 : 0} accent />
      {P(2) > 0 && <Flow x1={tx + rw + 6} y1={ty + 90 + 2 * rh} x2={tx + rw + 120} y2={ty + 90 + 2 * rh} p={P(2)} color={C.accent} />}
      <TChip x={tx + rw + 130} y={ty + 60 + 2 * rh} w={130} text="210" p={P(2)} accent mono />
      {P(3) > 0 && (
        <g>
          <Lbl x={800} y={720} text="모든 토큰 → 정수 ID 리스트" p={P(3)} />
          {ids.map((id, i) => (
            <TChip key={id} x={470 + i * 180} y={745} w={160} text={id} p={stag(P(3), i, 4)} mono />
          ))}
        </g>
      )}
    </g>
  );
}

// S03 ID 간격 교정 — before_after_contrast (4 steps)
function Scene03({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const y = 420, x120 = 420, x121 = 540, x500 = 1240;
  const pts = [
    { x: x120, id: "120", w: "영화" },
    { x: x121, id: "121", w: "양말" },
    { x: x500, id: "500", w: "드라마" },
  ];
  return (
    <g>
      {P(0) > 0 && (
        <g opacity={P(0)}>
          <line x1={240} y1={y} x2={1400} y2={y} stroke={C.line} strokeWidth="2.5" />
          <Lbl x={240} y={y - 30} text="ID 수직선 (vocab index)" p={P(0)} anchor="start" mono size={20} />
          {pts.map((pt, i) => (
            <g key={pt.id} opacity={stag(P(0), i, 3)}>
              <circle cx={pt.x} cy={y} r="9" fill={C.accent} />
              <Lbl x={pt.x} y={y - 44} text={pt.w} p={1} size={28} fill={C.text} weight={600} />
              <Lbl x={pt.x} y={y + 52} text={pt.id} p={1} mono size={24} />
            </g>
          ))}
        </g>
      )}
      {P(1) > 0 && (
        <g opacity={P(1)}>
          <path d={`M ${x120} ${y - 80} Q ${(x120 + x121) / 2} ${y - 130} ${x121} ${y - 80}`} fill="none" stroke={C.amber} strokeWidth="2.5" />
          <Lbl x={(x120 + x121) / 2} y={y - 145} text="간격 1" p={P(1)} size={26} fill={C.amber} weight={700} />
        </g>
      )}
      <Lbl x={800} y={620} text="그래서 '영화'와 '양말'이 비슷한 단어인가?" p={P(2)} size={30} fill={C.text} weight={600} />
      <Callout x={330} y={690} w={940} p={P(3)} tone="amber" text="✗ ID는 vocab index일 뿐 — 거리에 의미가 없다" />
    </g>
  );
}

// S04 embedding lookup — matrix_build + packet_flow (5 steps)
function Scene04({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const tx = 520, ty = 170, rw = 560, rh = 70;
  const rows = ["208", "209", "210", "211"];
  const vals = [["·", "·", "·", "·"], ["·", "·", "·", "·"], ["0.21", "−0.47", "0.88", "…"], ["·", "·", "·", "·"]];
  const vecY = ty + 60 + 4 * rh + 80;
  return (
    <g>
      <CardBox x={tx} y={ty} w={rw} h={rh * 4 + 62} p={P(0)} label="E — |V|×d · parameter block">
        {["d₁", "d₂", "d₃", "…"].map((c, j) => (
          <text key={c} x={tx + 190 + j * 100} y={ty + 40} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="19" fill={C.faint}>{c}</text>
        ))}
        {rows.map((r, i) => {
          const hl = i === 2 && P(2) > 0;
          return (
            <g key={r} opacity={stag(P(0), i, 4)}>
              {hl && <rect x={tx + 12} y={ty + 52 + i * rh} width={rw - 24} height={rh - 6} rx="8" fill={C.accentSoft} stroke={C.accent} strokeWidth="2" opacity={P(2)} />}
              <text x={tx + 70} y={ty + 96 + i * rh} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="23" fill={hl ? C.accent : C.faint}>{r}</text>
              {vals[i].map((v, j) => (
                <text key={j} x={tx + 190 + j * 100} y={ty + 96 + i * rh} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="23" fontWeight={hl ? 700 : 400} fill={hl ? C.text : C.faint}>{v}</text>
              ))}
            </g>
          );
        })}
      </CardBox>
      {P(1) > 0 && P(1) < 1 && <Packet cx={lerp(240, tx - 60, P(1))} cy={ty + 88 + 2 * rh} p={1} text="ID 210" w={140} />}
      <TChip x={tx - 210} y={ty + 56 + 2 * rh} w={140} text="ID 210" p={P(1) >= 1 ? 1 : 0} accent mono fontSize={24} />
      {P(3) > 0 && (
        <g>
          <Flow x1={tx + rw / 2} y1={ty + 62 + 3 * rh} x2={tx + rw / 2} y2={vecY - 12} p={P(3)} color={C.accent} />
          <g style={{ opacity: P(3), transform: `translateY(${(1 - P(3)) * -20}px)` }}>
            <rect x={tx + 40} y={vecY} width={rw - 80} height={64} rx="10" fill={C.accentSoft} stroke={C.accent} strokeWidth="2" />
            <text x={tx + rw / 2} y={vecY + 41} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="26" fontWeight="600" fill={C.text}>[ 0.21  −0.47  0.88  … ]</text>
          </g>
        </g>
      )}
      <Callout x={200} y={800} w={940} p={P(4)} tone="teal" text="training 중 backprop으로 갱신 · inference 중 고정 조회" />
    </g>
  );
}

// S05 학습된 임베딩 공간 — xy_transform (6 steps)
function Scene05({ step, p }) {
  const P = (i) => stepP(step, p, i);
  const ox = 350, oy = 160, w = 900, h = 560;
  const pts = [
    { x: ox + 560, y: oy + 200, l: "영화를" },
    { x: ox + 660, y: oy + 260, l: "드라마를" },
    { x: ox + 180, y: oy + 430, l: "봤다" },
  ];
  return (
    <g>
      {P(0) > 0 && (
        <g opacity={P(0)}>
          <rect x={ox} y={oy} width={w} height={h} rx="14" fill="rgba(255,255,255,0.02)" stroke={C.cardBorder} strokeWidth="1.5" />
          <line x1={ox + 50} y1={oy + h - 50} x2={ox + w - 40} y2={oy + h - 50} stroke={C.line} strokeWidth="2" />
          <line x1={ox + 50} y1={oy + h - 50} x2={ox + 50} y2={oy + 40} stroke={C.line} strokeWidth="2" />
          <Lbl x={ox + 20} y={oy - 16} text="학습된 임베딩 공간 (2D 투영)" p={P(0)} anchor="start" mono size={20} />
        </g>
      )}
      {pts.map((pt, i) => {
        const pp = P(i + 1);
        if (pp <= 0) return null;
        return (
          <g key={pt.l} opacity={pp}>
            <circle cx={pt.x} cy={pt.y} r={11 * Math.min(1, pp * 1.4)} fill={i < 2 ? C.teal : C.dim} />
            <Lbl x={pt.x} y={pt.y - 26} text={pt.l} p={pp} size={27} fill={C.text} weight={600} />
          </g>
        );
      })}
      {P(4) > 0 && (
        <g opacity={P(4)}>
          <line x1={pts[0].x} y1={pts[0].y} x2={lerp(pts[0].x, pts[1].x, P(4))} y2={lerp(pts[0].y, pts[1].y, P(4))} stroke={C.teal} strokeWidth="3" strokeDasharray="8 6" />
          <Lbl x={(pts[0].x + pts[1].x) / 2 + 120} y={(pts[0].y + pts[1].y) / 2} text="가까움 = 의미 유사" p={P(4)} size={26} fill={C.teal} weight={600} anchor="start" />
        </g>
      )}
      <Callout x={310} y={790} w={980} p={P(5)} text="초기화 직후 embedding은 랜덤 — 학습을 거쳐야 의미 거리가 생긴다" />
    </g>
  );
}

window.U01ScenesA = { Scene01, Scene02, Scene03, Scene04, Scene05 };
