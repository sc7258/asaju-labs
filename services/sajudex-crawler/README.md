# 🕷️ Sajudex Crawler

사주덱스(Sajudex) 서비스에 필요한 인물 데이터(생년월일, 국적, 직업 등)를 주기적으로 수집하고 정제하는 백그라운드 워커(Worker) 서비스입니다.

## 🎯 주요 역할 (ETL Pipeline)
1. **Extract (수집):** 위키피디아(Wikidata API) 및 나무위키 등에서 원본 데이터를 파싱하여 `raw_` 형태의 Staging DB에 저장합니다.
2. **Transform (정제):** 수집된 원본 데이터의 날짜 형식을 표준화하고, `@repo/saju-core` 패키지를 호출하여 해당 인물의 **사주 명식(천간지지)**을 계산합니다.
3. **Load (적재):** 최종 가공된 데이터를 사주덱스 웹앱이 바라보는 `curated_people` 메인 테이블에 적재합니다.

## 🛠️ 기술 스택
- **Language:** TypeScript (Node.js)
- **Database:** Prisma (MariaDB 10)
- **HTTP/Parsing:** Axios, Cheerio
- **Scheduling:** node-cron (배치 작업용)

## 🚀 실행 방법
이 서비스는 모노레포 환경에서 동작하므로, 워크스페이스 루트 또는 해당 디렉토리에서 실행할 수 있습니다.

```bash
# 개발 모드 실행 (ts-node)
pnpm run dev

# 빌드
pnpm run build
```