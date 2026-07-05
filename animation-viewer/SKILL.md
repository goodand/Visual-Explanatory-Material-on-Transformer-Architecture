---
name: animation-viewer
description: AI/ML 애니메이션 플레이어 scene 구현·승격·연동.
version: 1.0.0
author: vault
metadata:
  hermes:
    tags: [animation, visualization, deep-learning]
    category: ml-education
---

# Animation Viewer — Agent Skill

## 1. 시스템 개요

1920×1080 다크 캔버스(SVG viewBox `0 0 1600 900`) 위에서 딥러닝 개념을 scene-by-scene으로 애니메이션하는 플레이어.

```
AI-ML Animation Player.html          ← 진입점 (11 Unit 통합)
Unit 01 Animation.html               ← Unit 01 전용 (독립 실행 가능)
animation-viewer/
  player-app.jsx                     ← 통합 플레이어 App (unit/scene/step 상태 관리 + 그래프 토글 + 해부도 링크 + backlink)
  unit01-app.jsx                     ← Unit 01 전용 App (독립 버전)
  tween-engine.js                    ← JS timer tween (rAF, cubic-bezier solver)
  u01-shared.jsx                     ← 다크 캔버스 SVG 프리미티브 (전 Unit 공유)
  u01-scenes-a.jsx                   ← Unit 01 전용 Scene 01~05
  u01-scenes-b.jsx                   ← Unit 01 전용 Scene 06~09
  generic-visualizers.jsx            ← 범용 시각화 8종 (sketch.kind 기반)
  special-visualizers.jsx            ← 전용 시각화 4종 (params.kind 패턴 매칭)
  u0507-scenes.jsx                   ← ⭐ scene_id override 5종 (U05 gate ×3, U07 QK·softmax)
  graph-view.jsx                     ← Wiki 그래프 뷰 (102 노드 + backlink 인덱스)
  PROMPT.md                          ← 통합 시스템 설계 문서 (참고용)
storyboard/
  curriculum.js                      ← 11 Unit 메타데이터 (window.SB_CURRICULUM)
  data-unit01.js ~ data-unit11.js    ← scene 데이터 (window.SB_UNITS.unitXX)
```

---

## 2. 진입점 HTML 구조

`AI-ML Animation Player.html`의 script 로드 순서 (변경 금지):

```html
<!-- 1. React + Babel + KaTeX -->
<script src="react@18.3.1"></script>
<script src="react-dom@18.3.1"></script>
<script src="@babel/standalone@7.29.0"></script>
<script src="katex@0.16.9"></script>

<!-- 2. DS 번들 (ScenePlayer, FrameBar 등) -->
<script src="_ds/.../ds_bundle.js"></script>

<!-- 3. Tween 엔진 (plain JS, NOT babel) -->
<script src="animation-viewer/tween-engine.js"></script>

<!-- 4. 데이터 (plain JS, window.SB_UNITS에 등록) -->
<script src="storyboard/data-unit01.js"></script>
...
<script src="storyboard/data-unit11.js"></script>

<!-- 5. 시각화 컴포넌트 (Babel, 순서 중요) -->
<script type="text/babel" src="animation-viewer/u01-shared.jsx"></script>      ← 프리미티브
<script type="text/babel" src="animation-viewer/u01-scenes-a.jsx"></script>    ← U01 전용
<script type="text/babel" src="animation-viewer/u01-scenes-b.jsx"></script>    ← U01 전용
<script type="text/babel" src="animation-viewer/generic-visualizers.jsx"></script>
<script type="text/babel" src="animation-viewer/special-visualizers.jsx"></script>
<script type="text/babel" src="animation-viewer/u0507-scenes.jsx"></script>    ← scene_id override
<script type="text/babel" src="animation-viewer/graph-view.jsx"></script>
<script type="text/babel" src="animation-viewer/player-app.jsx"></script>      ← 마지막
```

**새 파일 추가 시**: `player-app.jsx` 앞에 배치. `player-app.jsx`는 반드시 마지막.

---

## 3. 데이터 모델 (storyboard/data-unit*.js)

### Unit 구조

