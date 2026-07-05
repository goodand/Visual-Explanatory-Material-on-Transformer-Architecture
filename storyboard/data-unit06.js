// Unit 06 — Seq2Seq / Encoder-Decoder Motivation (7 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit06 = {
  id: "unit06", no: "06", topic: 3,
  title_en: "Seq2Seq / Encoder-Decoder Motivation",
  title_ko: "Seq2Seq · 인코더-디코더 동기",
  core_question: "Encoder-Decoder 구조는 왜 필요한가?",
  correct_framing: "입력 sequence와 출력 sequence의 길이와 역할이 다를 때, 입력을 처리하는 encoder와 출력을 생성하는 decoder를 나누는 구조가 필요하다.",
  avoid: [
    "Encoder-Decoder를 Transformer 전용 구조처럼 설명하지 않는다 — RNN/LSTM 기반 Seq2Seq가 먼저 등장했다.",
    "context vector를 '요약'이라고 추상적으로 표현하지 않는다 — 마지막 hidden state라는 구체적 값이다.",
    "Attention 없는 기본 Seq2Seq의 한계를 건너뛰지 않는다 — 이 병목이 Attention의 동기다."
  ],
  routing: { emphasis: "표현: input sequence state → context/encoder states → decoder state", types: ["packet_flow", "zoom_hierarchy", "before_after_contrast"] },
  importance: {
    usage: "기계 번역, 요약, 대화 생성 등 입출력 길이가 다른 모든 seq-to-seq 작업의 기본 구조다.",
    necessity: "RNN/LSTM 단독으로는 입력과 출력의 길이·역할이 다른 작업을 처리할 수 없다.",
    difference: "Encoder는 입력을 이해하고, Decoder는 출력을 생성한다 — 역할 분리가 핵심이다.",
    strength: "이 구조를 이해해야 Attention(Unit 07)이 왜 encoder states를 직접 참조하는지 알 수 있다."
  },
  scenes: [
    {
      scene_id: "u06_s01", no: "01",
      title: "입출력 길이가 다른 문제",
      title_en: "Variable Length Input/Output",
      animation_type: ["before_after_contrast"],
      prereqs: [
        { target: "_unit:unit04", concept: "RNN sequence 처리", label: "Unit 04", note: "RNN이 시점별로 x_t를 받아 h_t를 전달하는 구조는 이미 설명됨" }
      ],
      five_unit_frame: {
        data: "입력: \"나는 학생이다\" (3 tokens) / 출력: \"I am a student\" (4 tokens)",
        representation: "입력과 출력이 길이·언어가 다른 sequence 쌍",
        calculation_target: "하나의 RNN으로 이걸 어떻게 처리하는가?",
        concept_classification: "순환 상태 · Seq2Seq 동기",
        importance: { type: "necessity", text: "같은 길이만 처리하는 RNN으로는 이 문제를 풀 수 없다" }
      },
      moving_object: "입력과 출력 sequence의 길이 차이를 보여주는 장면",
      scene_objects: [
        { id: "input_seq", type: "token_list", role: "입력: 나는 · 학생이다 (3 tokens)", visibility: "open" },
        { id: "output_seq", type: "token_list", role: "출력: I · am · a · student (4 tokens)", visibility: "open" },
        { id: "length_mismatch", type: "annotation_callout", role: "길이가 다르다 — 1:1 대응 불가", visibility: "open" }
      ],
      animation_steps: [
        "입력 sequence (3 tokens)가 위에 놓인다",
        "출력 sequence (4 tokens)가 아래에 놓인다",
        "길이 차이가 강조된다",
        "\"하나의 RNN cell 반복으로는 입출력 매핑이 안 된다\""
      ],
      zoom: { required: false, reason: "문제 정의 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "입력 (3 tokens)", note: "나는 · 학생이다" }, right: { title: "출력 (4 tokens)", note: "I · am · a · student" }, arrow: "길이 ≠" } },
      links: [{ target: "u06_s02", label: "해결: Encoder-Decoder 분리", type: "next" }]
    },
    {
      scene_id: "u06_s02", no: "02",
      title: "Encoder — 입력을 hidden states로 변환",
      title_en: "Encoder Processes Input",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "입력 token sequence [x_1, x_2, x_3]",
        representation: "encoder hidden states [h_1, h_2, h_3]",
        calculation_target: "각 시점의 RNN/LSTM cell이 x_t와 h_{t-1}으로 h_t를 만든다",
        concept_classification: "순환 상태 · Encoder",
        importance: { type: "usage", text: "encoder는 입력을 이해하는 역할 — 출력 생성은 하지 않는다" }
      },
      moving_object: "입력 token이 encoder cells을 통과하며 h_t가 쌓이는 장면",
      scene_objects: [
        { id: "input_tokens", type: "token_list", role: "x_1, x_2, x_3", visibility: "open" },
        { id: "encoder_cells", type: "schematic", role: "encoder RNN/LSTM cells (3개)", visibility: "open", reuse: { type: "same-type", label: "same type", note: "RNN/LSTM cell 구조는 Unit 04/05에서 해부됨" } },
        { id: "encoder_states", type: "hidden_state_packet", role: "H = [h_1, h_2, h_3]", visibility: "open" }
      ],
      animation_steps: [
        "입력 tokens가 왼쪽에 놓인다",
        "encoder cells이 시간축으로 펼쳐진다",
        "각 token이 해당 cell에 입력되고 h_t가 생성된다",
        "최종 encoder states H = [h_1, h_2, h_3]가 쌓인다"
      ],
      zoom: { required: false, reason: "encoder 흐름 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["x_1 · x_2 · x_3", "encoder cells", "H = [h_1, h_2, h_3]"], packet: "h_t", labels: ["입력", "encoder", "states"] } },
      links: [{ target: "u06_s03", label: "다음: context vector 병목", type: "next" }]
    },
    {
      scene_id: "u06_s03", no: "03",
      title: "Context vector — 마지막 h_n 하나로 압축",
      title_en: "Context Vector Bottleneck",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "encoder hidden states [h_1, h_2, h_3]",
        representation: "context vector c = h_3 (마지막 hidden state)",
        calculation_target: "입력 전체 정보를 고정 길이 벡터 하나로 압축",
        concept_classification: "순환 상태 · 병목",
        importance: { type: "necessity", text: "이 압축이 긴 입력에서 정보 손실을 만든다 — Attention의 동기" }
      },
      moving_object: "여러 h_t가 하나의 c로 수렴하는 장면",
      scene_objects: [
        { id: "encoder_states", type: "hidden_state_packet", role: "[h_1, h_2, h_3]", visibility: "open" },
        { id: "context_vector", type: "hidden_state_packet", role: "c = h_3 — 고정 길이 벡터 1개", visibility: "open" },
        { id: "bottleneck_callout", type: "annotation_callout", role: "긴 sequence → 벡터 1개 = 정보 손실 가능", visibility: "open" }
      ],
      animation_steps: [
        "encoder states [h_1, h_2, h_3]가 놓인다",
        "마지막 state h_3만 context vector c로 추출된다",
        "h_1, h_2의 정보는 h_3에 간접적으로만 남아있다",
        "\"입력이 길어질수록 앞쪽 정보가 희석된다\"",
        "병목 강조: 고정 길이 벡터 1개로 모든 입력을 표현해야 한다"
      ],
      zoom: { required: false, reason: "압축 과정 — 1 view" },
      formula_lock: { needed: true, formula: "c = h_n = \\text{encoder}(x_1, \\ldots, x_n)", when_to_show: "병목 강조 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["h_1 · h_2 · h_3", "→", "c = h_3"], packet: "c", labels: ["encoder states", "압축", "context vector"] } },
      links: [
        { target: "u06_s04", label: "다음: decoder가 c로 생성", type: "next" },
        { target: "_unit:unit07", label: "해결: Attention이 병목 완화", type: "cross", note: "Unit 07" }
      ]
    },
    {
      scene_id: "u06_s04", no: "04",
      title: "Decoder — context + 이전 출력으로 다음 token 생성",
      title_en: "Decoder Generates Output",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "context vector c + 이전 출력 token y_{t-1}",
        representation: "decoder hidden state s_t",
        calculation_target: "s_t = f(c, y_{t-1}, s_{t-1}) → y_t 생성",
        concept_classification: "순환 상태 · Decoder",
        importance: { type: "usage", text: "decoder는 한 번에 token 하나를 생성하며 autoregressive로 반복한다" }
      },
      moving_object: "decoder cell에서 y_t가 생성되어 다시 입력으로 돌아가는 loop",
      scene_objects: [
        { id: "context_c", type: "hidden_state_packet", role: "c — encoder에서 받은 context", visibility: "open" },
        { id: "prev_output", type: "data_token", role: "y_{t-1} — 이전에 생성한 token", visibility: "open" },
        { id: "decoder_cell", type: "schematic", role: "decoder RNN/LSTM cell", visibility: "open", reuse: { type: "same-type", label: "same type", note: "RNN/LSTM cell — Unit 04/05에서 해부됨" } },
        { id: "output_yt", type: "data_token", role: "y_t — 생성된 다음 token", visibility: "open" }
      ],
      animation_steps: [
        "context vector c가 decoder에 입력된다",
        "[BOS] token이 첫 입력으로 들어간다",
        "decoder cell이 s_1을 만들고 y_1을 출력한다",
        "y_1이 다시 다음 시점의 입력이 된다 (autoregressive)",
        "[EOS]가 출력되면 생성 종료"
      ],
      zoom: { required: false, reason: "decoder 흐름 — 1 view" },
      formula_lock: { needed: true, formula: "s_t = f(c, y_{t-1}, s_{t-1}), \\quad y_t = g(s_t)", when_to_show: "autoregressive loop 표시 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["c + y_{t-1}", "decoder cell", "y_t → 다시 입력"], packet: "y_t", labels: ["context+이전출력", "decoder", "생성→loop"] } },
      links: [
        { target: "u06_s03", label: "이전: context vector", type: "prev" },
        { target: "u06_s05", label: "다음: 전체 Seq2Seq 흐름", type: "next" },
        { target: "_unit:unit01", label: "참조: BOS/EOS", type: "cross", note: "Unit 01 S07" }
      ]
    },
    {
      scene_id: "u06_s05", no: "05",
      title: "Seq2Seq 전체 흐름 — Encoder → c → Decoder",
      title_en: "Full Seq2Seq Pipeline",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: {
        data: "입력 sequence → 출력 sequence",
        representation: "Encoder → context vector → Decoder → output tokens",
        calculation_target: "전체 파이프라인을 한 화면에서 조망",
        concept_classification: "순환 상태 · Seq2Seq 아키텍처",
        importance: { type: "usage", text: "이 구조가 Transformer Encoder-Decoder의 원형이다" }
      },
      moving_object: "입력이 encoder를 통과하고 decoder에서 출력이 생성되는 전체 흐름",
      scene_objects: [
        { id: "encoder_block", type: "schematic", role: "Encoder (collapsed)", visibility: "collapsed", reuse: { type: "same-type", label: "same type" } },
        { id: "context_c", type: "hidden_state_packet", role: "context vector c", visibility: "open" },
        { id: "decoder_block", type: "schematic", role: "Decoder (collapsed)", visibility: "collapsed", reuse: { type: "same-type", label: "same type" } },
        { id: "output_seq", type: "token_list", role: "출력: I · am · a · student", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽: Encoder block (collapsed) ← 입력 sequence",
        "가운데: context vector c (벡터 1개)",
        "오른쪽: Decoder block (collapsed) → 출력 sequence",
        "전체 흐름이 한 화면에 표시된다"
      ],
      zoom: { required: false, reason: "전체 파이프라인 조망 — 1 view (encoder/decoder는 이미 해부됨)" },
      formula_lock: { needed: true, formula: "H = \\text{Enc}(x_1,\\ldots,x_n), \\quad c = h_n, \\quad y_t = \\text{Dec}(c, y_{<t})", when_to_show: "전체 흐름 표시 직후" },
      sketch: { kind: "zoom_hierarchy", params: {
        levels: [
          { scope: "Encoder", blocks: [{ label: "x_1…x_n → H", focus: false }] },
          { scope: "Context", blocks: [{ label: "c = h_n", focus: true }] },
          { scope: "Decoder", blocks: [{ label: "c + y_{<t} → y_t", focus: false }] }
        ],
        focus: 1,
        breadcrumb: "Seq2Seq: Encoder → c → Decoder"
      }},
      links: [{ target: "u06_s06", label: "다음: 병목 문제", type: "next" }]
    },
    {
      scene_id: "u06_s06", no: "06",
      title: "병목: 긴 입력 → 벡터 1개 = 정보 손실",
      title_en: "Bottleneck Problem",
      animation_type: ["before_after_contrast"],
      five_unit_frame: {
        data: "짧은 입력(3 tokens) vs 긴 입력(20 tokens)",
        representation: "같은 크기의 context vector c",
        calculation_target: "입력 길이가 달라도 c는 같은 차원 — 긴 입력에서 정보 압축 손실",
        concept_classification: "순환 상태 · Seq2Seq 한계",
        importance: { type: "necessity", text: "이 병목이 Attention의 등장 동기다" }
      },
      moving_object: "긴 입력이 좁은 c로 압축되며 정보가 손실되는 장면",
      scene_objects: [
        { id: "short_input", type: "token_list", role: "3 tokens → c (충분)", visibility: "open" },
        { id: "long_input", type: "token_list", role: "20 tokens → c (같은 크기 — 정보 손실)", visibility: "open" },
        { id: "bottleneck_visual", type: "comparison_pair_object", role: "넓은 입력 → 좁은 병목", visibility: "open" }
      ],
      animation_steps: [
        "짧은 입력 3 tokens → c: 정보 대부분 보존",
        "긴 입력 20 tokens → 같은 크기 c: 앞쪽 정보 희석",
        "병목 시각화: 넓은 통로가 좁은 지점을 통과",
        "\"Decoder가 필요할 때 encoder states를 직접 참조할 수 있다면?\""
      ],
      zoom: { required: false, reason: "대조 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "3 tokens → c", note: "충분한 용량" }, right: { title: "20 tokens → c", note: "같은 크기 — 정보 손실" }, arrow: "병목" } },
      links: [
        { target: "u06_s07", label: "다음: Attention 동기 연결", type: "next" }
      ]
    },
    {
      scene_id: "u06_s07", no: "07",
      title: "해결 동기 — Attention이 encoder states를 직접 참조",
      title_en: "Motivation for Attention",
      animation_type: ["before_after_contrast", "packet_flow"],
      five_unit_frame: {
        data: "encoder hidden states H = [h_1, …, h_n]",
        representation: "Decoder가 매 시점마다 H 전체를 참조하여 필요한 정보를 선택",
        calculation_target: "c 하나 대신 H 전체에 대한 가중 합을 사용",
        concept_classification: "순환 상태 · Attention 동기",
        importance: { type: "strength", text: "context vector 병목을 없애고 입력 길이에 관계없이 관련 정보에 접근 가능" }
      },
      moving_object: "decoder가 H의 여러 h_i에 화살표로 연결되는 장면",
      scene_objects: [
        { id: "old_path", type: "schematic", role: "기존: H → c(h_n만) → Decoder", visibility: "collapsed" },
        { id: "new_path", type: "schematic", role: "Attention: Decoder가 H 전체를 매 시점 참조", visibility: "open" },
        { id: "attention_arrows", type: "annotation_callout", role: "각 decoder 시점이 encoder states에 가중치를 줘서 조합", visibility: "open" }
      ],
      animation_steps: [
        "기존 방식: H → h_n만 추출 → c → Decoder (collapsed)",
        "새 방식: Decoder가 매 시점마다 H = [h_1,…,h_n] 전체를 참조",
        "각 h_i에 대한 attention weight가 생긴다",
        "가중 합으로 해당 시점에 필요한 정보를 선택적으로 가져온다",
        "\"이것이 다음 단원 Attention의 시작점\""
      ],
      zoom: { required: false, reason: "동기 연결 — 1 view" },
      formula_lock: { needed: true, formula: "H = [h_1, \\ldots, h_n], \\quad s_t = f(s_{t-1}, y_{t-1}, \\text{Attn}(s_{t-1}, H))", when_to_show: "Attention 화살표 표시 직후" },
      sketch: { kind: "before_after_contrast", params: { left: { title: "기존 Seq2Seq", note: "c = h_n 병목\n긴 입력 → 정보 손실" }, right: { title: "+ Attention", note: "H 전체 참조\n시점마다 선택적 접근" }, arrow: "해결" } },
      links: [
        { target: "u06_s06", label: "이전: 병목 문제", type: "prev" },
        { target: "_unit:unit07", label: "다음 단원: Attention 메커니즘", type: "cross", note: "Unit 07" }
      ]
    }
  ]
};
