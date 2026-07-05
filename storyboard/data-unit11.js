// Unit 11 — Loss / Cross-Entropy / Gradient / Backprop Signal (9 scenes)
window.SB_UNITS = window.SB_UNITS || {};
window.SB_UNITS.unit11 = {
  id: "unit11", no: "11", topic: 5,
  title_en: "Loss / Cross-Entropy / Gradient / Backprop Signal",
  title_ko: "손실 · 교차 엔트로피 · 역전파 신호",
  core_question: "loss, objective, metric, gradient signal은 어떻게 연결되는가?",
  correct_framing: "target objective(진짜 목적) → surrogate loss(학습 가능한 대체 손실) → gradient signal(파라미터 갱신 방향). cross-entropy loss는 softmax probability와 정답 label 사이의 구체적 loss다.",
  avoid: [
    "Cross-Entropy를 일반 loss로 뭉뚱그리지 않는다 — softmax probability와 정답 label의 관계로 보여준다.",
    "gradient를 추상적 '기울기'로만 설명하지 않는다 — parameter를 어느 방향으로 얼마나 바꿀지 알려주는 미분값이다.",
    "loss, objective, metric을 혼동하지 않는다 — 각각 역할이 다르다."
  ],
  routing: { emphasis: "계산 대상: softmax probability, CE loss, gradient signal", types: ["packet_flow", "formula_lock", "before_after_contrast"] },
  importance: {
    usage: "모든 신경망 학습의 핵심 루프: forward → loss → backward → update.",
    necessity: "loss 없이는 parameter가 어디로 바뀌어야 하는지 알 수 없다.",
    difference: "objective(목적)과 metric(평가)과 loss(학습용 대체)는 각각 다르다.",
    strength: "gradient signal이 모든 parameter에 도달하면 전체 모델이 한 번에 갱신된다."
  },
  scenes: [
    { scene_id: "u11_s01", no: "01", title: "Target Objective vs Evaluation Metric vs Loss", title_en: "Objective / Metric / Loss",
      animation_type: ["before_after_contrast"],
      five_unit_frame: { data: "모델의 목적, 평가 기준, 학습 신호", representation: "3가지 역할 분리 — 같은 것이 아니다", calculation_target: "objective(진짜 목표) ≠ metric(평가 기준) ≠ loss(학습 가능한 대체)", concept_classification: "학습 신호 · 역할 구분", importance: { type: "necessity", text: "이 구분을 안 하면 loss를 최적화하는 이유를 이해할 수 없다" } },
      moving_object: "세 개념이 분리되어 각각 다른 위치에 놓이는 장면", scene_objects: [
        { id: "objective_card", type: "document_card", role: "Target Objective — 진짜 달성하고 싶은 목적 (예: 좋은 번역)", visibility: "open" },
        { id: "metric_card", type: "document_card", role: "Evaluation Metric — 평가할 때 보는 기준 (예: BLEU score)", visibility: "open" },
        { id: "loss_card", type: "document_card", role: "Surrogate Loss — 미분 가능한 학습용 대체 (예: CE loss)", visibility: "open" }
      ],
      animation_steps: ["Target Objective: \"좋은 번역을 만들자\" — 직접 최적화 불가", "Metric: BLEU score — 평가용이지만 미분 불가", "Surrogate Loss: CE loss — 미분 가능, gradient 계산 가능", "\"loss를 줄이면 metric이 개선되고, metric이 좋으면 objective에 가까워진다\""],
      zoom: { required: false, reason: "역할 분리 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "Objective · Metric", note: "진짜 목표 + 평가\n직접 최적화 불가" }, right: { title: "Surrogate Loss", note: "미분 가능 대체\ngradient 계산 가능" }, arrow: "대리" } },
      links: [{ target: "u11_s02", label: "다음: logits → softmax → probability", type: "next" }]
    },
    { scene_id: "u11_s02", no: "02", title: "Logits → Softmax → Probability Distribution", title_en: "Softmax Output",
      animation_type: ["packet_flow"],
      prereqs: [{ target: "_unit:unit02", concept: "softmax", label: "Unit 02", note: "softmax 함수는 이미 해부됨" }],
      five_unit_frame: { data: "decoder/classifier 출력 logit vector", representation: "softmax(logits) → probability distribution (합=1)", calculation_target: "각 vocab token에 대한 예측 확률", concept_classification: "학습 신호 · 예측 확률", importance: { type: "usage", text: "이 probability가 정답 label과 비교되어 CE loss가 계산된다" } },
      moving_object: "logit vector가 softmax를 통과하여 probability가 되는 장면", scene_objects: [
        { id: "logit_vector", type: "embedding_vector", role: "logit [3.2, 1.1, 0.5, −0.3, …]", visibility: "open" },
        { id: "softmax_fn", type: "procedure_block", role: "softmax", visibility: "collapsed", reuse: { type: "same-operation", label: "same operation", note: "Unit 02 S07과 동일 연산" }, postprocess: "softmax" },
        { id: "prob_dist", type: "distribution_row", role: "probability [0.72, 0.09, 0.05, 0.02, …] Σ=1", visibility: "open" }
      ],
      animation_steps: ["decoder 출력 logit vector", "softmax 적용 (same operation — Unit 02 참조)", "probability distribution [0.72, 0.09, 0.05, …] 합=1", "\"이 확률에서 정답 token의 위치를 본다\""],
      zoom: { required: false, reason: "softmax 적용 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["logits", "softmax", "probability Σ=1"], packet: "prob", labels: ["출력", "변환", "확률 분포"] } },
      links: [{ target: "u11_s03", label: "다음: Cross-Entropy Loss", type: "next" }]
    },
    { scene_id: "u11_s03", no: "03", title: "Cross-Entropy Loss — 정답 확률이 낮으면 loss가 크다", title_en: "Cross-Entropy Loss",
      animation_type: ["formula_lock"],
      five_unit_frame: { data: "예측 probability distribution + 정답 token (one-hot)", representation: "−log(p_correct) — 정답 token에 할당된 확률의 음의 로그", calculation_target: "정답 확률이 높으면 loss ≈ 0, 낮으면 loss ↑", concept_classification: "학습 신호 · cross-entropy loss", importance: { type: "usage", text: "분류와 생성에서 가장 많이 쓰이는 구체적 loss 함수" } },
      moving_object: "정답 token의 확률이 loss 값으로 변환되는 장면", scene_objects: [
        { id: "prob_dist", type: "distribution_row", role: "예측: [0.72, 0.09, 0.05, …]", visibility: "open" },
        { id: "target_label", type: "data_token", role: "정답: token 0 (one-hot [1, 0, 0, …])", visibility: "open" },
        { id: "ce_calculation", type: "calculation_node", role: "CE = −log(0.72) = 0.33", visibility: "open" },
        { id: "bad_example", type: "calculation_node", role: "만약 p=0.05였다면: CE = −log(0.05) = 3.0 (크다!)", visibility: "open" }
      ],
      animation_steps: ["예측 확률 분포에서 정답 token(0)의 확률 = 0.72", "CE = −log(0.72) = 0.33 (작은 loss)", "만약 정답 확률이 0.05였다면: CE = −log(0.05) = 3.0 (큰 loss)", "\"정답 확률이 높아질수록 loss가 줄어든다\"", "이것이 모든 training step에서 줄이려는 값"],
      zoom: { required: false, reason: "CE 계산 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{CE} = -\\sum_i y_i \\log(p_i) = -\\log(p_{\\text{correct}})", when_to_show: "CE 계산 직후" },
      sketch: { kind: "before_after_contrast", params: { left: { title: "p_correct = 0.72", note: "CE = 0.33\n작은 loss ✓" }, right: { title: "p_correct = 0.05", note: "CE = 3.0\n큰 loss ✗" }, arrow: "−log(p)" } },
      links: [{ target: "u11_s04", label: "다음: gradient signal", type: "next" }]
    },
    { scene_id: "u11_s04", no: "04", title: "Gradient Signal — loss에서 역방향으로 전파", title_en: "Gradient Signal Flows Backward",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "CE loss 값", representation: "gradient signal — 각 parameter를 어느 방향으로 바꿀지 알려주는 미분값", calculation_target: "∂L/∂W — loss를 각 parameter로 편미분", concept_classification: "학습 신호 · gradient", importance: { type: "usage", text: "이 signal이 모든 layer의 parameter에 도달해야 학습이 된다" } },
      moving_object: "gradient packet이 출력층에서 입력층으로 역방향 이동", scene_objects: [
        { id: "loss_node", type: "calculation_node", role: "CE loss", visibility: "open" },
        { id: "gradient_packet", type: "hidden_state_packet", role: "gradient signal ∂L/∂W", visibility: "open" },
        { id: "layers_backward", type: "schematic", role: "Output → FFN → Attention → Embedding 역방향", visibility: "open" }
      ],
      animation_steps: ["CE loss에서 gradient 계산 시작", "gradient packet이 출력층 → decoder/encoder 역방향으로 이동", "각 layer의 parameter W에 대한 ∂L/∂W 계산", "\"이 미분값이 parameter를 얼마나, 어느 방향으로 바꿀지 결정\"", "LSTM C_t 덧셈 경로, Residual skip path가 gradient 전달을 돕는다"],
      zoom: { required: false, reason: "역방향 흐름 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "packet_flow", params: { stations: ["CE loss", "역방향 전파", "각 W에 ∂L/∂W"], packet: "∇", labels: ["출발", "backward", "도착"] } },
      links: [{ target: "u11_s05", label: "다음: parameter update", type: "next" }, { target: "_unit:unit05", label: "참조: gradient 안정 (C_t 덧셈)", type: "cross", note: "Unit 05 S05" }, { target: "_unit:unit09", label: "참조: gradient 안정 (Residual)", type: "cross", note: "Unit 09 S06" }]
    },
    { scene_id: "u11_s05", no: "05", title: "Parameter Update — W ← W − lr × gradient", title_en: "Parameter Update Rule",
      animation_type: ["packet_flow", "formula_lock"],
      five_unit_frame: { data: "현재 parameter W와 gradient ∂L/∂W", representation: "새 W = W − learning_rate × ∂L/∂W", calculation_target: "gradient 방향의 반대로 W를 이동 — loss가 줄어드는 방향", concept_classification: "학습 신호 · parameter update", importance: { type: "usage", text: "이것이 매 training step마다 반복되는 핵심 갱신 규칙" } },
      moving_object: "W 값이 gradient 반대 방향으로 이동하는 장면", scene_objects: [
        { id: "current_w", type: "parameter_block", role: "현재 W", visibility: "open" },
        { id: "gradient_value", type: "hidden_state_packet", role: "∂L/∂W", visibility: "open" },
        { id: "learning_rate", type: "data_token", role: "lr (학습률) — 이동 크기 조절", visibility: "open" },
        { id: "new_w", type: "parameter_block", role: "갱신된 W", visibility: "open" }
      ],
      animation_steps: ["현재 W 값이 놓인다", "gradient ∂L/∂W가 도착한다", "learning_rate를 곱해 이동량 결정", "W ← W − lr × ∂L/∂W — gradient 반대 방향으로 이동", "\"이 한 step이 loss를 줄이는 방향\""],
      zoom: { required: false, reason: "update 규칙 — 1 view" },
      formula_lock: { needed: true, formula: "W \\leftarrow W - \\eta \\cdot \\frac{\\partial L}{\\partial W}", when_to_show: "update 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["W", "−lr × ∂L/∂W", "W (갱신)"], formula: "W ← W − η · ∂L/∂W", stateSlot: 3 } },
      links: [{ target: "u11_s06", label: "다음: 전체 training loop", type: "next" }]
    },
    { scene_id: "u11_s06", no: "06", title: "전체 Training Loop — Forward → Loss → Backward → Update", title_en: "Full Training Loop",
      animation_type: ["packet_flow"],
      five_unit_frame: { data: "training data batch", representation: "Forward → Loss → Backward → Update → 반복", calculation_target: "4단계 루프가 매 batch마다 반복", concept_classification: "학습 신호 · training loop", importance: { type: "usage", text: "모든 신경망 학습의 기본 구조" } },
      moving_object: "데이터가 forward → loss → backward → update를 순환", scene_objects: [
        { id: "forward_block", type: "procedure_block", role: "Forward: 입력 → 모델 → 예측", visibility: "open" },
        { id: "loss_block", type: "procedure_block", role: "Loss: 예측 vs 정답 → CE loss", visibility: "open" },
        { id: "backward_block", type: "procedure_block", role: "Backward: loss → gradient 역전파", visibility: "open" },
        { id: "update_block", type: "procedure_block", role: "Update: W ← W − lr × gradient", visibility: "open" }
      ],
      animation_steps: ["Forward: 입력 데이터가 모델을 통과하여 예측 생성", "Loss: 예측과 정답을 비교하여 CE loss 계산", "Backward: loss에서 gradient signal 역전파", "Update: 모든 parameter 갱신", "\"이 4단계가 매 batch마다 반복 → loss가 점점 줄어든다\""],
      zoom: { required: false, reason: "4단계 루프 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "formula_lock", params: { stations: ["Forward", "Loss", "Backward", "Update"], formula: "repeat: fwd → loss → bwd → update", stateSlot: 5 } },
      links: [{ target: "u11_s07", label: "다음: Embedding E도 갱신된다", type: "next" }]
    },
    { scene_id: "u11_s07", no: "07", title: "Embedding table도 gradient로 갱신된다", title_en: "Embedding Update via Backprop",
      animation_type: ["packet_flow"],
      prereqs: [{ target: "_unit:unit01", concept: "E table = parameter block", label: "Unit 01 S04", note: "embedding table이 학습 파라미터라는 것은 이미 설명됨" }],
      five_unit_frame: { data: "gradient signal이 embedding table E까지 도달", representation: "사용된 token의 row만 gradient 갱신", calculation_target: "∂L/∂E[id] — 해당 row의 gradient", concept_classification: "학습 신호 · embedding update", importance: { type: "usage", text: "Unit 01에서 'training 중 갱신'이라고 한 것의 구체적 메커니즘" } },
      moving_object: "gradient가 E table의 특정 row에 도달하여 갱신하는 장면", scene_objects: [
        { id: "embedding_table", type: "parameter_block", role: "E table", visibility: "open", reuse: { type: "same-object", label: "same object", note: "Unit 01과 동일한 E" } },
        { id: "gradient_to_row", type: "hidden_state_packet", role: "∂L/∂E[210] — 사용된 token row만 갱신", visibility: "open" }
      ],
      animation_steps: ["gradient signal이 모델 역방향을 거쳐 E table에 도달", "training batch에서 사용된 token의 row만 gradient 계산", "E[210] ← E[210] − lr × ∂L/∂E[210]", "사용되지 않은 row는 이번 step에서 갱신 안 됨", "\"inference 때는 이 갱신이 멈추고 E가 고정 조회 table\""],
      zoom: { required: false, reason: "E table 갱신 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "matrix_build", params: { rows: ["208", "209", "210", "211"], cols: ["d₁", "d₂", "d₃"], cells: [["·", "·", "·"], ["·", "·", "·"], ["↓∇", "↓∇", "↓∇"], ["·", "·", "·"]], highlightRow: 2, caption: "E[210] row 갱신", pullRow: false } },
      links: [{ target: "u11_s08", label: "다음: loss mask", type: "next" }, { target: "_unit:unit01", label: "참조: E table", type: "cross", note: "Unit 01 S04" }]
    },
    { scene_id: "u11_s08", no: "08", title: "Loss Mask — PAD 위치는 loss에서 제외", title_en: "Loss Mask",
      animation_type: ["before_after_contrast"],
      prereqs: [{ target: "_unit:unit01", concept: "padding mask", label: "Unit 01 S08", note: "PAD와 mask 개념은 이미 설명됨" }],
      five_unit_frame: { data: "위치별 CE loss + padding mask", representation: "mask=0인 PAD 위치의 loss = 0 (계산에서 제외)", calculation_target: "실제 token 위치의 loss만 합산", concept_classification: "학습 신호 · loss masking", importance: { type: "necessity", text: "PAD 위치의 loss를 포함하면 의미 없는 예측이 학습에 영향을 준다" } },
      moving_object: "loss mask가 PAD 위치의 loss를 제거하는 장면", scene_objects: [
        { id: "position_losses", type: "distribution_row", role: "위치별 CE: [0.33, 0.51, 0.12, 0.44, 2.1, 1.8]", visibility: "open" },
        { id: "loss_mask", type: "token_list", role: "mask: [1, 1, 1, 1, 0, 0]", visibility: "open", reuse: { type: "same-object", label: "same object", note: "Unit 01 S08과 동일한 padding mask" } },
        { id: "masked_loss", type: "calculation_node", role: "실제 loss: [0.33, 0.51, 0.12, 0.44, ×, ×] → 합산", visibility: "open" }
      ],
      animation_steps: ["각 위치의 CE loss가 놓인다", "padding mask [1,1,1,1,0,0]이 적용된다", "mask=0인 위치(PAD)의 loss가 제거된다", "실제 token 위치의 loss만 합산 → total loss", "\"Unit 01에서 만든 mask가 여기서 재사용된다\""],
      zoom: { required: false, reason: "mask 적용 — 1 view" }, formula_lock: { needed: false },
      sketch: { kind: "before_after_contrast", params: { left: { title: "위치별 CE loss", note: "0.33 · 0.51 · 0.12 · 0.44 · 2.1 · 1.8" }, right: { title: "mask 적용 후", note: "0.33 · 0.51 · 0.12 · 0.44 · × · ×\n→ 합산" }, arrow: "mask" } },
      links: [{ target: "u11_s09", label: "다음: formula lock", type: "next" }]
    },
    { scene_id: "u11_s09", no: "09", title: "Loss / Gradient / Update — 전체 formula lock", title_en: "Training Signal Formula Lock",
      animation_type: ["formula_lock", "state_bar_progression"],
      five_unit_frame: { data: "전체 training signal 흐름", representation: "prediction → CE loss → gradient → parameter update", calculation_target: "이미 본 흐름을 수식으로 압축", concept_classification: "학습 신호", importance: { type: "usage", text: "이 루프가 모든 신경망 학습의 엔진이다" } },
      moving_object: "전체 수식이 순서대로 고정", scene_objects: [
        { id: "formula_panel", type: "formula_lock", role: "CE + gradient + update 수식", visibility: "open" },
        { id: "loop_note", type: "annotation_callout", role: "매 batch마다 반복 → loss ↓ → 성능 ↑", visibility: "open" },
        { id: "frame_state_bar", type: "state_bar", role: "5-Unit '계산 대상' slot", visibility: "open" }
      ],
      animation_steps: ["CE = −log(p_correct)", "∂L/∂W — 모든 parameter에 대한 gradient", "W ← W − η · ∂L/∂W — parameter 갱신", "반복 → loss ↓ → objective에 접근", "전체 11 단원 curriculum 완료"],
      zoom: { required: false, reason: "수식 요약 — 1 view" },
      formula_lock: { needed: true, formula: "\\text{CE} = -\\log(p_{\\text{correct}}), \\quad W \\leftarrow W - \\eta \\cdot \\frac{\\partial \\text{CE}}{\\partial W}", when_to_show: "전체 루프 표시 직후" },
      sketch: { kind: "formula_lock", params: { stations: ["softmax", "CE loss", "gradient ∇", "W update"], formula: "CE = −log(p), W ← W − η·∂CE/∂W", stateSlot: 3 } },
      links: [
        { target: "_unit:unit01", label: "순환: E table이 이렇게 갱신된다", type: "cross", note: "Unit 01 S04" },
        { target: "_unit:unit05", label: "순환: LSTM gate도 이렇게 학습", type: "cross", note: "Unit 05" },
        { target: "_unit:unit09", label: "순환: Transformer parameter도 이렇게 학습", type: "cross", note: "Unit 09" }
      ]
    }
  ]
};