```js
window.SB_UNITS.unitXX = {
  id: "unitXX", no: "XX", topic: 1~5,
  title_en: "...", title_ko: "...",
  core_question: "...",        // 단원 핵심 질문
  correct_framing: "...",      // 올바른 프레이밍
  avoid: ["..."],              // 금지 표현
  routing: {
    emphasis: "표현: ...",     // 5-Unit Frame 강조 slot
    types: ["packet_flow", ...] // 사용하는 animation_type
  },
  importance: { usage, necessity, difference, strength },
  scenes: [ ... ]
}
```

### Scene 구조

```js
{
  scene_id: "uXX_sYY",        // 고유 ID (Unit XX, Scene YY)
  no: "YY",                    // 2자리 번호
  title: "한국어 제목",
  title_en: "English title",
  animation_type: ["packet_flow"],  // 배열 (복수 가능)

  five_unit_frame: {
    data: "...",                // slot 0: 데이터
    representation: "...",      // slot 1: 표현
    calculation_target: "...",  // slot 2: 계산 대상
    concept_classification: "...", // slot 3: 개념 분류
    importance: { type: "usage|necessity|difference|strength", text: "..." } // slot 4
  },

  moving_object: "...",         // 핵심 움직이는 객체 설명
  scene_objects: [ { id, type, role, visibility } ],

  animation_steps: [            // 각 항목 = 1 tween step (caption으로 표시)
    "step 1 설명",
    "step 2 설명",
    ...
  ],

  zoom: { required: bool, reason: "..." },
  formula_lock: {
    needed: bool,
    formula: "LaTeX string",    // KaTeX로 렌더링
    when_to_show: "..."
  },

  // ⭐ 핵심: 시각화 디스패치 키
  sketch: {
    kind: "packet_flow",        // generic-visualizers.jsx의 KIND_MAP 키
    params: { ... }             // 해당 visualizer의 파라미터
  },

  links: [
    { target: "uXX_sYY", label: "...", type: "next|prev|cross|related", note: "..." }
  ],
  prereqs: [
    { target: "_unit:unitXX", concept: "...", label: "...", note: "..." }
  ],
  correction: "교정 문구 (있으면 amber callout)"
}
```

---

## 4. 시각화 디스패치 체계

플레이어는 scene의 `sketch.kind`로 시각화를 선택한다:

### 4-1. Generic Visualizers (generic-visualizers.jsx → `window.GenericVis`)

| sketch.kind | 컴포넌트 | params 키 |
|---|---|---|
| `packet_flow` | VPacketFlow | `stations[]`, `packet`, `labels[]` |
| `matrix_build` | VMatrixBuild | `rows[]`, `cols[]`, `cells[][]`, `highlightRow`, `highlight[r,c]`, `pullRow`, `caption` |
| `before_after_contrast` | VBeforeAfter | `left{title,note}`, `right{title,note}`, `arrow` |
| `xy_transform` | VXYTransform | `points[{x,y,label,near}]`, `pair[i,j]` |
| `zoom_hierarchy` | VZoomHierarchy | `levels[{scope,blocks[{label,focus}],content}]`, `focus`, `breadcrumb` |
| `formula_lock` | VFormulaLock | `stations[]`, `packet`, `formula` |
| `gate_mask` | VGateMask | `values[]`, `labels[]`, `caption` |
| `_generic` | VGeneric (fallback) | `kind` (라벨용) |

### 4-2. Special Visualizers (special-visualizers.jsx → `window.SpecialVis`)

`_generic` fallback에 도달하기 전, `params.kind` 문자열을 정규식으로 매칭:

| params.kind 패턴 | 컴포넌트 | 설명 |
|---|---|---|
| `/sigmoid\|tanh\|relu.*curve/` | VSquashCurve | 실제 수학 함수 곡선 + 샘플 점 |
| `/weighted_?sum/` | VRowWeightedSum | `weights[]`, `vlabels[]`, `result` — distribution × V → weighted sum (params 없으면 기본값) |
| `/parallel_?heads/` | VParallelHeads | Multi-Head 병렬 분기 + heatmap |
| `/heatmap\|query focus/` | VHeatmapFocus | n×n attention 패턴 + row focus |

### 4-3. 디스패치 흐름

