// AI-ML Animation Player — 11 Unit 통합 플레이어
// Unit 01 = 전용 scene, Unit 02~11 = GenericScene(sketch 기반)
const { ScenePlayer, FrameBar } = window.MLAnimationsDesignSystem_947957;
const { tween, tokenEase } = window.TweenEngine;
const { GenericScene } = window.GenericVis;

const UNIT_IDS = ["unit01","unit02","unit03","unit04","unit05","unit06","unit07","unit08","unit09","unit10","unit11"];
const UNITS = UNIT_IDS.map((id) => window.SB_UNITS[id]).filter(Boolean);
const U01_VIS = [
  window.U01ScenesA.Scene01, window.U01ScenesA.Scene02, window.U01ScenesA.Scene03,
  window.U01ScenesA.Scene04, window.U01ScenesA.Scene05,
  window.U01ScenesB.Scene06, window.U01ScenesB.Scene07, window.U01ScenesB.Scene08,
  window.U01ScenesB.Scene09,
];
const LS_KEY = "aiml_anim_player";
const STEP_MS = 1500, HOLD_MS = 750;
const SLOT_BY_NAME = { "데이터": 0, "표현": 1, "계산 대상": 2, "개념 분류": 3, "중요성": 4 };

// scene_id → Transformer 해부도 level 딥링크 (U07~U10만 — U05 LSTM은 해부도 없음)
const ANATOMY_MAP = {
  u07_s02: { level: "L4-self", z: "Z4" }, u07_s04: { level: "L5", z: "Z5" },
  u07_s05: { level: "L5", z: "Z5" }, u07_s06: { level: "L5", z: "Z5" },
  u07_s08: { level: "L5", z: "Z5" }, u07_s09: { level: "L5", z: "Z5" },
  u08_s01: { level: "L3-self", z: "Z3" }, u08_s02: { level: "L3-self", z: "Z3" },
  u08_s03: { level: "L4-self", z: "Z4" }, u08_s04: { level: "L3-self", z: "Z3" },
  u08_s05: { level: "L3-self", z: "Z3" }, u08_s07: { level: "L3-self", z: "Z3" },
  u08_s08: { level: "L3-self", z: "Z3" },
  u09_s06: { level: "L2-enc", z: "Z2" }, u09_s07: { level: "L3-self", z: "Z3" },
  u09_s08: { level: "AddNorm", z: "Z3" }, u09_s09: { level: "L8", z: "Z3" },
  u09_s11: { level: "L1", z: "Z1" }, u09_s14: { level: "L1", z: "Z1" },
  u10_s02: { level: "L2-dec", z: "Z2" }, u10_s03: { level: "L3-masked", z: "Z3" },
  u10_s04: { level: "L3-cross", z: "Z3" }, u10_s05: { level: "L1", z: "Z1" },
  u10_s10: { level: "L1", z: "Z1" }, u10_s11: { level: "L0", z: "Z0" },
  u10_s12: { level: "L2-dec", z: "Z2" }, u10_s13: { level: "L2-dec", z: "Z2" },
};

function chipLabel(s) {
  const t = (s.title || "").split("—")[0].trim();
  return t.length > 9 ? t.slice(0, 9) + "…" : t;
}
function parseHash() {
  const m = (location.hash || "").match(/u=(\d+)/), s = (location.hash || "").match(/s=(\d+)/);
  if (!m) return null;
  const ui = UNITS.findIndex((u) => u.no === String(m[1]).padStart(2, "0"));
  if (ui < 0) return null;
  const sc = s ? Math.max(0, Math.min(UNITS[ui].scenes.length - 1, parseInt(s[1], 10) - 1)) : 0;
  return { unit: ui, scene: sc, step: 0 };
}
function loadState() {
  const h = parseHash();
  if (h) return h;
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY));
    if (s && s.unit >= 0 && s.unit < UNITS.length && s.scene < UNITS[s.unit].scenes.length) return s;
  } catch (e) {}
  return { unit: 0, scene: 0, step: 0 };
}

