# Sajudex Crawler Handoff

이 파일은 다음 작업이나 merge 전에 현재 crawler/DB 작업 상태를 빠르게 확인하기 위한 메모입니다.

## 현재 상태

- Commit: `855293c Add Sajudex crawler DB schema and Wikidata import`
- Prisma schema package: `packages/db-schema` (최근 `imageUrl` 및 `person_saju_plates` 테이블 구조 업데이트 완료)
- Crawler DB target: `sajudex`
- Local DB URL 예시: `mysql://orcmes:P%40ssw0rd1234@jayce-data:3306/sajudex`
- 비밀번호의 `@`는 Prisma URL에서 `%40`으로 인코딩해야 합니다.
- **진행 중인 작업:** 백그라운드 터미널에서 `latest-all.json.bz2` dump 스트리밍 raw import 실행 중 (Windows bzip2 fallback 적용)
- **최근 완료된 작업:** `transform:wikidata` 로직 구현 (P18 사진 추출 및 `@repo/saju-core`를 이용한 6판 사주 생성 연동 완료)

## 주요 명령

```bash
pnpm --filter @repo/db-schema prisma:validate
pnpm --filter @repo/db-schema db:push
pnpm --filter sajudex-crawler build
pnpm --filter sajudex-crawler dev -- db:check
```

전체 raw 수집의 메인 경로:

```bash
pnpm --filter sajudex-crawler dev -- import:wikidata:json-dump --file /data/latest-all.json.bz2 --progress-every 10000
```

보조 경로:

```bash
pnpm --filter sajudex-crawler dev -- discover:wikidata:people --limit 100 --offset 0
pnpm --filter sajudex-crawler dev -- extract:wikidata:pending --limit 100
pnpm --filter sajudex-crawler dev -- extract:wikidata Q76
```

## Merge 주의점

- `packages/db-schema/prisma/schema.prisma`가 DB schema의 단일 원본입니다.
- `services/sajudex-crawler/SCHEMA.md`에는 필드 전체를 중복하지 않고 실제 schema 파일을 참조합니다.
- `services/sajudex-crawler/.env`는 local ignored file입니다. 커밋 대상은 `.env.example`입니다.
- dump 전체 수집은 Wikidata API가 아니라 `latest-all.json.bz2` 스트리밍 import가 메인 경로입니다.
- SPARQL/API 경로는 샘플 검증, 누락분 재처리, 특정 QID 수동 수집용입니다.

## 다음 작업

- 백그라운드 dump import가 어느 정도 진행되거나 완료되면 `transform:wikidata` 명령어를 실행하여 데이터 정제(6판 사주 계산 포함) 및 검증
- dump import 장시간 실행 시 resume/checkpoint 전략 추가 (중간에 끊겼을 때 이어받기)
- 누락/실패 리포트 커맨드 추가
