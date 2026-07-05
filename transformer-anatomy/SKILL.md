---
name: transformer-anatomy-edit
description: Transformer 해부도 Z/P 데이터 편집·검증.
version: 1.0.0
author: vault
metadata:
  hermes:
    tags: [transformer, anatomy, visualization]
    category: ml-education
---

# Transformer Anatomy 편집 Skill

## 파일 구조

```
transformer-anatomy/
  Transformer Anatomy.html    ← 메인 (DS 토큰 → anatomy-data.js → anatomy-app.jsx)
  anatomy-data.js             ← 모든 레벨·블록·엣지·참조이미지 (window.ANATOMY)
  anatomy-app.jsx             ← React 렌더러 (PAL 색상, 블록, 화살표, zoom)
  tweaks-panel.jsx            ← Tweak 패널
  verification.md             ← 검증 체크리스트
  Transformer Zoom Plan v2.html ← Zoom Plan (루트 마스터의 사본)

Transformer Zoom Plan.html    ← 루트 마스터
storyboard/refs/transformer/  ← 참조 이미지 원본
```

## Z/P 2축 체계

L0–L9 단일 번호 **폐기**. 위치·타입·커리큘럼 3축 혼용 해결:

### Z축 (Zoom 깊이 = 구성/위치)
트리 depth 단조 일치 (역전 금지). Semantic zoom 대상 = Z축만.
```
Z0 Transformer 전체
Z1 Enc–Dec Stack (+Input Pipeline·Output Head)
Z2 Layer 내부 (Post-LN/Pre-LN Tweak)
Z3 Sublayer — MHA 컨테이너 · FFN · Add&Norm (형제!)
Z4 단일 Attention Head
Z5 SDPA 커널 (QKᵀ → Scale → Mask → Softmax → Drop → ×V)
```

### P축 (Primitive = 개념/타입)
깊이 무관, 여러 Z에서 등장. zoom 아님 → 리프에서 **side card**로 표시.
블록 스타일: 점선 테두리 + amber P 배지.
```
P1 Linear (xW+b)
P2 Scalar Activation (ReLU/GELU/SwiGLU)
P3 Distribution Fn (Softmax)
```

### 커리큘럼 축 — 보류

## Attention 3종 라벨 규칙

| 종류 | Z2 라벨 | Q | K/V | Score |
|------|---------|---|-----|-------|
| Encoder Self | Multi-Head Self-Attention | Encoder X | Encoder X | (B,S,S) |
| Decoder Masked | Masked Multi-Head Self-Attention | Decoder Y | Decoder Y | (B,T,T) |
| Encoder-Decoder | **Encoder-Decoder Attention** | Decoder state | Encoder output | (B,T,S) |

- Z2: `Encoder-Decoder Attention`
- Z3: `Encoder-Decoder Multi-Head Attention` + desc `Cross-Attention`
- Z4: `Single Cross-Attention Head`
- T=decoder length, S=encoder length 반드시 구분

## Add & Norm residual
Decoder 3개: `(+ x₀)`, `(+ x₁)`, `(+ x₂)` — 각 residual input이 다름

## 색상 (DS 토큰)

PAL 객체는 `_cv()` 헬퍼로 CSS var 읽음:
```
teal   → Encoder (입력, memory)
amber  → Decoder (출력, mask)
violet → 연산/projection (Linear, SDPA, FFN)
slate  → 보조 (Scale, Dropout, Add&Norm)
red    → Mask (−∞)
```

## 편집 워크플로우

### 1. 데이터 수정 (가장 빈번)
```
grep → anatomy-data.js에서 블록/라벨 검색
str_replace_edit → 블록 라벨·desc·shape·edge 수정
ready_for_verification → 렌더 확인
```

### 2. 대량 치환 (체계 변경)
```
run_script + replaceText → 전체 치환 (L→Z/P, hex→DS토큰)
copy_files → 루트 Zoom Plan → v2 동기화
```

### 3. 참조 이미지
- 출처 2종: 원논문 "Attention Is All You Need" / Illustrated Transformer (jalammar)
- 매칭 검증: `view_image` → 이미지 내용 ↔ zoom level 의미 일치 확인
- 경로: `storyboard/refs/transformer/` → `anatomy-data.js`의 `REF_IMAGES`

### 4. Zoom Plan 갤러리
- 루트 `Transformer Zoom Plan.html`이 마스터
- 수정 후 `copy_files`로 v2에 복사

## 반복 이슈 & 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| 축 혼용 (L7>L8 역전) | 단일 번호에 위치+타입+커리큘럼 혼합 | Z/P 2축 분리 |
| 라벨 불일치 | 해부도 ≠ 원논문 ≠ Zoom Plan | grep 전수 검색 → 일괄 교체 |
| 설명창 z-index | 블록 뒤로 가려짐 | tip/prim-card에 z-index:90+ |
| 하드코딩 hex | DS 토큰 미사용 | `var(--color-*)` + `_cv()` |
| edge 누락 | V 연결선, residual, Q/K/V 출처 | edges 배열에 추가 |
| AddNorm F(x) zoom | L8 하드코딩 | zoom 속성 제거 (generic) |

## 동기화 체크리스트

수정 시 반드시:
- [ ] anatomy-data.js → Anatomy.html 렌더 확인
- [ ] 루트 Zoom Plan.html → transformer-anatomy/Zoom Plan v2.html 복사
- [ ] verification.md 갱신 (구조 변경 시)
- [ ] 참조 이미지 매칭 검증 (레벨 변경 시)

## 남은 TODO
- animation-viewer 통합 (Phase 4) — 해부도 블록 ↔ 애니메이션 재생 링크
