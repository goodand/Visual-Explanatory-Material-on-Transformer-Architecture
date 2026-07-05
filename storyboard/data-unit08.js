// Unit 08 — Multi-Head Attention (8 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit08 = {
  id: "unit08", no: "08", topic: 4,
  title_en: "Multi-Head Attention",
  title_ko: "멀티헤드 어텐션",
  core_question: "head가 여러 개인 이유는 무엇인가?",
  correct_framing: "여러 head는 같은 토큰들을 서로 다른 projection 공간에서 보고, 서로 다른 관계 패턴을 잡는다.",
  avoid: [
    "마지막 W_O Linear 뒤에 활성화 함수가 있다고 설명하지 않는다 — 없다.",
    "모든 head가 같은 attention을 학습한다고 설명하지 않는다 — W_Q, W_K, W_V가 head마다 다르다.",
    "head를 '중요도 투표'처럼 설명하지 않는다 — 각 head는 다른 관계 패턴을 캡처한다."
  ],
  routing: { emphasis: "표현: head별 projected space", types: ["parallel_heads", "heatmap_focus", "zoom_hierarchy", "formula_lock"] },
  importance: {
    usage: "Transformer의 모든 attention layer가 Multi-Head Attention이다.",
    necessity: "단일 head는 하나의 관계 패턴만 잡을 수 있다 — 여러 head가 다양한 패턴을 병렬로 잡는다.",
    difference: "Single-head는 Q/K/V 1세트, Multi-head는 h세트 → 서로 다른 projection 공간.",
    strength: "다양한 언어적/구조적 관계를 동시에 포착하면서도 전체 계산 비용은 단일 head와 비슷하다."
  },
  scenes: [
    {
      scene_id: "u08_s01", no: "01",
      title: "같은 입력이 여러 head로 분기",
      title_en: "Same Input, Multiple Heads",
      animation_type: ["parallel_heads"],
      prereqs: [
        { target: "_unit:unit07", concept: "Attention(Q,K,V)", label: "Unit 07", note: "단일 head Attention의 전체 흐름은 이미 설명됨" }
      ],
      five_unit_frame: {
        data: "같은 hidden states X = [t_1, t_2, t_3, t_4]",
        representation: "head 1, head 2, head 3 — 각각 다른 W_Q, W_K, W_V",
        calculation_target: "같은 입력에 서로 다른 projection → 서로 다른 Q, K, V",
        concept_classification: "어텐션 · 병렬 head",
        importance: { type: "necessity", text: "하나의 head는 하나의 관계 패턴만 잡는다 — 여러 head가 다양한 패턴을 포착" }
      },
      moving_object: "같은 X가 3개 head로 동시에 분기하는 장면",
      scene_objects: [
        { id: "input_x", type: "token_list", role: "X = [t_1, t_2, t_3, t_4]", visibility: "open" },
        { id: "head_1", type: "procedure_block", role: "Head 1: W_Q¹, W_K¹, W_V¹ → Attention", visibility: "open", reuse: { type: "same-type", label: "same type", note: "Attention 구조는 Unit 07과 동일, projection W만 다름" } },
        { id: "head_2", type: "procedure_block", role: "Head 2: W_Q², W_K², W_V²", visibility: "collapsed", reuse: { type: "same-type", label: "same type" } },
        { id: "head_3", type: "procedure_block", role: "Head 3: W_Q³, W_K³, W_V³", visibility: "collapsed", reuse: { type: "same-type", label: "same type" } }
      ],
      animation_steps: [
        "같은 X가 3개 경로로 병렬 분기한다",
        "Head 1: X에 W_Q¹, W_K¹, W_V¹을 곱해 Q¹, K¹, V¹ 생성",
        "Head 2, 3도 같은 구조지만 다른 W → 다른 Q, K, V",
        "\"같은 토큰들을 서로 다른 projection 공간에서 본다\"",
        "각 head block에 same type badge + no activation"
      ],
      zoom: { required: false, reason: "병렬 분기 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "_generic", params: { kind: "parallel_heads · 3 heads" } },
      links: [{ target: "u08_s02", label: "다음: head별 다른 heatmap", type: "next" }]
    },
    {
      scene_id: "u08_s02", no: "02",
      title: "각 head가 다른 attention heatmap을 만든다",
      title_en: "Different Heatmaps per Head",
      animation_type: ["heatmap_focus", "parallel_heads"],
      five_unit_frame: {
        data: "같은 token sequence",
        representation: "head별 attention distribution matrix — 패턴이 다름",
        calculation_target: "head 1: 인접 토큰 주목, head 2: 먼 토큰 주목, head 3: 구문 관계 등",
        concept_classification: "어텐션 · head별 패턴",
        importance: { type: "strength", text: "다양한 관계 패턴을 동시에 포착 — 단일 head로는 불가능" }
      },
      moving_object: "3개 heatmap이 나란히 등장하며 패턴 차이가 드러나는 장면",
      scene_objects: [
        { id: "heatmap_h1", type: "score_matrix", role: "Head 1 attention — 인접 토큰 집중", visibility: "open" },
        { id: "heatmap_h2", type: "score_matrix", role: "Head 2 attention — 먼 토큰 참조", visibility: "open" },
        { id: "heatmap_h3", type: "score_matrix", role: "Head 3 attention — 구문 관계", visibility: "open" }
      ],
      animation_steps: [
        "Head 1 heatmap: 대각선 근처 집중 (인접 토큰)",
        "Head 2 heatmap: 대각선에서 먼 위치에 높은 weight",
        "Head 3 heatmap: 특정 구문 패턴에 집중",
        "\"같은 입력이지만 projection이 달라 다른 관계를 포착\"",
        "각 heatmap은 same operation (softmax(QK^T/√d_k)) 결과"
      ],
      zoom: { required: false, reason: "3 heatmap 나란히 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Head 1", note: "인접 토큰\n집중 패턴" }, right: { title: "Head 2·3", note: "먼 토큰 · 구문\n다른 패턴" }, arrow: "같은 X\n다른 W" } },
      links: [{ target: "u08_s03", label: "다음: 각 head의 output", type: "next" }]
    },
    {
      scene_id: "u08_s03", no: "03",
      title: "각 head output — V weighted sum",
      title_en: "Per-Head Output",
      animation_type: ["row_to_weighted_sum", "parallel_heads"],
      five_unit_frame: {
        data: "head별 attention distribution + V vectors",
        representation: "head별 output = distribution × V — 각 d_head 차원",
        calculation_target: "Unit 07 S06과 동일한 weighted sum을 head별로 반복",
        concept_classification: "어텐션 · head별 출력",
        importance: { type: "usage", text: "각 head output은 d_head 차원 — d_model보다 작다 (d_head = d_model / h)" }
      },
      moving_object: "각 head에서 weighted sum 결과가 나오는 장면",
      scene_objects: [
        { id: "head_outputs", type: "token_list", role: "[out_1, out_2, out_3] — 각 d_head 차원", visibility: "open" },
        { id: "v_mixing_note", type: "annotation_callout", role: "각 head: same operation (distribution × V)", visibility: "open", reuse: { type: "same-operation", label: "same operation", note: "Unit 07 S06 V mixing과 동일한 연산" } }
      ],
      animation_steps: [
        "Head 1: attention distribution × V¹ → out_1 (d_head 차원)",
        "Head 2: distribution × V² → out_2",
        "Head 3: distribution × V³ → out_3",
        "\"각 head output은 d_model/h 차원 — 전체보다 작다\"",
        "\"다음: 이 출력들을 합친다\""
      ],
      zoom: { required: false, reason: "head별 출력 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)", when_to_show: "3개 출력 완성 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["Head 1·2·3", "dist × V", "out_1 · out_2 · out_3"], packet: "out", labels: ["heads", "V mixing", "outputs"] } },
      links: [{ target: "u08_s04", label: "다음: concatenate", type: "next" }]
    },
    {
      scene_id: "u08_s04", no: "04",
      title: "Head outputs를 concatenate",
      title_en: "Concatenate Head Outputs",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "[out_1, out_2, out_3] — 각 d_head 차원",
        representation: "Concat = [out_1; out_2; out_3] — h × d_head = d_model 차원",
        calculation_target: "벡터를 나란히 이어붙이기",
        concept_classification: "어텐션 · concatenation",
        importance: { type: "necessity", text: "h개 head의 정보를 하나의 벡터로 합쳐야 다음 layer에 전달 가능" }
      },
      moving_object: "3개 출력이 나란히 이어붙여지는 장면",
      scene_objects: [
        { id: "head_outputs", type: "token_list", role: "out_1, out_2, out_3", visibility: "open" },
        { id: "concat_result", type: "embedding_vector", role: "Concat — d_model 차원 복원", visibility: "open" }
      ],
      animation_steps: [
        "out_1 (d_head), out_2 (d_head), out_3 (d_head)가 나란히 놓인다",
        "이어붙여서 하나의 벡터 [out_1; out_2; out_3]가 된다",
        "차원: h × d_head = d_model",
        "\"아직 최종 출력이 아니다 — W_O projection이 남았다\""
      ],
      zoom: { required: false, reason: "concat — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["out_1 · out_2 · out_3", "concat", "[out_1; out_2; out_3]"], packet: "concat", labels: ["head outputs", "이어붙임", "d_model 복원"] } },
      links: [{ target: "u08_s05", label: "다음: W_O projection", type: "next" }]
    },
    {
      scene_id: "u08_s05", no: "05",
      title: "W_O Linear — head들을 다시 섞는다",
      title_en: "Output Projection W_O",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "Concat(heads) — d_model 차원",
        representation: "W_O × Concat → MHA output — d_model 차원",
        calculation_target: "head별 정보를 최종 벡터로 projection",
        concept_classification: "어텐션 · output projection",
        importance: { type: "usage", text: "이 linear 뒤에 활성화 함수가 없다 — 새로운 비선형 판단보다 head 정보를 섞는 projection 역할" }
      },
      moving_object: "concat 결과가 W_O를 통과하여 최종 output이 되는 장면",
      scene_objects: [
        { id: "concat_input", type: "embedding_vector", role: "Concat(heads)", visibility: "open" },
        { id: "wo_linear", type: "procedure_block", role: "Linear W_O", visibility: "open", postprocess: "", reuse: { type: "same-type", label: "same type", note: "Linear 구조 동일 — Unit 07 S02에서 해부됨" } },
        { id: "mha_output", type: "embedding_vector", role: "MHA output — d_model", visibility: "open" }
      ],
      animation_steps: [
        "Concat 벡터가 W_O Linear에 들어간다",
        "W_O가 head별 정보를 섞어 최종 벡터를 만든다",
        "\"활성화 함수 없음 (no activation) — projection 역할\"",
        "결과: MHA output (d_model 차원)"
      ],
      zoom: { required: false, reason: "projection 1단계 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["Concat(heads)", "W_O Linear", "MHA output"], packet: "output", labels: ["concat", "no activation", "d_model"] } },
      links: [{ target: "u08_s06", label: "다음: 왜 no activation?", type: "next" }]
    },
    {
      scene_id: "u08_s06", no: "06",
      title: "W_O 뒤에 활성화 함수가 없는 이유",
      title_en: "Why No Activation After W_O",
      animation_type: ["before_after_contrast"],
      correction: "W_O Linear 뒤에 활성화 함수가 없는 이유: 새로운 비선형 판단보다 head output을 모델 차원으로 다시 섞는 projection 역할이기 때문.",
      five_unit_frame: {
        data: "W_O projection vs FFN Linear+GELU",
        representation: "같은 Linear이지만 post-process가 다른 두 경우 대조",
        calculation_target: "역할 차이: 정보 섞기(projection) vs 표현 변환(FFN)",
        concept_classification: "어텐션 · post-process 구분",
        importance: { type: "difference", text: "같은 Linear이라도 post-process가 다르면 역할이 다르다" }
      },
      moving_object: "두 Linear가 나란히 놓여 post-process 차이가 드러나는 장면",
      scene_objects: [
        { id: "wo_panel", type: "procedure_block", role: "W_O → no activation (projection)", visibility: "open", postprocess: "" },
        { id: "ffn_panel", type: "procedure_block", role: "FFN-1 → GELU (표현 변환)", visibility: "open", postprocess: "GELU" },
        { id: "diff_callout", type: "comparison_pair_object", role: "projection(섞기) vs transformation(변환)", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽: W_O Linear → no activation — head 정보를 d_model로 projection",
        "오른쪽: FFN-1 Linear → GELU — hidden representation 변환",
        "\"같은 Linear 구조지만 역할과 post-process가 다르다\"",
        "post-process 라벨이 명시적으로 표시된다"
      ],
      zoom: { required: false, reason: "대조 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "W_O Linear", note: "no activation\nprojection (섞기)" }, right: { title: "FFN-1 Linear", note: "+ GELU\ntransformation (변환)" }, arrow: "같은 Linear\n다른 역할" } },
      links: [{ target: "u08_s07", label: "다음: d_head 차원 관계", type: "next" }]
    },
    {
      scene_id: "u08_s07", no: "07",
      title: "d_model = h × d_head — 차원 분배",
      title_en: "Dimension Split Across Heads",
      animation_type: ["before_after_contrast"],
      five_unit_frame: {
        data: "d_model = 512, h = 8 heads",
        representation: "d_head = 512/8 = 64 — 각 head가 작은 차원에서 작동",
        calculation_target: "전체 계산 비용 ≈ 단일 d_model head와 비슷",
        concept_classification: "어텐션 · 차원 분배",
        importance: { type: "strength", text: "다양한 관계를 포착하면서도 계산 비용이 크게 늘지 않는다" }
      },
      moving_object: "d_model 벡터가 h등분되는 장면",
      scene_objects: [
        { id: "full_dim", type: "embedding_vector", role: "d_model = 512 (전체 차원)", visibility: "open" },
        { id: "split_dims", type: "token_list", role: "8 × d_head = 8 × 64", visibility: "open" },
        { id: "cost_note", type: "annotation_callout", role: "총 계산량 ≈ single-head d_model attention", visibility: "open" }
      ],
      animation_steps: [
        "d_model = 512 벡터가 놓인다",
        "8등분 → 각 head가 d_head = 64 차원에서 작동",
        "8개 head × 64차원 = 512차원 복원 (concat 후)",
        "\"단일 512차원 head 1개 vs 64차원 head 8개 — 계산량 비슷, 패턴 다양\""
      ],
      zoom: { required: false, reason: "차원 분배 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "d_model = 512", note: "전체 차원" }, right: { title: "8 × d_head = 8 × 64", note: "head별 분배\n→ concat → 512 복원" }, arrow: "분배" } },
      links: [{ target: "u08_s08", label: "다음: formula lock", type: "next" }]
    },
    {
      scene_id: "u08_s08", no: "08",
      title: "Multi-Head Attention — formula lock",
      title_en: "MHA Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: {
        data: "Q, K, V + h heads + W_O",
        representation: "MHA = Concat(head_1,…,head_h) W_O",
        calculation_target: "이미 본 병렬 head → concat → projection을 수식으로 압축",
        concept_classification: "어텐션 · Multi-Head",
        importance: { type: "usage", text: "Transformer의 모든 attention layer(self, cross, masked)가 이 구조" }
      },
      moving_object: "전체 수식이 고정되는 장면",
      scene_objects: [
        { id: "formula_panel", type: "formula_lock", role: "MHA 수식", visibility: "open" },
        { id: "linear_summary", type: "annotation_callout", role: "Linear post-process 정리: Q/K/V=none, W_O=none", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit '표현' slot", visibility: "open" }
      ],
      animation_steps: [
        "head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)",
        "MHA = Concat(head_1, …, head_h) W^O",
        "Linear post-process 정리: 모든 projection에 no activation",
        "\"다음 단원: Transformer Encoder가 이 MHA를 사용\"",
        "5-Unit state bar에서 '표현' slot 표시"
      ],
      zoom: { required: false, reason: "수식 요약 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V) \\\\ \\text{MHA} = \\text{Concat}(\\text{head}_1, \\ldots, \\text{head}_h) W^O", when_to_show: "post-process 정리 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["h heads", "Attention", "Concat", "W_O"], formula: "MHA = Concat(heads) W^O", stateSlot: 2 } },
      links: [
        { target: "_unit:unit09", label: "다음 단원: Transformer Encoder Internals", type: "cross", note: "Unit 09" }
      ]
    }
  ]
};
