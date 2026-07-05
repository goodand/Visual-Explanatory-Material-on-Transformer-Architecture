# Visual Explanatory Material on Transformer Architecture

딥러닝/NLP 핵심 개념을 11개 단원 · 102개 씬 애니메이션으로 설명하는 인터랙티브 플레이어입니다. 토큰화·임베딩부터 RNN·LSTM·Seq2Seq·Attention·Multi-Head Attention·Transformer Encoder/Decoder·Loss/Backprop까지 하나의 흐름으로 연결됩니다.

## 실행

정적 파일이라 서버에서 열기만 하면 됩니다 (`file://`로는 JSX 로딩이 막힐 수 있어 로컬 HTTP 서버 권장):

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000/AI-ML%20Animation%20Player.html
```

React 18 · Babel Standalone · KaTeX · Pretendard/JetBrains Mono 폰트는 CDN에서 로드됩니다.

## 조작

- `Space` 재생/정지 · `←`/`→` 스텝 이동 · `G` 그래프 뷰 토글
- 상단 Unit 칩으로 단원 전환, LINKS 칩으로 씬 간 위키식 이동
- 하단 5-Unit 프레임 칩 → 개념 프레임 오버레이

## 구성

```
AI-ML Animation Player.html          엔트리포인트
_ds/…/                               디자인 시스템 토큰(CSS) + 컴포넌트 번들
animation-viewer/                    tween 엔진 + scene 시각화 (JSX)
storyboard/data-unit01..11.js        11개 단원 씬 데이터
```

## 커리큘럼

| Unit | 주제 |
|------|------|
| 01 | 토큰화 · 어휘집 · 정수 ID · 임베딩 |
| 02 | 활성화 함수 · Softmax |
| 03 | 선형 · 비선형 · MLP · XOR |
| 04 | RNN |
| 05 | 기울기 소실 · LSTM |
| 06 | Seq2Seq · 인코더-디코더 |
| 07 | Attention |
| 08 | Multi-Head Attention |
| 09 | Transformer Encoder 내부 |
| 10 | Transformer Decoder · 학습 vs 추론 |
| 11 | 손실 · 교차 엔트로피 · 역전파 |
