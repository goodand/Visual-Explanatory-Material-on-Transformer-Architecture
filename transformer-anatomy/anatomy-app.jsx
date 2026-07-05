// Transformer Anatomy v2 — React App with FLIP Zoom Animation
const { useState, useCallback, useRef, useEffect, useMemo } = React;

// ─── Color palette ───
// DS token-based palette (reads computed CSS vars at init)
const _cv = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const PAL = {
  teal:   { bg:_cv('--color-dark-teal-3'),  border:_cv('--color-teal-9'),  glow:'rgba(18,165,148,.3)',  text:_cv('--color-dark-teal-12') },
  amber:  { bg:_cv('--color-amber-12'),      border:_cv('--color-amber-8'), glow:'rgba(229,162,27,.25)', text:_cv('--color-amber-7') },
  violet: { bg:_cv('--color-dark-violet-3'),  border:_cv('--color-dark-violet-8'), glow:'rgba(124,92,252,.25)', text:_cv('--color-dark-violet-11') },
  slate:  { bg:_cv('--color-dark-sage-2'),    border:_cv('--color-dark-sage-5'), glow:'none', text:_cv('--color-dark-sage-10') },
  red:    { bg:'#2d0f0f',                     border:_cv('--color-red-9'),   glow:'rgba(229,72,77,.2)',  text:_cv('--color-red-7') },
};

