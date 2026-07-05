// Unit 03 — Linear / Nonlinear / MLP / XOR (8 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit03 = {
  id: "unit03", no: "03", topic: 2,
  title_en: "Linear / Nonlinear / MLP / XOR",
  title_ko: "선형 · 비선형 · MLP · XOR",
  core_question: "왜 단일 퍼셉트론으로 XOR을 풀 수 없고, MLP는 풀 수 있는가?",
  correct_framing: "MLP = Linear + Activation + Linear + … 선형 변환과 비선형 함수가 층으로 쌓이며 표현 공간을 바꾼다.",
  avoid: [
    "\"활성화 함수가 데이터를 편다\"라고 단독 주체처럼 말하지 않는다.",
    "\"MLP는 그냥 리니어 레이어\"라고만 말하지 않는다."
  ],
  routing: { emphasis: "표현: 원본 공간에서 hidden representation으로 변환", types: ["xy_transform", "before_after_contrast", "formula_lock"] },
  importance: {
    usage: "Transformer FFN(Unit 09), 분류 출력층 등 어디서든 MLP 구조가 재사용된다.",
    necessity: "선형 모델의 한계를 이해해야 비선형 층을 쌓는 이유가 명확해진다.",
    difference: "단일 퍼셉트론은 직선 하나, MLP는 hidden layer를 통해 표현 공간 자체를 변환한다.",
    strength: "hidden layer가 만든 새 공간에서는 원래 불가능했던 분리가 가능해진다."
  },
  scenes: [
    {
      scene_id: "u03_s01", no: "01",
      title: "XOR 점 4개를 XY에 놓는다",
      title_en: "XOR Data Points",
      animation_type: ["xy_transform"],
      five_unit_frame: {
        data: "XOR 입력: (0,0)=0, (0,1)=1, (1,0)=1, (1,1)=0",
        representation: "2D 좌표 위의 점 4개 — 클래스 0과 1",
        calculation_target: "아직 계산 전 — 데이터 배치만",
        concept_classification: "활성·비선형 · 문제 정의",
        importance: { type: "necessity", text: "이 배치에서 직선 하나로 분리가 불가능함을 먼저 보여야 한다" }
      },
      moving_object: "XY 평면에 놓이는 점 1개",
      scene_objects: [
        { id: "xy_plane", type: "xy_coordinate", role: "2D 입력 공간", visibility: "open" },
        { id: "xor_points", type: "data_token", role: "XOR 점 4개 (클래스 0, 1 색 구분)", visibility: "open" }
      ],
      animation_steps: [
        "2D 좌표가 등장한다",
        "(0,0)=0, (1,1)=0 점이 한 클래스로 놓인다",
        "(0,1)=1, (1,0)=1 점이 다른 클래스로 놓인다",
        "대각선 위치 — 직선 하나로 나눌 수 없는 패턴"
      ],
      zoom: { required: false, reason: "점 4개 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "xy_transform", params: { points: [{ x: 0.15, y: 0.15, label: "0", near: false }, { x: 0.15, y: 0.85, label: "1", near: true }, { x: 0.85, y: 0.15, label: "1", near: true }, { x: 0.85, y: 0.85, label: "0", near: false }] } },
      links: [{ target: "u03_s02", label: "다음: 직선으로 시도", type: "next" }]
    },
    {
      scene_id: "u03_s02", no: "02",
      title: "직선 하나로는 분리 불가",
      title_en: "Single Line Fails",
      animation_type: ["xy_transform"],
      five_unit_frame: {
        data: "XOR 점 4개",
        representation: "직선(decision boundary) 1개",
        calculation_target: "어떤 기울기와 절편으로도 XOR을 분리할 수 없음",
        concept_classification: "활성·비선형 · 선형 모델의 한계",
        importance: { type: "necessity", text: "이 실패가 hidden layer의 존재 이유다" }
      },
      moving_object: "기울기가 바뀌며 회전하는 직선",
      scene_objects: [
        { id: "xy_plane", type: "xy_coordinate", role: "XOR 데이터", visibility: "open" },
        { id: "decision_line", type: "calculation_node", role: "직선 decision boundary", visibility: "open" },
        { id: "fail_callout", type: "annotation_callout", role: "어떻게 놓아도 대각 점 분리 불가", visibility: "open" }
      ],
      animation_steps: [
        "직선이 여러 각도로 회전한다",
        "어떤 위치에서도 (0,1),(1,0)과 (0,0),(1,1)을 양쪽으로 나눌 수 없다",
        "\"단일 퍼셉트론 = 직선 1개 = XOR 불가\""
      ],
      zoom: { required: false, reason: "직선 회전 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "xy_transform", params: { points: [{ x: 0.15, y: 0.15, label: "0" }, { x: 0.15, y: 0.85, label: "1", near: true }, { x: 0.85, y: 0.15, label: "1", near: true }, { x: 0.85, y: 0.85, label: "0" }] } },
      links: [{ target: "u03_s03", label: "해결: hidden layer 추가", type: "next" }]
    },
    {
      scene_id: "u03_s03", no: "03",
      title: "Hidden layer가 중간 표현값을 만든다",
      title_en: "Hidden Layer Creates New Representation",
      animation_type: ["xy_transform", "before_after_contrast"],
      prereqs: [
        { target: "_unit:unit02", concept: "활성화 함수 f(z)", label: "Unit 02", note: "선형 후 비선형 변환은 이미 설명됨" }
      ],
      five_unit_frame: {
        data: "XOR 입력 (x₁, x₂)",
        representation: "hidden layer 출력 (h₁, h₂) — 새 좌표계",
        calculation_target: "W₁x + b₁ → f(z) → h — 입력을 새 공간으로 매핑",
        concept_classification: "활성·비선형 · representation 변환",
        importance: { type: "strength", text: "새 공간에서는 원래 불가능했던 선형 분리가 가능해진다" }
      },
      moving_object: "원본 점이 새 공간의 점으로 이동하는 장면",
      scene_objects: [
        { id: "original_space", type: "xy_coordinate", role: "원본 (x₁,x₂) 공간", visibility: "open" },
        { id: "hidden_transform", type: "procedure_block", role: "h = f(W₁x + b₁)", visibility: "open" },
        { id: "new_space", type: "xy_coordinate", role: "새 (h₁,h₂) 공간", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽: 원본 XOR 점 4개",
        "hidden layer가 각 점을 새 좌표로 매핑한다",
        "오른쪽: 새 공간에서 점들이 재배치된다",
        "새 공간에서는 직선 하나로 분리 가능한 배치가 된다"
      ],
      zoom: { required: false, reason: "좌우 before/after — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "원본 공간", note: "XOR — 직선 분리 불가" }, right: { title: "새 공간 (h₁,h₂)", note: "직선 분리 가능!" }, arrow: "h=f(Wx+b)" } },
      links: [{ target: "u03_s04", label: "다음: 새 공간에서 분리", type: "next" }]
    },
    {
      scene_id: "u03_s04", no: "04",
      title: "새 공간에서 선형 분리 성공",
      title_en: "Linear Separation in New Space",
      animation_type: ["xy_transform"],
      five_unit_frame: {
        data: "hidden layer 출력 (h₁, h₂)",
        representation: "새 좌표계에서 직선 decision boundary",
        calculation_target: "W₂h + b₂ → 출력 — 이제 직선으로 분리 가능",
        concept_classification: "활성·비선형 · 분리 성공",
        importance: { type: "strength", text: "표현 공간 변환이 핵심 — 활성화 함수 단독이 아니라 층 쌓기의 결과" }
      },
      moving_object: "새 공간에서 직선이 놓이는 장면",
      scene_objects: [
        { id: "new_space", type: "xy_coordinate", role: "변환된 (h₁,h₂) 공간", visibility: "open" },
        { id: "decision_line", type: "calculation_node", role: "직선 boundary — 성공", visibility: "open" },
        { id: "success_callout", type: "annotation_callout", role: "hidden layer가 공간을 바꿨기 때문", visibility: "open" }
      ],
      animation_steps: [
        "변환된 공간에서 점 4개가 분리 가능한 배치",
        "직선 하나가 클래스 0과 1을 깔끔하게 나눈다",
        "\"원본 데이터가 아니라 표현(representation)이 바뀐 것\""
      ],
      zoom: { required: false, reason: "분리 결과 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "xy_transform", params: { points: [{ x: 0.2, y: 0.2, label: "0" }, { x: 0.2, y: 0.8, label: "1", near: true }, { x: 0.8, y: 0.2, label: "1", near: true }, { x: 0.5, y: 0.5, label: "0" }], pair: [1, 2] } },
      links: [{ target: "u03_s05", label: "다음: 출력층", type: "next" }]
    },
    {
      scene_id: "u03_s05", no: "05",
      title: "출력층 — logit/index로 보내기",
      title_en: "Output Layer",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "hidden representation h",
        representation: "logit 또는 class index",
        calculation_target: "W₂h + b₂ → logit → (softmax) → prediction",
        concept_classification: "활성·비선형 · 출력 변환",
        importance: { type: "usage", text: "이 구조가 분류, 생성 등 모든 출력의 기본 패턴" }
      },
      moving_object: "h가 출력층을 통과하여 logit이 되는 packet",
      scene_objects: [
        { id: "hidden_h", type: "embedding_vector", role: "hidden representation h", visibility: "open" },
        { id: "output_layer", type: "procedure_block", role: "W₂h + b₂ → logit", visibility: "open" },
        { id: "prediction", type: "data_token", role: "prediction (class 0 or 1)", visibility: "open" }
      ],
      animation_steps: [
        "hidden h가 출력 linear layer에 들어간다",
        "logit 값이 나온다",
        "softmax/threshold로 class 예측",
        "전체 흐름: x → hidden → h → output → prediction"
      ],
      zoom: { required: false, reason: "출력 1단계 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["h", "W₂h + b₂", "prediction"], packet: "logit", labels: ["hidden", "출력층", "예측"] } },
      links: [{ target: "u03_s06", label: "다음: MLP 전체 구조", type: "next" }]
    },
    {
      scene_id: "u03_s06", no: "06",
      title: "MLP = Linear + Activation + Linear + …",
      title_en: "MLP Structure",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: {
        data: "입력 x",
        representation: "x → Linear → f → h₁ → Linear → f → h₂ → … → output",
        calculation_target: "각 층의 역할: 선형 변환 + 비선형 함수",
        concept_classification: "활성·비선형 · MLP 아키텍처",
        importance: { type: "difference", text: "단일 퍼셉트론(직선 1개)과 MLP(공간 변환 가능)의 구조적 차이" }
      },
      moving_object: "입력이 층을 통과하며 표현이 바뀌는 packet",
      scene_objects: [
        { id: "mlp_pipeline", type: "schematic", role: "MLP 전체 구조", visibility: "open" },
        { id: "linear_blocks", type: "procedure_block", role: "Linear 층들", visibility: "open" },
        { id: "activation_fns", type: "procedure_block", role: "f(z) — 비선형 변환", visibility: "open" }
      ],
      animation_steps: [
        "MLP 전체: x → [Linear → f] → [Linear → f] → … → output",
        "각 [Linear → f] 쌍이 하나의 표현 변환 단위",
        "층이 깊어질수록 더 복잡한 경계를 만들 수 있다",
        "\"단일 퍼셉트론 = 직선 1개, MLP = 표현 공간 변환\""
      ],
      zoom: { required: false, reason: "전체 구조 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{MLP}: h^{(l)} = f(W^{(l)} h^{(l-1)} + b^{(l)})", when_to_show: "구조 표시 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["x", "Linear+f", "h₁", "Linear+f", "output"], formula: "MLP = Linear + f + Linear + f + …", stateSlot: 2 } },
      links: [
        { target: "u03_s07", label: "다음: 층 깊이와 결정 경계", type: "next" },
        { target: "_unit:unit09", label: "재사용: Transformer FFN", type: "cross", note: "Unit 09" }
      ]
    },
    {
      scene_id: "u03_s07", no: "07",
      title: "층이 쌓이면 결정 경계가 바뀐다",
      title_en: "Depth Changes Decision Boundary",
      animation_type: ["xy_transform", "before_after_contrast"],
      five_unit_frame: {
        data: "같은 입력 데이터",
        representation: "1층 vs 2층 vs 3층의 결정 경계 비교",
        calculation_target: "층이 깊어질수록 경계가 복잡해짐",
        concept_classification: "활성·비선형 · 표현력",
        importance: { type: "strength", text: "비선형 함수를 쌓는 것이 핵심 — 함수 하나가 아니라 층 쌓기" }
      },
      moving_object: "결정 경계가 직선에서 곡선으로 바뀌는 장면",
      scene_objects: [
        { id: "boundary_1", type: "xy_coordinate", role: "1층: 직선", visibility: "open" },
        { id: "boundary_2", type: "xy_coordinate", role: "2층: 곡선", visibility: "open" },
        { id: "boundary_3", type: "xy_coordinate", role: "3층: 더 복잡한 곡선", visibility: "open" }
      ],
      animation_steps: [
        "1층: 직선 경계만 가능",
        "2층: 꺾이거나 휜 경계 가능",
        "3층: 더 복잡한 영역 분리 가능",
        "\"활성화 함수 단독이 아니라 Linear+f 쌍이 쌓이는 것이 핵심\""
      ],
      zoom: { required: false, reason: "경계 비교 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "1층 (직선)", note: "선형 경계만" }, right: { title: "3층 (곡선)", note: "복잡한 영역 분리" }, arrow: "층 추가" } },
      links: [{ target: "u03_s08", label: "요약", type: "next" }]
    },
    {
      scene_id: "u03_s08", no: "08",
      title: "MLP 요약 — formula lock",
      title_en: "MLP Summary",
      animation_type: ["formula_lock"],
      five_unit_frame: {
        data: "XOR 문제 → MLP 해결",
        representation: "전체 흐름 축약",
        calculation_target: "핵심: 선형 모델의 한계 → hidden layer → 표현 변환 → 분리 가능",
        concept_classification: "활성·비선형 · MLP",
        importance: { type: "usage", text: "이 구조가 RNN, LSTM, Transformer 내부에서 반복 사용된다" }
      },
      moving_object: "전체 흐름을 통과하는 요약 packet",
      scene_objects: [
        { id: "summary", type: "schematic", role: "문제(XOR) → 해결(MLP) 축약", visibility: "open" },
        { id: "formula_panel", type: "formula_lock", role: "h = f(Wx+b), MLP = 층 쌓기", visibility: "open" }
      ],
      animation_steps: [
        "직선 실패 → hidden layer → 새 공간 → 분리 성공 축약",
        "formula lock: h⁽ˡ⁾ = f(W⁽ˡ⁾h⁽ˡ⁻¹⁾ + b⁽ˡ⁾)",
        "\"이 패턴이 이후 모든 단원의 building block\""
      ],
      zoom: { required: false, reason: "요약 — 1 view" },
      formula_lock: { needed: true, formula: "h^{(l)} = f\\bigl(W^{(l)} h^{(l-1)} + b^{(l)}\\bigr)", when_to_show: "축약 흐름 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["XOR 실패", "hidden layer", "새 공간", "분리 성공"], formula: "h = f(Wx + b)", stateSlot: 2 } },
      links: [
        { target: "_unit:unit04", label: "다음 단원: RNN이 이걸 시간축으로 반복", type: "cross", note: "Unit 04 RNN" }
      ]
    }
  ]
};
