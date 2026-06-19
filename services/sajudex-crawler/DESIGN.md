# Sajudex Crawler Design

이 문서는 `sajudex-crawler`를 구현하기 전에 고정할 설계 기준입니다. 목표는 공개 인물 데이터를 안정적으로 수집하고, 원본 보존과 정제 로직을 분리해서 `sajudex-mweb`이 조회할 수 있는 신뢰 가능한 인물 DB를 만드는 것입니다.

## 1. 목표와 비목표

### 목표

- Wikidata를 1차 수집원으로 사용한다.
- 수집 원본은 변형하지 않고 raw 테이블에 보존한다.
- 정제/파생 계산은 raw 적재 이후 별도 단계에서 수행한다.
- `@repo/saju-core`가 준비되면 생년월일을 사주 파생 필드로 변환한다.
- `@repo/db-schema`가 준비되면 Prisma Client를 통해 DB 접근을 공유한다.
- 같은 인물을 반복 수집해도 중복 생성되지 않는 idempotent 파이프라인을 만든다.

### 비목표

- 초기 버전에서 모든 공개 인물을 raw로 저장하되, transform 대상은 생년월일이 있는 Wikidata human 후보부터 제한한다.
- 초기 버전에서 나무위키 HTML 파싱을 포함하지 않는다.
- 초기 버전에서 출생 시간까지 신뢰도 있게 계산하지 않는다.
- 초기 버전에서 친구, 동료, 검색 기반 연관 인물처럼 출처와 의미가 불안정한 관계는 수집하지 않는다.
- 크롤러 내부에 만세력 계산 로직을 직접 구현하지 않는다.

## 2. 전체 구조

```text
services/sajudex-crawler/
  src/
    index.ts
    cli/
      run-command.ts
    config/
      env.ts
    sources/
      wikidata/
        wikidata-client.ts
        wikidata-extractor.ts
        wikidata-mapper.ts
    pipeline/
      extract.ts
      transform.ts
      load.ts
      run-pipeline.ts
    repositories/
      raw-wikipedia-repository.ts
      curated-person-repository.ts
    domain/
      person.ts
      source.ts
    scheduler/
      cron.ts
    utils/
      logger.ts
      retry.ts
```

각 계층의 책임은 아래처럼 제한합니다.

- `sources/*`: 외부 출처와 통신하고 출처별 응답 형태를 다룬다.
- `pipeline/*`: Extract, Transform, Load의 순서를 조율한다.
- `repositories/*`: Prisma Client 호출만 담당한다.
- `domain/*`: 크롤러 내부 표준 타입을 정의한다.
- `config/*`: 환경변수 파싱과 기본값을 담당한다.
- `scheduler/*`: 주기 실행만 담당하고 비즈니스 로직은 호출하지 않는다.

## 3. ETL 경계

### Extract

역할은 "가져와서 그대로 저장"입니다.

- 입력: SPARQL discovery로 발견한 Wikidata QID queue 또는 수동 QID 목록. 예: `Q76`
- 처리: Wikidata API 응답 JSON을 그대로 저장한다.
- 금지: 날짜 변환, 국적 정규화, 사주 계산, 필드 추정
- 출력: `raw_wikipedia` upsert

Extract 단계에서 저장할 최소 메타데이터:

- `wikidataId`
- `title`
- `sourceUrl`
- `rawJson`
- `rawRevisionId` 또는 `lastModified`를 얻을 수 있으면 저장
- `scrapedAt`
- `processStatus`
- `processError`

### Transform

역할은 "raw 데이터를 Sajudex 표준 중간 모델로 바꾸기"입니다.

- 입력: `processStatus = PENDING | FAILED_RETRYABLE`인 raw row
- 처리: Wikidata claim에서 생년월일, 사망일, 국적, 출생지, 직업, 성별 등 추출
- 처리: 날짜 정밀도와 신뢰도를 보존
- 금지: DB 최종 테이블 직접 쓰기. 최종 write는 Load에서 수행
- 출력: `NormalizedPersonDraft`

Wikidata에서 우선 볼 claim:

- `P569`: date of birth
- `P570`: date of death
- `P27`: country of citizenship, `citizenshipCountryName` 후보
- `P19`: place of birth, `birthPlaceName`/`birthCountryName` 후보
- `P106`: occupation
- `P21`: sex or gender
- `P735`: given name
- `P734`: family name

날짜 정밀도 정책:

- 일 단위 날짜만 사주 파생 계산 대상으로 사용한다.
- 월/년 단위만 있는 경우 `birthPrecision`에 보존하고 curated에는 계산 필드를 비운다.
- 음력 여부는 Wikidata만으로 확정하지 않는다. 기본값은 `UNKNOWN` 또는 `SOLAR_ASSUMED`로 둔다.

### Load

역할은 "표준화된 데이터를 최종 서비스 테이블에 반영"입니다.

- 입력: `NormalizedPersonDraft`
- 처리: source identity 기준 upsert
- 처리: `@repo/saju-core`가 있으면 사주 파생 필드 계산
- 처리: raw row의 처리 상태를 `PROCESSED` 또는 `FAILED_*`로 갱신
- 출력: `curated_people`

Load 단계는 raw 처리 상태 업데이트와 curated upsert를 하나의 트랜잭션으로 묶습니다.

## 4. 데이터 모델

스키마 v1은 [SCHEMA.md](./SCHEMA.md)에 고정합니다. 실제 Prisma schema는 `packages/db-schema`에 둡니다.

