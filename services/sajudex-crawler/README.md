# 🕷️ Sajudex Crawler

사주덱스(Sajudex) 서비스에 필요한 인물 데이터(생년월일, 국적, 직업 등)를 주기적으로 수집하고 정제하는 백그라운드 워커(Worker) 서비스입니다.

## 🎯 주요 역할 (ETL Pipeline)
1. **Extract (수집):** 위키피디아(Wikidata API) 및 나무위키 등에서 원본 데이터를 가공하지 않고 `raw_` 형태의 Staging DB에 저장합니다.
2. **Transform (정제):** 수집된 원본 데이터의 날짜, 이름, 출처 정보를 Sajudex 표준 중간 모델로 정규화합니다.
3. **Load (적재):** `@repo/saju-core`로 사주 파생 필드를 계산한 뒤 사주덱스 웹앱이 바라보는 `curated_people` 메인 테이블에 적재합니다.

## 🛠️ 기술 스택
- **Language:** TypeScript (Node.js)
- **Database:** Prisma (MariaDB 10)
- **HTTP/Parsing:** Axios, Cheerio
- **Scheduling:** node-cron (배치 작업용)

## 📐 설계 문서
- [DESIGN.md](./DESIGN.md): ETL 경계, 모듈 구조, 커맨드 설계, 구현 순서
- [SCHEMA.md](./SCHEMA.md): Prisma schema v1 결정안
- [ROADMAP.md](./ROADMAP.md): 단계별 개발 마일스톤

## 🚀 실행 방법
이 서비스는 모노레포 환경에서 동작하므로, 워크스페이스 루트 또는 해당 디렉토리에서 실행할 수 있습니다.

```bash
# DB 연결 확인
pnpm --filter sajudex-crawler dev -- db:check

# Wikidata JSON dump에서 전체 raw 수집
pnpm --filter sajudex-crawler dev -- import:wikidata:json-dump --file /data/latest-all.json.bz2 --progress-every 10000

# Wikidata 인물 후보 발견(SPARQL 보조 경로)
pnpm --filter sajudex-crawler dev -- discover:wikidata:people --limit 100 --offset 0

# 발견된 후보 raw 수집
pnpm --filter sajudex-crawler dev -- extract:wikidata:pending --limit 100

# Wikidata QID 원본 수동 수집
pnpm --filter sajudex-crawler dev -- extract:wikidata Q76

# 빌드
pnpm --filter sajudex-crawler build
```