// ─── Block ───
function Block({ b, onZoomClick, tweaks, mode }) {
  const c = PAL[b.color] || PAL.slate;
  const canZoom = !!b.zoom;
  const isPrim = !!b.prim;
  const [hover, setHover] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const isDimmed = mode === 'inference' && b.trainOnly;
  const primLevel = isPrim && window.ANATOMY.LEVELS[{P1:'L7',P2:'L9a',P3:'L9b'}[b.prim]];

  return React.createElement('div', {
    className: 'ab' + (canZoom ? ' zoom' : '') + (isDimmed ? ' dim' : '') + (b.stacked ? ' stacked' : '') + (isPrim ? ' prim-leaf' : ''),
    style: {
      background: c.bg, borderColor: c.border, color: c.text,
      cursor: canZoom ? 'pointer' : isPrim ? 'help' : 'default',
      boxShadow: (b.stacked
        ? `7px -7px 0 -1.5px var(--anim-bg-dark), 7px -7px 0 0 ${c.border}55, 14px -14px 0 -1.5px var(--anim-bg-dark), 14px -14px 0 0 ${c.border}2e, `
        : '') + (hover && canZoom
        ? `0 0 28px ${c.glow}, 0 0 0 1.5px ${c.border}`
        : '0 2px 8px rgba(0,0,0,.3)'),
      opacity: isDimmed ? 0.25 : 1,
    },
    onClick: (e) => {
      if (canZoom && !isDimmed) onZoomClick(b.zoom, e.currentTarget);
      else if (isPrim) setShowCard(s => !s);
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    'data-block-id': b.id,
  },
    React.createElement('div', { className:'ab-label' }, b.label),
    b.reuse && React.createElement('span', { className:'tag tag-reuse' }, b.reuse),
    b.postprocess && b.postprocess !== 'none' &&
      React.createElement('span', { className:'tag tag-pp' },
        b.postprocess === 'act' ? (tweaks?.activation||'GELU') : b.postprocess),
    b.trainOnly && React.createElement('span', { className:'tag tag-train' }, 'train only'),
    b.trainInf && React.createElement('span', { className:'tag tag-ti' },
      mode === 'training' ? 'logits → CE Loss' : 'softmax → token'),
    canZoom && React.createElement('span', { className:'ab-zoom' }, '▸'),
    isPrim && React.createElement('span', { className:'ab-prim-badge' }, b.prim),
    b.headCount && React.createElement('span', { className:'ab-h' }, '×h'),
    hover && b.desc && !showCard && React.createElement('div', { className:'tip' },
      React.createElement('span', { className:'tip-title' }, b.labelKo || b.label),
      React.createElement('br'), b.desc
    ),
    showCard && primLevel && React.createElement('div', { className:'prim-card' },
      React.createElement('div', { className:'prim-card-head' },
        React.createElement('span', { className:'prim-card-badge' }, b.prim),
        React.createElement('b', null, primLevel.titleKo || primLevel.title),
        React.createElement('button', { className:'prim-card-close', onClick:(e)=>{e.stopPropagation();setShowCard(false)} }, '✕')),
      React.createElement('p', { className:'prim-card-desc' }, primLevel.desc),
      primLevel.blocks && React.createElement('div', { className:'prim-card-flow' },
        primLevel.blocks.map((pb, i) => React.createElement('span', { key:i, className:'prim-card-step' }, pb.label))),
    ),
  );
}

// ─── Arrow ───
function Arrow({ label, shape, showShape }) {
  return React.createElement('div', { className:'ar' },
    React.createElement('div', { className:'ar-line' }),
    label && React.createElement('span', { className:'ar-label' }, label),
    showShape && shape && React.createElement('span', { className:'ar-shape' }, shape),
    React.createElement('div', { className:'ar-head' }),
  );
}

// ─── Back to animation scene (?from=uXX_sYY 딥링크 역방향) ───
function SceneBacklink() {
  const from = new URLSearchParams(window.location.search).get('from');
  const m = from && from.match(/^u(\d+)_s(\d+)$/);
  if (!m) return null;
  const [, u, s] = m;
  return React.createElement('a', {
    href: `../AI-ML%20Animation%20Player.html#u=${String(u).padStart(2,'0')}&s=${parseInt(s,10)}`,
    style: {
      display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px',
      borderRadius:999, fontSize:12, fontWeight:600, textDecoration:'none',
      fontFamily:'var(--font-sans)', border:'1px solid ' + _cv('--color-teal-9'),
      color:_cv('--color-dark-teal-12'), background:_cv('--color-dark-teal-3'),
      whiteSpace:'nowrap',
    },
  }, '◂ 애니메이션 U' + String(u).padStart(2,'0') + ' S' + String(s).padStart(2,'0'));
}

// ─── Breadcrumb ───
function Breadcrumb({ path, onNav }) {
  const levels = window.ANATOMY.LEVELS;
  return React.createElement('nav', { className:'bc' },
    path.map((id, i) => {
      const lv = levels[id]; const last = i === path.length - 1;
      return React.createElement(React.Fragment, { key: id },
        i > 0 && React.createElement('span', { className:'bc-sep' }, '›'),
        React.createElement('button', {
          className: 'bc-btn' + (last ? ' on' : ''),
          onClick: last ? undefined : () => onNav(id),
        }, lv ? (lv.z || lv.id.replace(/-.*/, '')) : id)
      );
    })
  );
}

// ─── Ref image ───
function RefPanel({ levelId }) {
  const raw = window.ANATOMY.REF_IMAGES[levelId] || window.ANATOMY.REF_IMAGES[levelId.replace(/-.*/, '')];
  if (!raw) return null;
  const srcs = Array.isArray(raw) ? raw : [raw];
  const [open, setOpen] = useState(false);
  return React.createElement('div', { className:'ref-panel' },
    React.createElement('button', { className:'ref-toggle', onClick:()=>setOpen(!open) },
      open ? '✕ 참조' : '📐 참조' + (srcs.length > 1 ? ' ×' + srcs.length : '')),
    open && React.createElement('div', { className:'ref-img-wrap' },
      srcs.map((src, i) => {
        const meta = (window.ANATOMY.REF_SOURCES || {})[src.split('/').pop()];
        return React.createElement('figure', { key:i, className:'ref-fig' },
          React.createElement('img', { src, className:'ref-img', alt:'ref '+(i+1) }),
          meta && React.createElement('figcaption', { className:'ref-src ref-src-'+meta.k }, meta.label));
      }))
  );
}

// ─── Graph layout (branching QKV diagrams) ───
function GraphLayout({ level, onZoomClick, tweaks, mode, contentRef }) {
  const wrapRef = useRef(null);
  const [edges, setEdges] = useState([]);
  const bp = (b) => ({ b, onZoomClick, tweaks, mode });
  const defs = {}; level.blocks.forEach(b => defs[b.id] = b);

  const measure = useCallback(() => {
    const w = wrapRef.current; if (!w) return;
    const wr = w.getBoundingClientRect();
    const es = [];
    (level.edges || []).forEach(([from, to, label, style]) => {
      const fe = w.querySelector('[data-block-id="' + from + '"]');
      const te = w.querySelector('[data-block-id="' + to + '"]');
      if (!fe || !te) return;
      const fr = fe.getBoundingClientRect(), tr = te.getBoundingClientRect();
      const x1 = fr.left - wr.left + fr.width / 2, y1 = fr.top - wr.top - 3;
      const x2 = tr.left - wr.left + tr.width / 2, y2 = tr.top - wr.top + tr.height + 3;
      let d, lx, ly;
      if (style === 'elbow') {
        const midY = y2;
        const dir = x2 > x1 ? -1 : 1;
        d = 'M ' + x1 + ' ' + y1 + ' L ' + x1 + ' ' + (midY - 10)
          + ' Q ' + x1 + ' ' + midY + ' ' + (x1 - dir * 10) + ' ' + midY
          + ' L ' + x2 + ' ' + midY;
        lx = x1 + 14; ly = (y1 + midY) / 2;
      } else {
        d = 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + (y1 - 22) + ', '
          + x2 + ' ' + (y2 + 22) + ', ' + x2 + ' ' + y2;
        lx = (x1 + x2) / 2 + 8; ly = (y1 + y2) / 2;
      }
      es.push({ d, label, lx, ly });
    });
    setEdges(es);
  }, [level]);

  useEffect(() => {
    const t1 = setTimeout(measure, 120);
    const t2 = setTimeout(measure, 600);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure); };
  }, [measure, tweaks, mode]);

  return React.createElement('div', {
    className:'lay-graph',
    ref: (el) => { wrapRef.current = el; if (contentRef) contentRef.current = el; },
  },
    React.createElement('svg', { className:'g-svg' },
      React.createElement('defs', null,
        React.createElement('marker', { id:'gxarrow', markerWidth:7, markerHeight:7,
          refX:6, refY:3.5, orient:'auto' },
          React.createElement('path', { d:'M0,0 L7,3.5 L0,7 Z', fill:_cv('--color-dark-sage-8') }))),
      edges.map((e, i) => React.createElement('path', {
        key:'p'+i, d:e.d, className:'g-path', markerEnd:'url(#gxarrow)' })),
      edges.map((e, i) => e.label && React.createElement('text', {
        key:'t'+i, x:e.lx, y:e.ly, className:'g-lbl' }, e.label))),
    level.rows.map((row, ri) =>
      React.createElement('div', { key:ri, className:'g-row' },
        row.map(id => React.createElement(Block, { key:id, ...bp(defs[id]) }))))
  );
}

