// Wiki Graph View — 102 scene 노드 + links 엣지 + backlink 인덱스
// window.WikiGraph = { GraphView, buildBacklinks }

// Topic 색상 — DS 토큰에서 읽기 (hex 하드코딩 금지 규칙)
const _gvTok = (v, fb) => (getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fb);
const TOPIC_HEX = {
  1: _gvTok("--color-violet-9", "#5333E1"),
  2: _gvTok("--color-teal-9", "#12A594"),
  3: _gvTok("--color-blue-10", "#0463AF"),
  4: _gvTok("--color-amber-11", "#DD9E08"),
  5: _gvTok("--color-red-10", "#D7292E"),
};

function parseTarget(t) {
  const m = (t || "").match(/^u(\d+)_s(\d+)$/);
  if (m) return { unitNo: m[1].padStart(2, "0"), sceneIdx: parseInt(m[2], 10) - 1 };
  if ((t || "").startsWith("_unit:")) return { unitId: t.slice(6) };
  return null;
}

// 정방향 links + prereqs → 역방향 인덱스
function buildBacklinks(UNITS) {
  const bl = {}; // key: scene_id 또는 "unit:unitXX"
  const add = (key, entry) => { (bl[key] = bl[key] || []).push(entry); };
  UNITS.forEach((u, ui) => {
    u.scenes.forEach((s, si) => {
      (s.links || []).forEach((l) => {
        const t = parseTarget(l.target);
        if (!t) return;
        const entry = { fromId: s.scene_id, fromTitle: s.title, unitIdx: ui, sceneIdx: si, unitNo: u.no, type: l.type };
        if (t.unitNo) {
          const tu = UNITS.find((x) => x.no === t.unitNo);
          if (tu && tu.scenes[t.sceneIdx]) add(tu.scenes[t.sceneIdx].scene_id, entry);
        } else if (t.unitId) add("unit:" + t.unitId, entry);
      });
      (s.prereqs || []).forEach((pq) => {
        const t = parseTarget(pq.target);
        if (t && t.unitId) add("unit:" + t.unitId, { fromId: s.scene_id, fromTitle: s.title, unitIdx: ui, sceneIdx: si, unitNo: u.no, type: "prereq" });
      });
    });
  });
  return bl;
}

