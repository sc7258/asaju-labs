# @repo/db-schema

Sajudex DB schema와 Prisma Client export를 제공하는 공유 패키지입니다.

## 책임

- Prisma schema의 단일 원본은 `prisma/schema.prisma`입니다.
- DB 모델은 `services/sajudex-crawler/SCHEMA.md`의 v1 결정안을 구현합니다.
- 앱과 서비스는 이 패키지에서 `PrismaClient`, `Prisma`, Prisma model type을 import합니다.
- 크롤러, API 서버, 웹앱은 각자의 실행 환경에서 client lifecycle을 관리합니다.

## DB/API 경계

- `services/sajudex-crawler`는 Wikidata 원본을 `raw_wikipedia`에 보존하고, 정제 결과를 `curated_people`에 적재합니다.
- API 또는 웹앱은 기본적으로 `curated_people`만 조회합니다.
- raw 테이블은 재처리, 디버깅, 백필 용도이며 사용자 요청 경로에서 직접 노출하지 않습니다.
- `crawler_runs`는 운영 이력 확인과 실패 추적용입니다.

## 명령어

```bash
pnpm --filter @repo/db-schema prisma:validate
pnpm --filter @repo/db-schema prisma:generate
pnpm --filter @repo/db-schema db:push
```

`DATABASE_URL`은 워크스페이스 루트 또는 실행 환경에서 주입합니다. 비밀번호에 `@` 같은 URL 예약 문자가 있으면 `%40`처럼 URL 인코딩해서 넣습니다.