```
GenericScene(scene, step, p)
  ├── ⭐ window.SceneVisOverrides[scene.scene_id] 있음? → 전용 override (u0507-scenes.jsx)
  ├── sketch.kind → KIND_MAP[kind] 찾음? → 해당 generic visualizer
  ├── 못 찾음 → window.SpecialVis.match(params.kind) 시도
  │     ├── 매칭됨 → special visualizer
  │     └── 매칭 안 됨 → VGeneric (fallback: 점선 박스 + kind 라벨)
  └── correction 있으면 amber callout, prereqs 있으면 참조 라벨 추가
```

### 4-3b. Scene Overrides (u0507-scenes.jsx → `window.SceneVisOverrides`)

scene_id 키 → 컴포넌트. KIND_MAP보다 우선. 현재 등록:

| scene_id | 컴포넌트 | 내용 |
|---|---|---|
| `u05_s03` | VLstmGate(forget) | σ→f_t bar→⊙ C_{t−1}→결과 (유지/폐기 verdict) |
| `u05_s04` | VLstmGate(input) | tanh→C̃_t + σ→i_t→⊙ |
| `u05_s06` | VLstmGate(output) | C_t→tanh + σ→o_t→⊙→h_t |
| `u07_s04` | VQKDot | Q₂가 K₁~K₄와 순차 dot product → score row + ÷√d_k |
| `u07_s05` | VSoftmaxDist | score bars → softmax box → distribution bars + Σ=1 segment |

새 override 추가: 컴포넌트 작성 → `window.SceneVisOverrides[scene_id] = 컴포넌트` 등록.
props: `{ g, params, scene }` (g = 전체 진행도 0~1).

### 4-4. Unit 01은 별도 경로

`player-app.jsx`에서 `U.id === "unit01"` 이면 `U01_VIS[scene]` 배열에서 전용 컴포넌트 직접 선택.
전용 Scene 목록: `u01-scenes-a.jsx` (Scene01~05), `u01-scenes-b.jsx` (Scene06~09).

---

## 5. SVG 프리미티브 (u01-shared.jsx → `window.U01Shared`)

모든 시각화가 공유하는 빌딩 블록. **전 Unit에서 사용**.

### 색상 상수 (U01C)

```js
bg: "#0F1110"           // 캔버스 배경
card: "#171A18"         // 카드 fill
cardBorder: "#2C312E"   // 카드 border
text: "#E8EAE7"         // 주 텍스트
dim: "#9BA29D"          // 보조 텍스트
faint: "#5A615C"        // 희미한 텍스트/선
line: "#3A403C"         // 연결선
accent: "#8B78F0"       // violet (강조)
accentSoft: "rgba(139,120,240,0.16)"
teal: "#22B8A5"         // teal (Encoder, 데이터)
tealSoft: "rgba(34,184,165,0.15)"
amber: "#E5B84B"        // amber (Decoder, gate)
amberSoft: "rgba(229,184,75,0.14)"
red: "#E5716B"          // red (Mask, 위험)
```

### 헬퍼 함수

```js
stepP(step, p, i)      // step > i → 1, step === i → p, step < i → 0
lerp(a, b, t)          // 선형 보간
clamp01(v)             // 0~1 클램프
stag(t, i, n, overlap) // n개 항목에 stagger 분배, i번째의 로컬 진행도
```

### SVG 컴포넌트

| 이름 | 용도 | 주요 props |
|---|---|---|
| `DarkGrid()` | 배경 도트 격자 (80px 간격) | 없음 |
| `TChip` | 텍스트 칩 (rect + text) | `x,y,w,h,text,p,accent,mono,dashed,dim,fontSize` |
| `CardBox` | 큰 카드 컨테이너 | `x,y,w,h,p,label,accent,children` |
| `Flow` | 화살표 (선 + 삼각형 머리) | `x1,y1,x2,y2,p,dashed,color` |
| `Callout` | 하단 보조 설명 박스 | `x,y,w,text,p,tone(dim/amber/teal),fontSize` |
| `Lbl` | 자유 라벨 | `x,y,text,p,size,fill,anchor,mono,weight` |
| `Packet` | 이동 패킷 (강조 사각형) | `cx,cy,p,text,w,h` |

### 진행도 패턴 (g = global progress)

Generic visualizer는 `g = clamp01((step + p) / nSteps)` 전체 진행도를 구간별로 분배:

