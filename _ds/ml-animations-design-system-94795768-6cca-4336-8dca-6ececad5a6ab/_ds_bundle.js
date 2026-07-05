/* @ds-bundle: {"format":3,"namespace":"MLAnimationsDesignSystem_947957","components":[{"name":"FrameBar","sourcePath":"components/animation/FrameBar.jsx"},{"name":"ScenePlayer","sourcePath":"components/animation/ScenePlayer.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Heading","sourcePath":"components/core/Heading.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Text","sourcePath":"components/core/Text.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"Stack","sourcePath":"components/layout/Stack.jsx"}],"sourceHashes":{"components/animation/FrameBar.jsx":"97d6b2989193","components/animation/ScenePlayer.jsx":"b711c9268cfb","components/core/Badge.jsx":"ded074fd124c","components/core/Button.jsx":"2540003bbcf6","components/core/Card.jsx":"1dfaf058f174","components/core/Heading.jsx":"48f86c4c80be","components/core/Tag.jsx":"921117483e69","components/core/Text.jsx":"e32a00bc20e8","components/forms/Checkbox.jsx":"9ced84de9304","components/forms/Select.jsx":"702c49a96893","components/forms/TextInput.jsx":"8355681e3adf","components/layout/Stack.jsx":"c5b4faca478c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MLAnimationsDesignSystem_947957 = window.MLAnimationsDesignSystem_947957 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/animation/FrameBar.jsx
try { (() => {
// FrameBar — 5칸 Representation 프레임바 (하단 상태바)
// DOM 계약: 루트 [data-frame-bar],
//           슬롯 [data-repr-slot="1..5"][data-disclosure="open|collapsed|hidden|not_in_scene"]
// 인코딩은 전부 무채색 — open 칩에 topic 틴트 금지 (색은 Topic Mode 전용, token ownership).
function FrameBar({
  slots,
  states,
  onSelect,
  size,
  className,
  ...rest
}) {
  const labels = slots || ["데이터", "표현", "계산 대상", "개념 분류", "중요성"];
  const st = states || labels.map(() => "collapsed");
  const s = size === "sm" ? "sm" : "md";
  const dim = s === "sm" ? {
    font: 11,
    mono: 9,
    pad: "4px 10px",
    dot: 6,
    gap: 4
  } : {
    font: 12.5,
    mono: 10,
    pad: "6px 14px",
    dot: 7,
    gap: 6
  };

  // Disclosure 상태 인코딩 — modes.css의 --disclosure-* 토큰만 사용
  const chipStyles = {
    open: {
      background: "var(--color-white)",
      border: "1.5px solid var(--color-slate-12)",
      color: "var(--color-slate-12)",
      fontWeight: 600
    },
    collapsed: {
      background: "var(--disclosure-collapsed-bg)",
      border: "1.5px solid transparent",
      color: "var(--disclosure-collapsed-label-color)",
      fontWeight: 500
    }
  };
  const clickable = typeof onSelect === "function";
  const items = labels.map((label, i) => {
    const state = ["open", "collapsed", "hidden", "not_in_scene"].includes(st[i]) ? st[i] : "collapsed";
    const commonProps = {
      key: i,
      "data-repr-slot": i + 1,
      "data-disclosure": state,
      title: label + " — " + state,
      "aria-label": label + " — " + state,
      onClick: clickable ? () => onSelect(i) : undefined,
      type: clickable ? "button" : undefined
    };

    // hidden = 작은 채움 점 / not_in_scene = 점선 링 점
    if (state === "hidden" || state === "not_in_scene") {
      return React.createElement(clickable ? "button" : "span", {
        ...commonProps,
        style: {
          width: dim.dot,
          height: dim.dot,
          padding: 0,
          borderRadius: "50%",
          background: state === "hidden" ? "var(--color-slate-5)" : "transparent",
          border: state === "hidden" ? "none" : "1px dotted var(--color-slate-6)",
          cursor: clickable ? "pointer" : "default",
          flex: "none"
        }
      });
    }
    return React.createElement(clickable ? "button" : "span", {
      ...commonProps,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: dim.pad,
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-sans)",
        fontSize: dim.font,
        lineHeight: 1,
        cursor: clickable ? "pointer" : "default",
        transition: "var(--transition-color)",
        ...chipStyles[state]
      }
    }, React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: dim.mono,
        opacity: 0.55,
        fontWeight: 500
      }
    }, String(i + 1)), label);
  });
  return React.createElement("div", {
    className,
    "data-frame-bar": "",
    role: "toolbar",
    "aria-label": "Representation frame bar",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: dim.gap
    },
    ...rest
  }, items);
}
Object.assign(__ds_scope, { FrameBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/animation/FrameBar.jsx", error: String((e && e.message) || e) }); }

// components/animation/ScenePlayer.jsx
try { (() => {
// ScenePlayer — 씬 플레이어 셸: 캔버스 슬롯 + 캡션 슬롯 + 씬 칩 + 스텝 도트 + 재생 컨트롤.
// 타임라인 엔진이 아니다 — 시간은 소비자가 JS 타이머 트윈으로 구동하고
// (strategy/motion_runtime.md), 셸은 상태만 반영한다.
// DOM 계약: 루트 [data-scene-player][data-scene][data-step][data-playing],
//           캔버스 [data-scene-canvas], 캡션 [data-scene-caption],
//           씬 칩 [data-scene-chip="i"], 스텝 도트 [data-step-dot="i"]
function ScenePlayer({
  scenes,
  scene,
  step,
  playing,
  onSceneChange,
  onStepChange,
  onPlayToggle,
  caption,
  canvasHeight,
  children,
  className,
  ...rest
}) {
  const list = scenes || [];
  const si = Math.max(0, Math.min(scene || 0, Math.max(0, list.length - 1)));
  const cur = list[si] || {};
  const steps = Math.max(0, cur.steps || 0);
  const stepI = Math.max(0, Math.min(step || 0, Math.max(0, steps - 1)));
  const icon = kind => {
    const p = {
      width: 12,
      height: 12,
      viewBox: "0 0 12 12",
      fill: "currentColor",
      "aria-hidden": true
    };
    if (kind === "pause") return React.createElement("svg", p, React.createElement("rect", {
      x: 2.2,
      y: 1.5,
      width: 2.8,
      height: 9
    }), React.createElement("rect", {
      x: 7,
      y: 1.5,
      width: 2.8,
      height: 9
    }));
    if (kind === "prev") return React.createElement("svg", p, React.createElement("rect", {
      x: 2,
      y: 1.5,
      width: 1.6,
      height: 9
    }), React.createElement("polygon", {
      points: "10,1.5 4.5,6 10,10.5"
    }));
    if (kind === "next") return React.createElement("svg", p, React.createElement("polygon", {
      points: "2,1.5 7.5,6 2,10.5"
    }), React.createElement("rect", {
      x: 8.4,
      y: 1.5,
      width: 1.6,
      height: 9
    }));
    return React.createElement("svg", p, React.createElement("polygon", {
      points: "3,1.5 10.5,6 3,10.5"
    }));
  };
  const ctrlBtn = (props, child) => React.createElement("button", {
    type: "button",
    ...props,
    style: {
      width: 28,
      height: 28,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--color-slate-5)",
      background: "var(--color-white)",
      color: "var(--color-slate-11)",
      cursor: "pointer",
      padding: 0,
      flex: "none",
      ...props.style
    }
  }, child);
  const transport = React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flex: "none"
    }
  }, ctrlBtn({
    key: "prev",
    "aria-label": "이전 스텝",
    onClick: onStepChange ? () => onStepChange(Math.max(0, stepI - 1)) : undefined
  }, icon("prev")), ctrlBtn({
    key: "play",
    "aria-label": playing ? "일시정지" : "재생",
    onClick: onPlayToggle,
    style: {
      background: "var(--color-slate-12)",
      color: "var(--color-white)",
      border: "1px solid var(--color-slate-12)"
    }
  }, icon(playing ? "pause" : "play")), ctrlBtn({
    key: "next",
    "aria-label": "다음 스텝",
    onClick: onStepChange ? () => onStepChange(Math.min(Math.max(0, steps - 1), stepI + 1)) : undefined
  }, icon("next")));

  // 씬 칩 — 활성은 무채색 solid. 씬 선택은 구조 채널이므로 topic 색 금지 (token ownership).
  const chips = React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flex: 1,
      flexWrap: "wrap",
      minWidth: 0
    }
  }, list.map((sc, i) => React.createElement("button", {
    key: i,
    type: "button",
    "data-scene-chip": i,
    onClick: onSceneChange ? () => onSceneChange(i) : undefined,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "5px 10px",
      border: "none",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-sans)",
      fontSize: 11,
      lineHeight: 1,
      fontWeight: i === si ? 600 : 400,
      background: i === si ? "var(--color-slate-12)" : "var(--color-slate-1)",
      color: i === si ? "var(--color-white)" : "var(--color-slate-9)",
      cursor: onSceneChange ? "pointer" : "default",
      transition: "var(--transition-color)"
    }
  }, React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      opacity: 0.6
    }
  }, String(i + 1).padStart(2, "0")), sc.label || "Scene " + (i + 1))));
  const dots = steps > 0 ? React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center",
      flex: "none"
    },
    "aria-label": "스텝"
  }, Array.from({
    length: steps
  }, (_, i) => React.createElement("button", {
    key: i,
    type: "button",
    "data-step-dot": i,
    "aria-label": "스텝 " + (i + 1),
    onClick: onStepChange ? () => onStepChange(i) : undefined,
    style: {
      width: 7,
      height: 7,
      padding: 0,
      borderRadius: "50%",
      border: "none",
      background: i === stepI ? "var(--color-slate-12)" : i < stepI ? "var(--color-slate-7)" : "var(--color-slate-4)",
      cursor: onStepChange ? "pointer" : "default",
      transition: "var(--transition-color)"
    }
  }))) : null;
  return React.createElement("div", {
    className,
    "data-scene-player": "",
    "data-scene": cur.id != null ? cur.id : si,
    "data-step": stepI,
    "data-playing": playing ? "true" : "false",
    style: {
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--color-slate-5)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--color-white)",
      fontFamily: "var(--font-sans)"
    },
    ...rest
  }, React.createElement("div", {
    "data-scene-canvas": "",
    style: {
      position: "relative",
      background: "var(--anim-bg-dark)",
      minHeight: canvasHeight || 220,
      overflow: "hidden"
    }
  }, children), React.createElement("div", {
    "data-scene-caption": "",
    style: {
      minHeight: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 16px",
      textAlign: "center",
      fontSize: 13,
      color: "var(--color-slate-11)",
      background: "var(--color-slate-1)",
      borderTop: "1px solid var(--color-slate-3)"
    }
  }, caption), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 10px",
      borderTop: "1px solid var(--color-slate-3)"
    }
  }, transport, chips, dots));
}
Object.assign(__ds_scope, { ScenePlayer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/animation/ScenePlayer.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone,
  size,
  className,
  ...rest
}) {
  const t = tone || "neutral";
  const s = size || "md";
  const toneStyles = {
    neutral: {
      bg: "var(--color-slate-2)",
      color: "var(--color-slate-11)"
    },
    brand: {
      bg: "var(--color-violet-3)",
      color: "var(--color-violet-11)"
    },
    danger: {
      bg: "var(--color-red-3)",
      color: "var(--color-red-11)"
    },
    success: {
      bg: "var(--color-green-3)",
      color: "var(--color-green-11)"
    },
    warning: {
      bg: "var(--color-amber-3)",
      color: "var(--color-amber-11)"
    },
    info: {
      bg: "var(--color-blue-3)",
      color: "var(--color-blue-11)"
    }
  };

  // topic-1..5 — bg는 도메인 프로필이 주입한 --topic-N-bg, 글자색은 --topic-N-color를
  // color-mix로 어둡게 파생시켜 소형 텍스트 대비 확보 — token ownership.
  const topicMatch = /^topic-([1-5])$/.exec(t);
  const ts = topicMatch ? {
    bg: `var(--topic-${topicMatch[1]}-bg)`,
    color: `color-mix(in oklab, var(--topic-${topicMatch[1]}-color) 75%, var(--color-slate-12))`
  } : toneStyles[t] || toneStyles.neutral;
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--font-weight-semibold)",
    borderRadius: "var(--radius-full)",
    background: ts.bg,
    color: ts.color,
    lineHeight: 1,
    ...(s === "sm" ? {
      fontSize: "10px",
      padding: "2px 6px",
      minWidth: "16px",
      height: "16px"
    } : {
      fontSize: "var(--font-size-xs)",
      padding: "2px 8px",
      minWidth: "20px",
      height: "20px"
    })
  };
  return React.createElement("span", {
    className,
    style,
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  children,
  disabled,
  fullWidth,
  loading,
  size,
  tone,
  type,
  variant,
  onClick,
  className,
  ...rest
}) {
  const s = size || "md";
  const t = tone || "brand";
  const v = variant || "solid";
  const btnType = type || "button";
  const sizeStyles = {
    sm: {
      padding: "8px 12px",
      fontSize: "var(--font-size-sm)",
      lineHeight: "1rem"
    },
    md: {
      padding: "10px 12px",
      fontSize: "var(--font-size-md)",
      lineHeight: "1.25rem"
    },
    lg: {
      padding: "12px 20px",
      fontSize: "var(--font-size-lg)",
      lineHeight: "1.5rem"
    }
  };
  const toneMap = {
    brand: {
      solid: {
        bg: "var(--bg-solid-brand)",
        color: "var(--fg-solid-brand)",
        hoverBg: "var(--bg-solid-brand-hover)",
        activeBg: "var(--bg-solid-brand-active)"
      },
      outline: {
        bg: "transparent",
        color: "var(--fg-brand)",
        border: "var(--border-width-sm) solid var(--border-brand)",
        hoverBg: "var(--bg-brand-hover)",
        activeBg: "var(--bg-brand-active)"
      },
      ghost: {
        bg: "transparent",
        color: "var(--fg-brand)",
        hoverBg: "var(--bg-brand-hover)",
        activeBg: "var(--bg-brand-active)"
      }
    },
    neutral: {
      solid: {
        bg: "var(--bg-solid-neutral)",
        color: "var(--fg-solid-neutral)",
        hoverBg: "var(--bg-solid-neutral-hover)",
        activeBg: "var(--bg-solid-neutral-active)"
      },
      outline: {
        bg: "transparent",
        color: "var(--fg-neutral)",
        border: "var(--border-width-sm) solid var(--border-neutral)",
        hoverBg: "var(--bg-neutral-hover)",
        activeBg: "var(--bg-neutral-active)"
      },
      ghost: {
        bg: "transparent",
        color: "var(--fg-neutral)",
        hoverBg: "var(--bg-neutral-hover)",
        activeBg: "var(--bg-neutral-active)"
      }
    },
    danger: {
      solid: {
        bg: "var(--bg-solid-danger)",
        color: "var(--fg-solid-danger)",
        hoverBg: "var(--bg-solid-danger-hover)",
        activeBg: "var(--bg-solid-danger-active)"
      },
      outline: {
        bg: "transparent",
        color: "var(--fg-danger)",
        border: "var(--border-width-sm) solid var(--border-danger)",
        hoverBg: "var(--bg-danger-hover)",
        activeBg: "var(--bg-danger-active)"
      },
      ghost: {
        bg: "transparent",
        color: "var(--fg-danger)",
        hoverBg: "var(--bg-danger-hover)",
        activeBg: "var(--bg-danger-active)"
      }
    }
  };
  const toneStyle = toneMap[t]?.[v] || toneMap.brand.solid;
  const [hovered, setHovered] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const baseStyle = {
    ...sizeStyles[s],
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--font-weight-medium)",
    border: toneStyle.border || "none",
    borderRadius: "var(--radius-sm)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
    position: "relative",
    boxSizing: "border-box",
    textDecoration: "none",
    width: fullWidth ? "100%" : "auto",
    background: disabled ? "var(--bg-neutral-disabled)" : active ? toneStyle.activeBg : hovered ? toneStyle.hoverBg : toneStyle.bg,
    color: disabled ? "var(--fg-neutral-disabled)" : toneStyle.color,
    opacity: disabled ? 0.7 : 1
  };
  return React.createElement("button", {
    type: btnType,
    disabled: disabled || loading,
    className: className,
    onClick: onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: baseStyle,
    ...rest
  }, loading ? React.createElement("span", {
    style: {
      display: "inline-block",
      width: s === "sm" ? "14px" : s === "lg" ? "20px" : "16px",
      height: s === "sm" ? "14px" : s === "lg" ? "20px" : "16px",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }
  }) : children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  tone,
  outline,
  padding,
  className,
  style: userStyle,
  ...rest
}) {
  const t = tone || "neutral";
  const borderColor = t === "brand" ? "var(--border-brand)" : "var(--border-neutral)";
  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "var(--space-7)",
    padding: padding || "var(--space-7)",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-neutral)",
    border: outline ? "var(--border-width-sm) solid " + borderColor : "none",
    fontFamily: "var(--font-sans)",
    boxSizing: "border-box",
    ...userStyle
  };
  return React.createElement("article", {
    className,
    style: cardStyle,
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Heading.jsx
try { (() => {
function Heading({
  children,
  level,
  style: userStyle,
  className,
  ...rest
}) {
  const lvl = level || 2;
  const tag = "h" + lvl;
  const sizeMap = {
    1: "var(--font-size-5xl)",
    2: "var(--font-size-4xl)",
    3: "var(--font-size-3xl)",
    4: "var(--font-size-2xl)",
    5: "var(--font-size-xl)"
  };
  const style = {
    fontFamily: "var(--font-sans)",
    fontSize: sizeMap[lvl],
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--line-height-tight)",
    letterSpacing: "var(--letter-spacing-tight)",
    color: "var(--color-slate-12)",
    margin: 0,
    ...userStyle
  };
  return React.createElement(tag, {
    className,
    style,
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Heading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Heading.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  tone,
  onRemove,
  href,
  className,
  ...rest
}) {
  const t = tone || "neutral";
  const toneStyles = {
    neutral: {
      bg: "var(--bg-solid-neutral)",
      color: "var(--fg-solid-neutral)"
    },
    brand: {
      bg: "var(--bg-solid-brand)",
      color: "var(--fg-solid-brand)"
    },
    danger: {
      bg: "var(--bg-solid-danger)",
      color: "var(--fg-solid-danger)"
    },
    success: {
      bg: "var(--bg-solid-success)",
      color: "var(--fg-solid-success)"
    },
    warning: {
      bg: "var(--bg-solid-warning)",
      color: "var(--fg-solid-warning)"
    },
    info: {
      bg: "var(--bg-solid-info)",
      color: "var(--fg-solid-info)"
    }
  };

  // topic-1..5 — 색은 활성 도메인 프로필(data-domain)이 주입한다.
  // topic 의미에 semantic tone(info 등)을 대입하지 말 것 — token ownership.
  const topicMatch = /^topic-([1-5])$/.exec(t);
  const ts = topicMatch ? {
    bg: `var(--topic-${topicMatch[1]}-color)`,
    color: "var(--color-white)"
  } : toneStyles[t] || toneStyles.neutral;
  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--line-height-tight)",
    background: ts.bg,
    color: ts.color,
    cursor: href ? "pointer" : "default",
    transition: "0.2s",
    textDecoration: "none"
  };
  const removeBtn = onRemove ? React.createElement("button", {
    type: "button",
    onClick: onRemove,
    "aria-label": "제거",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      border: "none",
      background: "transparent",
      color: "inherit",
      cursor: "pointer",
      padding: 0,
      fontSize: "12px",
      lineHeight: 1
    }
  }, "×") : null;
  if (href) {
    return React.createElement("a", {
      href,
      className,
      style,
      ...rest
    }, children, removeBtn);
  }
  return React.createElement("span", {
    className,
    style,
    ...rest
  }, children, removeBtn);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/Text.jsx
try { (() => {
function Text({
  children,
  size,
  weight,
  as,
  color,
  style: userStyle,
  className,
  ...rest
}) {
  const s = size || "md";
  const w = weight || "normal";
  const tag = as || "span";
  const sizeMap = {
    xs: "var(--font-size-xs)",
    sm: "var(--font-size-sm)",
    md: "var(--font-size-md)",
    lg: "var(--font-size-lg)"
  };
  const weightMap = {
    normal: "var(--font-weight-normal)",
    medium: "var(--font-weight-medium)",
    semibold: "var(--font-weight-semibold)",
    bold: "var(--font-weight-bold)"
  };
  const style = {
    fontFamily: "var(--font-sans)",
    fontSize: sizeMap[s],
    fontWeight: weightMap[w],
    lineHeight: "var(--line-height-balanced)",
    color: color || "inherit",
    margin: 0,
    ...userStyle
  };
  return React.createElement(tag, {
    className,
    style,
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Text });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Text.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked: controlledChecked,
  onChange,
  disabled,
  tone,
  className,
  ...rest
}) {
  const t = tone || "brand";
  const [internalChecked, setInternalChecked] = React.useState(false);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const handleClick = () => {
    if (disabled) return;
    const next = !isChecked;
    setInternalChecked(next);
    if (onChange) onChange(next);
  };
  const accentColor = t === "brand" ? "var(--fg-brand)" : "var(--fg-neutral)";
  const boxStyle = {
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "var(--border-width-md) solid " + (disabled ? "var(--fg-neutral-disabled)" : "var(--fg-neutral)"),
    borderRadius: "var(--radius-sm)",
    background: disabled ? "var(--bg-neutral-disabled)" : "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    flexShrink: 0,
    color: isChecked ? disabled ? "var(--fg-neutral-disabled)" : accentColor : "transparent",
    fontSize: "11px",
    lineHeight: 1
  };
  const rootStyle = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    padding: "var(--space-2)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-semibold)",
    color: disabled ? "var(--fg-neutral-disabled)" : "var(--color-slate-12)"
  };
  return React.createElement("label", {
    className,
    style: rootStyle,
    onClick: handleClick
  }, React.createElement("span", {
    style: boxStyle
  }, isChecked ? "✓" : null), label && React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  fullWidth,
  className,
  ...rest
}) {
  const wrapperStyle = {
    width: fullWidth ? "100%" : "auto",
    fontFamily: "var(--font-sans)"
  };
  const labelStyle = {
    display: "block",
    marginBottom: "var(--space-3)",
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-semibold)",
    color: disabled ? "var(--fg-neutral-disabled)" : "var(--color-slate-12)"
  };
  const selectStyle = {
    width: "100%",
    height: "40px",
    padding: "0 var(--space-4)",
    fontSize: "var(--font-size-md)",
    fontFamily: "inherit",
    border: "var(--border-width-md) solid var(--border-neutral)",
    borderRadius: "var(--radius-sm)",
    background: disabled ? "var(--bg-neutral-disabled)" : "var(--bg-app)",
    color: disabled ? "var(--fg-neutral-disabled)" : "var(--fg-neutral)",
    cursor: disabled ? "not-allowed" : "pointer",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23788D98' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "36px",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  };
  return React.createElement("div", {
    className,
    style: wrapperStyle
  }, label && React.createElement("label", {
    style: labelStyle
  }, label, required && React.createElement("span", {
    style: {
      color: "var(--fg-danger)",
      marginLeft: "2px"
    }
  }, " *")), React.createElement("select", {
    style: selectStyle,
    value,
    onChange: onChange ? e => onChange(e.target.value) : undefined,
    disabled,
    required,
    ...rest
  }, placeholder && React.createElement("option", {
    value: "",
    disabled: true,
    selected: !value
  }, placeholder), (options || []).map(opt => React.createElement("option", {
    key: opt.value,
    value: opt.value
  }, opt.label))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
function TextInput({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  readOnly,
  invalid,
  required,
  helperText,
  errorMessage,
  fullWidth,
  className,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const borderColor = invalid ? "var(--border-danger)" : focused ? "var(--border-brand-focus)" : hovered ? "var(--border-neutral-hover)" : "var(--border-neutral)";
  const wrapperStyle = {
    width: fullWidth ? "100%" : "auto",
    fontFamily: "var(--font-sans)"
  };
  const fieldStyle = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    width: "100%",
    height: "40px",
    padding: "0 var(--space-4)",
    fontSize: "var(--font-size-md)",
    border: "var(--border-width-md) solid " + borderColor,
    borderRadius: "var(--radius-sm)",
    background: disabled ? "var(--bg-neutral-disabled)" : "var(--bg-app)",
    transition: "all 0.2s ease-in-out",
    boxSizing: "border-box",
    outline: focused && !invalid ? "var(--border-width-lg) solid var(--border-brand-focus)" : "none",
    outlineOffset: "2px",
    cursor: disabled ? "not-allowed" : "text"
  };
  const inputStyle = {
    flex: 1,
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    color: disabled ? "var(--fg-neutral-disabled)" : "var(--fg-neutral)",
    cursor: disabled ? "not-allowed" : "text"
  };
  const labelStyle = {
    display: "block",
    marginBottom: "var(--space-3)",
    fontSize: "var(--font-size-md)",
    fontWeight: "var(--font-weight-semibold)",
    color: disabled ? "var(--fg-neutral-disabled)" : "var(--color-slate-12)"
  };
  const helperStyle = {
    marginTop: "var(--space-2)",
    fontSize: "var(--font-size-sm)",
    color: invalid ? "var(--fg-danger)" : "var(--fg-neutral-placeholder)"
  };
  const bottomText = invalid && errorMessage ? errorMessage : helperText;
  return React.createElement("div", {
    className,
    style: wrapperStyle
  }, label && React.createElement("label", {
    style: labelStyle
  }, label, required && React.createElement("span", {
    style: {
      color: "var(--fg-danger)",
      marginLeft: "2px"
    }
  }, " *")), React.createElement("div", {
    style: fieldStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, React.createElement("input", {
    style: inputStyle,
    placeholder,
    value,
    onChange,
    disabled,
    readOnly,
    required,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    ...rest
  })), bottomText && React.createElement("div", {
    style: helperStyle
  }, bottomText));
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/layout/Stack.jsx
try { (() => {
function Stack({
  children,
  direction,
  gap,
  align,
  justify,
  wrap,
  style: userStyle,
  className,
  ...rest
}) {
  const dir = direction || "vertical";
  const alignMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch"
  };
  const justifyMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    "space-between": "space-between"
  };
  const style = {
    display: "flex",
    flexDirection: dir === "horizontal" ? "row" : "column",
    gap: gap || "var(--space-5)",
    alignItems: alignMap[align] || "stretch",
    justifyContent: justifyMap[justify] || "flex-start",
    flexWrap: wrap ? "wrap" : "nowrap",
    ...userStyle
  };
  return React.createElement("div", {
    className,
    style,
    ...rest
  }, children);
}
Object.assign(__ds_scope, { Stack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Stack.jsx", error: String((e && e.message) || e) }); }

__ds_ns.FrameBar = __ds_scope.FrameBar;

__ds_ns.ScenePlayer = __ds_scope.ScenePlayer;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Heading = __ds_scope.Heading;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Text = __ds_scope.Text;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.Stack = __ds_scope.Stack;

})();
