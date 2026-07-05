// Unit 01 — Tokenization / Vocab / Integer ID / Embedding
// Scene plan (DS schema + strategy doc 4.1/4.2): 9 scenes (revised per review feedback)
// 예시 문장: "나는 어제 영화를 봤다"
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit01 = {
  id: "unit01", no: "01", topic: 1,
  title_en: "Tokenization / Vocab / Integer ID / Embedding",
  title_ko: "토큰화 · 어휘집 · 정수 ID · 임베딩",
  core_question: "정수 인코딩 숫자는 계산 가능한 의미 숫자인가?",
  correct_framing: "정수 ID는 식별자다. 의미적 거리는 학습된 embedding table을 거친 뒤 생긴다.",
  avoid: [
    "정수 ID에 의미적 거리가 있다고 설명하지 않는다 — ID 120과 121이 비슷하다는 뜻이 아니다.",
    "embedding table을 고정된 표처럼 설명하지 않는다 — training 중에는 backprop으로 갱신되고, inference 중에는 고정 조회된다.",
    "초기화 직후 embedding에 의미 거리가 있다고 설명하지 않는다 — 랜덤 초기화 후 학습을 거쳐야 의미 거리가 생긴다."
  ],
  routing: { emphasis: "표현: text → token → id → embedding vector", types: ["packet_flow", "matrix_build", "before_after_contrast"] },
  importance: {
    usage: "RNN·Attention·Transformer에 들어가는 x_t, token vector가 모두 이 파이프라인의 출력이다.",
    necessity: "text → token → id → vector 흐름을 먼저 잡아야 이후 단원의 입력이 무엇인지 전제 없이 이해된다.",
    difference: "정수 인코딩은 식별자 부여이고, 임베딩은 학습을 통해 의미 거리가 생기는 표현 변환이다.",
    strength: "한 번 고정하면 모든 후속 단원에서 '입력이 무엇인가'라는 질문이 사라진다."
  },
  scenes: [
    {
      scene_id: "u01_s01", no: "01",
      title: "문장이 토큰으로 분리된다",
      title_en: "Tokenization",
      animation_type: ["packet_flow"],
      five_unit_frame: {
        data: "원문 문장 \"나는 어제 영화를 봤다\"",
        representation: "토큰 리스트 [나는, 어제, 영화를, 봤다]",
        calculation_target: "문자열 분리 규칙 적용 — 아직 수치 계산이 아니다",
        concept_classification: "전처리 · 표현 준비",
        importance: { type: "necessity", text: "모델은 문자열 전체를 그대로 계산할 수 없다 — 처리 단위를 먼저 정해야 한다" }
      },
      moving_object: "문장에서 분리되어 나오는 토큰 1개",
      scene_objects: [
        { id: "source_sentence", type: "document_card", role: "원문 문장", visibility: "open" },
        { id: "tokenizer_block", type: "procedure_block", role: "토큰 분리 규칙", visibility: "open" },
        { id: "token_row", type: "token_list", role: "분리된 토큰 리스트", visibility: "open" },
        { id: "subword_callout", type: "annotation_callout", role: "실제 tokenizer는 subword 단위로 자를 수 있다", visibility: "collapsed" }
      ],
      animation_steps: [
        "원문 문장 카드가 왼쪽에 등장한다",
        "tokenizer block이 중앙에 배치된다",
        "문장이 block을 통과하며 토큰 4개로 분리된다",
        "토큰 리스트가 한 줄로 정렬된다",
        "하단 callout: 실제 tokenizer는 단어 단위가 아니라 subword 단위로 자를 수 있다"
      ],
      zoom: { required: false, reason: "단순 linear pipeline — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["\"나는 어제 영화를 봤다\"", "tokenizer", "나는 · 어제 · 영화를 · 봤다"], packet: "token", labels: ["원문", "분리 규칙", "토큰 리스트"] } },
      links: [
        { target: "u01_s02", label: "다음: vocab index 부여", type: "next" },
        { target: "_concept:chunking", label: "관련: 문서 청킹(RAG)", type: "related", note: "토큰화 = 처리 단위, 청킹 = 검색 단위" }
      ]
    },
    {
      scene_id: "u01_s02", no: "02",
      title: "토큰이 vocab에서 정수 ID가 된다",
      title_en: "Vocab Lookup → Integer ID",
      animation_type: ["matrix_build"],
      five_unit_frame: {
        data: "토큰 리스트 [나는, 어제, 영화를, 봤다]",
        representation: "정수 ID 리스트 [1042, 87, 210, 55]",
        calculation_target: "vocab에서 token에 대응하는 index/id 조회",
        concept_classification: "표현 · 식별자 부여",
        importance: { type: "difference", text: "ID는 계산용 값이 아니라 vocab의 index다 — 의미 숫자가 아니다" }
      },
      moving_object: "vocab에서 자기 index를 찾는 토큰 1개",
      scene_objects: [
        { id: "token_row", type: "token_list", role: "입력 토큰 리스트", visibility: "open" },
        { id: "vocab_table", type: "matrix_grid", role: "단어 → index 매핑 표", visibility: "open" },
        { id: "id_row", type: "token_list", role: "정수 ID 리스트", visibility: "open" }
      ],
      animation_steps: [
        "vocab 표가 등장한다 (단어 열 + index)",
        "토큰 '영화를'이 표에서 자기 index를 찾는다",
        "index 210이 ID로 추출된다",
        "모든 토큰이 ID 리스트 [1042, 87, 210, 55]로 치환된다"
      ],
      zoom: { required: false, reason: "index 조회 1건만 강조하면 되는 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "matrix_build", params: { rows: ["…", "영화를", "…"], cols: ["단어", "ID"], cells: [["…", "…"], ["영화를", "210"], ["…", "…"]], highlight: [1, 1], caption: "vocab table" } },
      links: [
        { target: "u01_s01", label: "이전: 토큰화", type: "prev" },
        { target: "u01_s03", label: "교정: ID ≠ 의미 거리", type: "next" },
        { target: "u01_s04", label: "다음: embedding lookup", type: "next" }
      ]
    },
    {
      scene_id: "u01_s03", no: "03",
      title: "ID 간격 1 ≠ 의미 근접 — 교정",
      title_en: "Integer ID Has No Semantic Distance",
      animation_type: ["before_after_contrast"],
      correction: "정수 ID 120과 121이 비슷하다는 뜻은 아니다.",
      five_unit_frame: {
        data: "단어 영화(120), 양말(121), 드라마(500)",
        representation: "1차원 수직선 위의 정수 ID",
        calculation_target: "ID 차이 |120−121|=1 — 이 값이 의미를 갖는지 검증",
        concept_classification: "표현 · 식별자의 한계",
        importance: { type: "necessity", text: "이 오해를 잡지 않으면 embedding의 존재 이유가 사라진다" }
      },
      moving_object: "수직선 위에서 간격을 확인하는 ID 점",
      scene_objects: [
        { id: "id_number_line", type: "xy_coordinate", role: "ID 수직선", visibility: "open" },
        { id: "adjacent_id_pair", type: "comparison_pair_object", role: "영화(120) vs 양말(121) — 간격 1", visibility: "open" },
        { id: "correction_callout", type: "annotation_callout", role: "ID는 vocab index, 거리에 의미 없음", visibility: "open" }
      ],
      animation_steps: [
        "ID들이 수직선 위에 배치된다 (영화 120, 양말 121, 드라마 500)",
        "영화(120)와 양말(121)의 간격 1이 강조된다",
        "\"그래서 두 단어가 비슷한가?\" 질문이 표시된다",
        "교정: ID는 vocab index일 뿐, 거리에 의미가 없다"
      ],
      zoom: { required: false, reason: "수직선 1개로 충분한 교정 장면" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "ID 수직선", note: "영화 120 · 양말 121 · 드라마 500" }, right: { title: "간격 1의 의미?", note: "vocab index — 거리 의미 없음 ✗" }, arrow: "검증" } },
      links: [
        { target: "u01_s05", label: "해결: 학습된 임베딩에서 의미 거리", type: "next" },
        { target: "u01_s06", label: "대조: ID 공간 vs 임베딩 공간", type: "related" }
      ]
    },
    {
      scene_id: "u01_s04", no: "04",
      title: "embedding table에서 벡터를 꺼낸다",
      title_en: "Embedding Lookup",
      animation_type: ["matrix_build", "packet_flow"],
      five_unit_frame: {
        data: "정수 ID 210 (영화를)",
        representation: "embedding table E — |V|×d 행렬. training 중 backprop으로 갱신, inference 중 고정 조회.",
        calculation_target: "E의 210번 index 행 추출 — e = E[id]",
        concept_classification: "표현 · 임베딩",
        importance: { type: "usage", text: "이후 모든 계산(RNN·Attention)의 입력이 이 벡터다" }
      },
      moving_object: "table에서 추출되는 행 벡터 1개",
      scene_objects: [
        { id: "id_token", type: "id_token", role: "정수 ID 210", visibility: "open" },
        { id: "embedding_table", type: "parameter_block", role: "E — |V|×d, training 중 갱신 / inference 중 고정", visibility: "open" },
        { id: "extracted_vector", type: "embedding_vector", role: "꺼낸 숫자 리스트 [0.21, −0.47, 0.88, …]", visibility: "open" }
      ],
      animation_steps: [
        "embedding table E가 등장한다 (|V|×d, parameter block 라벨)",
        "ID 210이 table 왼쪽에 도착한다",
        "210번 index 행이 하이라이트된다",
        "행이 벡터 [0.21, −0.47, 0.88, …]로 추출된다",
        "보조 라벨: training 중에는 backprop으로 갱신됨 / inference 중에는 고정 조회"
      ],
      zoom: { required: false, reason: "행 추출 1건 — 1 view" },
      formula_lock: { needed: true, formula: "e = E[\\mathrm{id}]", when_to_show: "행 추출 직후 하단 패널" },
      sketch: { kind: "matrix_build", params: { rows: ["208", "209", "210", "211"], cols: ["d₁", "d₂", "d₃", "…"], cells: [["·", "·", "·", "·"], ["·", "·", "·", "·"], ["0.21", "−0.47", "0.88", "…"], ["·", "·", "·", "·"]], highlightRow: 2, caption: "E — parameter block", pullRow: true } },
      links: [
        { target: "u01_s02", label: "입력: 정수 ID", type: "prev" },
        { target: "u01_s05", label: "결과: 의미 거리 생성", type: "next" },
        { target: "_unit:unit11", label: "학습: E는 backprop으로 갱신", type: "cross", note: "Unit 11 Loss/Gradient" }
      ]
    },
    {
      scene_id: "u01_s05", no: "05",
      title: "학습된 임베딩 공간에서 의미 거리가 생긴다",
      title_en: "Semantic Distance in Trained Embedding Space",
      animation_type: ["xy_transform"],
      five_unit_frame: {
        data: "단어 영화를, 드라마를, 봤다의 embedding vector",
        representation: "2D로 투영한 학습된 임베딩 공간의 점들",
        calculation_target: "점 사이 거리 — 학습 후에야 가깝다/멀다가 의미를 갖는다",
        concept_classification: "표현 · 임베딩",
        importance: { type: "strength", text: "vocab index에서 불가능했던 '의미적으로 가깝다' 계산이 학습 후 가능해진다" }
      },
      moving_object: "공간에 놓이는 벡터 점 1개",
      scene_objects: [
        { id: "embedding_plane", type: "xy_coordinate", role: "학습된 임베딩 공간 (2D 투영)", visibility: "open" },
        { id: "word_points", type: "embedding_vector", role: "영화를 · 드라마를 · 봤다", visibility: "open" },
        { id: "distance_pair", type: "comparison_pair_object", role: "영화를 ↔ 드라마를 (가까움)", visibility: "open" },
        { id: "training_note", type: "annotation_callout", role: "초기화 직후에는 랜덤 — 학습을 거쳐야 의미 거리가 생긴다", visibility: "open" }
      ],
      animation_steps: [
        "2D 투영 평면이 등장한다 (\"학습된 임베딩 공간\" 라벨)",
        "'영화를' 점이 배치된다",
        "'드라마를' 점이 가깝게 배치된다",
        "'봤다' 점이 멀리 배치된다",
        "가까움 = 의미 유사가 학습의 결과로 생겼음을 표시한다",
        "보조 callout: 초기화 직후 embedding은 랜덤 — 학습 후에야 거리가 의미를 갖는다"
      ],
      zoom: { required: false, reason: "점 3개 배치 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "xy_transform", params: { points: [{ x: 0.62, y: 0.35, label: "영화를", near: true }, { x: 0.72, y: 0.42, label: "드라마를", near: true }, { x: 0.2, y: 0.75, label: "봤다" }], pair: [0, 1] } },
      links: [
        { target: "u01_s03", label: "대조: ID에는 이 거리가 없었다", type: "prev" },
        { target: "_unit:unit07", label: "재사용: Attention Q·K 유사도", type: "cross", note: "Unit 07 Attention" }
      ]
    },
    {
      scene_id: "u01_s06", no: "06",
      title: "ID 공간 vs 학습된 임베딩 공간",
      title_en: "ID Space vs Trained Embedding Space",
      animation_type: ["before_after_contrast"],
      five_unit_frame: {
        data: "같은 단어 쌍 영화 · 양말",
        representation: "왼쪽 1D ID 수직선 vs 오른쪽 학습된 임베딩 공간",
        calculation_target: "같은 쌍의 거리가 두 공간에서 갖는 의미 대조",
        concept_classification: "표현 · 임베딩",
        importance: { type: "difference", text: "정수 인코딩과 임베딩의 결정적 차이 — 거리의 의미 유무" }
      },
      moving_object: "두 공간 사이를 이동하며 위치를 대조하는 단어 쌍",
      scene_objects: [
        { id: "id_space_panel", type: "xy_coordinate", role: "ID 수직선 — 거리 의미 없음", visibility: "open" },
        { id: "embedding_space_panel", type: "xy_coordinate", role: "학습된 임베딩 공간 — 거리 = 의미", visibility: "open" },
        { id: "contrast_pair", type: "comparison_pair_object", role: "영화 · 양말 위치 대조", visibility: "open" }
      ],
      animation_steps: [
        "왼쪽 ID 수직선에 영화(120) · 양말(121)이 간격 1로 놓인다",
        "오른쪽 학습된 임베딩 공간에 영화 · 양말이 학습된 거리로 놓인다 (멀리 분리됨)",
        "같은 쌍의 위치가 두 공간에서 다름이 강조된다",
        "\"의미 거리는 학습된 embedding 이후 생긴다\"로 고정한다"
      ],
      zoom: { required: false, reason: "좌우 대조 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "ID 공간", note: "간격 1 — 의미 없음 ✗" }, right: { title: "학습된 임베딩 공간", note: "거리 = 의미 유사 ○" }, arrow: "E[id]" } },
      links: [
        { target: "u01_s03", label: "왼쪽: ID 거리 교정", type: "related" },
        { target: "u01_s05", label: "오른쪽: 의미 거리", type: "related" },
        { target: "u01_s07", label: "다음: special tokens", type: "next" }
      ]
    },
    {
      scene_id: "u01_s07", no: "07",
      title: "Special Tokens — BOS / EOS / PAD",
      title_en: "Special Tokens",
      animation_type: ["packet_flow", "before_after_contrast"],
      five_unit_frame: {
        data: "길이가 다른 문장 2개",
        representation: "[BOS] token ... token [EOS] [PAD] [PAD]",
        calculation_target: "sequence 시작·끝·padding 위치 표시",
        concept_classification: "전처리 · sequence formatting",
        importance: { type: "necessity", text: "decoder 시작 신호, 생성 종료 판단, batch 내 길이 맞춤, masking에 필요하다" }
      },
      moving_object: "문장 앞뒤에 삽입되는 special token 1개",
      scene_objects: [
        { id: "sentence_pair", type: "document_card", role: "길이가 다른 문장 2개", visibility: "open" },
        { id: "bos_token", type: "data_token", role: "[BOS] — sequence 시작 표시", visibility: "open" },
        { id: "eos_token", type: "data_token", role: "[EOS] — sequence 종료 표시", visibility: "open" },
        { id: "pad_tokens", type: "data_token", role: "[PAD] — 짧은 문장의 빈 자리 채움", visibility: "open" }
      ],
      animation_steps: [
        "길이가 다른 문장 2개가 토큰 리스트로 변환된다",
        "[BOS]가 각 문장 앞에 삽입된다",
        "[EOS]가 각 문장 끝에 삽입된다",
        "짧은 문장 뒤에 [PAD]가 추가되어 길이가 맞춰진다",
        "각 special token의 역할 라벨이 표시된다"
      ],
      zoom: { required: false, reason: "삽입 과정 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["나는 · 영화를", "[BOS] 나는 · 영화를 [EOS]", "[BOS] 나는 · 영화를 [EOS] [PAD]"], packet: "special", labels: ["원본", "시작·종료", "패딩"] } },
      links: [
        { target: "u01_s08", label: "다음: padding & mask", type: "next" },
        { target: "_unit:unit10", label: "재사용: decoder BOS/EOS", type: "cross", note: "Unit 10 Decoder" }
      ]
    },
    {
      scene_id: "u01_s08", no: "08",
      title: "Padding & Mask Preview",
      title_en: "Padding Mask",
      animation_type: ["before_after_contrast"],
      five_unit_frame: {
        data: "패딩된 token sequence",
        representation: "mask 벡터 [1, 1, 1, 1, 0, 0] — 실제 token = 1, PAD = 0",
        calculation_target: "PAD 위치를 모델이 무시하도록 mask 적용",
        concept_classification: "전처리 · masking",
        importance: { type: "necessity", text: "PAD를 계산에 포함하면 결과가 오염된다 — mask로 제외해야 한다" }
      },
      moving_object: "mask 벡터가 PAD 위치를 가리는 장면",
      scene_objects: [
        { id: "padded_sequence", type: "token_list", role: "패딩된 token sequence", visibility: "open" },
        { id: "mask_vector", type: "token_list", role: "mask [1,1,1,1,0,0]", visibility: "open" },
        { id: "masked_result", type: "annotation_callout", role: "PAD 위치 = 계산에서 제외", visibility: "open" }
      ],
      animation_steps: [
        "패딩된 sequence가 놓인다 [BOS, 나는, 영화를, EOS, PAD, PAD]",
        "mask 벡터 [1, 1, 1, 1, 0, 0]이 아래에 나란히 놓인다",
        "mask=0인 PAD 위치가 흐려지며 \"계산에서 제외\"가 표시된다",
        "\"이 mask가 Attention과 Loss에서 다시 등장한다\" preview 표시"
      ],
      zoom: { required: false, reason: "mask 대응 — 1 view" },
      formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "패딩된 sequence", note: "BOS · 나는 · 영화를 · EOS · PAD · PAD" }, right: { title: "mask 적용", note: "1 · 1 · 1 · 1 · 0 · 0 → PAD 제외" }, arrow: "mask" } },
      links: [
        { target: "u01_s07", label: "이전: special tokens", type: "prev" },
        { target: "_unit:unit07", label: "재사용: attention mask", type: "cross", note: "Unit 07 Attention" },
        { target: "_unit:unit10", label: "재사용: decoder mask", type: "cross", note: "Unit 10 Decoder" },
        { target: "_unit:unit11", label: "재사용: loss mask", type: "cross", note: "Unit 11 Loss" }
      ]
    },
    {
      scene_id: "u01_s09", no: "09",
      title: "파이프라인 전체를 수식으로 잠근다",
      title_en: "Pipeline Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: {
        data: "원문 문장",
        representation: "text → tokens → ids → E[id] → vectors 전체 파이프라인 + special tokens + mask",
        calculation_target: "x_t = E[id_t] — 이미 본 움직임의 압축",
        concept_classification: "표현 · 임베딩",
        importance: { type: "usage", text: "이 x_t가 Unit 04 RNN, Unit 07 Attention의 입력으로 그대로 쓰인다" }
      },
      moving_object: "파이프라인을 처음부터 끝까지 통과하는 packet 1개",
      scene_objects: [
        { id: "pipeline_schematic", type: "schematic", role: "7단계 파이프라인 축약 (토큰화→ID→special→pad→mask→embed→vector)", visibility: "open" },
        { id: "formula_panel", type: "formula_lock", role: "x_t = E[id_t] ∈ ℝᵈ", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit 중 '표현' slot 표시", visibility: "open" }
      ],
      animation_steps: [
        "text → tokens → ids → special → pad+mask → embed → vectors 파이프라인이 축약 등장한다",
        "packet 1개가 처음부터 끝까지 1회 통과한다",
        "하단 formula 패널이 등장한다",
        "5-Unit state bar에서 '표현' slot이 표시된다"
      ],
      zoom: { required: false, reason: "요약 복귀 장면 — 1 view" },
      formula_lock: { needed: true, formula: "x_t = E[\\mathrm{id}_t] \\in \\mathbb{R}^{d}", when_to_show: "packet 통과 완료 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["text", "tokens", "ids", "special", "E[id]"], formula: "x_t = E[id_t] ∈ ℝᵈ", stateSlot: 2 } },
      links: [
        { target: "_unit:unit04", label: "입력으로: RNN x_t", type: "cross", note: "Unit 04 RNN" },
        { target: "_unit:unit07", label: "입력으로: Attention token vectors", type: "cross", note: "Unit 07 Attention" },
        { target: "_unit:unit09", label: "입력으로: Transformer embedding + PE", type: "cross", note: "Unit 09 Encoder" }
      ]
    }
  ]
};