function LinkChips({ scene, onJumpScene, onJumpUnit, onToast }) {
  const glyph = { next: "→", prev: "←", related: "↔", cross: "↗" };
  const anat = ANATOMY_MAP[scene.scene_id];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", minHeight: 26 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-slate-8)", letterSpacing: "0.06em" }}>LINKS</span>
      {(scene.links || []).map((l, i) => (
        <button key={i} type="button" title={l.note || l.label}
          onClick={() => {
            const m = l.target.match(/^u(\d+)_s(\d+)$/);
            if (m) onJumpScene(m[1], parseInt(m[2], 10) - 1);
            else if (l.target.startsWith("_unit:")) onJumpUnit(l.target.slice(6));
            else onToast(l.note || l.label);
          }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
            borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)", fontSize: 11.5,
            cursor: "pointer", border: "1px solid",
            borderColor: l.type === "cross" ? "var(--color-violet-6)" : "var(--color-slate-4)",
            background: l.type === "cross" ? "var(--color-violet-2)" : "var(--color-slate-1)",
            color: l.type === "cross" ? "var(--color-violet-11)" : "var(--color-slate-10)",
          }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{glyph[l.type] || "·"}</span>
          {l.label}
        </button>
      ))}
      {anat && (
        <a href={`transformer-anatomy/Transformer%20Anatomy.html?level=${anat.level}&from=${scene.scene_id}`}
          title={`Transformer 해부도 ${anat.z} (${anat.level})로 이동`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px",
            borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)", fontSize: 11.5,
            cursor: "pointer", border: "1px solid var(--color-teal-7)", textDecoration: "none",
            background: "var(--color-teal-2)", color: "var(--color-teal-11)", fontWeight: 600,
          }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>⧉</span>
          해부도 {anat.z}
        </a>
      )}
    </div>
  );
}

function BacklinkChips({ entries, onJump }) {
  const [open, setOpen] = React.useState(false);
  if (!entries || entries.length === 0) return null;
  const shown = open ? entries : entries.slice(0, 3);
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-slate-8)", letterSpacing: "0.06em" }}>← REFERENCED BY</span>
      {shown.map((b, i) => (
        <button key={i} type="button" title={`U${b.unitNo} · ${b.fromTitle}`}
          onClick={() => onJump(b.unitIdx, b.sceneIdx)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px",
            borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)", fontSize: 11,
            cursor: "pointer", border: "1px dashed var(--color-slate-5)",
            background: "transparent", color: "var(--color-slate-9)",
          }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--color-slate-7)" }}>U{b.unitNo}</span>
          {b.fromTitle.length > 18 ? b.fromTitle.slice(0, 18) + "…" : b.fromTitle}
        </button>
      ))}
      {entries.length > 3 && (
        <button type="button" onClick={() => setOpen((v) => !v)}
          style={{
            padding: "3px 9px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-mono)",
            fontSize: 10.5, cursor: "pointer", border: "1px solid var(--color-slate-4)",
            background: "var(--color-slate-1)", color: "var(--color-slate-10)",
          }}>{open ? "접기" : `+${entries.length - 3}`}</button>
      )}
    </div>
  );
}