// ─── L1 unified stack layout (Encoder ×N ‖ Decoder ×N + Memory fan-out) ───
function L1Layout({ level, onZoomClick, tweaks, mode, contentRef }) {
  const wrapRef = useRef(null);
  const [paths, setPaths] = useState([]);
  const showShape = tweaks?.showShapes !== false;
  const bp = (b) => ({ b, onZoomClick, tweaks, mode });

  const measure = useCallback(() => {
    const w = wrapRef.current; if (!w) return;
    const wr = w.getBoundingClientRect();
    const encTop = w.querySelector('[data-block-id="e-layer-' + level.enc.layers + '"]');
    if (!encTop) return;
    const et = encTop.getBoundingClientRect();
    const ps = [];
    for (let i = 1; i <= level.dec.layers; i++) {
      const d = w.querySelector('[data-block-id="d-layer-' + i + '"]');
      if (!d) continue;
      const dr = d.getBoundingClientRect();
      const x1 = et.left - wr.left + et.width / 2;
      const y1 = et.top - wr.top - 4;
      const x2 = dr.left - wr.left - 7;
      const y2 = dr.top - wr.top + dr.height / 2;
      ps.push('M ' + x1 + ' ' + y1 +
        ' C ' + x1 + ' ' + (y1 - 44) + ', ' + (x2 - 70) + ' ' + y2 + ', ' + x2 + ' ' + y2);
    }
    setPaths(ps);
  }, [level]);

  useEffect(() => {
    const t1 = setTimeout(measure, 120);
    const t2 = setTimeout(measure, 600);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure); };
  }, [measure, tweaks, mode]);

  const col = (side, prefix) => {
    const kids = [];
    kids.push(React.createElement('div', { key:'cap', className:'l1-cap' }, side.caption));
    side.pipeline.forEach((b, i) => {
      kids.push(React.createElement(Arrow, { key:'pa'+i, showShape: i===0 && showShape, shape: i===0 ? window.S.emb : undefined }));
      kids.push(React.createElement(Block, { key:b.id, ...bp(b) }));
    });
    for (let i = 1; i <= side.layers; i++) {
      kids.push(React.createElement(Arrow, { key:'la'+i }));
      kids.push(React.createElement(Block, { key:prefix+i,
        ...bp({ ...side.layerBlock, id: prefix + i,
          reuse: i === side.layers ? '×N repeated' : undefined }) }));
    }
    (side.head || []).forEach((b, i) => {
      kids.push(React.createElement(Arrow, { key:'ha'+i, showShape: showShape && i===0, shape: i===0 ? window.S.logits : undefined }));
      kids.push(React.createElement(Block, { key:b.id, ...bp(b) }));
    });
    if (side.capTop) kids.push(React.createElement('div', { key:'capt', className:'l1-cap' }, side.capTop));
    return React.createElement('div', { className:'l1-col' }, kids);
  };

  return React.createElement('div', {
    className:'lay-l1',
    ref: (el) => { wrapRef.current = el; if (contentRef) contentRef.current = el; },
  },
    React.createElement('svg', { className:'l1-svg' },
      React.createElement('defs', null,
        React.createElement('marker', { id:'l1arrow', markerWidth:7, markerHeight:7,
          refX:6, refY:3.5, orient:'auto' },
          React.createElement('path', { d:'M0,0 L7,3.5 L0,7 Z', fill:_cv('--color-teal-9') }))),
      paths.map((d, i) => React.createElement('path', {
        key:i, d, className:'l1-path', markerEnd:'url(#l1arrow)' }))),
    React.createElement('div', { className:'l1-mem' }, 'Encoder Memory (K, V) → 모든 Decoder layer'),
    col(level.enc, 'e-layer-'),
    col(level.dec, 'd-layer-'),
  );
}