```js
const pr = (g, a, b) => clamp01((g - a) / (b - a));
// pr(g, 0, 0.3)   → g=0~0.3 구간에서 0→1
// pr(g, 0.3, 0.6) → g=0.3~0.6 구간에서 0→1
```

전용 Scene은 `stepP(step, p, i)` 로 개별 step 단위 제어.

---

## 6. Tween 엔진 (tween-engine.js → `window.TweenEngine`)

```js
const { tween, tokenMs, tokenEase, cubicBezier } = window.TweenEngine;
```

- `tween({ duration, ease, onUpdate, onDone })` → rAF 기반 0→1 트윈
- `tokenEase("--ease-default")` → CSS 커스텀 프로퍼티에서 cubic-bezier 파싱
- `tokenMs("--duration-normal")` → CSS 토큰에서 ms 값 읽기
- **캡처 대응**: `clock` 옵션으로 외부 시간 주입 가능

---

## 7. 플레이어 App 상태 관리 (player-app.jsx)

### 상태

```js
unit   → 현재 Unit 인덱스 (0~10)
scene  → 현재 Scene 인덱스 (0-based)
step   → 현재 animation_step 인덱스 (0-based)
p      → 현재 step 내 진행도 (0~1, tween으로 구동)
playing → 자동 재생 여부
slot   → FrameOverlay에 표시 중인 5-Unit Frame slot (null~4)
```

### 재생 로직

```
step 변화 → tween(0→1, STEP_MS=1500ms) → p 업데이트
p=1 도달 + playing → HOLD_MS=750ms 대기 → advance()
advance():
  step+1 < nSteps → step++
  else scene+1 < nScenes → scene++, step=0
  else unit+1 < 11 → unit++, scene=0, step=0
  else → playing=false (끝)
마지막에서 ▶ → unit=0, scene=0, step=0 (처음부터)
```

### 영속성

- `localStorage("aiml_anim_player")` → `{unit, scene, step}` 저장/복원
- URL 해시 `#u=07&s=5` → Unit 07 Scene 5 (해시가 localStorage보다 우선)

### 키보드

- `→` advance, `←` 되감기, `Space` 재생/정지

### Unit 01 vs 나머지 분기

```jsx
const canvas = U.id === "unit01"
  ? React.createElement(U01_VIS[scene], { step, p })
  : <GenericScene scene={cur} step={step} p={p} />;
```

---

## 8. DS 컴포넌트 사용

```js
const { ScenePlayer, FrameBar } = window.MLAnimationsDesignSystem_947957;
```

### ScenePlayer

씬 플레이어 셸. 캔버스 + 컨트롤 바 + 씬 칩 목록.

```jsx
<ScenePlayer
  scenes={[{ label: "칩라벨", steps: 5 }, ...]}
  scene={sceneIdx} step={stepIdx} playing={bool}
  onSceneChange={(i) => ...}
  onStepChange={(i) => ...}
  onPlayToggle={() => ...}
  caption="현재 step 설명 텍스트"
  canvasHeight="min(54vw, calc(100vh - 360px))">
  {/* children = 캔버스 안쪽 (SVG + 오버레이) */}
</ScenePlayer>
```

### FrameBar

5-Unit 프레임 바 (데이터/표현/계산대상/개념분류/중요성).

```jsx
<FrameBar size="sm" states={["collapsed","open","collapsed","collapsed","collapsed"]}
  onSelect={(slotIdx) => ...} />
```

---

## 9. 전용 Scene 승격 워크플로우

### 목적

Generic visualizer는 sketch.params만으로 그리므로 표현력에 한계가 있다.
중요한 scene은 전용 컴포넌트로 승격하여 정교한 애니메이션을 구현한다.

### 우선순위

1. **U05 gate_mask** — LSTM gate 시각화. 현재 VGateMask는 단순 막대그래프. 전용 버전은:
   - sigmoid 곡선에서 gate 값 생성 과정
   - element-wise 곱셈 (⊙) 시각화
   - forget/input/output gate 3종 순차 등장
   - C_t 통로 위/아래 gate 위치 표현

2. **U07 attention** — Attention 핵심 3 scene:
   - S04 `QKᵀ score 행렬` → 실제 dot product 계산 과정 (current: matrix_build)
   - S06 `row → V weighted sum` → VRowWeightedSum 있지만 커스텀 data 매핑 필요
   - S07 `전체 output 행렬` → 행별 weighted sum 결과가 쌓이는 과정