function FrameOverlay({ scene, slot, onClose }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    if (slot != null) { const t = requestAnimationFrame(() => setOn(true)); return () => cancelAnimationFrame(t); }
    setOn(false);
  }, [slot]);
  if (slot == null) return null;
  const f = scene.five_unit_frame || {};
  const items = [
    ["데이터", f.data], ["표현", f.representation], ["계산 대상", f.calculation_target],
    ["개념 분류", f.concept_classification],
    ["중요성", f.importance ? `[${f.importance.type}] ${f.importance.text}` : ""],
  ];
  const [label, text] = items[slot];
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 10, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15,17,16,0.62)", backdropFilter: "blur(2px)",
      opacity: on ? 1 : 0, transition: "opacity 200ms ease",
    }}>
      <div style={{
        maxWidth: 680, margin: "0 24px", background: "#171A18", border: "1px solid #3A403C",
        borderRadius: 14, padding: "22px 28px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        transform: on ? "translateY(0)" : "translateY(14px)", transition: "transform 220ms ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#8B78F0", background: "rgba(139,120,240,0.16)", padding: "3px 10px", borderRadius: 999 }}>{slot + 1}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#E8EAE7" }}>{label}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9BA29D", marginLeft: "auto" }}>5-UNIT FRAME · S{scene.no}</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.7, color: "#C9CEC9" }}>{text}</div>
        <div style={{ marginTop: 12, fontSize: 11, color: "#5A615C" }}>클릭하면 닫힙니다 · 다른 칩으로 전환 가능</div>
      </div>
    </div>
  );
}