function GraphView({ units, current, onSelect }) {
  const [hover, setHover] = React.useState(null);
  const geo = React.useMemo(() => {
    const cx = 800, cy = 442, rx = 545, ry = 300;
    const hubs = units.map((u, i) => {
      const a = (i / units.length) * Math.PI * 2 - Math.PI / 2;
      return { id: "hub-" + u.id, unitIdx: i, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), angle: a, unit: u };
    });
    const nodes = [], byId = {};
    hubs.forEach((h) => {
      const n = h.unit.scenes.length;
      const r = 46 + n * 4;
      h.unit.scenes.forEach((s, si) => {
        const a = h.angle + (si / n) * Math.PI * 2;
        const node = {
          id: s.scene_id, unitIdx: h.unitIdx, sceneIdx: si, topic: h.unit.topic,
          x: h.x + r * Math.cos(a), y: h.y + r * Math.sin(a),
          title: s.title, no: s.no, unitNo: h.unit.no,
        };
        nodes.push(node); byId[s.scene_id] = node;
      });
    });
    const edges = [];
    units.forEach((u) => {
      u.scenes.forEach((s) => {
        (s.links || []).forEach((l) => {
          const t = parseTarget(l.target);
          if (!t) return;
          if (t.unitNo) {
            const tu = units.find((x) => x.no === t.unitNo);
            const tn = tu && tu.scenes[t.sceneIdx] && byId[tu.scenes[t.sceneIdx].scene_id];
            if (tn && byId[s.scene_id]) edges.push({ a: byId[s.scene_id], b: tn, type: l.type === "next" || l.type === "prev" ? "next" : l.type });
          } else if (t.unitId) {
            const hub = hubs.find((h) => h.unit.id === t.unitId);
            if (hub && byId[s.scene_id]) edges.push({ a: byId[s.scene_id], b: hub, type: "unit" });
          }
        });
      });
    });
    return { hubs, nodes, edges };
  }, [units]);

  const curve = (a, b, pull = 0.22) => {
    const mx = (a.x + b.x) / 2 + (800 - (a.x + b.x) / 2) * pull;
    const my = (a.y + b.y) / 2 + (442 - (a.y + b.y) / 2) * pull;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  };
  const edgeStyle = {
    next: { stroke: "var(--color-slate-4)", w: 1, dash: "none", o: 0.5, pull: 0 },
    cross: { stroke: TOPIC_HEX[1], w: 1.4, dash: "none", o: 0.42, pull: 0.3 },
    related: { stroke: TOPIC_HEX[2], w: 1.3, dash: "5 4", o: 0.55, pull: 0.25 },
    unit: { stroke: TOPIC_HEX[1], w: 1.1, dash: "2 5", o: 0.3, pull: 0.3 },
  };
  const curId = current && units[current.unit] && units[current.unit].scenes[current.scene] && units[current.unit].scenes[current.scene].scene_id;

  return (
    <div style={{ position: "relative", background: "var(--color-white)", border: "1px solid var(--color-slate-4)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <svg viewBox="0 0 1600 900" style={{ display: "block", width: "100%", height: "auto" }}>
        {geo.edges.map((e, i) => {
          const st = edgeStyle[e.type] || edgeStyle.next;
          return <path key={i} d={curve(e.a, e.b, st.pull)} fill="none" stroke={st.stroke} strokeWidth={st.w} strokeDasharray={st.dash} opacity={st.o} />;
        })}
        {geo.hubs.map((h) => (
          <g key={h.id} style={{ cursor: "pointer" }} onClick={() => onSelect(h.unitIdx, 0)}>
            <circle cx={h.x} cy={h.y} r="17" fill="var(--color-white)" stroke={TOPIC_HEX[h.unit.topic]} strokeWidth="2.5" />
            <text x={h.x} y={h.y + 4.5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fontWeight="700" fill={TOPIC_HEX[h.unit.topic]}>{h.unit.no}</text>
          </g>
        ))}
        {geo.nodes.map((n) => (
          <g key={n.id} style={{ cursor: "pointer" }}
            onClick={() => onSelect(n.unitIdx, n.sceneIdx)}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)}>
            <circle cx={n.x} cy={n.y} r={n.id === curId ? 8.5 : 6} fill={TOPIC_HEX[n.topic]}
              opacity={hover && hover.id !== n.id ? 0.55 : 0.9} />
            {n.id === curId && <circle cx={n.x} cy={n.y} r="13" fill="none" stroke={TOPIC_HEX[n.topic]} strokeWidth="2" opacity="0.6" />}
          </g>
        ))}
      </svg>
      {hover && (
        <div style={{
          position: "absolute", left: `${(hover.x / 1600) * 100}%`, top: `${(hover.y / 900) * 100}%`,
          transform: "translate(-50%, calc(-100% - 12px))", pointerEvents: "none",
          background: "var(--color-slate-12)", color: "var(--color-white)", fontSize: 11.5,
          padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 10, boxShadow: "var(--shadow-lg)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", opacity: 0.7 }}>U{hover.unitNo}·S{hover.no}</span> {hover.title}
        </div>
      )}
      <div style={{ position: "absolute", left: 14, bottom: 12, display: "flex", gap: 14, fontSize: 10.5, color: "var(--color-slate-9)", fontFamily: "var(--font-sans)" }}>
        <span><span style={{ display: "inline-block", width: 18, borderTop: "2px solid " + TOPIC_HEX[1], verticalAlign: "middle", marginRight: 4 }}></span>cross</span>
        <span><span style={{ display: "inline-block", width: 18, borderTop: "2px dashed " + TOPIC_HEX[2], verticalAlign: "middle", marginRight: 4 }}></span>related</span>
        <span><span style={{ display: "inline-block", width: 18, borderTop: "1px solid var(--color-slate-6)", verticalAlign: "middle", marginRight: 4 }}></span>next</span>
        <span>노드 클릭 → 해당 scene 재생 · 허브(U번호) 클릭 → 단원 처음</span>
      </div>
    </div>
  );
}

window.WikiGraph = { GraphView, buildBacklinks };