3. **U09/U10 zoom_hierarchy** → Transformer 해부도(`transformer-anatomy/`)와 실제 연동

### 승격 절차

```
1. 대상 scene의 data-unit*.js 읽기
   → animation_steps, scene_objects, sketch.params 파악

2. 전용 컴포넌트 작성 (새 파일 또는 special-visualizers.jsx에 추가)
   - props: { step, p } (Unit 01 스타일) 또는 { g, params, scene } (generic 스타일)
   - U01Shared 프리미티브 사용
   - stepP() 또는 pr(g, start, end) 패턴으로 타이밍 제어

3. 디스패치 등록:
   방법 A — sketch.kind를 새 키로 변경 + KIND_MAP에 추가
   방법 B — params.kind 패턴을 SpecialVis.match()에 추가
   방법 C — Unit 전용이면 player-app.jsx에서 직접 분기

4. HTML에 <script> 태그 추가 (special-visualizers.jsx 앞)

5. ready_for_verification으로 검증
```

### 파일 분할 규칙

- 1파일 1000줄 이하
- 전용 scene이 3개 이하면 `special-visualizers.jsx`에 추가
- 4개 이상이면 `u05-scenes.jsx` 등 Unit별 파일 분리
- `window.XXX = { ... }` 로 export, 다른 파일에서 참조

---

## 10. Zoom 해부도 연동 — ✅ 구현됨

### 구현 방식

- **Player → 해부도**: `player-app.jsx`의 `ANATOMY_MAP` (scene_id → { level, z }).
  매핑된 scene은 LINKS 행에 teal "⧉ 해부도 Z*" 칩 표시 →
  `transformer-anatomy/Transformer%20Anatomy.html?level=<levelId>&from=<scene_id>` 링크.
- **해부도 → Player**: `anatomy-app.jsx`의 `SceneBacklink` 컴포넌트가 `?from=` 파라미터를 읽어
  툴바에 "◂ 애니메이션 UXX SYY" 버튼 표시 → `../AI-ML%20Animation%20Player.html#u=XX&s=Y`.
- 해부도는 `?level=L3-self` URL 파라미터로 직접 진입 가능 (parent chain 자동 복원).

### ANATOMY_MAP 현재 매핑 (25 scene)

| Unit | scene → level |
|---|---|
| U07 | s02→L4-self · s04/s05/s06/s08/s09→L5 (SDPA) |
| U08 | s01/s02/s04/s05/s07/s08→L3-self · s03→L4-self |
| U09 | s06→L2-enc · s07→L3-self · s08→AddNorm · s09→L8 · s11/s14→L1 |
| U10 | s02/s12/s13→L2-dec · s03→L3-masked · s04→L3-cross · s05/s10→L1 · s11→L0 |

U05 LSTM은 Transformer 해부도 대상이 아니므로 매핑 없음.
해부도 편집은 별도 Skill (`transformer-anatomy/SKILL.md`) 참조.

---

## 11. Wiki 그래프 뷰 (graph-view.jsx) — ✅ 연결됨

- `window.WikiGraph = { GraphView, buildBacklinks }`
- Player 우측 상단 "그래프" 버튼 또는 `G` 키 → 캔버스 영역이 GraphView로 교체
- 노드 클릭 → 해당 scene 재생 + 그래프 닫기 · 허브(U번호) 클릭 → 단원 처음
- 현재 재생 중 scene은 큰 노드 + ring으로 하이라이트
- Topic 색상은 DS 토큰에서 읽음 (`_gvTok` 헬퍼 — hex 하드코딩 금지)
- **Backlink 칩**: `buildBacklinks(UNITS)` 인덱스를 App에서 1회 계산 →
  각 scene 하단에 "← REFERENCED BY" 점선 칩 (3개 + "+N" 펼치기) → 클릭 시 출발 scene으로 이동

---

## 12. 새 scene 데이터 작성 규칙

### sketch.params 작성법 (Generic용)

**packet_flow:**
```js
sketch: {
  kind: "packet_flow",
  params: {
    stations: ["출발지", "중간1", "중간2", "도착지"],  // 3~6개 권장
    packet: "이동체 라벨",                             // 짧게 (4자 이내)
    labels: ["하단라벨1", "하단라벨2", ...]             // stations와 동일 길이
  }
}
```

