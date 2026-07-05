// Unit 04 — RNN (8 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit04 = {
  id: "unit04", no: "04", topic: 3,
  title_en: "RNN",
  title_ko: "RNN — h_t는 무엇이 움직이는가",
  core_question: "RNN이 이전 상태를 기억한다는 말은 실제로 무엇이 움직인다는 뜻인가?",
  correct_framing: "다음 셀로 넘어가는 핵심 값은 h_t다. y_t는 현재 시점의 출력이고, 다음 시점의 내부 기억으로 직접 이어지는 값은 아니다.",
  avoid: [
    "RNN에서 다음 셀로 y_t가 넘어간다고 설명하지 않는다 — 핵심은 h_t다.",
    "hidden layer와 hidden state를 혼동하지 않는다 — hidden layer는 구조, hidden state는 시점별 값이다.",
    "\"기억한다\"를 추상적으로 쓰지 않는다 — h_t라는 숫자 리스트가 다음 시점으로 전달되는 것이다."
  ],
  routing: { emphasis: "표현: h_t hidden state packet", types: ["packet_flow", "zoom_hierarchy", "formula_lock"] },
  importance: {
    usage: "시퀀스 데이터(문장, 시계열)에서 시간 순서 정보를 처리하는 기본 구조다.",
    necessity: "MLP는 각 입력을 독립 처리하지만, RNN은 이전 시점 정보를 h_t로 전달하여 순서를 반영한다.",
    difference: "h_t는 다음 시점으로 전달되는 중간 계산값 리스트이고, y_t는 현재 시점의 출력일 뿐이다.",
    strength: "같은 파라미터(W_x, W_h)를 모든 시점에서 공유하므로 가변 길이 입력을 처리할 수 있다."
  },
  scenes: [
    {
      scene_id: "u04_s01", no: "01",
      title: "접힌 RNN cell 1개",
      title_en: "Single RNN Cell (Folded)",
      animation_type: ["zoom_hierarchy"],
      prereqs: [
        { target: "_unit:unit01", concept: "x_t (embedding vector)", label: "Unit 01", note: "입력 token이 embedding vector로 변환되는 과정은 이미 설명됨" },
        { target: "_unit:unit02", concept: "tanh", label: "Unit 02", note: "tanh 함수는 이미 해부됨" }
      ],
      five_unit_frame: {
        data: "입력 x_t와 이전 hidden state h_{t-1}",
        representation: "RNN cell 블록 — 내부에 tanh 연산",
        calculation_target: "아직 내부 계산 전 — cell 구조 식별",
        concept_classification: "순환 상태 · RNN cell",
        importance: { type: "necessity", text: "cell 1개의 입출력을 먼저 고정해야 unroll이 이해된다" }
      },
      moving_object: "cell block 안으로 x_t와 h_{t-1}이 들어가는 장면",
      scene_objects: [
        { id: "rnn_cell", type: "schematic", role: "RNN cell 블록 (접힌 상태)", visibility: "open" },
        { id: "input_xt", type: "data_token", role: "x_t — 현재 시점 입력", visibility: "open" },
        { id: "prev_ht", type: "hidden_state_packet", role: "h_{t-1} — 이전 시점 중간 계산값", visibility: "open" },
        { id: "output_ht", type: "hidden_state_packet", role: "h_t — 새 중간 계산값", visibility: "open" },
        { id: "output_yt", type: "data_token", role: "y_t — 현재 시점 출력", visibility: "open" }
      ],
      animation_steps: [
        "RNN cell 블록이 중앙에 등장한다",
        "왼쪽에서 x_t가 cell에 들어간다",
        "아래에서 h_{t-1}이 cell에 들어간다",
        "오른쪽으로 h_t가 나온다 (다음 시점으로 전달)",
        "위쪽으로 y_t가 나온다 (현재 출력 — h_t와 구분)"
      ],
      zoom: { required: false, reason: "cell 1개 입출력 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["x_t + h_{t-1}", "RNN cell", "h_t / y_t"], packet: "h_t", labels: ["입력", "cell", "출력"] } },
      links: [{ target: "u04_s02", label: "다음: unroll", type: "next" }]
    },
    {
      scene_id: "u04_s02", no: "02",
      title: "시간축으로 펼친다 — unroll",
      title_en: "Unroll Along Time",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: {
        data: "token sequence [x_1, x_2, x_3, x_4]",
        representation: "같은 cell이 시간축으로 복제된 모습",
        calculation_target: "각 시점에 같은 파라미터(W_x, W_h)가 재사용됨",
        concept_classification: "순환 상태 · RNN unroll",
        importance: { type: "difference", text: "같은 cell의 복사가 아니라, 같은 파라미터를 시간 순서대로 적용하는 것" }
      },
      moving_object: "접힌 cell이 시간축으로 펼쳐지는 장면",
      scene_objects: [
        { id: "folded_cell", type: "schematic", role: "접힌 RNN cell", visibility: "collapsed" },
        { id: "unrolled_cells", type: "schematic", role: "시점별 cell 4개 (같은 파라미터)", visibility: "open" },
        { id: "param_badge", type: "annotation_callout", role: "W_x, W_h — 모든 시점에서 공유", visibility: "open" }
      ],
      animation_steps: [
        "접힌 cell 1개가 왼쪽에 있다",
        "시간축(→)으로 펼쳐져 cell 4개가 일렬로 놓인다",
        "각 cell에 같은 W_x, W_h 라벨이 표시된다",
        "\"같은 파라미터, 다른 시점 — same type badge\"",
        "각 cell 사이에 h_t 전달 화살표가 생긴다"
      ],
      zoom: { required: false, reason: "펼침 1단계 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: {
        levels: [
          { scope: "접힌", blocks: [{ label: "RNN cell", focus: true }] },
          { scope: "펼침", blocks: [{ label: "t=1", focus: false }, { label: "t=2", focus: false }, { label: "t=3", focus: false }, { label: "t=4", focus: false }] },
          { scope: "공유", content: "W_x, W_h\nsame type\n모든 시점" }
        ],
        focus: 1,
        breadcrumb: "RNN cell → unroll along time"
      }},
      links: [
        { target: "u04_s01", label: "이전: 접힌 cell", type: "prev" },
        { target: "u04_s03", label: "다음: x_t 입력 흐름", type: "next" }
      ]
    },
    {
      scene_id: "u04_s03", no: "03",
      title: "x_t가 각 셀에 들어간다",
      title_en: "Input x_t at Each Timestep",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "embedding vector sequence [x_1, x_2, x_3, x_4]",
        representation: "각 시점의 cell에 해당 x_t가 입력됨",
        calculation_target: "x_t → cell — 시점별 입력 대응",
        concept_classification: "순환 상태 · 입력 흐름",
        importance: { type: "necessity", text: "각 시점마다 다른 x_t가 들어가는 것 — 파라미터가 공유되는 것과 구분" }
      },
      moving_object: "x_t packet이 해당 시점 cell로 이동하는 장면",
      scene_objects: [
        { id: "token_sequence", type: "token_list", role: "[x_1, x_2, x_3, x_4]", visibility: "open" },
        { id: "unrolled_cells", type: "schematic", role: "시점별 cell 4개", visibility: "open", reuse: { type: "same-type", label: "same type" } }
      ],
      animation_steps: [
        "token sequence가 위에 놓인다",
        "x_1이 첫 번째 cell로, x_2가 두 번째 cell로 … 순차 이동",
        "각 cell이 해당 시점의 x_t를 받는다",
        "\"파라미터는 같지만 입력은 시점마다 다르다\""
      ],
      zoom: { required: false, reason: "입력 대응 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["x_1 · x_2 · x_3 · x_4", "cell₁ cell₂ cell₃ cell₄", "각 cell에 입력"], packet: "x_t", labels: ["tokens", "cells", "대응"] } },
      links: [{ target: "u04_s04", label: "다음: h_t 전달", type: "next" }]
    },
    {
      scene_id: "u04_s04", no: "04",
      title: "h_{t-1} → cell → h_t — 핵심 이동",
      title_en: "Hidden State Packet Flow",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "이전 시점 중간 계산값 h_{t-1}과 현재 입력 x_t",
        representation: "h_t — 새 중간 계산값 리스트",
        calculation_target: "h_{t-1}과 x_t를 받아 h_t를 만들고, 다음 셀로 전달",
        concept_classification: "순환 상태 · hidden state 전달",
        importance: { type: "usage", text: "이 h_t 전달이 RNN의 '기억'의 실체 — 추상적 기억이 아니라 숫자 리스트의 이동" }
      },
      moving_object: "h_t packet이 cell을 나와 다음 cell로 이동",
      scene_objects: [
        { id: "ht_packet", type: "hidden_state_packet", role: "h_t — 다음 시점으로 전달되는 중간 계산값", visibility: "open" },
        { id: "cell_t", type: "schematic", role: "현재 cell", visibility: "open", reuse: { type: "same-type", label: "same type" } },
        { id: "cell_t1", type: "schematic", role: "다음 cell", visibility: "open", reuse: { type: "same-type", label: "same type" } }
      ],
      animation_steps: [
        "h_{t-1} packet이 cell_t에 도착한다",
        "cell_t 안에서 x_t와 결합된다",
        "h_t packet이 생성되어 cell_t를 나온다",
        "h_t가 cell_{t+1}으로 이동한다",
        "\"이 이동이 RNN의 기억 = 숫자 리스트의 전달\""
      ],
      zoom: { required: false, reason: "packet 이동 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["h_{t-1}", "cell_t", "h_t → cell_{t+1}"], packet: "h_t", labels: ["이전 상태", "현재 cell", "다음으로 전달"] } },
      links: [{ target: "u04_s05", label: "다음: h_t vs y_t 구분", type: "next" }]
    },
    {
      scene_id: "u04_s05", no: "05",
      title: "h_t ≠ y_t — 핵심 구분",
      title_en: "h_t vs y_t Separation",
      animation_type: ["before_after_contrast"],
      correction: "y_t는 현재 시점의 출력이고, 다음 시점의 내부 기억으로 직접 이어지는 값은 아니다. 핵심은 h_t다.",
      five_unit_frame: {
        data: "cell_t의 두 출력",
        representation: "h_t (→ 다음 cell) vs y_t (↑ 현재 출력)",
        calculation_target: "h_t는 cell 사이 전달, y_t는 외부 출력 — 방향이 다르다",
        concept_classification: "순환 상태 · h_t vs y_t",
        importance: { type: "necessity", text: "이 구분을 안 하면 '다음 셀로 y_t가 넘어간다'는 오해가 생긴다" }
      },
      moving_object: "h_t와 y_t가 다른 방향으로 분기하는 장면",
      scene_objects: [
        { id: "cell_t", type: "schematic", role: "RNN cell", visibility: "open", reuse: { type: "same-type", label: "same type" } },
        { id: "ht_arrow", type: "hidden_state_packet", role: "h_t → 다음 cell (수평 이동)", visibility: "open" },
        { id: "yt_arrow", type: "data_token", role: "y_t ↑ 현재 출력 (수직 분리)", visibility: "open" },
        { id: "diff_callout", type: "comparison_pair_object", role: "h_t = 내부 기억 전달 / y_t = 외부 출력", visibility: "open" }
      ],
      animation_steps: [
        "cell에서 h_t가 오른쪽(→ 다음 cell)으로 나간다",
        "같은 cell에서 y_t가 위쪽(↑ 외부 출력)으로 나간다",
        "두 화살표의 방향 차이를 강조한다",
        "\"h_t = 다음 시점에 전달되는 기억, y_t = 현재 시점의 예측 출력\"",
        "교정: '다음 셀로 y_t가 넘어간다'는 오해"
      ],
      zoom: { required: false, reason: "방향 분기 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "h_t →", note: "다음 cell로 전달\n내부 기억" }, right: { title: "y_t ↑", note: "현재 출력\n외부로 분리" }, arrow: "≠" } },
      links: [
        { target: "u04_s06", label: "다음: cell 내부 계산", type: "next" },
        { target: "_unit:unit05", label: "확장: LSTM은 C_t와 h_t 분리", type: "cross", note: "Unit 05" }
      ]
    },
    {
      scene_id: "u04_s06", no: "06",
      title: "Cell 내부 — tanh(W_x·x_t + W_h·h_{t-1} + b)",
      title_en: "RNN Cell Internal Computation",
      animation_type: ["zoom_hierarchy"],
      prereqs: [
        { target: "_unit:unit02", concept: "tanh", label: "Unit 02", note: "tanh 함수 자체는 이미 해부됨 — 여기서는 입력/출력만" }
      ],
      five_unit_frame: {
        data: "x_t와 h_{t-1}",
        representation: "W_x·x_t + W_h·h_{t-1} + b → z → tanh(z) → h_t",
        calculation_target: "두 입력을 각각 W로 곱하고 더한 뒤 tanh로 눌러 h_t를 만든다",
        concept_classification: "순환 상태 · RNN 내부 계산",
        importance: { type: "usage", text: "이 계산이 모든 시점에서 같은 W_x, W_h로 반복된다" }
      },
      moving_object: "z가 tanh를 통과하여 h_t가 되는 장면",
      scene_objects: [
        { id: "wx_multiply", type: "calculation_node", role: "W_x · x_t", visibility: "open" },
        { id: "wh_multiply", type: "calculation_node", role: "W_h · h_{t-1}", visibility: "open" },
        { id: "addition", type: "calculation_node", role: "+ b → z", visibility: "open" },
        { id: "tanh_fn", type: "procedure_block", role: "tanh(z) → h_t", visibility: "open", reuse: { type: "same-type", label: "same type", note: "tanh 구조는 Unit 02에서 해부됨" } }
      ],
      animation_steps: [
        "x_t에 W_x를 곱한다",
        "h_{t-1}에 W_h를 곱한다",
        "두 결과를 더하고 b를 더해 z를 만든다",
        "z가 tanh를 통과하여 h_t = tanh(z)가 된다",
        "\"W_x, W_h는 학습되는 곱셈 계수 — 모든 시점에서 공유\""
      ],
      zoom: {
        required: true,
        reason: "RNN cell 내부로 zoom — S01의 cell block 안을 열어본다.",
        sequence: ["RNN cell (collapsed)", "cell 내부 ●", "W_x·x + W_h·h + b → tanh → h_t"],
        interaction: "anatomy"
      },
      formula_lock: { needed: true, formula: "h_t = \\tanh(W_x x_t + W_h h_{t-1} + b)", when_to_show: "tanh 통과 직후" },
      sketch: { kind: "zoom_hierarchy", params: {
        levels: [
          { scope: "RNN cell", blocks: [{ label: "x_t", focus: false }, { label: "h_{t-1}", focus: false }, { label: "→ h_t", focus: false }] },
          { scope: "내부 계산", blocks: [{ label: "W_x · x_t", focus: true }, { label: "W_h · h_{t-1}", focus: true }, { label: "+ b → tanh", focus: true }] },
          { scope: "출력", content: "h_t = tanh(z)\n→ 다음 cell" }
        ],
        focus: 1,
        breadcrumb: "RNN › cell 내부 › W·x + W·h + b → tanh"
      }},
      links: [
        { target: "u04_s05", label: "이전: h_t vs y_t", type: "prev" },
        { target: "u04_s07", label: "다음: hidden layer vs hidden state", type: "next" }
      ]
    },
    {
      scene_id: "u04_s07", no: "07",
      title: "Hidden layer ≠ hidden state — 교정",
      title_en: "Hidden Layer vs Hidden State",
      animation_type: ["before_after_contrast"],
      correction: "hidden layer는 MLP의 중간 층(구조), hidden state는 RNN 시점별 중간 계산값(값)이다.",
      five_unit_frame: {
        data: "MLP의 hidden layer vs RNN의 h_t",
        representation: "구조(layer) vs 값(state) 대조",
        calculation_target: "같은 'hidden'이라는 단어지만 가리키는 대상이 다르다",
        concept_classification: "순환 상태 · 용어 교정",
        importance: { type: "necessity", text: "이 혼동을 안 잡으면 Transformer hidden state(Unit 09)에서 다시 헷갈린다" }
      },
      moving_object: "두 개념이 나란히 놓여 차이가 드러나는 장면",
      scene_objects: [
        { id: "mlp_layer", type: "schematic", role: "MLP hidden layer — 구조 (노드들의 층)", visibility: "open" },
        { id: "rnn_state", type: "hidden_state_packet", role: "RNN h_t — 값 (시점별 숫자 리스트)", visibility: "open" },
        { id: "diff_callout", type: "comparison_pair_object", role: "layer = 구조 / state = 시점별 값", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽: MLP hidden layer — 노드들의 구조적 층",
        "오른쪽: RNN h_t — 특정 시점의 숫자 리스트",
        "\"같은 hidden이지만 layer(구조) ≠ state(값)\"",
        "\"Transformer에서도 hidden state라는 용어가 다시 나온다 — 여기서 고정\""
      ],
      zoom: { required: false, reason: "좌우 대조 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Hidden Layer", note: "MLP의 중간 층\n구조 (structure)" }, right: { title: "Hidden State", note: "RNN의 h_t\n시점별 값 (value)" }, arrow: "≠" } },
      links: [
        { target: "u04_s08", label: "다음: formula lock 요약", type: "next" },
        { target: "_unit:unit09", label: "재등장: Transformer hidden state", type: "cross", note: "Unit 09" }
      ]
    },
    {
      scene_id: "u04_s08", no: "08",
      title: "RNN 요약 — formula lock",
      title_en: "RNN Summary Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: {
        data: "전체 RNN 흐름",
        representation: "x_t + h_{t-1} → cell → h_t → next cell / y_t ↑",
        calculation_target: "h_t = tanh(W_x x_t + W_h h_{t-1} + b), y_t = g(h_t)",
        concept_classification: "순환 상태 · RNN",
        importance: { type: "usage", text: "LSTM(Unit 05)이 이 구조에 C_t 통로와 gate를 추가한다" }
      },
      moving_object: "전체 흐름을 통과하는 요약 packet",
      scene_objects: [
        { id: "rnn_summary", type: "schematic", role: "RNN 전체 흐름 축약", visibility: "open" },
        { id: "formula_panel", type: "formula_lock", role: "h_t = tanh(…), y_t = g(h_t)", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit '표현' slot", visibility: "open" }
      ],
      animation_steps: [
        "접힌 cell → unroll → h_t 전달 → y_t 분리 축약 흐름",
        "formula lock: h_t = tanh(W_x x_t + W_h h_{t-1} + b)",
        "보조: y_t = g(h_t) — 현재 출력은 h_t에서 파생",
        "\"다음 단원: h_t만으로는 긴 sequence에서 gradient 소실\""
      ],
      zoom: { required: false, reason: "요약 — 1 view" },
      formula_lock: { needed: true, formula: "h_t = \\tanh(W_x x_t + W_h h_{t-1} + b), \\quad y_t = g(h_t)", when_to_show: "축약 흐름 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["x_t", "h_{t-1}", "cell", "h_t→", "y_t↑"], formula: "h_t = tanh(W_x x_t + W_h h_{t-1} + b)", stateSlot: 2 } },
      links: [
        { target: "_unit:unit05", label: "다음 단원: Vanishing Gradient → LSTM", type: "cross", note: "Unit 05" }
      ]
    }
  ]
};
