# Sajudex Crawler Schema v1

이 문서는 `sajudex-crawler`가 v1에서 사용할 DB 스키마 결정안입니다. 실제 Prisma schema는 `packages/db-schema`에 둡니다.

## 결정

v1에서는 네 테이블을 사용합니다.

- `wikidata_people_seeds`: SPARQL discovery로 발견한 인물 후보 QID queue
- `raw_wikipedia`: Wikidata 원본 JSON 보존
- `curated_people`: Sajudex 앱이 읽는 정제 인물 데이터
- `crawler_runs`: 배치/수동 실행 이력

v1에서 제외합니다. 안정적인 출처와 의미가 확인되기 전까지 아래 항목은 저장하지 않습니다.

- `raw_namuwiki`: 나무위키 수집 단계에서 추가
- 국적/출생지/직업 정규화 테이블: 검색 요구가 커질 때 분리
- 인물 병합 테이블: Wikidata/Namuwiki 중복 매칭이 필요해질 때 추가
- 사람 관계 테이블: 가족/배우자/사제처럼 명시적 관계만 v2에서 검토
- 친구/동료/연관 인물: 검색 결과나 추론 기반 데이터는 v1에서 제외

## v1 수집 대상

v1은 SPARQL로 `instance of human(Q5)`이고 `date of birth(P569)`가 있는 후보를 먼저 발견한 뒤, Wikidata에서 명시적으로 제공되는 안정적인 인물 속성만 정제 테이블에 저장합니다.

| Wikidata property | 의미 | 저장 필드 | v1 처리 |
| --- | --- | --- | --- |
| `P569` | 생년월일 | `birthYear`, `birthMonth`, `birthDay`, `birthPrecision` | 저장 |
| `P570` | 사망일 | `deathYear`, `deathMonth`, `deathDay` | 저장 |
| `P27` | 국적/시민권 | `citizenshipCountryName` | 저장 |
| `P19` | 출생지 | `birthPlaceName`, `birthCountryName` | 저장 |
| `P106` | 직업 | `occupationName` | 저장 |
| `P21` | 성별 | v1 정제 테이블에는 저장하지 않음 | raw에만 보존 |
| `P735` | given name | v1 정제 테이블에는 저장하지 않음 | raw에만 보존 |
| `P734` | family name | v1 정제 테이블에는 저장하지 않음 | raw에만 보존 |

v1에서 저장하지 않는 데이터도 `raw_wikipedia.raw_json`에는 그대로 남깁니다. 나중에 스키마가 확장되면 raw JSON을 다시 읽어 백필합니다. `wikidata_people_seeds.birth_date`는 discovery 추적용 문자열로만 보존하고, 실제 날짜 정밀도 해석은 transform 단계에서 raw JSON의 Wikidata claim을 기준으로 수행합니다.

## Prisma Schema

실제 Prisma schema의 단일 원본은 `packages/db-schema/prisma/schema.prisma`입니다. 이 문서에는 스키마 결정과 운영 의미만 남기고, 필드 정의는 실제 schema 파일을 기준으로 확인합니다.

## 전체 수집 운영 방식

1. 메인 경로는 `latest-all.json.bz2`를 `import:wikidata:json-dump`로 스트리밍 처리하는 방식입니다. 압축 파일을 풀어두지 않고 한 entity씩 읽습니다.
2. dump entity 중 `instance of human(Q5)`이고 `date of birth(P569)` claim이 있는 항목만 `raw_wikipedia.raw_json`에 저장합니다.
3. 저장 성공 시 `wikidata_people_seeds`에도 `FETCHED` 상태로 upsert하고 `raw_wikipedia_id`를 연결합니다.
4. `discover:wikidata:people`와 `extract:wikidata:pending`은 SPARQL/API 보조 경로입니다. 샘플 검증, 누락분 재처리, 특정 QID 수동 수집에 사용합니다.

## 설계 이유

- 생년월일은 `DateTime` 하나로 저장하지 않고 `birthYear`, `birthMonth`, `birthDay`로 나눕니다. 날짜만 필요한 데이터에서 timezone 변환 문제를 피하고, 년/월까지만 있는 Wikidata 값도 보존하기 위해서입니다.
- `RawWikipedia.rawJson`은 항상 원본 그대로 저장합니다. 나중에 transform 로직이나 curated schema가 바뀌어도 raw에서 재처리할 수 있습니다.
- `CuratedPerson`은 `source + sourceId`를 유니크 키로 둡니다. v1에서는 출처별 인물을 안정적으로 upsert하고, 출처 간 인물 병합은 v2에서 별도 모델로 처리합니다.
- `rawWikipediaId`는 1:1 관계로 둡니다. 같은 raw row를 재처리해도 같은 curated row를 갱신하게 만들기 위해서입니다.
- 사주 검색에 필요한 일주/월주/년주 필드는 `curated_people`에 저장합니다. 앱 조회 시 매번 계산하지 않기 위한 denormalization입니다.
- `crawler_runs`는 운영 이력 확인용입니다. cron 실패, 수집 건수, 수동 실행 결과를 DB에 남겨 디버깅할 수 있게 합니다.

## v2 확장 후보

- `RawNamuwiki`: 나무위키 HTML 원본/infobox 저장
- `CrawlSeed`: 수집 대상 QID queue와 우선순위 관리
- `PersonIdentity`: 여러 출처의 동일 인물 병합
- `PersonAlias`: 한글명, 영문명, 한자명, 예명 검색
- `Country` / `Place` / `Occupation`: 국적, 출생지, 직업 정규화 및 faceted search
- `InferredRelation`: 같은 작품, 같은 학교, 같은 회사 등 간접 관계. 자동 확정하지 않고 별도 신뢰도와 출처가 필요
