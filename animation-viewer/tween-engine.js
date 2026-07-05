// Tween Engine — strategy/motion_runtime.md 참조 구현
// DS animation 토큰을 읽어 JS 타이머 트윈으로 구동 (CSS transition은 캡처에서 얼어붙음)
(function () {
  const css = () => getComputedStyle(document.documentElement);
  const tokenMs = (name) => parseFloat(css().getPropertyValue(name)) || 0;

  // cubic-bezier(x1,y1,x2,y2) solver — Newton–Raphson
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t) => ((ay * t + by) * t + cy) * t;
    const solveX = (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const dx = sampleX(t) - x;
        const d = (3 * ax * t + 2 * bx) * t + cx;
        if (Math.abs(dx) < 1e-5 || d === 0) break;
        t -= dx / d;
      }
      return t;
    };
    return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)));
  }

  const tokenEase = (name) => {
    const m = css().getPropertyValue(name).match(/-?[\d.]+/g);
    return m && m.length === 4 ? cubicBezier(...m.map(Number)) : (t) => t;
  };

  // Timer tween — rAF 라이브 구동 (capture 시 clock 주입 가능)
  function tween({ duration, ease, onUpdate, onDone, clock = null }) {
    duration = duration ?? tokenMs("--duration-normal");
    ease = ease ?? tokenEase("--ease-default");
    let start = null, raf = null, dead = false;
    const step = (now) => {
      if (dead) return;
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / duration);
      onUpdate(ease(p), p);
      if (p < 1) { if (!clock) raf = requestAnimationFrame(step); }
      else if (onDone) onDone();
    };
    if (clock) return { advance: (t) => step(t), cancel: () => { dead = true; } };
    raf = requestAnimationFrame(step);
    return { cancel: () => { dead = true; cancelAnimationFrame(raf); } };
  }

  window.TweenEngine = { tween, tokenMs, tokenEase, cubicBezier };
})();
