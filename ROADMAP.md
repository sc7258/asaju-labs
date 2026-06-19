# 🗺️ asaju-labs Roadmap

## Phase 1: 모노레포 인프라 및 뼈대 구축 (현재 완료)
- [x] Synology NAS 보안 및 네트워크 세팅 (Tailscale, Nginx Proxy Manager)
- [x] MariaDB 10 시스템 패키지 설치 및 최적화
- [x] Turborepo 기반 `asaju-labs` 모노레포 구축 (`apps`, `services`, `packages` 분리)

## Phase 2: 코어 로직 이식 및 데이터 수집 (진행 예정)
- [ ] `packages/saju-core`: 기존 사주큐브에서 '만세력 계산 루틴'을 완벽히 분리하여 이식
- [ ] `packages/db-schema`: Prisma 설정 (명식 조합 검색을 위한 일주, 월주 등 파생 컬럼 설계 포함)
- [ ] `services/sajudex-crawler`: 위키피디아(Wikidata) API 연동 크롤러 개발 (Extract)
- [ ] `services/sajudex-crawler`: 데이터 정제 시 `saju-core`를 태워 일주/월주를 계산하여 메인 DB 적재 (Transform & Load)

## Phase 3: 사주덱스 (Sajudex) M-Web 프론트엔드
- [ ] `apps/sajudex-mweb`: Next.js 기반 유명인/지인 명식 검색 및 조회 화면 (일주/조합 검색 기능)

## Phase 4: 사주큐브 (Sajucube) 통합 및 고도화
- [ ] `apps/sajucube-web`: 분리된 코어 로직을 기반으로 사주 6개 판 정밀 분석 툴 리뉴얼
- [ ] **Sajudex ↔ Sajucube 연동:** 사주덱스에서 검색한 인물을 사주큐브의 분석 화면으로 매끄럽게 연결하는 브릿지 구현