// ─── Level View ───
function LevelView({ levelId, onZoomClick, tweaks, mode, contentRef }) {
  const level = window.ANATOMY.LEVELS[levelId];
  if (!level) return React.createElement('div', { className:'empty' }, 'Level: '+levelId);
  const blocks = level.blocks;
  const arrows = level.arrows || [];
  const showShape = tweaks?.showShapes !== false;
  const bp = (b) => ({ b, onZoomClick, tweaks, mode });

  // L1 unified stack
  if (level.layout === 'l1') {
    return React.createElement(L1Layout, { level, onZoomClick, tweaks, mode, contentRef });
  }
  // Branching graph (L3 QKV)
  if (level.layout === 'graph') {
    return React.createElement(GraphLayout, { level, onZoomClick, tweaks, mode, contentRef });
  }

  // L0 two-column
  if (levelId === 'L0') {
    const bm = {}; blocks.forEach(b => bm[b.id] = b);
    return React.createElement('div', { className:'lay-l0', ref: contentRef },
      React.createElement('div', { className:'l0-col' },
        React.createElement('div', { className:'l0-side-label' }, 'ENCODER'),
        React.createElement(Block, bp(bm.inp)),
        React.createElement(Arrow, { shape:window.S.emb, showShape }),
        React.createElement(Block, bp(bm.enc)),
      ),
      React.createElement('div', { className:'l0-bridge' },
        React.createElement('div', { className:'l0-bridge-line' }),
        React.createElement('div', { className:'l0-bridge-label' }, 'Memory (K, V)'),
        showShape && React.createElement('div', { className:'ar-shape bridge-shape' }, '(B, S_src, d_model)'),
      ),
      React.createElement('div', { className:'l0-col' },
        React.createElement('div', { className:'l0-side-label' }, 'DECODER'),
        React.createElement(Block, bp(bm.tgt)),
        React.createElement(Arrow, { shape:window.S.emb, showShape }),
        React.createElement(Block, bp(bm.dec)),
        React.createElement(Arrow, { shape:window.S.prob, showShape }),
        React.createElement(Block, bp(bm.out)),
      ),
    );
  }

  // L4 MHA
  if (level.layout === 'mha') {
    const bm = {}; blocks.forEach(b => bm[b.id] = b);
    return React.createElement('div', { className:'lay-v', ref: contentRef },
      React.createElement('div', { className:'mha-row' },
        ['lq','lk','lv'].map(id => React.createElement(Block, { key:id, ...bp(bm[id]) }))),
      React.createElement(Arrow, { showShape, shape:'(B,S,d) each' }),
      React.createElement(Block, bp(bm.split)),
      React.createElement(Arrow, { showShape, shape:window.S.head }),
      React.createElement(Block, bp(bm.sdpa)),
      React.createElement(Arrow, { showShape, shape:window.S.attn }),
      React.createElement(Block, bp(bm.concat)),
      React.createElement(Arrow, { showShape, shape:window.S.emb }),
      React.createElement(Block, bp(bm.wo)),
    );
  }

  // Grouped layout with residual skip paths (L2 levels) — variant by normOrder
  if (level.groups) {
    const defs = {}; blocks.forEach(b => defs[b.id] = b);
    const variant = tweaks?.normOrder === 'Pre-LN' ? 'Pre-LN' : 'Post-LN';
    const groups = level.groups[variant] || level.groups['Post-LN'];
    const kids = [];
    groups.forEach((g, gi) => {
      if (gi > 0) kids.push(React.createElement(Arrow, { key:'ga'+gi, shape:window.S.emb, showShape }));
      const inner = [];
      g.ids.forEach((id, bi) => {
        if (bi > 0) inner.push(React.createElement(Arrow, { key:'a'+id }));
        inner.push(React.createElement(Block, { key:id, ...bp(defs[id]) }));
      });
      kids.push(React.createElement('div', { key:'g'+gi, className:'res-group' },
        g.skip !== false && React.createElement('div', { className:'skip' },
          React.createElement('span', { className:'skip-label' }, g.skipLabel || 'x')),
        inner
      ));
    });
    if (variant === 'Pre-LN' && level.preNote) {
      kids.push(React.createElement('div', { key:'note', className:'variant-note' }, '⚠ ' + level.preNote));
    }
    return React.createElement('div', { className:'lay-v', ref: contentRef }, kids);
  }

  // Variant block-list levels (AddNorm)
  let orderedBlocks = blocks;
  if (level.variants) {
    const defs = {}; blocks.forEach(b => defs[b.id] = b);
    const variant = tweaks?.normOrder === 'Pre-LN' ? 'Pre-LN' : 'Post-LN';
    orderedBlocks = (level.variants[variant] || level.variants['Post-LN']).map(id => defs[id]);
  }

  // Default vertical
  const connMap = {};
  arrows.forEach(a => { connMap[a.from+'→'+a.to] = a; });
  return React.createElement('div', { className:'lay-v', ref: contentRef },
    orderedBlocks.map((b, i) => {
      const prev = i > 0 ? orderedBlocks[i-1].id : null;
      const conn = prev ? connMap[prev+'→'+b.id] : null;
      return React.createElement(React.Fragment, { key: b.id },
        conn && React.createElement(Arrow, { label:conn.label, shape:conn.shape, showShape }),
        i > 0 && !conn && React.createElement(Arrow, {}),
        React.createElement(Block, bp(b)));
    })
  );
}

