---
name: ds-token-lint
description: DS 토큰 컴플라이언스 검사 및 교체 절차.
version: 1.0.0
author: vault
metadata:
  hermes:
    tags: [design-system, tokens, css, linting]
    category: dev-workflow
---

# DS Token Lint Skill

하드코딩된 hex 색상을 Design System CSS 토큰으로 교체하는 절차.
hex → `var(--color-*)` 또는 `getComputedStyle().getPropertyValue()` 래퍼.

## When to Use

- DS가 바인딩된 프로젝트에서 새 파일 작성 후
- `ready_for_verification` 결과에 "raw hex color" 경고가 나올 때
- 코드 리뷰 시 hex 하드코딩 발견 시

## Prerequisites

- DS 토큰 CSS 파일 경로 확인 (`_ds/*/tokens/colors.css`)
- DS 번들이 HTML에 로드되어 있어야 함

## Procedure

### 1. Hex 패턴 검색

```
grep(path="대상파일.jsx", pattern="#[0-9a-fA-F]{3,8}")
```

### 2. 매칭 토큰 찾기

각 hex 값에 대해 DS colors.css에서 대응 토큰 검색:

```
grep(path="_ds/*/tokens/colors.css", pattern="해당hex값")
```

### 3. 컨텍스트별 교체 방식 결정

| 컨텍스트 | 교체 방식 | 이유 |
|---|---|---|
| HTML/CSS attribute | `var(--color-violet-9)` | CSS var 직접 사용 |
| JS inline style (React) | `"var(--color-violet-9)"` | 문자열로 전달 |
| SVG attribute (fill, stroke) | 상수 테이블 (`U01C.accent`) | SVG attr에서 CSS var 미작동 |
| JS에서 런타임 계산 필요 | `getComputedStyle(el).getPropertyValue('--color-violet-9')` | 동적 읽기 |

### 4. SVG 내부 예외 처리

다크 캔버스(SVG viewBox) 내부는 CSS var가 작동하지 않는다.
상수 테이블을 1곳에 선언하고 import:

```js
const COLORS = {
  accent: "#8B78F0",  // = --color-dark-violet-8 (다크 캔버스 전용)
  teal: "#22B8A5",    // = --color-dark-teal-9
};
```

이 상수는 DS 토큰에서 **파생**된 것이므로 허용.
단, 상수 선언부에 원본 토큰명을 주석으로 반드시 기록.

### 5. 래퍼 패턴 (JS에서 토큰 읽기)

```js
// fallback 포함 래퍼
const _tok = (name, fallback) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim() || fallback;

const BRAND = _tok("--color-violet-9", "#5333E1");
```

### 6. 검증

```
ready_for_verification("파일.html")
→ "raw hex color" 경고 0건 확인
```

## Pitfalls

| 실수 | 결과 | 해결 |
|---|---|---|
| SVG fill에 `var()` 사용 | 색상 미적용 (검정) | 상수 테이블 사용 |
| 라이트/다크 모드 토큰 혼용 | 잘못된 색상 | `--color-dark-*` vs `--color-*` 구분 |
| fallback 없는 런타임 읽기 | CSS 로드 전 빈 문자열 | 두 번째 인자로 fallback 제공 |
| opacity 포함 hex (#RRGGBBAA) | 토큰에 없음 | `rgba()` + 토큰 조합 |

## Quick Reference

```
grep("#[0-9a-fA-F]{6}", "파일")    → hex 위치 파악
grep("해당값", "colors.css")       → 토큰명 확인
str_replace_edit → var() 교체      → 적용
ready_for_verification             → 경고 0건 확인
```
