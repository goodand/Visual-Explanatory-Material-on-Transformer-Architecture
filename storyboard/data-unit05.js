// Unit 05 — Vanishing Gradient / LSTM (preview: 6 scenes, zoom granular)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit05 = {
  id: "unit05", no: "05", topic: 3,
  title_en: "Vanishing Gradient / LSTM",
  title_ko: "기울기 소실 · LSTM",
  core_question: "C_t와 h_t는 각각 어디에 있고, 무엇이 다음으로 이동하는가?",
  correct_framing: "Vanishing gradient는 긴 sequence에서 앞쪽 정보의 학습 신호가 뒤쪽까지 잘 전달되지 않는 문제다. LSTM은 cell state C_t와 gate를 사용해 어떤 정보를 오래 보존할지 조절한다.",
  avoid: [
    "sigmoid를 이진 결정 함수로 설명하지 않는다 — 0~1 연속값 gate로 설명한다.",
    "tanh를 단순히 요약이라고 표현하지 않는다 — 값을 -1~1 범위로 누르는 함수다.",
    "LSTM의 C_t와 h_t 위치를 혼동하지 않는다 — C_t는 위쪽 긴 통로, h_t는 아래쪽/출력."
  ],
  routing: { emphasis: "표현: C_t와 h_t, 계산 대상: gate mask", types: ["gate_mask", "packet_flow", "zoom_hierarchy", "formula_lock"] },
  importance: {
    usage: "긴 sequence에서 앞쪽 정보를 보존하며 시간 의존성을 학습한다.",
    necessity: "일반 RNN은 긴 sequence에서 gradient가 소실되어 앞쪽 정보를 학습하기 어렵다.",
    difference: "RNN h_t는 하나의 통로로 모든 정보를 전달하지만, LSTM은 C_t(장기)와 h_t(단기)를 분리한다.",
    strength: "gate가 0~1 연속값으로 정보 보존/폐기를 조절하므로 gradient 흐름이 안정적이다."
  },
  scenes: [
    // ─── S01: Vanishing Gradient bridge ───
    {
      scene_id: "u05_s01", no: "01",
      title: "RNN gradient가 뒤로 갈수록 작아진다",
      title_en: "Vanishing Gradient Bridge",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "시간 순서대로 펼친 RNN cells (t=1 ~ t=8)",
        representation: "각 시점의 gradient signal 크기",
        calculation_target: "gradient signal이 역방향으로 전달될 때 크기 변화",
        concept_classification: "순환 상태 · gradient 소실 문제",
        importance: { type: "necessity", text: "이 문제를 이해해야 LSTM gate의 존재 이유가 명확해진다" }
      },
      moving_object: "역방향으로 이동하며 작아지는 gradient packet",
      scene_objects: [
        { id: "unrolled_rnn", type: "schematic", role: "시간축으로 펼친 RNN 8 cells", visibility: "open" },
        { id: "gradient_packet", type: "hidden_state_packet", role: "역방향 gradient signal", visibility: "open" },
        { id: "shrink_annotation", type: "annotation_callout", role: "뒤로 갈수록 signal이 작아짐", visibility: "open" }
      ],
      animation_steps: [
        "시간축으로 펼친 RNN 8개 cell이 등장한다",
        "t=8에서 gradient packet이 출발한다",
        "packet이 t=7, t=6, ... 으로 역방향 이동하며 점점 작아진다",
        "t=1 근처에서 거의 사라진 gradient를 보여준다",
        "\"앞쪽 정보를 학습할 수 없다\" 교정 callout"
      ],
      zoom: { required: false, reason: "gradient 축소를 전체 timeline에서 보여주는 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["t=8 gradient", "역방향 전파", "t=1 거의 소실"], packet: "∇", labels: ["출발", "축소", "소실"] } },
      links: [
        { target: "u05_s02", label: "해결: LSTM 해부도", type: "next" },
        { target: "_unit:unit04", label: "배경: RNN h_t 전달", type: "prev", note: "Unit 04 RNN" }
      ]
    },

    // ─── S02: LSTM Anatomy Overview (all parts zoomable) ───
    {
      scene_id: "u05_s02", no: "02",
      title: "LSTM 해부도 — 모든 부분이 zoom 대상",
      title_en: "LSTM Anatomy Overview",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: {
        data: "LSTM cell에 들어오는 x_t, h_{t-1}, C_{t-1}",
        representation: "해부도: C_t 통로(위) · h_t 출력(아래) · gate 3개 · tanh 2곳 · cell update",
        calculation_target: "아직 내부 계산 전 — 구조 배치와 경로 식별",
        concept_classification: "순환 상태 · LSTM 아키텍처",
        importance: { type: "difference", text: "RNN은 h_t 하나로 전달하지만, LSTM은 C_t(장기 통로)와 h_t(단기 출력)를 분리한다" }
      },
      moving_object: "collapsed 부분 중 하나가 open되는 장면",
      prereqs: [
        { target: "_unit:unit04", concept: "h_t (hidden state)", label: "Unit 04 RNN", note: "h_t가 무엇이고 어디로 이동하는지는 RNN에서 설명됨" },
        { target: "_unit:unit02", concept: "sigmoid / tanh", label: "Unit 02 Activation", note: "sigmoid=0~1 gate, tanh=-1~1 누르기는 Activation에서 설명됨" }
      ],
      scene_objects: [
        { id: "ct_conveyor", type: "hidden_state_packet", role: "C_t — 위쪽 긴 통로 (장기 보존, 다음 시점으로 전달)", visibility: "open" },
        { id: "ht_packet", type: "hidden_state_packet", role: "h_t — 아래쪽 출력 (단기 전달, 다음 시점 + 현재 출력)", visibility: "open" },
        { id: "gates_group", type: "procedure_block", role: "forget gate · input gate · output gate (각각 sigmoid)", visibility: "collapsed" },
        { id: "tanh_candidate", type: "procedure_block", role: "tanh — 후보 cell state C̃_t 생성", visibility: "collapsed" },
        { id: "tanh_output", type: "procedure_block", role: "tanh(C_t) — output gate 앞에서 C_t를 -1~1로", visibility: "collapsed" }
      ],
      animation_steps: [
        "LSTM cell 전체 해부도가 등장한다",
        "위쪽 긴 통로: C_{t-1} → C_t (cell state, 장기 보존) 라벨",
        "아래쪽: h_{t-1} → h_t (hidden state, 단기 전달 + 현재 출력) 라벨",
        "gate 3개 위치 표시: forget(좌), input(중), output(우) — 각각 sigmoid",
        "tanh 2곳 표시: ① 후보 C̃_t 생성용, ② output gate 앞 tanh(C_t)",
        "cell update 지점: C_t = f_t × C_{t-1} + i_t × C̃_t",
        "모든 부분이 collapsed — hover/tap으로 설명, click으로 zoom"
      ],
      zoom: {
        required: true,
        reason: "LSTM 내부의 각 부분(gate 3 + tanh 2 + cell update + h_t 출력)은 별도 scene으로 zoom. 해부도에서 전체를 먼저 보고 하나씩 진입한다.",
        sequence: ["LSTM cell 해부도 (global)", "forget gate", "input gate + tanh → C̃_t", "cell update: C_t 갱신", "output gate + tanh(C_t) → h_t"],
        interaction: "anatomy"
      },
      formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: {
        levels: [
          { scope: "해부도 (Global)", blocks: [
            { label: "C_{t-1} → C_t 통로", focus: false },
            { label: "forget gate (σ)", focus: false },
            { label: "input gate (σ) + tanh → C̃_t", focus: false },
            { label: "cell update: ×,+", focus: false },
            { label: "output gate (σ) + tanh(C_t)", focus: false },
            { label: "h_t 출력", focus: false }
          ]},
          { scope: "Zoom 대상", blocks: [
            { label: "forget gate", focus: true },
            { label: "input + candidate", focus: true },
            { label: "cell update", focus: true },
            { label: "output + h_t", focus: true }
          ]},
          { scope: "각 zoom 내부", content: "sigmoid mask\ntanh 변환\n요소별 곱셈/덧셈\nformula lock" }
        ],
        focus: 0,
        breadcrumb: "LSTM 해부도 · hover/tap: 부분 설명 · click: zoom 진입"
      }},
      links: [
        { target: "u05_s01", label: "동기: vanishing gradient", type: "prev" },
        { target: "u05_s03", label: "zoom: forget gate", type: "next" },
        { target: "u05_s04", label: "zoom: input gate + tanh → C̃_t", type: "next" },
        { target: "u05_s05", label: "zoom: cell update", type: "next" },
        { target: "u05_s06", label: "zoom: output gate → h_t", type: "next" }
      ]
    },

    // ─── S03: Forget Gate ───
    {
      scene_id: "u05_s03", no: "03",
      title: "Forget Gate — C_{t-1}에서 무엇을 남길지",
      title_en: "Forget Gate · Sigmoid Mask",
      animation_type: ["gate_mask", "zoom_hierarchy"],
      five_unit_frame: {
        data: "이전 cell state C_{t-1}의 각 값",
        representation: "sigmoid 출력 f_t — 0~1 연속값 벡터",
        calculation_target: "f_t × C_{t-1} — 각 값을 얼마나 남길지 조절하는 곱셈 mask",
        concept_classification: "순환 상태 · LSTM forget gate",
        importance: { type: "usage", text: "관련 없는 과거 정보를 부분적으로 폐기하여 C_t 통로를 정리한다" }
      },
      moving_object: "sigmoid 출력 mask가 C_{t-1} 값에 곱해지는 장면",
      prereqs: [
        { target: "_unit:unit02", concept: "sigmoid", label: "Unit 02", note: "sigmoid가 0~1 연속값을 출력하는 함수라는 것은 이미 설명됨" }
      ],
      scene_objects: [
        { id: "ct_prev_values", type: "embedding_vector", role: "C_{t-1} 값들 [0.8, −0.3, 1.2, 0.5]", visibility: "open" },
        { id: "forget_sigmoid", type: "procedure_block", role: "sigmoid → f_t [0.9, 0.1, 0.7, 0.3]", visibility: "open", reuse: { type: "same-type", label: "same type", note: "sigmoid 구조는 Unit 02에서 해부됨 — 여기서는 입력/출력만" } },
        { id: "mask_multiply", type: "calculation_node", role: "f_t × C_{t-1} — 요소별 곱셈", visibility: "open" },
        { id: "ct_after_forget", type: "embedding_vector", role: "forget 후 [0.72, −0.03, 0.84, 0.15]", visibility: "open" }
      ],
      animation_steps: [
        "C_{t-1} 값들이 가로 벡터로 놓인다 [0.8, −0.3, 1.2, 0.5]",
        "sigmoid가 f_t = [0.9, 0.1, 0.7, 0.3]을 출력한다",
        "f_t 값이 bar chart로 시각화된다 — 0.9(거의 유지) ~ 0.1(거의 폐기)",
        "f_t × C_{t-1} 요소별 곱셈이 실행된다",
        "결과 [0.72, −0.03, 0.84, 0.15] — 0.1이었던 위치의 값이 거의 사라진다"
      ],
      zoom: {
        required: true,
        reason: "LSTM 해부도에서 forget gate 내부로 zoom한 상태.",
        sequence: ["LSTM 해부도", "forget gate ●", "sigmoid → mask → multiply"],
        interaction: "anatomy"
      },
      formula_lock: { needed: true, formula: "f_t = \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f)", when_to_show: "mask 곱셈 결과 표시 직후" },
      sketch: { kind: "gate_mask", params: {
        values: [0.9, 0.1, 0.7, 0.3],
        labels: ["C₁ 유지", "C₂ 폐기", "C₃ 유지", "C₄ 일부"],
        caption: "forget gate f_t · sigmoid 0~1 → C_{t-1}에 곱셈"
      }},
      links: [
        { target: "u05_s02", label: "복귀: LSTM 해부도", type: "prev" },
        { target: "u05_s04", label: "다음: input gate + candidate tanh", type: "next" },
        { target: "_unit:unit02", label: "참조: sigmoid 함수", type: "cross", note: "Unit 02 Activation" }
      ]
    },

    // ─── S04: Input Gate + Candidate tanh ───
    {
      scene_id: "u05_s04", no: "04",
      title: "Input Gate + tanh → 후보 C̃_t",
      title_en: "Input Gate · Candidate Generation",
      animation_type: ["gate_mask", "zoom_hierarchy"],
      five_unit_frame: {
        data: "현재 입력 x_t와 이전 hidden state h_{t-1}",
        representation: "tanh 출력 C̃_t (후보 cell state, -1~1 범위) + sigmoid 출력 i_t (0~1 mask)",
        calculation_target: "i_t × C̃_t — 후보 중 무엇을 cell state에 넣을지 결정",
        concept_classification: "순환 상태 · LSTM input gate",
        importance: { type: "usage", text: "새 정보를 cell state에 선택적으로 기록한다" }
      },
      moving_object: "tanh가 만든 후보 C̃_t에 input gate mask가 곱해지는 장면",
      prereqs: [
        { target: "_unit:unit02", concept: "tanh", label: "Unit 02", note: "값을 -1~1로 누르는 함수 — 재설명 없음" },
        { target: "_unit:unit02", concept: "sigmoid", label: "Unit 02", note: "0~1 gate — 재설명 없음" }
      ],
      scene_objects: [
        { id: "tanh_candidate", type: "procedure_block", role: "tanh → C̃_t [0.6, −0.9, 0.3, 0.8] — 후보 상태값을 -1~1 범위로", visibility: "open", reuse: { type: "same-type", label: "same type", note: "tanh 구조는 Unit 02에서 해부됨 — 여기서는 역할만" } },
        { id: "input_sigmoid", type: "procedure_block", role: "sigmoid → i_t [0.2, 0.8, 0.5, 0.1] — 각 후보를 얼마나 받을지", visibility: "open", reuse: { type: "same-type", label: "same type", note: "sigmoid 구조는 Unit 02 + S03 forget gate와 동일" } },
        { id: "mask_multiply", type: "calculation_node", role: "i_t × C̃_t — 선택적 기록", visibility: "open" },
        { id: "gated_candidate", type: "embedding_vector", role: "결과 [0.12, −0.72, 0.15, 0.08]", visibility: "open" }
      ],
      animation_steps: [
        "x_t와 h_{t-1}이 tanh에 들어가 후보 C̃_t = [0.6, −0.9, 0.3, 0.8]을 만든다",
        "같은 입력이 sigmoid에 들어가 i_t = [0.2, 0.8, 0.5, 0.1]을 만든다",
        "tanh는 '무엇을 넣을 수 있는지' — sigmoid는 '그 중 얼마나 넣을지'",
        "i_t × C̃_t 요소별 곱셈 → [0.12, −0.72, 0.15, 0.08]",
        "i_t=0.8인 위치의 후보가 강하게 통과, i_t=0.1인 위치는 거의 차단"
      ],
      zoom: {
        required: true,
        reason: "LSTM 해부도에서 input gate + tanh 내부로 zoom.",
        sequence: ["LSTM 해부도", "input gate + tanh ●", "sigmoid mask × tanh 후보"],
        interaction: "anatomy"
      },
      formula_lock: { needed: true, formula: "i_t = \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i), \\quad \\tilde{C}_t = \\tanh(W_C \\cdot [h_{t-1}, x_t] + b_C)", when_to_show: "mask 곱셈 결과 직후" },
      sketch: { kind: "gate_mask", params: {
        values: [0.2, 0.8, 0.5, 0.1],
        labels: ["C̃₁ 약간", "C̃₂ 많이", "C̃₃ 반", "C̃₄ 거의×"],
        caption: "input gate i_t × tanh 후보 C̃_t"
      }},
      links: [
        { target: "u05_s03", label: "이전: forget gate", type: "prev" },
        { target: "u05_s05", label: "다음: cell state 갱신", type: "next" },
        { target: "_unit:unit02", label: "참조: tanh 함수", type: "cross", note: "Unit 02 Activation" }
      ]
    },

    // ─── S05: Cell State Update ───
    {
      scene_id: "u05_s05", no: "05",
      title: "Cell State 갱신 — C_t = forget + input",
      title_en: "Cell State Update",
      animation_type: ["packet_flow", "zoom_hierarchy"],
      five_unit_frame: {
        data: "forget 후 C_{t-1} 값 + gated 후보 i_t × C̃_t",
        representation: "새 cell state C_t",
        calculation_target: "C_t = f_t × C_{t-1} + i_t × C̃_t — 요소별 덧셈",
        concept_classification: "순환 상태 · LSTM cell update",
        importance: { type: "strength", text: "덧셈 경로가 gradient를 직접 전달 — vanishing gradient 완화의 핵심" }
      },
      moving_object: "forget 결과와 input 결과가 합쳐져 새 C_t가 되는 장면",
      scene_objects: [
        { id: "ct_after_forget", type: "embedding_vector", role: "f_t × C_{t-1} = [0.72, −0.03, 0.84, 0.15]", visibility: "open" },
        { id: "gated_candidate", type: "embedding_vector", role: "i_t × C̃_t = [0.12, −0.72, 0.15, 0.08]", visibility: "open" },
        { id: "addition_node", type: "calculation_node", role: "+ 요소별 덧셈", visibility: "open" },
        { id: "ct_new", type: "hidden_state_packet", role: "새 C_t = [0.84, −0.75, 0.99, 0.23] → 다음 시점으로 전달", visibility: "open" }
      ],
      animation_steps: [
        "forget 결과 [0.72, −0.03, 0.84, 0.15]가 위에서 도착한다",
        "input 결과 [0.12, −0.72, 0.15, 0.08]가 아래에서 도착한다",
        "두 벡터가 요소별 덧셈으로 합쳐진다",
        "새 C_t = [0.84, −0.75, 0.99, 0.23]",
        "핵심 강조: 이 덧셈 경로가 gradient를 직접 전달한다"
      ],
      zoom: {
        required: true,
        reason: "LSTM 해부도에서 cell update 지점으로 zoom.",
        sequence: ["LSTM 해부도", "cell update ●", "f×C + i×C̃ = C_t"],
        interaction: "anatomy"
      },
      formula_lock: { needed: true, formula: "C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t", when_to_show: "덧셈 결과 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["f_t × C_{t-1}", "+", "C_t (새)"], packet: "C_t", labels: ["forget 결과", "덧셈", "갱신된 cell state"] } },
      links: [
        { target: "u05_s04", label: "이전: input gate + candidate", type: "prev" },
        { target: "u05_s06", label: "다음: output gate → h_t", type: "next" },
        { target: "u05_s01", label: "해결: 덧셈 경로 = gradient 직접 전달", type: "related" }
      ]
    },

    // ─── S06: Output Gate + tanh(C_t) → h_t ───
    {
      scene_id: "u05_s06", no: "06",
      title: "Output Gate + tanh(C_t) → h_t 출력",
      title_en: "Output Gate · h_t Generation",
      animation_type: ["gate_mask", "zoom_hierarchy"],
      five_unit_frame: {
        data: "갱신된 cell state C_t",
        representation: "tanh(C_t) — C_t를 -1~1로 누른 뒤, output gate mask 적용",
        calculation_target: "h_t = o_t × tanh(C_t) — cell state 중 무엇을 내보낼지 결정",
        concept_classification: "순환 상태 · LSTM output gate",
        importance: { type: "usage", text: "h_t는 현재 시점 출력이자 다음 시점의 입력으로 전달된다" }
      },
      moving_object: "C_t가 tanh를 거치고 output mask가 적용되어 h_t가 되는 장면",
      prereqs: [
        { target: "_unit:unit04", concept: "h_t 전달", label: "Unit 04 RNN", note: "h_t가 다음 시점 + 현재 출력으로 가는 것은 RNN에서 설명됨" },
        { target: "_unit:unit02", concept: "tanh / sigmoid", label: "Unit 02", note: "재설명 없음" }
      ],
      scene_objects: [
        { id: "ct_new", type: "hidden_state_packet", role: "갱신된 C_t [0.84, −0.75, 0.99, 0.23]", visibility: "open" },
        { id: "tanh_ct", type: "procedure_block", role: "tanh(C_t) → [0.69, −0.64, 0.76, 0.23]", visibility: "open", reuse: { type: "same-operation", label: "same operation", note: "같은 tanh 함수, 입력이 C_t (S04의 C̃_t 생성과 같은 연산, 다른 입력)" } },
        { id: "output_sigmoid", type: "procedure_block", role: "sigmoid → o_t [0.8, 0.4, 0.9, 0.2]", visibility: "open", reuse: { type: "same-type", label: "same type", note: "sigmoid gate — forget/input과 같은 구조, 다른 파라미터 W_o" } },
        { id: "ht_result", type: "hidden_state_packet", role: "h_t = o_t × tanh(C_t) = [0.55, −0.26, 0.68, 0.05]", visibility: "open" }
      ],
      animation_steps: [
        "갱신된 C_t가 tanh를 통과하여 -1~1 범위로 눌린다",
        "같은 시점의 x_t, h_{t-1}이 sigmoid에 들어가 o_t = [0.8, 0.4, 0.9, 0.2]를 만든다",
        "o_t × tanh(C_t) 요소별 곱셈 → h_t",
        "h_t = [0.55, −0.26, 0.68, 0.05]",
        "h_t는 두 곳으로 전달: ① 현재 출력(y_t로) ② 다음 시점(h_{t-1}으로)"
      ],
      zoom: {
        required: true,
        reason: "LSTM 해부도에서 output gate 내부로 zoom. tanh(C_t)가 별도 함수 적용인 점 주의.",
        sequence: ["LSTM 해부도", "output gate ●", "tanh(C_t) × σ → h_t"],
        interaction: "anatomy"
      },
      formula_lock: { needed: true, formula: "o_t = \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o), \\quad h_t = o_t \\odot \\tanh(C_t)", when_to_show: "h_t 결과 표시 직후" },
      sketch: { kind: "gate_mask", params: {
        values: [0.8, 0.4, 0.9, 0.2],
        labels: ["내보냄", "일부", "내보냄", "거의×"],
        caption: "output gate o_t × tanh(C_t) → h_t"
      }},
      links: [
        { target: "u05_s05", label: "이전: cell state 갱신", type: "prev" },
        { target: "u05_s02", label: "복귀: LSTM 해부도 전체", type: "related" },
        { target: "_unit:unit04", label: "비교: RNN h_t와의 차이", type: "cross", note: "Unit 04 RNN" }
      ]
    },

    // ─── S07: C_t vs h_t — 무엇이 다음 시점으로 이동하는가 ───
    {
      scene_id: "u05_s07", no: "07",
      title: "C_t vs h_t — 두 경로가 다음 시점으로 전달",
      title_en: "C_t and h_t Both Move Forward",
      animation_type: ["packet_flow", "before_after_contrast"],
      five_unit_frame: {
        data: "현재 시점의 C_t와 h_t",
        representation: "C_t → 위쪽 통로로 다음 시점 C_{t-1}이 됨 / h_t → 아래쪽으로 다음 시점 h_{t-1}이 됨",
        calculation_target: "두 값이 모두 다음 시점의 입력으로 전달됨",
        concept_classification: "순환 상태 · 이중 전달 경로",
        importance: { type: "difference", text: "RNN은 h_t 하나만 전달하지만 LSTM은 C_t(장기)와 h_t(단기) 두 경로를 분리한다" }
      },
      moving_object: "C_t packet과 h_t packet이 동시에 다음 cell로 이동",
      scene_objects: [
        { id: "ct_packet", type: "hidden_state_packet", role: "C_t → 다음 시점 C_{t-1} (위쪽 통로, 장기 보존)", visibility: "open" },
        { id: "ht_packet", type: "hidden_state_packet", role: "h_t → 다음 시점 h_{t-1} (아래쪽, 단기 전달)", visibility: "open" },
        { id: "yt_branch", type: "data_token", role: "y_t ↑ 현재 출력 (h_t에서 분기)", visibility: "open" },
        { id: "dual_path_callout", type: "comparison_pair_object", role: "C_t = 장기 기억 통로 / h_t = 단기 작업 기억", visibility: "open" }
      ],
      animation_steps: [
        "현재 cell에서 C_t가 위쪽 통로를 통해 다음 cell로 이동한다",
        "같은 cell에서 h_t가 아래쪽으로 다음 cell에 전달된다",
        "h_t에서 y_t가 위로 분기한다 (현재 출력)",
        "RNN과 비교: RNN은 h_t 하나 / LSTM은 C_t + h_t 이중 경로",
        "C_t 통로의 덧셈 경로가 gradient를 안정적으로 전달한다"
      ],
      zoom: { required: false, reason: "두 경로 비교 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "C_t (위쪽 통로)", note: "장기 보존\n덧셈 경로 = gradient 안정" }, right: { title: "h_t (아래쪽)", note: "단기 전달 + y_t 출력\ngate로 필터링된 값" }, arrow: "동시 전달" } },
      links: [
        { target: "u05_s06", label: "이전: output gate → h_t", type: "prev" },
        { target: "u05_s08", label: "다음: RNN vs LSTM 비교", type: "next" }
      ]
    },

    // ─── S08: RNN vs LSTM 대조 ───
    {
      scene_id: "u05_s08", no: "08",
      title: "RNN vs LSTM — 구조 비교",
      title_en: "RNN vs LSTM Comparison",
      animation_type: ["before_after_contrast"],
      prereqs: [
        { target: "_unit:unit04", concept: "RNN 전체 구조", label: "Unit 04", note: "RNN cell과 h_t 전달은 이미 설명됨" }
      ],
      five_unit_frame: {
        data: "같은 입력 sequence",
        representation: "왼쪽 RNN(h_t 1개) vs 오른쪽 LSTM(C_t + h_t + gates)",
        calculation_target: "구조적 차이: 전달 경로 수, gate 유무",
        concept_classification: "순환 상태 · 아키텍처 비교",
        importance: { type: "difference", text: "LSTM이 gate와 C_t를 추가해 vanishing gradient를 완화한다" }
      },
      moving_object: "두 구조를 나란히 비교하는 장면",
      scene_objects: [
        { id: "rnn_panel", type: "schematic", role: "RNN: x_t + h_{t-1} → tanh → h_t (1경로)", visibility: "open" },
        { id: "lstm_panel", type: "schematic", role: "LSTM: C_t 통로 + h_t + gate 3개 (2경로)", visibility: "open" },
        { id: "diff_callout", type: "comparison_pair_object", role: "전달 경로 1개 vs 2개, gate 없음 vs 있음", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽: RNN — h_t 1경로, gate 없음",
        "오른쪽: LSTM — C_t + h_t 2경로, forget/input/output gate",
        "gradient 흐름: RNN은 곱셈 반복으로 소실 / LSTM은 C_t 덧셈 경로로 안정",
        "\"LSTM = RNN + C_t 통로 + gate 조절\""
      ],
      zoom: { required: false, reason: "좌우 대조 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "RNN", note: "h_t 1경로\ngate 없음\n긴 seq → gradient 소실" }, right: { title: "LSTM", note: "C_t + h_t 2경로\ngate 3개\n덧셈 → gradient 안정" }, arrow: "비교" } },
      links: [
        { target: "u05_s09", label: "다음: LSTM unroll", type: "next" }
      ]
    },

    // ─── S09: LSTM Unroll — 시간축 ───
    {
      scene_id: "u05_s09", no: "09",
      title: "LSTM unroll — 시간축에서 C_t와 h_t가 이동",
      title_en: "LSTM Unroll Along Time",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "token sequence [x_1, x_2, x_3]",
        representation: "시간축으로 펼친 LSTM cells — C_t와 h_t가 동시에 이동",
        calculation_target: "각 시점에서 gate가 C_t와 h_t를 갱신",
        concept_classification: "순환 상태 · LSTM 시간 전개",
        importance: { type: "usage", text: "같은 gate 파라미터가 모든 시점에서 재사용된다" }
      },
      moving_object: "C_t와 h_t packet이 시간축을 따라 이동",
      scene_objects: [
        { id: "unrolled_lstm", type: "schematic", role: "시간축 LSTM cells 3개", visibility: "open" },
        { id: "ct_flow", type: "hidden_state_packet", role: "C_t — 위쪽 통로 흐름", visibility: "open" },
        { id: "ht_flow", type: "hidden_state_packet", role: "h_t — 아래쪽 흐름", visibility: "open" },
        { id: "gate_labels", type: "annotation_callout", role: "각 cell 내 gate는 collapsed (same type)", visibility: "collapsed", reuse: { type: "same-type", label: "same type", note: "gate 구조는 S03-S06에서 해부됨" } }
      ],
      animation_steps: [
        "LSTM cell 3개가 시간축으로 펼쳐진다",
        "C_0 → C_1 → C_2 → C_3 위쪽 통로 흐름",
        "h_0 → h_1 → h_2 → h_3 아래쪽 흐름",
        "각 cell의 gate는 collapsed — same type badge",
        "\"모든 시점에서 같은 gate 파라미터 공유\""
      ],
      zoom: { required: false, reason: "시간축 흐름 — 1 view (gate는 이미 해부됨)" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["cell₁", "cell₂", "cell₃"], packet: "C_t + h_t", labels: ["t=1", "t=2", "t=3"] } },
      links: [
        { target: "u05_s08", label: "이전: RNN vs LSTM", type: "prev" },
        { target: "u05_s10", label: "다음: formula lock", type: "next" }
      ]
    },

    // ─── S10: LSTM Formula Lock ───
    {
      scene_id: "u05_s10", no: "10",
      title: "LSTM 전체 수식 요약",
      title_en: "LSTM Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: {
        data: "x_t, h_{t-1}, C_{t-1}",
        representation: "gate 3개 + cell update + h_t 출력 — 전체 수식",
        calculation_target: "이미 본 gate 동작을 수식으로 압축",
        concept_classification: "순환 상태 · LSTM",
        importance: { type: "usage", text: "이 구조 위에 Seq2Seq(Unit 06)와 Attention(Unit 07)이 올라간다" }
      },
      moving_object: "전체 수식이 순서대로 고정되는 장면",
      scene_objects: [
        { id: "formula_panel", type: "formula_lock", role: "LSTM 6줄 수식", visibility: "open" },
        { id: "gate_mapping", type: "annotation_callout", role: "각 줄 ↔ S03~S06 대응", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit '표현' slot", visibility: "open" }
      ],
      animation_steps: [
        "f_t = σ(…) — forget gate (→ S03)",
        "i_t = σ(…), C̃_t = tanh(…) — input gate + candidate (→ S04)",
        "C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t — cell update (→ S05)",
        "o_t = σ(…), h_t = o_t ⊙ tanh(C_t) — output gate (→ S06)",
        "각 수식 옆에 해당 scene 번호 참조 표시"
      ],
      zoom: { required: false, reason: "수식 요약 — 1 view" },
      formula_lock: { needed: true, formula: "f_t = \\sigma(\\cdot), \\quad i_t = \\sigma(\\cdot), \\quad \\tilde{C}_t = \\tanh(\\cdot) \\\\ C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t \\\\ o_t = \\sigma(\\cdot), \\quad h_t = o_t \\odot \\tanh(C_t)", when_to_show: "gate 대응 표시 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["forget", "input+tanh", "C_t update", "output→h_t"], formula: "C_t = f⊙C + i⊙C̃,  h_t = o⊙tanh(C_t)", stateSlot: 2 } },
      links: [
        { target: "u05_s02", label: "복귀: LSTM 해부도", type: "related" },
        { target: "_unit:unit06", label: "다음 단원: Seq2Seq", type: "cross", note: "Unit 06" }
      ]
    }
  ]
};