// ═══════════════════════════════════════════
// FLIP Zoom Animation Manager
// ═══════════════════════════════════════════
function useFlipZoom() {
  // URL parameter support: ?level=L3-self navigates directly
  const getInitialPath = () => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('level');
    if (!target) return ['L0'];
    const levels = window.ANATOMY.LEVELS;
    if (!levels[target]) return ['L0'];
    // Build path from L0 to target via parent chain
    const chain = [];
    let cur = target;
    while (cur && levels[cur]) {
      chain.unshift(cur);
      cur = levels[cur].parent;
    }
    if (chain[0] !== 'L0') chain.unshift('L0');
    return chain;
  };

  const [state, setState] = useState({
    path: getInitialPath(),
    phase: 'idle',
    originRect: null,
    originColor: null,
  });
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);

  const currentLevel = state.path[state.path.length - 1];

  const onZoomClick = useCallback((targetId, blockEl) => {
    if (state.phase !== 'idle') return;
    const canvas = canvasRef.current;
    if (!canvas || !blockEl) return;

    const canvasRect = canvas.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();
    const c = PAL[blockEl.style.borderColor ? 'violet' : 'violet'];
    const borderColor = blockEl.style.borderColor || _cv('--color-dark-violet-8');

    // Relative position within canvas
    const rel = {
      x: blockRect.left - canvasRect.left,
      y: blockRect.top - canvasRect.top,
      w: blockRect.width, h: blockRect.height,
      cw: canvasRect.width, ch: canvasRect.height,
    };

    // Phase A: highlight clicked block
    setState(s => ({ ...s, phase:'phaseA', originRect:rel, originColor:borderColor }));

    // Phase B: expand overlay
    setTimeout(() => {
      setState(s => ({ ...s, phase:'phaseB' }));
    }, 150);

    // Phase C: swap content + fade in
    setTimeout(() => {
      setState(s => ({
        ...s,
        path: [...s.path, targetId],
        phase:'phaseC',
      }));
    }, 450);

    // Done
    setTimeout(() => {
      setState(s => ({ ...s, phase:'idle', originRect:null }));
    }, 700);
  }, [state.phase]);

  const onNav = useCallback((id) => {
    setState(s => {
      const idx = s.path.indexOf(id);
      if (idx < 0) return s;
      return { ...s, phase:'zoomOut', path: s.path };
    });
    setTimeout(() => {
      setState(s => {
        const idx = s.path.indexOf(id);
        return { ...s, path: s.path.slice(0, idx + 1), phase:'idle' };
      });
    }, 350);
  }, []);

  const onBack = useCallback(() => {
    if (state.path.length <= 1) return;
    onNav(state.path[state.path.length - 2]);
  }, [state.path, onNav]);

  return { state, canvasRef, contentRef, overlayRef, onZoomClick, onNav, onBack, currentLevel };
}

