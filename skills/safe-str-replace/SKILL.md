---
name: safe-str-replace
description: 파일 편집 전 반드시 읽고 검증하는 절차.
version: 1.0.0
author: vault
metadata:
  hermes:
    tags: [editing, workflow, safety]
    category: dev-workflow
---

# Safe String Replace Skill

파일 편집 시 old_str 불일치를 방지하는 절차적 워크플로우.
기억에 의존한 편집은 100% 실패한다 — 반드시 읽고 복사하라.

## When to Use

- `str_replace_edit`로 파일을 수정할 때 (매번)
- 특히 100줄 이상의 파일, 한글/특수문자 포함 파일, 이전 턴에서 읽은 파일

## Procedure

### 1. 대상 구간 정확히 읽기

```
read_file(path, offset=대상줄근처, limit=30~50)
```

- offset/limit으로 편집할 구간만 읽는다
- 전체를 다시 읽지 않아도 됨 — 해당 섹션만

### 2. old_str 복사

읽은 결과에서 교체할 텍스트를 **있는 그대로** 복사한다:
- 줄바꿈 위치
- 들여쓰기 (탭 vs 스페이스)
- 한글 조사·띄어쓰기
- 따옴표 종류 (', ", `)
- 이스케이프 (`\\`, `\n`)

### 3. 유일성 확인

old_str이 파일에서 **정확히 1회** 등장하는지 확인:
- 너무 짧으면 여러 곳에 매칭 → 더 긴 context 포함
- 너무 길면 줄바꿈 불일치 위험 → 핵심 구간만

### 4. 편집 실행

```
str_replace_edit(path, edits=[
  { old_string: "정확히 복사한 텍스트", new_string: "교체할 텍스트" }
])
```

같은 파일 여러 곳 수정 시 반드시 `edits:[]` 배열로 **1회** 호출.
순차 호출하면 첫 편집이 두 번째 old_str을 깨뜨릴 수 있다.

### 5. 실패 시

```
에러: "old_str found 0 times"
→ read_file로 해당 구간 다시 읽기
→ 실제 텍스트와 비교
→ 차이점 수정 후 재시도
```

```
에러: "old_str found N times" (N > 1)
→ old_str에 앞뒤 context를 더 포함시켜 유일하게 만들기
```

## Pitfalls

| 실수 | 결과 | 해결 |
|---|---|---|
| 이전 턴에서 읽은 내용으로 편집 | 중간에 다른 편집이 파일을 바꿨을 수 있음 | 매번 read_file |
| 한글 조사 불일치 (`을/를`, `이/가`) | 0 match | 정확히 복사 |
| 이스케이프 (`\\frac` vs `\frac`) | 0 match | JS 문자열은 이중 이스케이프 |
| 탭 vs 스페이스 2/4 | 0 match | 파일의 실제 들여쓰기 확인 |
| atomic batch 중 1개 실패 | 3개 edits 모두 미적용 | 실패 edit 수정 후 전체 재시도 |

## Quick Reference

```
# 패턴: Read → Copy → Edit → Verify
read_file("f.js", offset=100, limit=30)
str_replace_edit("f.js", edits=[{old_string: "읽은 그대로", new_string: "새 내용"}])
```
