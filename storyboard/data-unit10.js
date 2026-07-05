// Unit 10 — Transformer Decoder / Training vs Inference (13 scenes, v2 tree aligned)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit10 = {
  id: "unit10", no: "10", topic: 4,
  title_en: "Transformer Decoder / Training vs Inference",
  title_ko: "디코더 · 학습 vs 추론",
  core_question: "학습 때와 추론 때 decoder는 어떻게 다르게 작동하는가?",
  correct_framing: "Training: teacher forcing으로 정답 token을 입력하고 mask로 미래를 가린다. Inference: 이전까지 생성한 token만 입력하고 autoregressive로 반복한다.",
  avoid: [
    "training과 inference를 같은 화면에 섞지 않는다.",
    "masked self-attention의 mask를 단순 '가림'으로 끝내지 않는다 — Padding Mask + Causal Mask 결합.",
    "Teacher Forcing을 Decoder 설명 안에 묻지 않는다 — 독립 scene.",
    "Logits 단계를 생략하지 않는다 — Linear → Logits → Softmax → Probabilities 분리.",
    "Encoder Memory를 추상적으로 넘기지 않는다 — Cross-Attention의 K/V source임을 명시."
  ],
  routing: { emphasis: "계산 대상: masked attention, teacher forcing, next-token loop", types: ["heatmap_focus", "before_after_contrast", "packet_flow"] },
  importance: {
    usage: "GPT 계열 모델, 기계 번역 decoder, text generation의 핵심 구조.",
    necessity: "Encoder만으로는 출력을 생성할 수 없다 — Decoder가 autoregressive 생성을 담당한다.",
    difference: "Encoder는 입력 전체를 동시에 볼 수 있지만, Decoder는 현재 위치 이전까지만 볼 수 있다.",
    strength: "Training 때는 병렬 계산, Inference 때는 순차 생성 — 같은 구조로 두 모드를 지원."
  },
  scenes: [
    // ─── NEW: Decoder Input Pipeline ───
    { scene_id: "u10_s01", no: "01", title: "Decoder Input Pipeline — shifted-right + 임베딩 + 스케일링 + PE + Dropout", title_en: "Decoder Input Pipeline",
      animation_type: ["packet_flow"],
      prereqs: [
        { target: "_unit:unit09", concept: "Input Pipeline", label: "Unit 09 S01-S05/S13", note: "Encoder Input Pipeline과 동일 구조 — same type" },
        { target: "_unit:unit01", concept: "BOS/EOS/PAD", label: "Unit 01 S07", note: "special tokens은 이미 설명됨" }
      ],
      five_unit_frame: { data: "정답 token sequence (training) 또는 이전 생성 tokens (inference)", representation: "shifted-right → Embedding → ×√d_model → +PE → Dropout", calculation_target: "Decoder 입력 준비 — Encoder Input Pipeline과 same type", concept_classification: "어텐션 · decoder input", importance: { type: "necessity", text: "Decoder는 [BOS]부터 시작하고, 정답을 한 칸 밀어서(shifted-right) 입력한다" } },
      moving_object: "정답 tokens가 shifted-right 되어 pipeline을 통과", scene_objects: [
        { id: "target_tokens", type: "token_list", role: "정답: [BOS, I, am, a, student]", visibility: "open" },
        { id: "shifted_input", type: "token_list", role: "shifted-right: [BOS, I, am, a] → decoder 입력", visibility: "open" },
        { id: "pipeline", type: "schematic", role: "E[id] → ×√d_model → +PE → Dropout", visibility: "collapsed", reuse: { type: "same-type", label: "same type", note: "Encoder Input Pipeline과 동일 구조, 다른 embedding table 가능" } },
        { id: "decoder_input_vectors", type: "token_list", role: "decoder 입력 vectors", visibility: "open" }
      ],
      animation_steps: ["정답 sequence가 한 칸 right-shift된다: [BOS, I, am, a]", "Embedding lookup → ×√d_model scaling → +PE → Dropout", "Encoder Input Pipeline과 same type (구조 동일)", "\"training: 정답 사용 / inference: 이전 생성 token 사용\""],
      zoom: { required: false, reason: "pipeline 참조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["[BOS, I, am, a]", "E→×√d→+PE→Drop", "decoder vectors"], packet: "shifted", labels: ["shifted-right", "pipeline", "입력"] } },
      links: [{ target: "u10_s02", label: "다음: Decoder Block 전체", type: "next" }]
    },

    // ─── Decoder Block Overview ───
    { scene_id: "u10_s02", no: "02", title: "Decoder Block 전체 — collapsed overview", title_en: "Decoder Block Overview",
      animation_type: ["zoom_hierarchy"],
      prereqs: [{ target: "_unit:unit09", concept: "Encoder Block 구조", label: "Unit 09", note: "Encoder Block의 구조는 이미 해부됨" }],
      five_unit_frame: { data: "decoder 입력 vectors + Encoder Memory", representation: "Masked Self-Attn → Drop+Add&Norm → Cross-Attn → Drop+Add&Norm → FFN → Drop+Add&Norm", calculation_target: "Encoder block + 2가지 추가: Masked Self-Attn(Causal+Padding), Cross-Attn(Encoder Memory 참조)", concept_classification: "어텐션 · decoder architecture", importance: { type: "difference", text: "Encoder block에 Masked Self-Attention과 Cross-Attention이 추가된 구조" } },
      moving_object: "하위 block들이 순서대로 놓이는 장면", scene_objects: [
        { id: "masked_self_attn", type: "procedure_block", role: "Masked Self-Attention (Causal + Padding Mask)", visibility: "collapsed" },
        { id: "cross_attn", type: "procedure_block", role: "Cross-Attention (Q=decoder, K/V=Encoder Memory)", visibility: "collapsed" },
        { id: "ffn_block", type: "procedure_block", role: "FFN", visibility: "collapsed", reuse: { type: "same-type", label: "same type", note: "Unit 09 FFN과 동일 구조" } },
        { id: "drop_add_norm", type: "procedure_block", role: "Dropout+Add&Norm ×3", visibility: "collapsed", reuse: { type: "same-operation", label: "same op", note: "Unit 09 S08과 동일" } }
      ],
      animation_steps: ["Decoder block 해부도 등장", "Masked Self-Attn → Drop+Add&Norm → Cross-Attn → Drop+Add&Norm → FFN → Drop+Add&Norm", "FFN, Drop+Add&Norm은 same type/op (Unit 09 참조)", "\"Masked와 Cross — 이 두 가지가 decoder의 핵심 차이\""],
      zoom: { required: true, reason: "하위 block들을 각각 독립 scene으로 zoom", sequence: ["Decoder Block (global)", "Masked Self-Attn(Causal+Pad)", "Cross-Attn(Memory)", "Training vs Inference"], interaction: "anatomy" },
      formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: { levels: [
        { scope: "Decoder Block", blocks: [{ label: "Masked Self-Attn", focus: false }, { label: "D+A&N", focus: false }, { label: "Cross-Attn", focus: false }, { label: "D+A&N", focus: false }, { label: "FFN", focus: false }, { label: "D+A&N", focus: false }] },
        { scope: "Encoder와 차이", blocks: [{ label: "Causal+Pad Mask", focus: true }, { label: "Cross-Attn(Memory)", focus: true }] },
        { scope: "공유", content: "FFN, D+A&N\nsame type/op" }
      ], focus: 0, breadcrumb: "Decoder Block · Masked + Cross 추가" } },
      links: [{ target: "u10_s03", label: "zoom: Masked Self-Attention", type: "next" }]
    },

    // ─── Masked Self-Attention (Causal + Padding) ───
    { scene_id: "u10_s03", no: "03", title: "Masked Self-Attention — Causal Mask + Padding Mask 결합", title_en: "Masked Self-Attention: Causal + Padding",
      animation_type: ["heatmap_focus"],
      prereqs: [{ target: "_unit:unit01", concept: "Padding Mask", label: "Unit 01 S08", note: "PAD mask는 이미 설명됨" }],
      five_unit_frame: { data: "decoder token sequence [y_1, y_2, y_3, PAD]", representation: "Causal Mask(하삼각) + Padding Mask 결합 → 최종 mask", calculation_target: "미래 token + PAD token 양쪽 모두 −∞ 처리", concept_classification: "어텐션 · masked attention", importance: { type: "necessity", text: "Causal Mask만으로는 PAD를 무시 못하고, Padding Mask만으로는 미래를 차단 못한다 — 결합 필수" } },
      moving_object: "두 mask가 결합되어 최종 mask가 되는 장면", scene_objects: [
        { id: "causal_mask", type: "score_matrix", role: "Causal Mask — 하삼각 (미래=−∞)", visibility: "open" },
        { id: "padding_mask", type: "score_matrix", role: "Padding Mask — PAD 열=−∞", visibility: "open" },
        { id: "combined_mask", type: "score_matrix", role: "결합 mask — 미래+PAD 모두 −∞", visibility: "open" }
      ],
      animation_steps: ["Causal Mask: 상삼각(미래) = −∞ (하삼각만 참조 가능)", "Padding Mask: PAD 열 = −∞", "두 mask를 결합: 미래 + PAD 양쪽 모두 −∞", "softmax 후: 미래=0, PAD=0 — 유효 token의 과거만 참조", "\"Decoder Masked Self-Attention = Causal + Padding 결합\""],
      zoom: { required: true, reason: "Decoder block에서 Masked Self-Attn으로 zoom", sequence: ["Decoder Block", "Masked Self-Attn ●", "Causal + Padding 결합"], interaction: "anatomy" },
      formula_lock: { needed: false },
      sketch: { kind: "matrix_build", params: { rows: ["y_1", "y_2", "y_3", "PAD"], cols: ["y_1", "y_2", "y_3", "PAD"], cells: [["✓", "−∞", "−∞", "−∞"], ["✓", "✓", "−∞", "−∞"], ["✓", "✓", "✓", "−∞"], ["✓", "✓", "✓", "−∞"]], highlightRow: 1, caption: "Causal + Padding Mask 결합" } },
      links: [{ target: "u10_s04", label: "다음: Cross-Attention", type: "next" }]
    },

    // ─── Cross-Attention + Encoder Memory ───
    { scene_id: "u10_s04", no: "04", title: "Cross-Attention — Decoder Q가 Encoder Memory(K/V)를 참조", title_en: "Cross-Attention over Encoder Memory",
      animation_type: ["heatmap_focus", "packet_flow"],
      prereqs: [{ target: "_unit:unit09", concept: "Encoder Memory", label: "Unit 09 S11", note: "Encoder 최종 출력 = Memory" }],
      five_unit_frame: { data: "Decoder hidden states (Q source) + Encoder Memory (K/V source)", representation: "Q = Decoder × W_Q, K = Memory × W_K, V = Memory × W_V", calculation_target: "decoder의 각 위치가 encoder memory의 어떤 위치를 참조할지", concept_classification: "어텐션 · cross-attention", importance: { type: "difference", text: "Self-Attn은 Q=K=V=같은 source, Cross-Attn은 Q=decoder, K/V=encoder memory" } },
      moving_object: "decoder Q가 encoder memory K/V에 연결되는 장면", scene_objects: [
        { id: "decoder_hidden", type: "token_list", role: "Decoder hidden states → Q", visibility: "open" },
        { id: "encoder_memory", type: "hidden_state_packet", role: "Encoder Memory → K, V (Unit 09 최종 출력)", visibility: "open" },
        { id: "cross_attn_heatmap", type: "score_matrix", role: "Cross-attention: decoder→encoder 참조", visibility: "open" },
        { id: "padding_mask_enc", type: "annotation_callout", role: "Padding Mask: encoder memory의 PAD 무시", visibility: "open" }
      ],
      animation_steps: ["Decoder hidden states → W_Q → Q", "Encoder Memory → W_K → K, W_V → V (다른 source)", "Q·K^T → cross-attention score", "Padding Mask: encoder memory의 PAD 위치 = −∞", "softmax → distribution → ×V → decoder가 encoder 정보 참조"],
      zoom: { required: true, reason: "Decoder block에서 Cross-Attn으로 zoom", sequence: ["Decoder Block", "Cross-Attn ●", "Q=decoder, K/V=Memory"], interaction: "anatomy" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Self-Attn", note: "Q=K=V\n같은 source" }, right: { title: "Cross-Attn", note: "Q=decoder\nK,V=Encoder Memory" }, arrow: "차이" } },
      links: [{ target: "u10_s05", label: "다음: Output Head", type: "next" }]
    },

    // ─── Output Head: Linear → Logits → Softmax → Probabilities ───
    { scene_id: "u10_s05", no: "05", title: "Output Head — Linear → Logits → Softmax → Probabilities", title_en: "Output Head Pipeline",
      animation_type: ["packet_flow"],
      prereqs: [{ target: "_unit:unit02", concept: "softmax", label: "Unit 02", note: "softmax는 이미 해부됨" }],
      five_unit_frame: { data: "decoder block 출력 hidden vector", representation: "Linear(d_model→|V|) → logits → softmax → probability distribution", calculation_target: "4단계 분리: hidden → logits(원점수) → softmax → probabilities", concept_classification: "어텐션 · output generation", importance: { type: "necessity", text: "logits와 probabilities를 구분해야 loss 계산(Unit 11)이 정확해진다" } },
      moving_object: "hidden → logits → softmax → probabilities 순서로 변환", scene_objects: [
        { id: "hidden_vector", type: "embedding_vector", role: "decoder 최종 hidden vector (d_model)", visibility: "open" },
        { id: "vocab_linear", type: "procedure_block", role: "Linear: d_model → |V| (vocab projection)", visibility: "open", postprocess: "", reuse: { type: "same-type", label: "same type", note: "Linear 구조 동일" } },
        { id: "logits", type: "embedding_vector", role: "logits — vocab별 원점수 [3.2, 1.1, 0.5, −0.3, …]", visibility: "open" },
        { id: "softmax_fn", type: "procedure_block", role: "Softmax over vocabulary", visibility: "open", postprocess: "softmax", reuse: { type: "same-operation", label: "same op", note: "Attention softmax와 같은 함수, 축이 다름(vocab축)" } },
        { id: "probabilities", type: "distribution_row", role: "output probabilities [0.72, 0.09, …] Σ=1", visibility: "open" }
      ],
      animation_steps: ["decoder hidden vector가 Linear에 들어간다 (d_model → |V|)", "결과: logits — 각 vocab token에 대한 원점수", "\"logits는 아직 확률이 아니다 — 크기 비교만 가능\"", "Softmax → probability distribution (합=1)", "\"Attention softmax는 token 위치 축, Output softmax는 vocabulary 축\""],
      zoom: { required: false, reason: "output pipeline — 1 view" },
      formula_lock: { needed: true, formula: "\\text{logits} = Wh + b, \\quad p = \\text{softmax}(\\text{logits})", when_to_show: "probabilities 완성 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["hidden", "Linear(→|V|)", "logits", "softmax", "probs"], formula: "logits = Wh+b, p = softmax(logits)", stateSlot: 3 } },
      links: [{ target: "u10_s06", label: "다음: Teacher Forcing", type: "next" }, { target: "_unit:unit11", label: "연결: logits → CE loss", type: "cross", note: "Unit 11" }]
    },

    // ─── Teacher Forcing ───
    { scene_id: "u10_s06", no: "06", title: "Teacher Forcing — Training 때 정답을 입력으로", title_en: "Teacher Forcing",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "정답 token sequence", representation: "한 칸 밀어서 decoder 입력: [BOS, I, am, a] → 기대 출력: [I, am, a, student]", calculation_target: "이전 정답 token을 입력으로 사용 — 모델 생성 token이 아님", concept_classification: "학습 · teacher forcing", importance: { type: "necessity", text: "training 때 모델의 오류가 다음 입력에 전파되지 않도록 정답을 직접 공급" } },
      moving_object: "정답 token이 한 칸씩 밀려 decoder 입력으로", scene_objects: [
        { id: "target_sequence", type: "token_list", role: "정답: [BOS, I, am, a, student]", visibility: "open" },
        { id: "shifted_input", type: "token_list", role: "입력 (shifted): [BOS, I, am, a]", visibility: "open" },
        { id: "expected_output", type: "token_list", role: "기대 출력: [I, am, a, student]", visibility: "open" }
      ],
      animation_steps: ["정답 sequence가 놓인다", "한 칸 shift → decoder 입력: [BOS, I, am, a]", "각 위치의 기대 출력: [I, am, a, student]", "mask로 미래 정답은 못 보게 (S03 참조)", "\"모델이 틀려도 다음 입력은 정답\""],
      zoom: { required: false, reason: "teacher forcing — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "정답 (shifted)", note: "[BOS, I, am, a]\ndecoder 입력" }, right: { title: "기대 출력", note: "[I, am, a, student]\nloss 계산 대상" }, arrow: "한 칸 밀기" } },
      links: [{ target: "u10_s07", label: "다음: Training 병렬 loss", type: "next" }]
    },

    // ─── Training: Parallel Loss ───
    { scene_id: "u10_s07", no: "07", title: "Training — 모든 위치에서 동시에 loss 계산", title_en: "Training: Parallel Loss",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "shifted 정답 + mask", representation: "모든 위치의 logits vs 정답 → CE loss 합산", calculation_target: "각 위치: softmax(logits) vs 정답 token → CE loss", concept_classification: "학습 · training mode", importance: { type: "strength", text: "모든 위치를 병렬로 계산 — RNN처럼 순차 필요 없음" } },
      moving_object: "모든 위치에서 동시에 loss가 계산되는 장면", scene_objects: [
        { id: "parallel_computation", type: "schematic", role: "모든 위치 동시 계산 (mask 적용)", visibility: "open" },
        { id: "logits_per_pos", type: "embedding_vector", role: "위치별 logits → softmax → probabilities", visibility: "open" },
        { id: "loss_per_position", type: "calculation_node", role: "위치별 CE loss (Padding 위치 제외)", visibility: "open", reuse: { type: "same-operation", label: "same op", note: "Unit 11 CE loss와 동일" } }
      ],
      animation_steps: ["shifted 입력이 decoder에 한 번에 들어감", "mask로 미래+PAD 차단 → 모든 위치 동시 계산", "각 위치: logits → softmax → probabilities → CE loss", "Padding 위치 loss 제외 (loss mask, Unit 11 참조)", "\"병렬 계산 — training이 빠른 이유\""],
      zoom: { required: false, reason: "training 흐름 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["shifted 입력", "decoder (masked)", "logits → CE loss 합산"], packet: "loss", labels: ["teacher forcing", "병렬 계산", "loss"] } },
      links: [{ target: "u10_s08", label: "다음: Inference 모드", type: "next" }]
    },

    // ─── Inference: Autoregressive ───
    { scene_id: "u10_s08", no: "08", title: "Inference — autoregressive loop", title_en: "Inference: Autoregressive Generation",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "[BOS] token만으로 시작", representation: "한 번에 token 1개 생성 → 입력에 붙임 → 반복", calculation_target: "decoder → logits → softmax → argmax → 다음 입력에 append", concept_classification: "추론 · inference mode", importance: { type: "difference", text: "Training과 달리 정답이 없다 — 모델 생성 token이 다음 입력" } },
      moving_object: "생성된 token이 입력에 append되어 loop를 형성", scene_objects: [
        { id: "growing_sequence", type: "token_list", role: "[BOS] → [BOS, I] → [BOS, I, am] → …", visibility: "open" },
        { id: "decoder_step", type: "schematic", role: "decoder → logits → softmax → argmax", visibility: "open", reuse: { type: "same-type", label: "same type", note: "같은 decoder, step마다 반복" } },
        { id: "eos_check", type: "annotation_callout", role: "[EOS] 생성 시 종료", visibility: "open" }
      ],
      animation_steps: ["[BOS]만 decoder에 입력", "decoder → logits → softmax → argmax → 'I' 생성", "[BOS, I]를 다시 decoder에 입력", "반복 … [EOS] 생성 시 종료", "\"한 번에 1 token — training의 병렬과 대조적\""],
      zoom: { required: false, reason: "autoregressive loop — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["[BOS]", "decoder→logits→argmax", "append→반복"], packet: "y_t", labels: ["시작", "생성", "loop"] } },
      links: [{ target: "u10_s09", label: "다음: Training vs Inference 대조", type: "next" }]
    },

    // ─── Training vs Inference Contrast ───
    { scene_id: "u10_s09", no: "09", title: "Training vs Inference — 핵심 대조", title_en: "Training vs Inference Contrast",
      animation_type: ["before_after_contrast"],
      five_unit_frame: { data: "같은 decoder 구조", representation: "Training: teacher forcing + 병렬 / Inference: autoregressive + 순차", calculation_target: "입력 source, 계산 방식, 속도의 차이", concept_classification: "학습 vs 추론", importance: { type: "difference", text: "같은 구조지만 작동 방식이 완전히 다르다" } },
      moving_object: "두 모드가 나란히 놓여 차이가 드러나는 장면", scene_objects: [
        { id: "training_panel", type: "schematic", role: "Training: 정답 입력, mask, 병렬, loss", visibility: "open" },
        { id: "inference_panel", type: "schematic", role: "Inference: 생성 입력, loop, 순차, output", visibility: "open" },
        { id: "contrast_table", type: "comparison_pair_object", role: "입력/계산/속도/목적 비교", visibility: "open" }
      ],
      animation_steps: ["Training: 정답 shifted → 병렬 → logits → CE loss", "Inference: [BOS] → 1개씩 → logits → argmax → append → loop", "입력: 정답 vs 모델 생성값", "계산: 병렬 vs 순차", "목적: 파라미터 학습 vs 텍스트 생성"],
      zoom: { required: false, reason: "대조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Training", note: "teacher forcing\n병렬 · logits→CE loss" }, right: { title: "Inference", note: "autoregressive\n순차 · logits→argmax" }, arrow: "같은 구조\n다른 모드" } },
      links: [{ target: "u10_s10", label: "다음: Decoder ×N stack", type: "next" }]
    },

    // ─── Decoder ×N Stack ───
    { scene_id: "u10_s10", no: "10", title: "Decoder ×N — layer 쌓기", title_en: "Decoder Stack ×N",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: { data: "decoder layer 1개의 출력", representation: "같은 구조의 layer를 N번 쌓음", calculation_target: "layer별 파라미터 다르지만 구조 동일 (repeated layer)", concept_classification: "어텐션 · decoder stack", importance: { type: "usage", text: "모든 layer에서 Encoder Memory를 동일하게 참조 (cross-attention)" } },
      moving_object: "decoder layer가 쌓이는 장면", scene_objects: [
        { id: "decoder_stack", type: "schematic", role: "Decoder Layer ×N", visibility: "open", reuse: { type: "repeated-layer", label: "repeated layer" } },
        { id: "memory_ref", type: "annotation_callout", role: "모든 layer의 Cross-Attn이 같은 Encoder Memory 참조", visibility: "open" }
      ],
      animation_steps: ["Decoder Layer 1 → 2 → … → N", "각 layer는 같은 구조, 다른 파라미터", "모든 layer의 Cross-Attention이 동일한 Encoder Memory를 K/V로 참조", "최종 출력 → Output Head (S05)"],
      zoom: { required: false, reason: "stack — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: { levels: [
        { scope: "Layer 1", blocks: [{ label: "Masked+Cross+FFN", focus: false }] },
        { scope: "Layer N", blocks: [{ label: "Masked+Cross+FFN", focus: false }] },
        { scope: "출력", content: "→ Output Head\nLinear→Logits→Softmax" }
      ], focus: 2, breadcrumb: "Decoder Stack × N" } },
      links: [{ target: "u10_s11", label: "다음: Encoder-Decoder 전체 조감", type: "next" }]
    },

    // ─── NEW: Encoder-Decoder 전체 조감 (L0 view) ───
    { scene_id: "u10_s11", no: "11", title: "Transformer 전체 — Encoder ⇄ Decoder 조감", title_en: "Full Transformer L0 View",
      animation_type: ["zoom_hierarchy"],
      five_unit_frame: { data: "입력 sequence + 출력 sequence", representation: "Input Pipeline → Encoder ×N → Memory ⇄ Decoder ×N → Output Head", calculation_target: "L0 가장 추상적 view — 모든 구성이 한 화면에", concept_classification: "어텐션 · transformer 전체", importance: { type: "usage", text: "이 전체 구조가 기계 번역, 요약, 생성 등에서 사용된다" } },
      moving_object: "입력이 encoder를 거쳐 memory가 되고 decoder가 참조하여 출력을 생성하는 전체 흐름", scene_objects: [
        { id: "encoder_block", type: "schematic", role: "Encoder: Input Pipeline → ×N → Memory", visibility: "collapsed", reuse: { type: "same-type", label: "same type" } },
        { id: "decoder_block", type: "schematic", role: "Decoder: Input Pipeline → ×N → Output Head", visibility: "collapsed", reuse: { type: "same-type", label: "same type" } },
        { id: "memory_connection", type: "annotation_callout", role: "Memory ⇄ Cross-Attention (모든 decoder layer)", visibility: "open" }
      ],
      animation_steps: ["왼쪽: Encoder (Input Pipeline → ×N → Memory)", "오른쪽: Decoder (Input Pipeline → ×N → Output Head)", "가운데: Memory가 모든 Decoder layer의 Cross-Attn으로 연결", "\"이것이 Transformer의 L0 — 가장 추상적 전체 구조\""],
      zoom: { required: false, reason: "L0 조감 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "zoom_hierarchy", params: { levels: [
        { scope: "Encoder", blocks: [{ label: "Pipeline→×N→Memory", focus: false }] },
        { scope: "Memory", blocks: [{ label: "⇄ Cross-Attn", focus: true }] },
        { scope: "Decoder", blocks: [{ label: "Pipeline→×N→Output", focus: false }] }
      ], focus: 1, breadcrumb: "L0: Transformer = Encoder ⇄ Decoder" } },
      links: [{ target: "u10_s12", label: "다음: Encoder-Decoder 차이 정리", type: "next" }]
    },

    // ─── Encoder vs Decoder 차이 정리 ───
    { scene_id: "u10_s12", no: "12", title: "Encoder vs Decoder — 구조 차이 정리", title_en: "Encoder vs Decoder Differences",
      animation_type: ["before_after_contrast"],
      five_unit_frame: { data: "Encoder block vs Decoder block", representation: "Self-Attn vs Masked+Cross / Add&Norm ×2 vs ×3 / Output Head 유무", calculation_target: "블록 단위 차이 비교", concept_classification: "어텐션 · 아키텍처 비교", importance: { type: "difference", text: "같은 기본 구조에 mask와 cross-attention이 추가된 것이 decoder" } },
      moving_object: "두 block이 나란히 놓여 차이가 드러나는 장면", scene_objects: [
        { id: "encoder_panel", type: "schematic", role: "Encoder: Self-Attn(+PadMask) + FFN + ×2 D+A&N", visibility: "open" },
        { id: "decoder_panel", type: "schematic", role: "Decoder: Masked(Causal+Pad) + Cross(Memory) + FFN + ×3 D+A&N + Output Head", visibility: "open" }
      ],
      animation_steps: ["Self-Attn: Encoder=Padding만 / Decoder=Causal+Padding", "Cross-Attn: Encoder=없음 / Decoder=Encoder Memory 참조", "Add&Norm: Encoder=×2 / Decoder=×3", "FFN: 동일 (same type)", "Output Head: Encoder=없음 / Decoder=Linear+Logits+Softmax"],
      zoom: { required: false, reason: "대조 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Encoder", note: "Self-Attn(Pad)\nFFN\n×2 D+A&N" }, right: { title: "Decoder", note: "Masked(Causal+Pad)\nCross(Memory)\nFFN · ×3 D+A&N\n+ Output Head" }, arrow: "차이" } },
      links: [{ target: "u10_s13", label: "다음: formula lock", type: "next" }]
    },

    // ─── Decoder Formula Lock ───
    { scene_id: "u10_s13", no: "13", title: "Decoder 전체 수식 — formula lock", title_en: "Decoder Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: { data: "Decoder 전체", representation: "Input Pipeline + Masked Self-Attn + Cross-Attn + FFN + Output Head", calculation_target: "이미 본 블록들을 수식으로 압축", concept_classification: "어텐션 · decoder", importance: { type: "usage", text: "다음 단원: Loss/CE/Gradient가 이 output에서 시작" } },
      moving_object: "수식이 순서대로 고정", scene_objects: [
        { id: "formula_panel", type: "formula_lock", role: "Decoder 수식 + training/inference 구분", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit '계산 대상' slot", visibility: "open" }
      ],
      animation_steps: ["y = Dropout(E[id]·√d + PE) — decoder input pipeline", "h' = LN(y + Drop(MaskedMHA(y, causal+pad)))", "h'' = LN(h' + Drop(CrossMHA(h', Memory, pad)))", "h''' = LN(h'' + Drop(FFN(h'')))", "logits = Wh''' + b, p = softmax(logits)"],
      zoom: { required: false, reason: "수식 요약 — 1 view" },
      formula_lock: { needed: true, formula: "y = \\text{Drop}(E \\cdot \\sqrt{d} + PE) \\\\ h' = \\text{LN}(y + \\text{Drop}(\\text{MaskedMHA}(y))) \\\\ h'' = \\text{LN}(h' + \\text{Drop}(\\text{CrossMHA}(h', H_{\\text{enc}}))) \\\\ h''' = \\text{LN}(h'' + \\text{Drop}(\\text{FFN}(h'')))", when_to_show: "수식 배치 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["Input", "MaskedMHA", "CrossMHA", "FFN", "Output"], formula: "Decoder = Masked + Cross + FFN + Head", stateSlot: 3 } },
      links: [{ target: "_unit:unit11", label: "다음 단원: Loss/CE/Gradient", type: "cross", note: "Unit 11" }]
    }
  ]
};