// ═══════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════
function App() {
  const DEFAULTS = {
    normOrder:'Post-LN', activation:'GELU', weightTying:false,
    showShapes:true, mode:'training'
  };
  const [t, setTweak] = useTweaks(DEFAULTS);
  const { state, canvasRef, contentRef, overlayRef, onZoomClick, onNav, onBack, currentLevel } = useFlipZoom();

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { e.preventDefault(); onBack(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onBack]);

  const level = window.ANATOMY.LEVELS[currentLevel];
  const { phase, originRect, originColor } = state;

  // Build zoom overlay for FLIP phases
  let overlay = null;
  if (originRect && (phase === 'phaseA' || phase === 'phaseB')) {
    const r = originRect;
    if (phase === 'phaseA') {
      // Highlight box at block position
      overlay = React.createElement('div', {
        ref: overlayRef, className:'zoom-overlay phase-a',
        style: {
          left: r.x, top: r.y, width: r.w, height: r.h,
          borderColor: originColor,
          boxShadow: `0 0 40px ${originColor}44, 0 0 80px ${originColor}22`,
        }
      });
    } else {
      // Expand to fill canvas
      overlay = React.createElement('div', {
        ref: overlayRef, className:'zoom-overlay phase-b',
        style: {
          left: 0, top: 0, width: '100%', height: '100%',
          borderColor: originColor,
          background: 'var(--bg)',
          '--ox': (r.x + r.w/2) + 'px',
          '--oy': (r.y + r.h/2) + 'px',
        }
      });
    }
  }

  const canvasClass = 'canvas'
    + (phase === 'phaseC' ? ' fade-in-content' : '')
    + (phase === 'zoomOut' ? ' zoom-out-anim' : '')
    + (phase === 'phaseA' ? ' dimming' : '');

  return React.createElement('div', { className:'root' },
    React.createElement('header', { className:'hdr' },
      React.createElement('h1', null, 'Transformer Anatomy'),
      React.createElement('p', null, 'Interactive semantic zoom · 블록 클릭 = drill-down · Esc = zoom-out · Z = zoom 깊이, P = 재사용 primitive'),
    ),
    React.createElement('div', { className:'toolbar' },
      React.createElement(Breadcrumb, { path: state.path, onNav }),
      React.createElement(SceneBacklink, null),
      React.createElement(RefPanel, { levelId: currentLevel }),
    ),
    level && React.createElement('div', { className:'level-bar' },
      React.createElement('span', { className:'lv-badge' + (level.z && level.z[0] === 'P' ? ' p' : '') },
        level.z || currentLevel.replace(/-.*/, '')),
      React.createElement('span', { className:'lv-title' }, level.titleKo || level.title),
      React.createElement('span', { className:'lv-desc' }, level.desc),
      level.taxonomy && React.createElement('span', { className:'tax' },
        [['Scope', level.taxonomy.scope], ['Head', level.taxonomy.head], ['Kernel', level.taxonomy.kernel]].map(([k, v]) =>
          React.createElement('span', { key:k, className:'tax-chip' },
            React.createElement('b', null, k), v))),
    ),
    React.createElement('div', { className: canvasClass, ref: canvasRef },
      React.createElement(LevelView, {
        levelId: currentLevel, onZoomClick, tweaks: t, mode: t.mode, contentRef }),
      overlay,
    ),
    state.path.length > 1 && React.createElement('button', {
      className:'back', onClick: onBack }, '← Zoom Out'),
    React.createElement(TweaksPanel, null,
      React.createElement(TweakSection, { label:'Architecture' }),
      React.createElement(TweakRadio, { label:'Norm', value:t.normOrder,
        options:['Post-LN','Pre-LN'], onChange:v=>setTweak('normOrder',v) }),
      React.createElement(TweakRadio, { label:'Activation', value:t.activation,
        options:['ReLU','GELU','SwiGLU'], onChange:v=>setTweak('activation',v) }),
      React.createElement(TweakToggle, { label:'Weight Tying', value:t.weightTying,
        onChange:v=>setTweak('weightTying',v) }),
      React.createElement(TweakSection, { label:'Display' }),
      React.createElement(TweakToggle, { label:'Tensor Shapes', value:t.showShapes,
        onChange:v=>setTweak('showShapes',v) }),
      React.createElement(TweakRadio, { label:'Mode', value:t.mode,
        options:['training','inference'], onChange:v=>setTweak('mode',v) }),
    ),
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
