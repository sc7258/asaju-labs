<!-- BEGIN:nextjs-agent-rules -->
# 익숙한 Next.js라고 가정하지 말 것

이 버전은 학습 데이터 시점의 Next.js와 다를 수 있다. API, 관례, 파일 구조가 달라졌을 가능성이 있으니 코드를 작성하기 전에 `node_modules/next/dist/docs/` 아래의 관련 가이드를 확인하고, deprecated 안내를 주의해서 따른다.
<!-- END:nextjs-agent-rules -->

# 프로젝트 작업 흐름

의미 있는 작업을 시작하기 전에, 아래 파일이 있으면 순서대로 읽는다.
- `.ai/PROJECT.md`
- `.ai/PLAN.md`
- `.ai/MEMORY.md`
- `.ai/DECISIONS.md`
- `.ai/COMMANDS.md`

이 문서들을 현재 프로젝트 문맥의 1차 기준으로 사용한다.

`/start`, `/check`, `/review`, `/handoff` 같은 슬래시형 프롬프트가 들어오면 `.ai/COMMANDS.md`의 정의를 기준으로 해석한다.

# 현재 프로젝트 우선순위

- 테스트를 중요하게 다루고 유지보수 가능한 코드로 개발한다.
- 첫 번째 제품 마일스톤은 `만세력` 표시 기능이다.
- 빠르게 검증 가능한 작은 수직 단위 구현을 우선한다.

# 작업 규칙

- 프로젝트 문맥이 바뀌는 의미 있는 변경이 있으면 관련 `.ai` 파일을 갱신한다.
- 중요한 아키텍처나 제품 선택은 `.ai/DECISIONS.md`에 기록한다.
- `.ai/PLAN.md`는 다음 구현 단계가 바로 보이도록 유지한다.
- 가능하면 기능 작업과 함께 테스트를 추가하거나 갱신한다.

# 자주 쓰는 명령어

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run check`
