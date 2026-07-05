// Unit 07 — Attention (9 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit07 = {
  id: "unit07", no: "07", topic: 4,
  title_en: "Attention",
  title_ko: "어텐션 — V를 섞는 비율",
  core_question: "Attention distribution은 계산된 뒤 실제로 어디에 쓰이는가?",
  correct_framing: "Attention distribution은 단순 중요도 표시가 아니다. V(value)들을 섞는 비율이다.",
  avoid: [
    "Attention distribution을 '중요도 표시'로 끝내지 않는다 — 반드시 V를 섞는 비율로 보여줘야 한다.",
    "Q, K, V를 한 화면에서 동시에 모든 계산을 보여주지 않는다 — scene별 분리.",
    "score와 distribution을 혼동하지 않는다 — score는 dot product 결과, distribution은 softmax 후 합=1."
  ],
  routing: { emphasis: "계산 대상: QK score row, attention distribution, V weighted sum", types: ["matrix_build", "heatmap_focus", "row_to_weighted_sum", "formula_lock"] },
  importance: {
    usage: "Transformer의 핵심 메커니즘 — Self-Attention, Cross-Attention 모두 이 패턴을 따른다.",
    necessity: "Seq2Seq context vector 병목(Unit 06)을 해결하기 위해 encoder states를 선택적으로 참조한다.",
    difference: "RNN은 h_t에 모든 정보를 압축하지만, Attention은 필요한 위치의 정보를 직접 가져온다.",
    strength: "입력 길이에 관계없이 관련 정보에 동적으로 접근할 수 있다."
  },
  scenes: [
    {
      scene_id: "u07_s01", no: "01",
      title: "토큰들이 한 줄로 놓인다",
      title_en: "Token Sequence Layout",
      animation_type: ["packet_flow"],
      prereqs: [
        { target: "_unit:unit01", concept: "embedding vector x_t", label: "Unit 01", note: "토큰이 embedding vector로 변환되는 과정은 이미 설명됨" }
      ],
      five_unit_frame: {
        data: "token sequence — 각 토큰은 embedding vector",
        representation: "hidden states 리스트 (또는 초기 embedding vectors)",
        calculation_target: "아직 계산 전 — 토큰 배치",
        concept_classification: "어텐션 · 입력 준비",
        importance: { type: "necessity", text: "Attention은 이 토큰들 사이의 관계를 계산한다" }
      },
      moving_object: "token vector가 한 줄로 배치되는 장면",
      scene_objects: [
        { id: "token_row", type: "token_list", role: "token vectors [t_1, t_2, t_3, t_4]", visibility: "open" }
      ],
      animation_steps: [
        "token embedding vectors가 한 줄로 놓인다",
        "각 vector는 d차원 숫자 리스트",
        "\"이 토큰들 사이에서 어떤 관계를 계산할까?\""
      ],
      zoom: { required: false, reason: "배치 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["t_1", "t_2 · t_3", "t_4"], packet: "vector", labels: ["token 1", "token 2·3", "token 4"] } },
      links: [{ target: "u07_s02", label: "다음: Q, K, V 생성", type: "next" }]
    },
    {
      scene_id: "u07_s02", no: "02",
      title: "각 토큰에서 Q, K, V가 만들어진다",
      title_en: "Q, K, V Projection",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "token vector t_i",
        representation: "Q_i = t_i·W_Q, K_i = t_i·W_K, V_i = t_i·W_V",
        calculation_target: "같은 token vector에 서로 다른 projection matrix를 곱해 3개 벡터 생성",
        concept_classification: "어텐션 · Q/K/V projection",
        importance: { type: "necessity", text: "Q(질문), K(키), V(값)의 역할 분리가 Attention의 핵심 구조" }
      },
      moving_object: "token vector가 3개 Linear를 통과하여 Q, K, V로 분기",
      scene_objects: [
        { id: "token_vector", type: "embedding_vector", role: "t_i — 현재 token vector", visibility: "open" },
        { id: "linear_wq", type: "procedure_block", role: "Linear W_Q → Q_i", visibility: "open", postprocess: "", reuse: { type: "same-type", label: "same type", note: "Linear 구조는 동일, 파라미터 W가 다름" } },
        { id: "linear_wk", type: "procedure_block", role: "Linear W_K → K_i", visibility: "collapsed", postprocess: "", reuse: { type: "same-type", label: "same type" } },
        { id: "linear_wv", type: "procedure_block", role: "Linear W_V → V_i", visibility: "collapsed", postprocess: "", reuse: { type: "same-type", label: "same type" } }
      ],
      animation_steps: [
        "token vector t_i가 3개 경로로 분기한다",
        "W_Q Linear → Q_i (\"이 token이 무엇을 찾고 있는가\")",
        "W_K Linear → K_i (\"이 token이 무엇을 제공하는가\")",
        "W_V Linear → V_i (\"이 token의 실제 정보\")",
        "3개 Linear는 same type — 구조 동일, 파라미터(W)만 다름",
        "모든 Linear 뒤에 활성화 함수 없음 (no activation)"
      ],
      zoom: { required: false, reason: "3분기 — 1 view" },
      formula_lock: { needed: true, formula: "Q = XW_Q, \\quad K = XW_K, \\quad V = XW_V", when_to_show: "3분기 직후" },
      sketch: { kind: "zoom_hierarchy", params: {
        levels: [
          { scope: "입력", blocks: [{ label: "t_i", focus: true }] },
          { scope: "Projection", blocks: [{ label: "W_Q → Q", focus: true }, { label: "W_K → K", focus: false }, { label: "W_V → V", focus: false }] },
          { scope: "역할", content: "Q: 질문\nK: 키\nV: 값\nno activation" }
        ],
        focus: 1,
        breadcrumb: "token → Q, K, V projection"
      }},
      links: [
        { target: "u07_s03", label: "다음: 하나의 query에 집중", type: "next" }
      ]
    },
    {
      scene_id: "u07_s03", no: "03",
      title: "하나의 query token만 focus",
      title_en: "Focus One Query",
      animation_type: ["heatmap_focus"],
      five_unit_frame: {
        data: "Q_2 (token 2의 query vector)",
        representation: "Q_2가 모든 K와 비교할 준비",
        calculation_target: "한 번에 하나의 query만 focus — 나머지는 collapsed",
        concept_classification: "어텐션 · query focus",
        importance: { type: "necessity", text: "전체 Q×K 행렬을 한꺼번에 보면 복잡 — 한 query row씩 분리" }
      },
      moving_object: "token 2의 Q vector가 중앙에 focus되는 장면",
      scene_objects: [
        { id: "all_tokens", type: "token_list", role: "t_1, t_2, t_3, t_4", visibility: "open" },
        { id: "focused_q", type: "embedding_vector", role: "Q_2 — focus된 query", visibility: "open" },
        { id: "all_keys", type: "token_list", role: "K_1, K_2, K_3, K_4 — 비교 대상", visibility: "open" }
      ],
      animation_steps: [
        "4개 token이 놓여있다",
        "token 2의 Q_2가 focus 표시된다 (중앙, 굵은 테두리)",
        "나머지 Q_1, Q_3, Q_4는 dim 처리",
        "\"이 Q_2가 모든 K와 dot product를 한다\""
      ],
      zoom: { required: false, reason: "focus 선택 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "_generic", params: { kind: "query focus · Q_2" } },
      links: [{ target: "u07_s04", label: "다음: Q·K dot product", type: "next" }]
    },
    {
      scene_id: "u07_s04", no: "04",
      title: "Q · K dot product → score row",
      title_en: "QK Dot Product",
      animation_type: ["matrix_build"],
      prereqs: [
        { target: "_unit:unit02", concept: "softmax", label: "Unit 02", note: "softmax 함수 자체는 이미 해부됨 — 다음 scene에서 적용" }
      ],
      five_unit_frame: {
        data: "Q_2와 모든 K [K_1, K_2, K_3, K_4]",
        representation: "score row [s_21, s_22, s_23, s_24]",
        calculation_target: "Q_2 · K_i / √d_k — 각 key와의 유사도 점수",
        concept_classification: "어텐션 · score 계산",
        importance: { type: "usage", text: "이 score가 softmax를 거쳐 attention distribution이 된다" }
      },
      moving_object: "Q_2가 각 K와 dot product하여 score가 생기는 장면",
      scene_objects: [
        { id: "q2_vector", type: "embedding_vector", role: "Q_2", visibility: "open" },
        { id: "k_vectors", type: "token_list", role: "[K_1, K_2, K_3, K_4]", visibility: "open" },
        { id: "dot_products", type: "calculation_node", role: "Q_2·K_i / √d_k", visibility: "open" },
        { id: "score_row", type: "distribution_row", role: "score [2.1, 0.5, 3.8, 1.2]", visibility: "open" }
      ],
      animation_steps: [
        "Q_2가 K_1과 dot product → s_21 = 2.1",
        "Q_2가 K_2와 dot product → s_22 = 0.5",
        "Q_2가 K_3과 dot product → s_23 = 3.8",
        "Q_2가 K_4와 dot product → s_24 = 1.2",
        "√d_k로 나누기 (scaling) — 값이 너무 크면 softmax가 극단적이 된다",
        "score row [2.1, 0.5, 3.8, 1.2] 완성"
      ],
      zoom: { required: false, reason: "dot product 4회 — 1 view" },
      formula_lock: { needed: true, formula: "s_{ij} = \\frac{Q_i \\cdot K_j}{\\sqrt{d_k}}", when_to_show: "score row 완성 직후" },
      sketch: { kind: "matrix_build", params: { rows: ["Q_2"], cols: ["K_1", "K_2", "K_3", "K_4"], cells: [["2.1", "0.5", "3.8", "1.2"]], highlightRow: 0, caption: "score row · Q₂·Kᵢ/√d_k" } },
      links: [{ target: "u07_s05", label: "다음: softmax → distribution", type: "next" }]
    },
    {
      scene_id: "u07_s05", no: "05",
      title: "Softmax → distribution row (합=1)",
      title_en: "Softmax → Attention Distribution",
      animation_type: ["heatmap_focus"],
      five_unit_frame: {
        data: "score row [2.1, 0.5, 3.8, 1.2]",
        representation: "attention distribution [0.18, 0.04, 0.63, 0.15] — 합=1",
        calculation_target: "softmax로 score를 확률 분포로 변환",
        concept_classification: "어텐션 · distribution",
        importance: { type: "usage", text: "이 distribution이 V들을 섞는 비율이 된다 — 단순 중요도 표시가 아니다" }
      },
      moving_object: "score row가 softmax를 거쳐 distribution으로 변환",
      scene_objects: [
        { id: "score_row", type: "distribution_row", role: "score [2.1, 0.5, 3.8, 1.2]", visibility: "open" },
        { id: "softmax_fn", type: "procedure_block", role: "softmax", visibility: "collapsed", reuse: { type: "same-operation", label: "same operation", note: "softmax 함수는 Unit 02 S07에서 해부됨" }, postprocess: "softmax" },
        { id: "dist_row", type: "distribution_row", role: "[0.18, 0.04, 0.63, 0.15] Σ=1", visibility: "open" }
      ],
      animation_steps: [
        "score row [2.1, 0.5, 3.8, 1.2]가 softmax에 들어간다",
        "결과: [0.18, 0.04, 0.63, 0.15] — 합이 정확히 1",
        "K_3과의 score가 가장 높았으므로 가중치 0.63",
        "\"이 숫자가 '중요도'가 아니라 'V를 섞는 비율'이다\""
      ],
      zoom: { required: false, reason: "softmax 적용 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "gate_mask", params: { values: [0.18, 0.04, 0.63, 0.15], labels: ["V_1", "V_2", "V_3", "V_4"], caption: "attention distribution · V를 섞는 비율" } },
      links: [
        { target: "u07_s04", label: "이전: score 계산", type: "prev" },
        { target: "u07_s06", label: "핵심: distribution × V → weighted sum", type: "next" }
      ]
    },
    {
      scene_id: "u07_s06", no: "06",
      title: "Distribution × V → weighted sum (핵심)",
      title_en: "Value Mixing · Weighted Sum",
      animation_type: ["row_to_weighted_sum"],
      five_unit_frame: {
        data: "attention distribution [0.18, 0.04, 0.63, 0.15] + V vectors [V_1, V_2, V_3, V_4]",
        representation: "각 V를 비율대로 곱한 뒤 더한 결과 — 새 representation vector",
        calculation_target: "0.18·V_1 + 0.04·V_2 + 0.63·V_3 + 0.15·V_4 = 혼합 벡터",
        concept_classification: "어텐션 · V mixing",
        importance: { type: "strength", text: "Attention의 실제 출력 — distribution은 이 mixing을 위한 비율일 뿐이다" }
      },
      moving_object: "distribution 비율이 각 V에 곱해지고 합쳐지는 장면",
      scene_objects: [
        { id: "dist_row", type: "distribution_row", role: "[0.18, 0.04, 0.63, 0.15]", visibility: "open" },
        { id: "v_vectors", type: "token_list", role: "[V_1, V_2, V_3, V_4]", visibility: "open" },
        { id: "weighted_sum", type: "embedding_vector", role: "결과: 새 representation vector", visibility: "open" }
      ],
      animation_steps: [
        "V_1에 0.18을 곱한다",
        "V_2에 0.04를 곱한다 (거의 무시)",
        "V_3에 0.63을 곱한다 (가장 강하게 반영)",
        "V_4에 0.15를 곱한다",
        "4개 결과를 더한다 → 새 representation vector",
        "\"V_3의 정보가 63% 반영된 혼합 벡터 — 이것이 Attention의 실제 출력\""
      ],
      zoom: { required: false, reason: "가중 합 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "_generic", params: { kind: "row_to_weighted_sum", weights: [0.18, 0.04, 0.63, 0.15], vlabels: ["V_1", "V_2", "V_3", "V_4"], result: "합산 → token 2의 새 representation (V mixing)" } },
      links: [
        { target: "u07_s05", label: "이전: distribution", type: "prev" },
        { target: "u07_s07", label: "다음: 결과가 새 representation이 된다", type: "next" }
      ]
    },
    {
      scene_id: "u07_s07", no: "07",
      title: "결과 = 해당 토큰의 새 hidden representation",
      title_en: "Output as New Representation",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "token 2의 weighted sum 결과",
        representation: "token 2의 새 hidden representation — 다른 토큰 정보가 혼합됨",
        calculation_target: "원래 t_2 → Attention 후 → 새 h_2'",
        concept_classification: "어텐션 · representation 갱신",
        importance: { type: "difference", text: "RNN h_t는 시간 순서로만 정보 전달, Attention h_2'는 모든 위치에서 직접 수집" }
      },
      moving_object: "weighted sum 결과가 token 2의 새 representation으로 대체",
      scene_objects: [
        { id: "old_t2", type: "embedding_vector", role: "원래 t_2", visibility: "collapsed" },
        { id: "new_h2", type: "embedding_vector", role: "새 h_2' — V mixing 결과", visibility: "open" },
        { id: "info_sources", type: "annotation_callout", role: "V_3 정보 63% + V_1 18% + V_4 15% + V_2 4%", visibility: "open" }
      ],
      animation_steps: [
        "weighted sum 결과가 token 2의 새 representation으로 배치된다",
        "원래 t_2는 dim 처리",
        "새 h_2'에는 다른 토큰의 V 정보가 비율대로 섞여 있다",
        "\"모든 query token에 대해 이 과정을 반복하면 전체 sequence가 갱신된다\""
      ],
      zoom: { required: false, reason: "결과 배치 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "원래 t_2", note: "자기 정보만" }, right: { title: "새 h_2'", note: "V_3 63% + V_1 18% +\nV_4 15% + V_2 4%" }, arrow: "Attention" } },
      links: [{ target: "u07_s08", label: "다음: 전체 QK^T 행렬", type: "next" }]
    },
    {
      scene_id: "u07_s08", no: "08",
      title: "전체 QK^T score matrix — 모든 query row",
      title_en: "Full QK^T Score Matrix",
      animation_type: ["matrix_build", "heatmap_focus"],
      five_unit_frame: {
        data: "모든 Q와 모든 K",
        representation: "QK^T / √d_k — n×n score matrix",
        calculation_target: "모든 query-key 쌍의 score",
        concept_classification: "어텐션 · score matrix",
        importance: { type: "usage", text: "S03~S06에서 본 과정이 모든 query row에 대해 반복된다" }
      },
      moving_object: "score row들이 쌓여 전체 matrix가 되는 장면",
      scene_objects: [
        { id: "score_matrix", type: "score_matrix", role: "QK^T / √d_k — 4×4 행렬", visibility: "open" },
        { id: "row_highlight", type: "annotation_callout", role: "각 row = S04에서 본 하나의 query row", visibility: "open", reuse: { type: "same-operation", label: "same operation", note: "S04 dot product를 모든 query에 반복" } }
      ],
      animation_steps: [
        "S04에서 본 Q_2 row가 행렬의 2번째 행이 된다",
        "Q_1, Q_3, Q_4 row도 같은 방식으로 채워진다",
        "4×4 score matrix 완성",
        "\"각 row에 softmax를 적용하면 attention distribution matrix가 된다\""
      ],
      zoom: { required: false, reason: "matrix 조립 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "matrix_build", params: { rows: ["Q_1", "Q_2", "Q_3", "Q_4"], cols: ["K_1", "K_2", "K_3", "K_4"], cells: [["·", "·", "·", "·"], ["2.1", "0.5", "3.8", "1.2"], ["·", "·", "·", "·"], ["·", "·", "·", "·"]], highlightRow: 1, caption: "QK^T / √d_k" } },
      links: [{ target: "u07_s09", label: "다음: formula lock", type: "next" }]
    },
    {
      scene_id: "u07_s09", no: "09",
      title: "Attention 전체 수식 — formula lock",
      title_en: "Attention Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: {
        data: "Q, K, V",
        representation: "Attention(Q,K,V) = softmax(QK^T / √d_k) V",
        calculation_target: "이미 본 5단계를 하나의 수식으로 압축",
        concept_classification: "어텐션",
        importance: { type: "usage", text: "Multi-Head Attention(Unit 08)이 이 수식을 head별로 반복한다" }
      },
      moving_object: "전체 수식이 순서대로 고정",
      scene_objects: [
        { id: "formula_panel", type: "formula_lock", role: "Attention(Q,K,V) = softmax(QK^T/√d_k)V", visibility: "open" },
        { id: "step_mapping", type: "annotation_callout", role: "QK^T=S04, softmax=S05, ×V=S06", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit '계산 대상' slot", visibility: "open" }
      ],
      animation_steps: [
        "QK^T / √d_k → score matrix (S04, S08)",
        "softmax → attention distribution (S05)",
        "× V → weighted sum = 새 representation (S06, S07)",
        "하나의 수식으로 압축: Attention(Q,K,V) = softmax(QK^T/√d_k)V",
        "핵심 반복: distribution은 중요도가 아니라 V mixing 비율"
      ],
      zoom: { required: false, reason: "수식 요약 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{Attention}(Q,K,V) = \\text{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V", when_to_show: "단계 매핑 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["Q·K^T", "÷√d_k", "softmax", "×V"], formula: "Attention(Q,K,V) = softmax(QK^T/√d_k) V", stateSlot: 3 } },
      links: [
        { target: "_unit:unit08", label: "다음 단원: Multi-Head Attention", type: "cross", note: "Unit 08" }
      ]
    }
  ]
};
