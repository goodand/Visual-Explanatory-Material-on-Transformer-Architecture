---
name: babel-multifile-scope
description: Babel 다중파일 JSX 프로젝트 scope 관리.
version: 1.0.0
author: vault
metadata:
  hermes:
    tags: [react, babel, jsx, scope]
    category: dev-workflow
---

# Babel Multi-file Scope Skill

`<script type="text/babel">` 다중 파일 프로젝트에서 scope 분리 문제를 해결하는 규칙.
module bundler 없이 inline Babel로 React 프로젝트를 구성할 때 필수.

## When to Use

- HTML에 `<script type="text/babel" src="...">` 2개 이상 사용 시
- 한 파일의 컴포넌트를 다른 파일에서 참조해야 할 때
- `ReferenceError: XXX is not defined` 에러 발생 시

## Procedure

### 1. 핵심 규칙: 각 Babel script는 별도 scope

```html
<!-- 이 두 파일은 서로의 변수를 볼 수 없다 -->
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel" src="app.jsx"></script>
```

`components.jsx`에서 정의한 `MyComponent`를 `app.jsx`에서 직접 사용 불가.

### 2. Window export 패턴

공유할 컴포넌트를 파일 끝에서 `window`에 등록:

```js
// components.jsx 끝
window.MyComponents = { Header, Footer, Sidebar };
```

```js
// app.jsx 시작
const { Header, Footer, Sidebar } = window.MyComponents;
```

### 3. Styles 이름 충돌 방지

**절대 금지:**
```js
// components.jsx
const styles = { container: { ... } };  // ← 전역 충돌!

// app.jsx
const styles = { wrapper: { ... } };    // ← 같은 이름!
```

**필수:**
```js
// components.jsx
const componentStyles = { container: { ... } };

// app.jsx
const appStyles = { wrapper: { ... } };
```

### 4. Script 로드 순서

의존성 순서대로 배치. 마지막은 항상 App(ReactDOM.render 호출):

```html
<!-- 1. 프리미티브/유틸 (의존성 없음) -->
<script type="text/babel" src="shared.jsx"></script>

<!-- 2. 컴포넌트 (shared에 의존) -->
<script type="text/babel" src="components-a.jsx"></script>
<script type="text/babel" src="components-b.jsx"></script>

<!-- 3. 전용 override (components에 의존, 선택적) -->
<script type="text/babel" src="overrides.jsx"></script>

<!-- 4. App (모든 것에 의존, ReactDOM.render) — 항상 마지막 -->
<script type="text/babel" src="app.jsx"></script>
```

### 5. 새 파일 추가 체크리스트

- [ ] 파일 끝에 `window.XXX = { ... }` export 추가
- [ ] HTML에 `<script type="text/babel" src="...">` 태그 추가
- [ ] 위치: app.jsx **앞**
- [ ] styles 객체 이름이 고유한지 확인
- [ ] 사용 측에서 `const { A, B } = window.XXX;` destructure

### 6. Plain JS vs Babel 구분

| 파일 종류 | 로드 방식 | 이유 |
|---|---|---|
| 데이터 (`.js`) | `<script src="...">` | JSX 없음, 파싱 불필요 |
| 엔진/유틸 (`.js`) | `<script src="...">` | 순수 JS, 빠른 로드 |
| React 컴포넌트 (`.jsx`) | `<script type="text/babel" src="...">` | JSX 변환 필요 |
| DS 번들 (`.js`) | `<script src="...">` | 이미 빌드됨 |

**Babel이 아닌 script에 `type="text/babel"` 붙이면 로드 실패.**
**Babel script에 `type="text/babel"` 빼먹으면 JSX 구문 에러.**

## Pitfalls

| 이슈 | 증상 | 해결 |
|---|---|---|
| Window export 누락 | `XXX is not defined` | 파일 끝에 `window.XXX = {...}` |
| 로드 순서 역전 | `window.YYY is undefined` | 의존 대상을 먼저 로드 |
| Styles 이름 충돌 | 나중 파일이 앞 파일 스타일 덮어씀 | `컴포넌트명Styles` 패턴 |
| type="module" 사용 | import/export 작동 안 함 | Babel inline에서 module 미지원 — window 사용 |
| React 미로드 상태에서 Babel | 빈 화면 | React/ReactDOM을 Babel **앞에** 로드 |

## Quick Reference

```
Export:  window.MyLib = { A, B, C };
Import:  const { A, B, C } = window.MyLib;
Order:   prims → components → overrides → app (last)
Styles:  const headerStyles = {...}  (NEVER: const styles = {...})
```
