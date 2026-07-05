// Unit 02 — Activation Function / Softmax Basics (9 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit02 = {
  id: "unit02", no: "02", topic: 2,
  title_en: "Activation Function / Softmax Basics",
  title_ko: "활성화 함수 · Softmax 기초",
  core_question: "활성화 함수는 '무엇을 활성화'하는가?",
  correct_framing: "활성화 함수는 층이 아니라 함수다. 선형 계산 결과를 받아 다음 층으로 넘길 값을 만든다.",
  avoid: [
    "활성화 함수가 데이터를 '펴는 주체'라고 단독으로 표현하지 않는다.",
    "sigmoid를 이진 결정 함수로 설명하지 않는다 — 0~1 연속값 출력이다.",
    "tanh를 단순히 요약이라고 표현하지 않는다 — 값을 -1~1로 누르는 함수다."
  ],
  routing: { emphasis: "계산 대상: z와 a=f(z), vector → distribution", types: ["value_squash_curve", "xy_transform", "formula_lock"] },
  importance: {
    usage: "RNN(tanh), LSTM(sigmoid gate + tanh), Attention(softmax), 출력층 등 모든 후속 단원에서 재사용된다.",
    necessity: "선형 계산만으로는 복잡한 패턴을 학습할 수 없다 — 비선형 변환이 필수다.",
    difference: "sigmoid(0~1), tanh(-1~1), ReLU(음수 제거), softmax(벡터→확률분포)는 각각 역할이 다르다.",
    strength: "이 단원에서 한 번 정확히 잡으면 이후 단원에서 재설명 없이 참조만 하면 된다."
  },
  scenes: [
    {
      scene_id: "u02_s01", no: "01",
      title: "선형 계산 z = Wx + b",
      title_en: "Linear Computation z",
      animation_type: ["xy_transform"],
      five_unit_frame: {
        data: "입력 x와 학습되는 곱셈 계수 W, offset b",
        representation: "선형 출력 z — 직선/평면",
        calculation_target: "z = Wx + b — 곱하고 더하는 계산",
        concept_classification: "활성·비선형 · 선형 계산",
        importance: { type: "necessity", text: "활성화 함수의 입력이 무엇인지 먼저 고정해야 한다" }
      },
      moving_object: "입력 x가 W와 곱해지고 b가 더해져 z가 되는 packet",
      scene_objects: [
        { id: "input_x", type: "data_token", role: "입력값 x", visibility: "open" },
        { id: "weight_w", type: "parameter_block", role: "W — 학습되는 곱셈 계수", visibility: "open" },
        { id: "bias_b", type: "parameter_block", role: "b — 더해지는 offset", visibility: "open" },
        { id: "output_z", type: "embedding_vector", role: "z = Wx + b", visibility: "open" }
      ],
      animation_steps: [
        "입력 x가 왼쪽에 놓인다",
        "W가 x에 곱해진다 (기울기 결정)",
        "b가 더해진다 (절편 이동)",
        "결과 z가 직선 위의 점으로 표시된다",
        "\"이 z가 활성화 함수의 입력이 된다\""
      ],
      zoom: { required: false, reason: "선형 계산 1단계 — 1 view" },
      formula_lock: { needed: true, formula: "z = Wx + b", when_to_show: "z 계산 직후" },
      sketch: { kind: "xy_transform", params: { points: [{ x: 0.3, y: 0.25, label: "x", near: false }, { x: 0.7, y: 0.65, label: "z=Wx+b", near: true }], pair: [0, 1] } },
      links: [
        { target: "u02_s02", label: "다음: sigmoid로 z를 누른다", type: "next" }
      ]
    },
    {
      scene_id: "u02_s02", no: "02",
      title: "sigmoid — 0~1로 누르기",
      title_en: "Sigmoid Squash",
      animation_type: ["value_squash_curve"],
      five_unit_frame: {
        data: "선형 출력 z (큰 음수 ~ 큰 양수)",
        representation: "sigmoid(z) — 0과 1 사이의 연속값",
        calculation_target: "큰 음수 → 0 근처, 큰 양수 → 1 근처로 눌림",
        concept_classification: "활성·비선형 · sigmoid",
        importance: { type: "usage", text: "LSTM gate(Unit 05), 이진 분류 출력에서 재사용된다" }
      },
      moving_object: "z 값이 sigmoid 곡선을 따라 0~1로 눌리는 점",
      scene_objects: [
        { id: "sigmoid_curve", type: "xy_coordinate", role: "sigmoid 곡선 (S자)", visibility: "open" },
        { id: "z_input", type: "data_token", role: "입력 z 값", visibility: "open" },
        { id: "a_output", type: "embedding_vector", role: "출력 a = σ(z) ∈ (0,1)", visibility: "open" }
      ],
      animation_steps: [
        "sigmoid S자 곡선이 등장한다",
        "z = −3 → σ(z) ≈ 0.05 (0 근처로 눌림)",
        "z = 0 → σ(z) = 0.5 (중간)",
        "z = 3 → σ(z) ≈ 0.95 (1 근처로 눌림)",
        "\"0과 1 사이 연속값 — 이진 결정이 아니다\""
      ],
      zoom: { required: false, reason: "곡선 1개 — 1 view" },
      formula_lock: { needed: true, formula: "\\sigma(z) = \\frac{1}{1 + e^{-z}}", when_to_show: "값 눌림 시연 직후" },
      sketch: { kind: "_generic", params: { kind: "sigmoid curve" } },
      links: [
        { target: "u02_s03", label: "다음: tanh", type: "next" },
        { target: "_unit:unit05", label: "재사용: LSTM gate", type: "cross", note: "Unit 05 LSTM" }
      ]
    },
    {
      scene_id: "u02_s03", no: "03",
      title: "tanh — -1~1로 누르기",
      title_en: "Tanh Squash",
      animation_type: ["value_squash_curve"],
      five_unit_frame: {
        data: "선형 출력 z",
        representation: "tanh(z) — -1과 1 사이의 연속값",
        calculation_target: "큰 음수 → -1, 큰 양수 → 1, 0 → 0",
        concept_classification: "활성·비선형 · tanh",
        importance: { type: "usage", text: "RNN h_t(Unit 04), LSTM 후보 C̃_t(Unit 05)에서 재사용된다" }
      },
      moving_object: "z 값이 tanh 곡선을 따라 -1~1로 눌리는 점",
      scene_objects: [
        { id: "tanh_curve", type: "xy_coordinate", role: "tanh 곡선 (원점 대칭 S자)", visibility: "open" },
        { id: "z_input", type: "data_token", role: "입력 z 값", visibility: "open" },
        { id: "a_output", type: "embedding_vector", role: "출력 a = tanh(z) ∈ (-1,1)", visibility: "open" }
      ],
      animation_steps: [
        "tanh 곡선이 등장한다 (원점 대칭)",
        "z = −3 → tanh(z) ≈ -0.995",
        "z = 0 → tanh(z) = 0",
        "z = 3 → tanh(z) ≈ 0.995",
        "sigmoid와의 차이: 출력 범위가 -1~1 (음수 포함)"
      ],
      zoom: { required: false, reason: "곡선 1개 — 1 view" },
      formula_lock: { needed: true, formula: "\\tanh(z) = \\frac{e^z - e^{-z}}{e^z + e^{-z}}", when_to_show: "값 눌림 시연 직후" },
      sketch: { kind: "_generic", params: { kind: "tanh curve" } },
      links: [
        { target: "u02_s02", label: "비교: sigmoid (0~1)", type: "related" },
        { target: "u02_s04", label: "다음: ReLU", type: "next" },
        { target: "_unit:unit04", label: "재사용: RNN h_t = tanh(...)", type: "cross", note: "Unit 04" }
      ]
    },
    {
      scene_id: "u02_s04", no: "04",
      title: "ReLU — 음수 제거, 양수 유지",
      title_en: "ReLU",
      animation_type: ["value_squash_curve"],
      five_unit_frame: {
        data: "선형 출력 z",
        representation: "ReLU(z) = max(0, z)",
        calculation_target: "음수 → 0, 양수 → 그대로 유지",
        concept_classification: "활성·비선형 · ReLU",
        importance: { type: "usage", text: "MLP hidden layer, Transformer FFN block(Unit 09)에서 가장 많이 사용된다" }
      },
      moving_object: "z 값이 ReLU 꺾인 선을 따라 변환되는 점",
      scene_objects: [
        { id: "relu_curve", type: "xy_coordinate", role: "ReLU — 꺾인 선 (0에서 꺾임)", visibility: "open" },
        { id: "z_input", type: "data_token", role: "입력 z 값", visibility: "open" },
        { id: "a_output", type: "embedding_vector", role: "출력 a = max(0, z)", visibility: "open" }
      ],
      animation_steps: [
        "ReLU 꺾인 선이 등장한다",
        "z = −2 → ReLU = 0 (음수 제거)",
        "z = 0 → ReLU = 0 (경계)",
        "z = 3 → ReLU = 3 (양수 유지)",
        "sigmoid/tanh와의 차이: 양수는 눌리지 않고 그대로 통과"
      ],
      zoom: { required: false, reason: "곡선 1개 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{ReLU}(z) = \\max(0, z)", when_to_show: "값 변환 시연 직후" },
      sketch: { kind: "_generic", params: { kind: "ReLU curve" } },
      links: [
        { target: "u02_s05", label: "다음: 세 함수 비교", type: "next" },
        { target: "_unit:unit09", label: "재사용: Transformer FFN", type: "cross", note: "Unit 09" }
      ]
    },
    {
      scene_id: "u02_s05", no: "05",
      title: "세 함수 비교 — sigmoid vs tanh vs ReLU",
      title_en: "Comparison: sigmoid / tanh / ReLU",
      animation_type: ["before_after_contrast"],
      five_unit_frame: {
        data: "같은 z 값 범위",
        representation: "세 곡선 나란히 — 출력 범위와 모양 차이",
        calculation_target: "같은 입력에 대해 각 함수의 출력 차이",
        concept_classification: "활성·비선형 · 함수 비교",
        importance: { type: "difference", text: "어떤 상황에서 어떤 함수를 쓰는지 구분하는 기준" }
      },
      moving_object: "같은 z 값이 세 곡선을 동시에 통과하는 점",
      scene_objects: [
        { id: "three_curves", type: "xy_coordinate", role: "세 곡선 overlay", visibility: "open" },
        { id: "range_labels", type: "annotation_callout", role: "sigmoid(0,1) / tanh(-1,1) / ReLU(0,∞)", visibility: "open" },
        { id: "use_case_labels", type: "classification_object", role: "gate용 / 상태값용 / hidden layer용", visibility: "open" }
      ],
      animation_steps: [
        "세 곡선이 같은 좌표에 겹쳐 표시된다",
        "z = −3, 0, 3 에서 각 함수의 출력을 비교한다",
        "출력 범위 라벨: sigmoid(0,1), tanh(-1,1), ReLU(0,∞)",
        "용도 라벨: sigmoid=gate, tanh=상태값, ReLU=hidden layer"
      ],
      zoom: { required: false, reason: "비교 overlay — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "입력 z", note: "같은 값 범위" }, right: { title: "출력 비교", note: "σ(0,1) · tanh(-1,1) · ReLU(0,∞)" }, arrow: "f(z)" } },
      links: [
        { target: "u02_s06", label: "다음: 활성화 함수의 역할", type: "next" }
      ]
    },
    {
      scene_id: "u02_s06", no: "06",
      title: "활성화 함수는 '층'이 아니라 '함수'",
      title_en: "Activation = Function, Not Layer",
      animation_type: ["before_after_contrast"],
      correction: "활성화 함수 하나가 데이터를 '펴는 주체'가 아니라, 선형 변환과 비선형 함수가 층으로 쌓이며 표현 공간을 바꾼다.",
      five_unit_frame: {
        data: "선형 계산 결과 z",
        representation: "z → a = f(z) 변환",
        calculation_target: "함수 적용 — 층 추가와 구분",
        concept_classification: "활성·비선형 · 역할 교정",
        importance: { type: "necessity", text: "활성화 함수를 독립 층처럼 오해하면 MLP 구조를 잘못 세게 된다" }
      },
      moving_object: "z → f(z) → a 변환 흐름",
      scene_objects: [
        { id: "linear_block", type: "procedure_block", role: "Linear: z = Wx + b", visibility: "open" },
        { id: "activation_fn", type: "procedure_block", role: "f(z) — 함수 적용 (층이 아님)", visibility: "open" },
        { id: "correction_callout", type: "annotation_callout", role: "단독 주체가 아님 — 선형+비선형이 쌓여야 효과", visibility: "open" }
      ],
      animation_steps: [
        "Linear block → z 출력",
        "f(z) 함수가 z를 비선형 변환",
        "\"이것은 별도 층이 아니라 함수 적용\"",
        "\"선형 변환 + 비선형 함수가 층으로 쌓여야 표현 공간이 바뀐다\""
      ],
      zoom: { required: false, reason: "교정 장면 — 1 view" },
      formula_lock: { needed: true, formula: "a = f(z) = f(Wx + b)", when_to_show: "교정 callout 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["z = Wx + b", "f(z)", "a"], packet: "값", labels: ["선형 계산", "함수 적용", "출력"] } },
      links: [
        { target: "u02_s07", label: "다음: softmax", type: "next" },
        { target: "_unit:unit03", label: "연결: MLP 층 쌓기", type: "cross", note: "Unit 03 MLP" }
      ]
    },
    {
      scene_id: "u02_s07", no: "07",
      title: "Softmax — 벡터 → 확률 분포",
      title_en: "Softmax: Vector to Probability Distribution",
      animation_type: ["value_squash_curve"],
      five_unit_frame: {
        data: "logit 벡터 [2.0, 1.0, 0.1]",
        representation: "확률 분포 [0.659, 0.242, 0.099] — 합이 1",
        calculation_target: "각 원소를 exp로 키운 뒤 전체 합으로 나누기",
        concept_classification: "활성·비선형 · softmax",
        importance: { type: "usage", text: "Attention distribution(Unit 07), output probability(Unit 11)에서 재사용" }
      },
      moving_object: "logit 벡터가 확률 분포로 변환되는 장면",
      scene_objects: [
        { id: "logit_vector", type: "embedding_vector", role: "logit [2.0, 1.0, 0.1]", visibility: "open" },
        { id: "exp_step", type: "procedure_block", role: "exp → [7.39, 2.72, 1.11]", visibility: "open" },
        { id: "normalize_step", type: "procedure_block", role: "÷ sum → [0.659, 0.242, 0.099]", visibility: "open" },
        { id: "prob_dist", type: "distribution_row", role: "확률 분포 (합 = 1)", visibility: "open" }
      ],
      animation_steps: [
        "logit 벡터 [2.0, 1.0, 0.1]이 놓인다",
        "각 값에 exp를 적용 → [7.39, 2.72, 1.11]",
        "전체 합(11.22)으로 나눈다",
        "결과 [0.659, 0.242, 0.099] — 합이 정확히 1",
        "sigmoid와의 차이: sigmoid는 값 1개를 0~1로, softmax는 벡터 전체를 확률 분포로"
      ],
      zoom: { required: false, reason: "벡터 변환 1단계 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{softmax}(z_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}", when_to_show: "확률 분포 완성 직후" },
      sketch: { kind: "before_after_contrast", params: { left: { title: "logit 벡터", note: "[2.0, 1.0, 0.1]" }, right: { title: "확률 분포", note: "[0.659, 0.242, 0.099] Σ=1" }, arrow: "softmax" } },
      links: [
        { target: "u02_s08", label: "다음: softmax vs sigmoid 비교", type: "next" },
        { target: "_unit:unit07", label: "재사용: attention distribution", type: "cross", note: "Unit 07" },
        { target: "_unit:unit11", label: "재사용: output probability", type: "cross", note: "Unit 11" }
      ]
    },
    {
      scene_id: "u02_s08", no: "08",
      title: "Softmax vs Sigmoid — 입력과 출력 차이",
      title_en: "Softmax vs Sigmoid",
      animation_type: ["before_after_contrast"],
      five_unit_frame: {
        data: "같은 값을 sigmoid와 softmax에 넣었을 때",
        representation: "sigmoid: 값 1개 → 스칼라(0,1) / softmax: 벡터 전체 → 분포(합=1)",
        calculation_target: "입력 단위와 출력 구조의 차이",
        concept_classification: "활성·비선형 · 함수 비교",
        importance: { type: "difference", text: "sigmoid는 gate용, softmax는 확률 분포 생성용으로 역할이 다르다" }
      },
      moving_object: "같은 값이 두 함수를 통과하며 결과가 달라지는 장면",
      scene_objects: [
        { id: "sigmoid_panel", type: "xy_coordinate", role: "sigmoid: 개별 값 → (0,1) 스칼라", visibility: "open" },
        { id: "softmax_panel", type: "xy_coordinate", role: "softmax: 벡터 전체 → 분포(합=1)", visibility: "open" },
        { id: "diff_callout", type: "comparison_pair_object", role: "gate(독립) vs 분포(경쟁)", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽: sigmoid — 값 하나를 독립적으로 0~1로 변환",
        "오른쪽: softmax — 벡터 전체를 서로 경쟁하는 확률로 변환",
        "sigmoid: 여러 값이 모두 0.9일 수 있다 (독립)",
        "softmax: 하나가 높으면 나머지는 낮아진다 (경쟁/정규화)",
        "용도 정리: sigmoid=gate, softmax=확률 선택"
      ],
      zoom: { required: false, reason: "좌우 대조 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "sigmoid", note: "값 1개 → (0,1)\n독립 · gate용" }, right: { title: "softmax", note: "벡터 → 분포(Σ=1)\n경쟁 · 확률용" }, arrow: "차이" } },
      links: [
        { target: "u02_s09", label: "다음: 전체 요약 formula lock", type: "next" }
      ]
    },
    {
      scene_id: "u02_s09", no: "09",
      title: "활성화 함수 전체 요약 — formula lock",
      title_en: "Activation Summary Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: {
        data: "선형 출력 z",
        representation: "a = f(z) — f는 sigmoid, tanh, ReLU, softmax 중 하나",
        calculation_target: "이미 본 네 함수를 하나의 패턴으로 압축",
        concept_classification: "활성·비선형",
        importance: { type: "usage", text: "이후 단원에서 이 네 함수는 이름만 언급하고 재설명하지 않는다" }
      },
      moving_object: "네 함수가 한 줄로 정렬되는 요약",
      scene_objects: [
        { id: "summary_grid", type: "schematic", role: "네 함수: sigmoid(gate), tanh(상태), ReLU(hidden), softmax(분포)", visibility: "open" },
        { id: "formula_panel", type: "formula_lock", role: "z = Wx + b, a = f(z)", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit 중 '계산 대상' slot", visibility: "open" }
      ],
      animation_steps: [
        "네 함수가 역할 라벨과 함께 한 줄로 정렬된다",
        "공통 패턴: z → f(z) → a",
        "하단 formula lock: z = Wx + b, a = f(z)",
        "\"이후 단원에서는 함수 이름만 참조 — canonical 설명은 여기\"",
        "5-Unit state bar에서 '계산 대상' slot 표시"
      ],
      zoom: { required: false, reason: "요약 — 1 view" },
      formula_lock: { needed: true, formula: "z = Wx + b, \\quad a = f(z)", when_to_show: "네 함수 정렬 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["σ(gate)", "tanh(상태)", "ReLU(hidden)", "softmax(분포)"], formula: "z = Wx + b,  a = f(z)", stateSlot: 3 } },
      links: [
        { target: "_unit:unit03", label: "다음 단원: MLP가 이 함수를 쌓는다", type: "cross", note: "Unit 03" }
      ]
    }
  ]
};