**matrix_build:**
```js
sketch: {
  kind: "matrix_build",
  params: {
    rows: ["행1", "행2", "행3"],
    cols: ["열1", "열2", "열3"],
    cells: [["1,1", "1,2", "1,3"], ["2,1", "2,2", "2,3"], ...],
    highlightRow: 1,        // 0-based, 강조할 행
    highlight: [1, 2],      // [row, col] 강조할 셀
    pullRow: true,          // highlightRow를 아래로 끌어내기
    caption: "하단 설명"
  }
}
```

**before_after_contrast:**
```js
sketch: {
  kind: "before_after_contrast",
  params: {
    left: { title: "제목 (Before)", note: "설명\n여러 줄" },
    right: { title: "제목 (After)", note: "설명\n여러 줄" },
    arrow: "→ 화살표 라벨"
  }
}
```

**xy_transform:**
```js
sketch: {
  kind: "xy_transform",
  params: {
    points: [
      { x: 0.3, y: 0.25, label: "점A", near: false },   // x,y는 0~1 정규화
      { x: 0.7, y: 0.65, label: "점B", near: true }      // near=true → teal 색상
    ],
    pair: [0, 1]   // 연결선을 그을 점 인덱스 쌍
  }
}
```

**zoom_hierarchy:**
```js
sketch: {
  kind: "zoom_hierarchy",
  params: {
    levels: [
      { scope: "L0: 전체", blocks: [{ label: "Transformer", focus: true }] },
      { scope: "L1: Stack", blocks: [{ label: "Encoder" }, { label: "Decoder" }] },
      { scope: "L2: Layer", content: "Self-Attn\nFFN\nAdd&Norm" }
    ],
    focus: 1,           // 0-based, 강조할 level
    breadcrumb: "Transformer > Encoder > Layer 1"
  }
}
```

**gate_mask:**
```js
sketch: {
  kind: "gate_mask",
  params: {
    values: [0.9, 0.1, 0.7, 0.3],   // 0~1 gate 값
    labels: ["기억", "폐기", "유지", "약화"],
    caption: "하단 설명"
  }
}
```

**formula_lock:**
```js
sketch: {
  kind: "formula_lock",
  params: {
    stations: ["단계1", "단계2", "단계3"],
    packet: "●",
    formula: "f(x) = ..."   // 하단 수식 (plain text; KaTeX는 formula_lock.formula에서)
  }
}
```

### Special Visualizer 트리거

sketch.kind가 `_generic`이고 params.kind가 패턴에 매칭되면 Special이 대신 렌더링:

```js
// 예: sigmoid 곡선 전용
sketch: { kind: "_generic", params: { kind: "sigmoid curve" } }
// → VSquashCurve가 처리 (정규식: /sigmoid|tanh|relu.*curve/)

// 예: weighted sum 전용 (weights/vlabels/result 주입 — 없으면 기본값 fallback)
sketch: { kind: "_generic", params: { kind: "weighted sum", weights: [0.18, 0.04, 0.63, 0.15], vlabels: ["V_1","V_2","V_3","V_4"], result: "합산 → 새 representation" } }
// → VRowWeightedSum이 처리

// 예: parallel heads 전용
sketch: { kind: "_generic", params: { kind: "parallel 3 heads" } }
// → VParallelHeads가 처리

// 예: heatmap 전용
sketch: { kind: "_generic", params: { kind: "self-attention heatmap" } }
// → VHeatmapFocus가 처리
```

---

## 13. 편집 워크플로우

### Scene 데이터 수정

```bash
# 1. 대상 검색
grep "u07_s04" storyboard/data-unit07.js

# 2. 수정
str_replace_edit storyboard/data-unit07.js

# 3. 검증
ready_for_verification "AI-ML Animation Player.html"
# → 해당 unit/scene으로 이동하여 재생 확인
```

### 새 Visualizer 추가

```bash
# 1. special-visualizers.jsx 또는 새 파일에 컴포넌트 작성
# 2. window export: window.SpecialVis에 추가 또는 새 window 객체
# 3. match() 함수에 패턴 추가 (special) 또는 KIND_MAP에 추가 (generic)
# 4. AI-ML Animation Player.html에 <script> 태그 추가
# 5. ready_for_verification
```

