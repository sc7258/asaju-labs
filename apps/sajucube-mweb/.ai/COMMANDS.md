# 슬래시 명령어 규칙

이 문서는 Codex와 작업할 때 사용할 프로젝트용 약속이다.
터미널의 실제 명령어가 아니라, 에이전트가 작업 준비를 빠르게 하기 위한 문맥 규칙이다.

## 사용법
- 채팅에 `/start`처럼 그대로 입력한다.
- 필요하면 뒤에 짧게 목적을 붙인다.
- 예시: `/start 만세력 UI 이어서 작업`

## 자주 쓰는 명령
- `/start`
- `/next`
- `/check`
- `/test`
- `/review`
- `/handoff`
- `/manselyeok`
- `npm run deploy:prod`
- `npm run deploy:prod:logs`

## /start
- `.ai/PROJECT.md`, `.ai/PLAN.md`, `.ai/STATUS.md`, `.ai/MEMORY.md`, `.ai/DECISIONS.md`를 읽는다.
- 현재 상태를 짧게 요약하고, 바로 이어서 할 다음 작업을 제안한다.

## /next
- 현재 코드와 `.ai/PLAN.md`, `.ai/STATUS.md`를 보고 우선순위가 높은 다음 작업 1~3개를 제안한다.

## /check
- `npm run check` 또는 필요한 검증을 실행한다.
- 바로 고칠 수 있는 문제를 수정하고, 남는 위험을 알려준다.

## /test
- 현재 변경에 필요한 테스트를 추가하거나 보강한다.

## /review
- 코드 리뷰 관점으로 버그, 회귀, 누락된 테스트를 우선 점검한다.

## /handoff
- `.ai/STATUS.md`를 최신 상태로 갱신한다.
- 계획이 바뀌었으면 `.ai/PLAN.md`를 수정한다.
- 중요한 선택은 `.ai/DECISIONS.md`에 남긴다.
- 계속 기억할 선호나 규칙은 `.ai/MEMORY.md`에 남긴다.

## 배포 메모
- 프로덕션 배포 전에는 `package.json`, `package-lock.json`의 patch 버전을 먼저 올린다.
- 배포 전에도 이번 작업에 맞는 `.ai` 문서 갱신이 끝났는지 확인한다.

## /manselyeok
- 만세력 기능 범위에 집중해서 작업한다.
- 입력, 계산, 출력, 테스트 중 빠진 부분을 우선 채운다.