function App() {
  const init = React.useMemo(loadState, []);
  const [unit, setUnit] = React.useState(init.unit);
  const [scene, setScene] = React.useState(init.scene);
  const [step, setStep] = React.useState(init.step);
  const [p, setP] = React.useState(1);
  const [playing, setPlaying] = React.useState(false);
  const [runId, setRunId] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [slot, setSlot] = React.useState(null);
  const [showGraph, setShowGraph] = React.useState(false);
  const playingRef = React.useRef(playing); playingRef.current = playing;
  const pRef = React.useRef(p); pRef.current = p;
  const stateRef = React.useRef({ unit, scene, step }); stateRef.current = { unit, scene, step };
  const formulaRef = React.useRef(null);

  const U = UNITS[unit];
  const SCENES = U.scenes;
  const cur = SCENES[scene];
  const nSteps = cur.animation_steps.length;
  const gNow = Math.min(1, (step + p) / nSteps);
  const BACKLINKS = React.useMemo(() => (window.WikiGraph ? window.WikiGraph.buildBacklinks(UNITS) : {}), []);

  const advance = React.useCallback(() => {
    const { unit: un, scene: sc, step: st } = stateRef.current;
    const scs = UNITS[un].scenes;
    const n = scs[sc].animation_steps.length;
    if (st + 1 < n) setStep(st + 1);
    else if (sc + 1 < scs.length) { setScene(sc + 1); setStep(0); }
    else if (un + 1 < UNITS.length) { setUnit(un + 1); setScene(0); setStep(0); }
    else setPlaying(false);
    setRunId((r) => r + 1);
  }, []);

  const togglePlay = React.useCallback(() => {
    const { unit: un, scene: sc, step: st } = stateRef.current;
    const scs = UNITS[un].scenes;
    const atEnd = un === UNITS.length - 1 && sc === scs.length - 1 && st === scs[sc].animation_steps.length - 1 && pRef.current >= 0.99;
    if (!playingRef.current && atEnd) { setUnit(0); setScene(0); setStep(0); setRunId((r) => r + 1); setPlaying(true); return; }
    setPlaying((v) => !v);
  }, []);

  React.useEffect(() => {
    let dead = false, hold = null;
    setP(0);
    const tw = tween({
      duration: STEP_MS, ease: tokenEase("--ease-default"),
      onUpdate: (v) => { if (!dead) setP(v); },
      onDone: () => { if (!dead && playingRef.current) hold = setTimeout(advance, HOLD_MS); },
    });
    return () => { dead = true; tw.cancel && tw.cancel(); clearTimeout(hold); };
  }, [unit, scene, step, runId, advance]);

  React.useEffect(() => {
    if (playing && pRef.current >= 0.99) { const t = setTimeout(advance, 250); return () => clearTimeout(t); }
  }, [playing, advance]);

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ unit, scene, step })); } catch (e) {}
    try { history.replaceState(null, "", `#u=${U.no}&s=${scene + 1}`); } catch (e) {}
  }, [unit, scene, step]);

  React.useEffect(() => { setSlot(null); }, [unit, scene]);

  React.useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); advance(); }
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const { unit: un, scene: sc, step: st } = stateRef.current;
        if (st > 0) setStep(st - 1);
        else if (sc > 0) { setScene(sc - 1); setStep(UNITS[un].scenes[sc - 1].animation_steps.length - 1); }
        else if (un > 0) { const pu = UNITS[un - 1]; setUnit(un - 1); setScene(pu.scenes.length - 1); setStep(pu.scenes[pu.scenes.length - 1].animation_steps.length - 1); }
        setRunId((r) => r + 1);
      } else if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if (e.key === "g" || e.key === "G") { setShowGraph((v) => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [advance, togglePlay]);

  // KaTeX formula 오버레이 — 마지막 30% 구간에 표시
  const formulaTex = cur.formula_lock && cur.formula_lock.needed ? cur.formula_lock.formula : null;
  const formulaOn = !!formulaTex && gNow > 0.72;
  React.useEffect(() => {
    if (formulaOn && formulaRef.current && window.katex) {
      window.katex.render(formulaTex, formulaRef.current, { throwOnError: false, displayMode: true });
    }
  }, [formulaOn, formulaTex]);

  React.useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); } }, [toast]);

  const jumpUnitId = (uid) => {
    const ui = UNITS.findIndex((u) => u.id === uid);
    if (ui >= 0) { setUnit(ui); setScene(0); setStep(0); setRunId((r) => r + 1); }
    else setToast("해당 Unit을 찾을 수 없습니다");
  };
  const jumpScene = (unitNo, sceneIdx) => {
    const ui = UNITS.findIndex((u) => u.no === String(unitNo).padStart(2, "0"));
    if (ui < 0) return setToast("해당 Unit 없음");
    const si = Math.max(0, Math.min(UNITS[ui].scenes.length - 1, sceneIdx));
    setUnit(ui); setScene(si); setStep(0); setRunId((r) => r + 1);
  };

  // 시각화 선택: Unit 01 전용 / 나머지 generic
  const canvas = U.id === "unit01"
    ? React.createElement(U01_VIS[scene], { step, p })
    : <GenericScene scene={cur} step={step} p={p} />;

  // FrameBar: 단원 마지막 scene 끝부분에서 routing emphasis slot open
  const emphKey = (U.routing && U.routing.emphasis || "").split(":")[0].trim();
  const emphSlot = SLOT_BY_NAME[emphKey] != null ? SLOT_BY_NAME[emphKey] : 1;
  const frameStates = [0, 1, 2, 3, 4].map((i) =>
    i === emphSlot && scene === SCENES.length - 1 && gNow > 0.8 ? "open" : "collapsed");

  const typeBadges = (cur.animation_type || []).map((t) => (
    <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "2.5px 8px", borderRadius: "var(--radius-full)", background: "var(--color-violet-2)", color: "var(--color-violet-11)", fontWeight: 600 }}>{t}</span>
  ));

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 24px 40px", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        {UNITS.map((u, i) => (
          <button key={u.id} type="button" title={u.title_ko}
            onClick={() => { setUnit(i); setScene(0); setStep(0); setRunId((r) => r + 1); setShowGraph(false); }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: i === unit ? 700 : 500,
              padding: "5px 11px", borderRadius: "var(--radius-full)", cursor: "pointer",
              border: "1px solid", borderColor: i === unit ? "var(--color-slate-12)" : "var(--color-slate-4)",
              background: i === unit ? "var(--color-slate-12)" : "var(--color-white)",
              color: i === unit ? "var(--color-white)" : "var(--color-slate-9)",
            }}>{u.no}</button>
        ))}
        {window.WikiGraph && (
          <button type="button" onClick={() => setShowGraph((v) => !v)}
            style={{
              marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
              padding: "5px 13px", borderRadius: "var(--radius-full)", cursor: "pointer",
              border: "1px solid", borderColor: showGraph ? "var(--color-violet-9)" : "var(--color-slate-4)",
              background: showGraph ? "var(--color-violet-9)" : "var(--color-white)",
              color: showGraph ? "var(--color-white)" : "var(--color-slate-10)",
            }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="2.5" cy="2.5" r="1.8" fill="currentColor"/><circle cx="9.5" cy="4" r="1.8" fill="currentColor"/><circle cx="5" cy="9.5" r="1.8" fill="currentColor"/><path d="M4 3l4 .8M3.2 4.2l1.4 3.8M8.8 5.5l-3 3.2" stroke="currentColor" strokeWidth="1"/></svg>
            그래프
          </button>
        )}
      </div>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-violet-9)", background: "var(--color-violet-2)", padding: "3px 10px", borderRadius: "var(--radius-full)" }}>UNIT {U.no}</span>
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "var(--color-slate-12)" }}>{U.title_ko}</h1>
        <span style={{ fontSize: 12, color: "var(--color-slate-8)" }}>{U.title_en}</span>
      </header>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-slate-8)" }}>S{cur.no}</span>
        <span data-screen-label={"U" + U.no + " S" + cur.no} style={{ fontSize: 15, fontWeight: 600, color: "var(--color-slate-12)" }}>{cur.title}</span>
        {typeBadges}
      </div>

      {showGraph && window.WikiGraph ? (
        <window.WikiGraph.GraphView units={UNITS} current={{ unit, scene }}
          onSelect={(ui, si) => { setUnit(ui); setScene(si); setStep(0); setRunId((r) => r + 1); setShowGraph(false); setPlaying(false); }} />
      ) : (
      <React.Fragment>
      <ScenePlayer
        scenes={SCENES.map((s) => ({ label: chipLabel(s), steps: s.animation_steps.length }))}
        scene={scene} step={step} playing={playing}
        onSceneChange={(i) => { setScene(i); setStep(0); setRunId((r) => r + 1); }}
        onStepChange={(i) => { setStep(i); setRunId((r) => r + 1); }}
        onPlayToggle={togglePlay}
        caption={cur.animation_steps[Math.min(step, nSteps - 1)]}
        canvasHeight={"min(54vw, calc(100vh - 360px))"}>
        <svg viewBox="0 0 1600 900" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect x="0" y="0" width="1600" height="900" fill="var(--anim-bg-dark, #0F1110)" />
          {window.U01Shared.DarkGrid()}
          {canvas}
        </svg>
        {formulaOn && (
          <div style={{
            position: "absolute", bottom: 14, right: 18,
            background: "rgba(23,26,24,0.94)", border: "1px solid #3A403C", borderRadius: 12,
            padding: "8px 22px", zIndex: 5, maxWidth: "60%", overflowX: "auto",
          }}>
            <div ref={formulaRef} className="pl-katex" />
          </div>
        )}
        <FrameOverlay scene={cur} slot={slot} onClose={() => setSlot(null)} />
      </ScenePlayer>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <FrameBar size="sm" states={frameStates} onSelect={(i) => setSlot(slot === i ? null : i)} />
        <LinkChips scene={cur} onJumpScene={jumpScene} onJumpUnit={jumpUnitId} onToast={setToast} />
      </div>
      <BacklinkChips entries={BACKLINKS[cur.scene_id]} onJump={(ui, si) => { setUnit(ui); setScene(si); setStep(0); setRunId((r) => r + 1); }} />
      </React.Fragment>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-slate-7)" }}>
        Space 재생/정지 · ←/→ 스텝 · G 그래프 뷰 · Unit 칩으로 단원 전환 · LINKS 칩 = wiki 이동(단원 간 포함) · 5-Unit 칩 → 프레임 오버레이
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "var(--color-slate-12)", color: "var(--color-white)", fontSize: 12.5,
          padding: "9px 18px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-lg)", zIndex: 60,
        }}>{toast}</div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