v1에서 사용하는 테이블은 아래 세 개입니다.

- `raw_wikipedia`: Wikidata 원본 JSON 보존
- `curated_people`: Sajudex 앱이 읽는 정제 인물 데이터
- `crawler_runs`: 배치/수동 실행 이력

핵심 결정은 아래와 같습니다.

- 생년월일은 `DateTime` 하나가 아니라 `birthYear`, `birthMonth`, `birthDay`로 나눠 저장합니다.
- `raw_wikipedia.raw_json`은 원본 그대로 저장하고, schema나 transform 로직이 바뀌면 raw에서 재처리합니다.
- `curated_people`는 `source + sourceId`를 유니크 키로 사용합니다.
- 국적과 출생지는 다를 수 있으므로 `citizenshipCountryName`, `birthPlaceName`, `birthCountryName`으로 분리합니다.
- 사주 검색에 필요한 년주/월주/일주 파생 컬럼은 `curated_people`에 저장합니다.

## 5. 커맨드 설계

초기 CLI는 cron보다 먼저 구현합니다. cron은 검증된 커맨드를 주기 호출하는 얇은 레이어로 둡니다.

```bash
pnpm --filter sajudex-crawler dev -- import:wikidata:json-dump --file /data/latest-all.json.bz2 --progress-every 10000
pnpm --filter sajudex-crawler dev -- discover:wikidata:people --limit 100 --offset 0
pnpm --filter sajudex-crawler dev -- extract:wikidata:pending --limit 100
pnpm --filter sajudex-crawler dev -- extract:wikidata Q76
pnpm --filter sajudex-crawler dev -- transform:wikidata --limit 100
pnpm --filter sajudex-crawler dev -- run:pipeline --limit 100
pnpm --filter sajudex-crawler dev -- schedule
```

커맨드 책임:

- `extract:wikidata <qid...>`: 지정 QID만 raw 저장
- `transform:wikidata`: 미처리 raw row를 curated draft로 변환하고 적재
- `import:wikidata:json-dump`: Wikidata JSON dump를 스트리밍으로 읽어 human + birth date entity를 raw로 저장
- `discover:wikidata:people`: Wikidata SPARQL로 생년월일이 있는 human 후보 QID를 `wikidata_people_seeds`에 적재
- `extract:wikidata:pending`: seed queue의 pending/failed QID를 raw로 수집
- `run:pipeline`: discovery와 pending extract를 묶는 통합 실행
- `schedule`: 매일 새벽 3시 파이프라인 실행

## 6. 환경변수

```dotenv
DATABASE_URL="mysql://orcmes:P%40ssw0rd1234@jayce-data:3306/sajudex"
WIKIDATA_API_BASE_URL="https://www.wikidata.org/w/api.php"
WIKIDATA_SPARQL_ENDPOINT="https://query.wikidata.org/sparql"
CRAWLER_USER_AGENT="asaju-labs/sajudex-crawler contact@example.com"
CRAWLER_BATCH_SIZE="100"
CRAWLER_MAX_RETRIES="3"
CRAWLER_CRON="0 3 * * *"
```

주의:

- Wikidata 요청에는 식별 가능한 User-Agent를 붙입니다.
- SPARQL discovery는 label service를 사용하지 않습니다. 후보 탐색 단계에서는 QID만 확보하고, 라벨과 상세 값은 Entity API raw JSON에 보존합니다.
- `.env`는 서비스 루트 또는 워크스페이스 루트에서 로드할 수 있게 합니다.
- 비밀번호에 `@` 같은 URL 예약 문자가 있으면 `%40`처럼 URL 인코딩합니다.
- 운영 환경에서는 DB URL과 알림 웹훅을 외부 secret으로 주입합니다.

## 7. 오류 처리와 재처리

- 네트워크 오류, 429, 5xx는 retry 대상입니다.
- 데이터 구조가 예상과 다른 경우 raw row를 `FAILED_RETRYABLE`로 두고 에러 메시지를 저장합니다.
- 생년월일이 없는 인물은 실패가 아니라 `PROCESSED_WITHOUT_BIRTH_DATE`로 처리해 원본 재시도 루프에 갇히지 않게 합니다.
- raw row 처리 중 프로세스가 죽어도 다시 잡을 수 있도록 `PROCESSING` 상태에는 timeout 재큐잉 정책을 둡니다.

## 8. 구현 순서

1. `packages/db-schema` 생성 및 Prisma schema 확정
2. `sajudex-crawler` TypeScript 실행 환경 정리
3. 환경변수 파서와 logger 추가
4. Wikidata client 구현
5. `extract:wikidata QID` 커맨드 구현
6. RawWikipedia repository 구현
7. Wikidata raw JSON fixture 기반 transform 테스트 작성
8. transform/load 트랜잭션 구현
9. `@repo/saju-core` 연동 후 사주 파생 필드 저장
10. cron과 알림 연동

## 9. 남은 설계 결정

- `CuratedPerson`의 이름 필드를 다국어로 분리할지 여부
- 생년월일이 불완전한 인물을 웹앱 검색 대상으로 노출할지 여부
- 음력 생일을 어떤 출처에서 확정할지 여부
- 출생 시간이 없는 경우 사주 계산 결과를 어디까지 저장할지 여부
- Wikidata QID seed list를 코드, DB, CSV 중 어디에서 관리할지 여부