### 검증 체크리스트

- [ ] 해당 scene으로 이동하여 재생 (자동 + 수동 스텝)
- [ ] animation_steps 수와 실제 시각 변화 일치
- [ ] formula_lock KaTeX 렌더링 (있는 경우)
- [ ] links 칩 클릭 → 정상 이동
- [ ] FrameBar 칩 클릭 → 오버레이 표시
- [ ] 콘솔 에러 없음
- [ ] 이전 scene + 다음 scene 깨지지 않음

---

## 14. 디자인 시스템 규칙

- **DS 토큰 필수**: hex 하드코딩 금지 (U01C 상수는 예외 — 다크 캔버스 전용)
- **DS 번들 경로**: `_ds/ml-animations-design-system-94795768-6cca-4336-8dca-6ececad5a6ab/`
- **CSS 토큰**: `var(--color-*)`, `var(--font-sans)`, `var(--font-mono)`, `var(--radius-*)`, `var(--shadow-*)`
- **컴포넌트**: `window.MLAnimationsDesignSystem_947957`에서 가져오기

### 다크 캔버스 내부 색상

캔버스 내부(SVG)에서는 CSS var가 동작하지 않으므로 U01C 상수를 사용한다.
캔버스 외부(HTML)에서는 반드시 DS 토큰을 사용한다.

---

## 15. 파일 크기 제한

| 파일 | 현재 | 한계 |
|---|---|---|
| player-app.jsx | 296줄 | 유지 |
| generic-visualizers.jsx | 278줄 | 400줄 이하 |
| special-visualizers.jsx | 206줄 | 400줄 이하 |
| u01-shared.jsx | 142줄 | 유지 |
| u01-scenes-a.jsx | 194줄 | 유지 |
| 새 파일 | — | 500줄 이하 |

초과 시 Unit별로 분할: `u05-gate-scenes.jsx`, `u07-attention-scenes.jsx` 등.

---

## 16. 남은 TODO

### Phase 2: 전용 Scene 승격 — ✅ 1차 완료 (u0507-scenes.jsx)

- [x] U05 gate_mask → LSTM gate 전용 (forget/input/output 3종)
- [x] U07 S04~S05 → QK dot product · softmax distribution 전용
- [x] U07 S06/S07 data 매핑 개선 (VRowWeightedSum params 주입: weights/vlabels/result)
- [ ] U09/U10 zoom_hierarchy → Transformer 구조 전용 (현재는 해부도 링크로 대체)

### Phase 3: Zoom 해부도 연동 — ✅ 완료

- [x] ANATOMY_MAP + ⧉ 해부도 칩 (25 scene)
- [x] 해부도 SceneBacklink (?from= → ◂ 애니메이션 복귀)

### Phase 4: Wiki 그래프 — ✅ 완료

- [x] 그래프 뷰 토글 (버튼 + G 키)
- [x] backlink 칩 (← REFERENCED BY)
- [x] 현재 scene 하이라이트

### Phase 5 (미착수)

- [ ] U05 gate scene을 LSTM 전용 해부도로 확장 (현재 Transformer만 존재)
- [ ] 그래프 뷰 URL 해시(#graph) 지원
- [ ] 남은 generic scene 품질 검토 (U03 XOR, U06 seq2seq 등)

---

## 17. 반복 이슈 & 해결

| 이슈 | 원인 | 해결 |
|---|---|---|
| Babel scope 분리 | 각 `<script type="text/babel">`은 별도 scope | `window.XXX`로 export/import |
| styles 이름 충돌 | 전역 `const styles = {}` 충돌 | `const playerStyles = {}` 등 고유 이름 |
| SVG 내 CSS var | SVG attribute에서 CSS var 미작동 | U01C 상수 사용 |
| KaTeX 깨짐 | formula 문자열의 백슬래시 이스케이프 | `\\frac` 등 이중 이스케이프 |
| stagger 타이밍 이상 | overlap 파라미터 누락 | `stag(t, i, n, 0.55)` 기본값 확인 |
| localStorage 충돌 | 키 중복 | Unit 01 전용 `aiml_anim_u01`, 통합 `aiml_anim_player` |
| 새 script 로드 안 됨 | HTML에 태그 미추가 | checklist 확인 |
