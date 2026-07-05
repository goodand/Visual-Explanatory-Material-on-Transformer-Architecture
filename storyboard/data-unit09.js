// Unit 09 — Transformer Encoder Internals (14 scenes, v2 tree aligned)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit09 = {
  id: "unit09", no: "09", topic: 4,
  title_en: "Transformer Encoder Internals",
  title_ko: "트랜스포머 인코더 내부",
  core_question: "Transformer hidden state는 RNN hidden state와 무엇이 다른가?",
  correct_framing: "RNN hidden state는 시간축으로 전달되는 상태값이다. Transformer hidden state는 각 layer에서 각 token 위치마다 존재하는 representation vector다.",
  avoid: [
    "Transformer hidden state를 RNN의 h_t와 동일하게 설명하지 않는다.",
    "Positional Encoding을 '더한다'로만 끝내지 않는다 — 왜 순서 정보가 필요한지 먼저 보여준다.",
    "Residual Connection과 Layer Normalization을 흐름선으로만 처리하지 않는다 — 각각 독립 scene.",
    "Embedding Scaling ×√d_model을 생략하지 않는다 — 원 논문의 처리.",
    "Encoder Self-Attention에서도 Padding Mask가 필요하다는 것을 빠뜨리지 않는다."
  ],
  routing: { emphasis: "표현: token별 hidden representation, PE, residual, norm, FFN", types: ["zoom_hierarchy", "matrix_build", "packet_flow"] },
  importance: {
    usage: "BERT, GPT 등 현대 언어 모델의 기본 빌딩 블록이다.",
    necessity: "Attention만으로는 순서 정보, gradient 안정성, 표현 변환이 부족하다 — PE, Residual, Norm, FFN이 보완한다.",
    difference: "RNN은 시간 순서로 h_t를 전달하지만, Transformer는 모든 token이 한 layer 안에서 동시에 Attention으로 관계를 계산한다.",
    strength: "병렬 처리 가능 + 긴 거리 관계를 직접 참조 + layer를 깊이 쌓을 수 있다."
  },
  scenes: [
    // ─── Input Pipeline (L0 tree: Input Pipeline) ───
    { scene_id: "u09_s01", no: "01", title: "Token IDs → Embedding Vectors", title_en: "Embedding Lookup",
      animation_type: ["packet_flow"],
      prereqs: [{ target: "_unit:unit01", concept: "x_t = E[id_t]", label: "Unit 01", note: "embedding lookup은 이미 해부됨 — 여기서는 참조만" }],
      five_unit_frame: { data: "token id sequence", representation: "embedding vectors", calculation_target: "E[id_t] — same object (같은 E table)", concept_classification: "표현·임베딩", importance: { type: "usage", text: "encoder의 첫 입력" } },
      moving_object: "id가 embedding vector로 변환", scene_objects: [
        { id: "embedding_table", type: "parameter_block", role: "E table", visibility: "collapsed", reuse: { type: "same-object", label: "same object", note: "Unit 01과 동일한 E" } },
        { id: "token_vectors", type: "token_list", role: "embedding vectors [e_1, e_2, e_3]", visibility: "open" }
      ],
      animation_steps: ["token ids가 E table에서 vectors로 변환 (Unit 01 참조)", "결과: [e_1, e_2, e_3]"],
      zoom: { required: false, reason: "참조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["ids", "E table", "vectors"], packet: "e_t", labels: ["입력", "lookup", "출력"] } },
      links: [{ target: "u09_s02", label: "다음: Embedding Scaling", type: "next" }]
    },

    // ─── NEW: Embedding Scaling ×√d_model ───
    { scene_id: "u09_s02", no: "02", title: "Embedding Scaling — ×√d_model", title_en: "Embedding Scaling",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "embedding vectors [e_1, e_2, e_3]", representation: "scaled vectors [e_1·√d, e_2·√d, e_3·√d]", calculation_target: "각 embedding vector에 √d_model을 곱한다", concept_classification: "표현 · scaling", importance: { type: "necessity", text: "PE와 embedding의 크기 비율을 맞추기 위한 원 논문(Attention Is All You Need)의 처리" } },
      moving_object: "embedding vector가 √d_model 배로 스케일되는 장면", scene_objects: [
        { id: "raw_embeddings", type: "token_list", role: "[e_1, e_2, e_3] — 원래 크기", visibility: "open" },
        { id: "scale_factor", type: "calculation_node", role: "×√d_model (예: √512 ≈ 22.6)", visibility: "open" },
        { id: "scaled_embeddings", type: "token_list", role: "[e_1·√d, e_2·√d, e_3·√d] — 스케일 후", visibility: "open" }
      ],
      animation_steps: ["embedding vectors가 놓인다", "√d_model (예: √512 ≈ 22.6)을 각 vector에 곱한다", "\"왜? PE는 고정 크기(-1~1), embedding은 학습으로 크기가 다를 수 있다\"", "\"스케일링으로 embedding이 PE에 묻히지 않도록 크기를 키운다\""],
      zoom: { required: false, reason: "곱셈 1단계 — 1 view" },
      formula_lock: { needed: true, formula: "e_i' = e_i \\times \\sqrt{d_{\\text{model}}}", when_to_show: "스케일링 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["e_1·e_2·e_3", "×√d_model", "scaled vectors"], packet: "×√d", labels: ["embedding", "scaling", "결과"] } },
      links: [{ target: "u09_s03", label: "다음: PE WHY", type: "next" }]
    },

    // ─── PE WHY ───
    { scene_id: "u09_s03", no: "03", title: "Positional Encoding — WHY: Attention은 순서를 모른다", title_en: "PE: Why Position Matters",
      animation_type: ["before_after_contrast"],
      five_unit_frame: { data: "같은 token 집합의 순서를 바꾼 두 문장", representation: "Attention은 집합 연산 — 순서 정보가 없다", calculation_target: "\"나는 너를 좋아한다\" vs \"너를 나는 좋아한다\"", concept_classification: "어텐션 · 위치 정보 부재", importance: { type: "necessity", text: "순서 정보를 추가하지 않으면 어순이 다른 문장을 구분할 수 없다" } },
      moving_object: "두 문장이 Attention 결과가 같아지는 장면", scene_objects: [
        { id: "sent_a", type: "token_list", role: "\"나는 너를 좋아한다\"", visibility: "open" },
        { id: "sent_b", type: "token_list", role: "\"너를 나는 좋아한다\"", visibility: "open" },
        { id: "same_attention", type: "annotation_callout", role: "QK^T score가 동일 — 순서 구분 불가", visibility: "open" }
      ],
      animation_steps: ["두 문장의 token은 같고 순서만 다르다", "Attention은 순서를 고려하지 않는 집합 연산", "두 문장의 QK^T score가 동일해진다", "\"순서 정보를 별도로 넣어야 한다\""],
      zoom: { required: false, reason: "대조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "나는 너를 좋아한다", note: "순서 A" }, right: { title: "너를 나는 좋아한다", note: "순서 B → Attention 결과 동일?" }, arrow: "순서 무시" } },
      links: [{ target: "u09_s04", label: "해결: PE 추가", type: "next" }]
    },

    // ─── PE HOW ───
    { scene_id: "u09_s04", no: "04", title: "Positional Encoding — HOW: 위치별 패턴 더하기", title_en: "PE: Adding Position Vectors",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "scaled embedding vectors", representation: "[e'_1+PE_1, e'_2+PE_2, e'_3+PE_3]", calculation_target: "위치별 고유 패턴(sin/cos)을 scaled embedding에 더한다", concept_classification: "표현 · positional encoding", importance: { type: "usage", text: "위치 정보가 추가되면 같은 token이라도 위치에 따라 다른 vector" } },
      moving_object: "PE vector가 각 embedding에 더해지는 장면", scene_objects: [
        { id: "scaled_vectors", type: "token_list", role: "scaled [e'_1, e'_2, e'_3]", visibility: "open" },
        { id: "pe_vectors", type: "token_list", role: "[PE_1, PE_2, PE_3] — sin/cos 패턴", visibility: "open" },
        { id: "result_vectors", type: "token_list", role: "[e'_1+PE_1, e'_2+PE_2, e'_3+PE_3]", visibility: "open" }
      ],
      animation_steps: ["각 위치에 고유한 PE vector (sin/cos)", "PE를 scaled embedding에 더한다", "결과: 같은 단어라도 위치가 다르면 다른 vector"],
      zoom: { required: false, reason: "덧셈 — 1 view" }, formula_lock: { needed: true, formula: "x_i = e_i \\cdot \\sqrt{d_{\\text{model}}} + PE_i", when_to_show: "덧셈 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["scaled e", "+ PE", "e+PE"], packet: "PE", labels: ["scaled", "위치 패턴", "결과"] } },
      links: [{ target: "u09_s05", label: "다음: Input Dropout", type: "next" }]
    },

    // ─── NEW: Input Dropout ───
    { scene_id: "u09_s05", no: "05", title: "Input Dropout — Embedding+PE 후 정규화", title_en: "Input Dropout",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "embedding + PE 결과 vectors", representation: "dropout 적용 — 일부 값을 0으로 약화", calculation_target: "training 중 과적합 방지. inference 중에는 적용 안 함.", concept_classification: "표현 · dropout", importance: { type: "necessity", text: "dropout은 sublayer output, attention weight 등 여러 곳에서 재사용되는 primitive" } },
      moving_object: "vector의 일부 값이 0으로 약화되는 장면", scene_objects: [
        { id: "input_vectors", type: "token_list", role: "embedding+PE vectors", visibility: "open" },
        { id: "dropout_block", type: "procedure_block", role: "Dropout(p=0.1) — training만 적용", visibility: "open" },
        { id: "output_vectors", type: "token_list", role: "일부 값 약화된 vectors → encoder 입력", visibility: "open" }
      ],
      animation_steps: ["embedding+PE 결과가 dropout을 통과한다", "일부 값이 랜덤하게 0으로 마스킹된다", "\"training 중에만 적용 — inference에서는 원본 통과\"", "\"이 dropout은 sublayer output, attention weight에서도 재사용\""],
      zoom: { required: false, reason: "dropout 적용 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Dropout 전", note: "모든 값 활성" }, right: { title: "Dropout 후", note: "일부 값 = 0\n(training만)" }, arrow: "Dropout" } },
      links: [{ target: "u09_s06", label: "다음: Encoder Block 전체", type: "next" }]
    },

    // ─── Encoder Block Overview ───
    { scene_id: "u09_s06", no: "06", title: "Encoder Block 전체 — collapsed overview", title_en: "Encoder Block Overview",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: { data: "dropout 후 token vectors", representation: "Self-Attn → Dropout → Add&Norm → FFN → Dropout → Add&Norm", calculation_target: "구조 배치 — 하위 블록 식별 (dropout 포함)", concept_classification: "어텐션 · encoder architecture", importance: { type: "usage", text: "이 block이 N번 반복되어 encoder를 구성한다" } },
      moving_object: "collapsed block들이 순서대로 놓이는 장면", scene_objects: [
        { id: "self_attn_block", type: "procedure_block", role: "Multi-Head Self-Attention + Padding Mask", visibility: "collapsed", reuse: { type: "same-type", label: "same type", note: "MHA 구조는 Unit 08에서 해부됨" } },
        { id: "dropout_1", type: "procedure_block", role: "Dropout", visibility: "collapsed", reuse: { type: "same-operation", label: "same op", note: "S05와 동일 primitive" } },
        { id: "add_norm_1", type: "procedure_block", role: "Residual Add + LayerNorm", visibility: "collapsed" },
        { id: "ffn_block", type: "procedure_block", role: "FFN (Linear+GELU+Linear)", visibility: "collapsed" },
        { id: "dropout_2", type: "procedure_block", role: "Dropout", visibility: "collapsed", reuse: { type: "same-operation", label: "same op" } }
      ],
      animation_steps: ["encoder block 해부도 등장", "Self-Attn(+Padding Mask) → Dropout → Add&Norm → FFN → Dropout → Add&Norm", "dropout 위치 2곳 명시 (sublayer output 뒤)", "모든 하위 block collapsed — 이후 하나씩 zoom"],
      zoom: { required: true, reason: "하위 block들을 각각 독립 scene으로 zoom", sequence: ["Encoder Block (global)", "Self-Attention+Padding Mask", "Dropout+Residual+Norm", "FFN"], interaction: "anatomy" },
      formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: { levels: [
        { scope: "Encoder Block", blocks: [{ label: "Self-Attn+PadMask", focus: false }, { label: "Drop+Add&Norm", focus: false }, { label: "FFN", focus: false }, { label: "Drop+Add&Norm", focus: false }] },
        { scope: "Zoom 대상", blocks: [{ label: "Padding Mask (신규)", focus: true }, { label: "Dropout ×2", focus: true }, { label: "Residual", focus: true }, { label: "FFN", focus: true }] },
        { scope: "반복", content: "× N layers\nrepeated layer" }
      ], focus: 0, breadcrumb: "Encoder Block · hover: 부분 설명 · click: zoom" } },
      links: [{ target: "u09_s07", label: "zoom: Self-Attention + Padding Mask", type: "next" }]
    },

    // ─── Self-Attention + Padding Mask (NEW: padding mask 추가) ───
    { scene_id: "u09_s07", no: "07", title: "Self-Attention + Padding Mask", title_en: "Self-Attention with Padding Mask",
      animation_type: ["heatmap_focus"],
      prereqs: [
        { target: "_unit:unit08", concept: "Multi-Head Attention", label: "Unit 08", note: "MHA 구조는 이미 해부됨" },
        { target: "_unit:unit01", concept: "Padding Mask", label: "Unit 01 S08", note: "PAD와 mask 개념은 이미 설명됨" }
      ],
      five_unit_frame: { data: "같은 token sequence X (PAD 포함 가능)", representation: "Q=K=V=X, Padding Mask 적용", calculation_target: "PAD 위치의 score를 −∞로 마스킹 → softmax 후 weight=0", concept_classification: "어텐션 · self-attention + padding mask", importance: { type: "necessity", text: "Encoder에서도 PAD token을 무시해야 한다 — Decoder만의 문제가 아니다" } },
      moving_object: "Padding Mask가 attention score matrix에 적용되는 장면", scene_objects: [
        { id: "same_x", type: "token_list", role: "X — Q,K,V 모두 여기서 (PAD 포함)", visibility: "open" },
        { id: "padding_mask", type: "score_matrix", role: "Padding Mask — PAD 열에 −∞", visibility: "open" },
        { id: "masked_heatmap", type: "score_matrix", role: "mask 적용 후 attention heatmap", visibility: "open" }
      ],
      animation_steps: ["X에서 Q,K,V 생성 (같은 source = self-attention)", "token 중 PAD가 있으면 해당 열에 Padding Mask 적용", "score matrix에서 PAD 위치 = −∞ → softmax 후 weight = 0", "\"Encoder Self-Attention에서도 PAD를 무시해야 정확한 representation\"", "MHA 내부는 collapsed (Unit 08 참조)"],
      zoom: { required: true, reason: "encoder block에서 self-attn으로 zoom", sequence: ["Encoder Block", "Self-Attention + Padding Mask ●"], interaction: "anatomy" },
      formula_lock: { needed: false },
      sketch: { kind: "matrix_build", params: { rows: ["t_1", "t_2", "t_3", "PAD"], cols: ["t_1", "t_2", "t_3", "PAD"], cells: [["✓", "✓", "✓", "−∞"], ["✓", "✓", "✓", "−∞"], ["✓", "✓", "✓", "−∞"], ["✓", "✓", "✓", "−∞"]], highlightRow: 0, caption: "Padding Mask · PAD 열 = −∞" } },
      links: [{ target: "u09_s08", label: "다음: Dropout + Residual + LayerNorm", type: "next" }]
    },

    // ─── Dropout → Residual → LayerNorm (sublayer 완료 흐름) ───
    { scene_id: "u09_s08", no: "08", title: "Sublayer → Dropout → Residual Add → LayerNorm", title_en: "Post-Sublayer: Drop + Add & Norm",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "sublayer 입력 x, sublayer 출력 F(x)", representation: "LN(x + Dropout(F(x)))", calculation_target: "3단계: ①F(x)에 dropout ②원래 x와 residual add ③LayerNorm", concept_classification: "표현 · sublayer 후처리", importance: { type: "usage", text: "이 3단계가 모든 sublayer(Attention, FFN) 뒤에 동일하게 적용된다" } },
      moving_object: "F(x) → dropout → +x → LN 순서로 처리되는 장면", scene_objects: [
        { id: "sublayer_output", type: "embedding_vector", role: "F(x) — sublayer 출력", visibility: "open" },
        { id: "dropout", type: "procedure_block", role: "Dropout — training 중 일부 0", visibility: "open", reuse: { type: "same-operation", label: "same op" } },
        { id: "residual_add", type: "calculation_node", role: "x + Dropout(F(x)) — skip path", visibility: "open" },
        { id: "layer_norm", type: "procedure_block", role: "LayerNorm — 값 분포 안정화", visibility: "open", reuse: { type: "same-operation", label: "same op" } }
      ],
      animation_steps: ["sublayer 출력 F(x)에 Dropout 적용", "원래 입력 x가 skip path로 직접 더해진다 (residual add)", "Dropout(F(x)) + x → LayerNorm", "\"이 3단계가 Attention 뒤에도, FFN 뒤에도 동일하게 반복\"", "same operation — 2번째 적용 시 collapsed"],
      zoom: { required: true, reason: "encoder block에서 Add&Norm으로 zoom", sequence: ["Encoder Block", "Drop+Add&Norm ●", "Dropout → +x → LN"], interaction: "anatomy" },
      formula_lock: { needed: true, formula: "\\text{output} = \\text{LN}(x + \\text{Dropout}(F(x)))", when_to_show: "LN 직후" },
      sketch: { kind: "packet_flow", params: { stations: ["F(x)", "Dropout", "+x → LN"], packet: "output", labels: ["sublayer", "약화", "정규화"] } },
      links: [
        { target: "u09_s09", label: "다음: FFN Block", type: "next" },
        { target: "_unit:unit05", label: "같은 원리: LSTM C_t 덧셈 경로", type: "cross", note: "Unit 05 S05" }
      ]
    },

    // ─── FFN Block ───
    { scene_id: "u09_s09", no: "09", title: "FFN Block — 확장 → 비선형 → 축소", title_en: "Feed-Forward Network Block",
      animation_type: ["zoom_hierarchy"],
      prereqs: [{ target: "_unit:unit02", concept: "GELU/ReLU", label: "Unit 02", note: "활성화 함수는 이미 해부됨" }],
      five_unit_frame: { data: "token별 hidden vector (d_model)", representation: "d_model → d_ff(확장) → d_model(축소)", calculation_target: "Linear+GELU+Linear — token별 pointwise 변환", concept_classification: "표현 · FFN", importance: { type: "usage", text: "Attention이 token 간 관계를 계산하고, FFN이 각 token의 representation을 개별 변환한다" } },
      moving_object: "hidden vector가 확장 → 활성화 → 축소를 거치는 장면", scene_objects: [
        { id: "ffn_linear1", type: "procedure_block", role: "Linear 1: d_model → d_ff (확장)", visibility: "open", postprocess: "GELU" },
        { id: "ffn_linear2", type: "procedure_block", role: "Linear 2: d_ff → d_model (축소)", visibility: "open", postprocess: "", reuse: { type: "same-type", label: "same type", note: "같은 Linear, 다른 post-process" } }
      ],
      animation_steps: ["hidden vector (d_model)가 들어온다", "Linear 1: d_model → d_ff (4배 확장) + GELU", "Linear 2: d_ff → d_model (축소, no activation)", "\"Linear 1 + GELU vs Linear 2 no activation — post-process 다름\"", "이 뒤에도 Dropout → Residual → LN (S08과 동일, same op)"],
      zoom: { required: true, reason: "encoder block에서 FFN으로 zoom", sequence: ["Encoder Block", "FFN ●", "Linear+GELU+Linear"], interaction: "anatomy" },
      formula_lock: { needed: true, formula: "\\text{FFN}(x) = W_2 \\cdot \\text{GELU}(W_1 x + b_1) + b_2", when_to_show: "축소 직후" },
      sketch: { kind: "zoom_hierarchy", params: { levels: [
        { scope: "FFN", blocks: [{ label: "Linear 1 + GELU", focus: true }, { label: "Linear 2 (no act)", focus: true }] },
        { scope: "차원", blocks: [{ label: "d → d_ff", focus: false }, { label: "d_ff → d", focus: false }] },
        { scope: "역할", content: "token별 pointwise\n표현 변환" }
      ], focus: 0, breadcrumb: "Encoder › FFN › Linear+GELU+Linear" } },
      links: [{ target: "u09_s10", label: "다음: token별 hidden update", type: "next" }, { target: "_unit:unit03", label: "참조: MLP 구조", type: "cross", note: "Unit 03" }]
    },

    // ─── Per-Token Update ───
    { scene_id: "u09_s10", no: "10", title: "각 token 위치마다 hidden vector가 업데이트", title_en: "Per-Token Hidden Update",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "encoder block 입력", representation: "encoder block 출력 — 각 위치의 vector가 갱신됨", calculation_target: "Self-Attn + Drop+Add&Norm + FFN + Drop+Add&Norm", concept_classification: "표현 · encoder output", importance: { type: "difference", text: "RNN h_t는 시간축 하나의 상태, Transformer는 각 token 위치마다 독립적 representation" } },
      moving_object: "각 token 위치의 vector가 갱신되는 장면", scene_objects: [
        { id: "input_vectors", type: "token_list", role: "입력 vectors", visibility: "open" },
        { id: "output_vectors", type: "token_list", role: "갱신된 vectors — Attention 정보 포함", visibility: "open" }
      ],
      animation_steps: ["encoder block을 거치면 각 token 위치의 vector가 갱신된다", "모든 위치가 동시에 갱신 (RNN과 달리 순차가 아님)", "\"N개 layer를 반복하면 점점 정교한 representation\""],
      zoom: { required: false, reason: "갱신 결과 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "입력", note: "x_1' · x_2' · x_3'" }, right: { title: "갱신", note: "h_1 · h_2 · h_3\n+ Attention 정보" }, arrow: "Block" } },
      links: [{ target: "u09_s11", label: "다음: ×N 반복", type: "next" }]
    },

    // ─── NEW: ×N Layer Stacking ───
    { scene_id: "u09_s11", no: "11", title: "Encoder ×N — layer 쌓기와 Encoder Memory", title_en: "Encoder Stack ×N",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: { data: "encoder layer 1개의 출력", representation: "같은 구조의 layer를 N번 쌓음 → 최종 encoder output = Encoder Memory", calculation_target: "layer별 파라미터는 다르지만 구조는 동일 (repeated layer)", concept_classification: "어텐션 · encoder stack", importance: { type: "usage", text: "최종 출력이 Decoder의 Cross-Attention에서 K/V로 참조된다 (Encoder Memory)" } },
      moving_object: "layer가 쌓이고 최종 출력이 Encoder Memory로 라벨되는 장면", scene_objects: [
        { id: "encoder_stack", type: "schematic", role: "Encoder Layer ×N", visibility: "open", reuse: { type: "repeated-layer", label: "repeated layer", note: "같은 구조, layer별 다른 파라미터" } },
        { id: "encoder_memory", type: "hidden_state_packet", role: "최종 출력 = Encoder Memory — Decoder Cross-Attn의 K/V source", visibility: "open" }
      ],
      animation_steps: ["Encoder Layer 1 → 출력이 Layer 2 입력이 된다", "Layer 2 → Layer 3 → … → Layer N", "각 layer는 같은 구조, 다른 파라미터 (repeated layer)", "최종 출력 = Encoder Memory", "\"이 Memory가 Decoder Cross-Attention에서 K, V로 사용된다\""],
      zoom: { required: false, reason: "stack 구조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: { levels: [
        { scope: "Layer 1", blocks: [{ label: "Attn+FFN", focus: false }] },
        { scope: "Layer N", blocks: [{ label: "Attn+FFN", focus: false }] },
        { scope: "출력", content: "Encoder Memory\n→ Decoder K/V" }
      ], focus: 2, breadcrumb: "Encoder Stack × N → Memory" } },
      links: [
        { target: "u09_s12", label: "다음: RNN hs vs Transformer hs", type: "next" },
        { target: "_unit:unit10", label: "연결: Decoder가 이 Memory를 참조", type: "cross", note: "Unit 10 Cross-Attn" }
      ]
    },

    // ─── RNN vs Transformer hs ───
    { scene_id: "u09_s12", no: "12", title: "RNN hidden state vs Transformer hidden state", title_en: "RNN hs vs Transformer hs",
      animation_type: ["before_after_contrast"],
      correction: "Transformer hidden state를 RNN의 h_t와 동일시하지 않는다.",
      prereqs: [{ target: "_unit:unit04", concept: "RNN h_t", label: "Unit 04", note: "RNN h_t가 시간축으로 전달되는 값이라는 설명은 이미 됨" }],
      five_unit_frame: { data: "같은 sequence", representation: "RNN: 시점별 h_t 순차 / Transformer: layer별 모든 위치 동시", calculation_target: "구조적 차이", concept_classification: "표현 · 아키텍처 비교", importance: { type: "difference", text: "같은 'hidden state' 이름이지만 구조가 완전히 다르다" } },
      moving_object: "두 구조가 나란히 놓이는 장면", scene_objects: [
        { id: "rnn_hs", type: "schematic", role: "RNN: h_t 시간축 순차", visibility: "open" },
        { id: "transformer_hs", type: "schematic", role: "Transformer: layer별 모든 위치 동시", visibility: "open" }
      ],
      animation_steps: ["왼쪽 RNN: h_1 → h_2 → h_3 순차", "오른쪽 Transformer: [h_1,h_2,h_3] 동시 갱신", "같은 'hidden state' 이름이지만 구조가 다르다"],
      zoom: { required: false, reason: "대조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "RNN hs", note: "h_t→h_{t+1}\n시간축 순차" }, right: { title: "Transformer hs", note: "[h_1,h_2,h_3]\nlayer별 동시" }, arrow: "≠" } },
      links: [{ target: "u09_s13", label: "다음: Input Pipeline 전체 요약", type: "next" }]
    },

    // ─── NEW: Input Pipeline 요약 (Embedding → Scaling → PE → Dropout) ───
    { scene_id: "u09_s13", no: "13", title: "Input Pipeline 요약 — E → ×√d → +PE → Dropout", title_en: "Input Pipeline Summary",
      animation_type: ["formula_lock"],
      five_unit_frame: { data: "token ids", representation: "E[id] × √d_model + PE → Dropout → encoder 입력", calculation_target: "4단계 입력 파이프라인을 수식으로 압축", concept_classification: "표현 · input pipeline", importance: { type: "usage", text: "Decoder Input Pipeline도 같은 구조 (Unit 10에서 same type으로 재사용)" } },
      moving_object: "4단계 파이프라인을 통과하는 packet", scene_objects: [
        { id: "pipeline", type: "schematic", role: "E[id] → ×√d → +PE → Dropout", visibility: "open" },
        { id: "formula_panel", type: "formula_lock", role: "x = Dropout(E[id]·√d_model + PE)", visibility: "open" }
      ],
      animation_steps: ["Token IDs → E[id] (lookup)", "×√d_model (scaling)", "+ PE (위치 정보)", "Dropout (training만)", "결과: encoder 입력 vectors"],
      zoom: { required: false, reason: "요약 — 1 view" },
      formula_lock: { needed: true, formula: "x = \\text{Dropout}(E[\\text{id}] \\cdot \\sqrt{d_{\\text{model}}} + PE)", when_to_show: "파이프라인 완료 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["E[id]", "×√d", "+PE", "Dropout"], formula: "x = Dropout(E·√d + PE)", stateSlot: 2 } },
      links: [{ target: "u09_s14", label: "다음: Encoder 전체 formula lock", type: "next" }]
    },

    // ─── Encoder Formula Lock ───
    { scene_id: "u09_s14", no: "14", title: "Encoder 전체 수식 — formula lock", title_en: "Encoder Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: { data: "encoder 전체", representation: "Input Pipeline → Encoder Block ×N → Encoder Memory", calculation_target: "이미 본 블록들을 수식으로 압축", concept_classification: "어텐션 · encoder", importance: { type: "usage", text: "Encoder Memory가 Decoder Cross-Attention의 K/V로 전달된다" } },
      moving_object: "수식이 순서대로 고정", scene_objects: [
        { id: "formula_panel", type: "formula_lock", role: "encoder 전체 수식", visibility: "open" },
        { id: "memory_note", type: "annotation_callout", role: "Encoder Memory → Decoder Cross-Attn K/V", visibility: "open" }
      ],
      animation_steps: ["x = Dropout(E[id]·√d + PE)", "h' = LN(x + Dropout(MHA(x, padding_mask)))", "h'' = LN(h' + Dropout(FFN(h')))", "× N layers → Encoder Memory", "\"이 Memory가 Decoder에서 참조된다\""],
      zoom: { required: false, reason: "수식 요약 — 1 view" },
      formula_lock: { needed: true, formula: "x = \\text{Drop}(E \\cdot \\sqrt{d} + PE) \\\\ h' = \\text{LN}(x + \\text{Drop}(\\text{MHA}(x))) \\\\ h'' = \\text{LN}(h' + \\text{Drop}(\\text{FFN}(h')))", when_to_show: "전체 흐름 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["Input Pipeline", "MHA+Drop+Add&LN", "FFN+Drop+Add&LN", "×N → Memory"], formula: "Encoder = Pipeline → Block×N → Memory", stateSlot: 2 } },
      links: [{ target: "_unit:unit10", label: "다음 단원: Decoder", type: "cross", note: "Unit 10" }]
    }
  ]
};
