# 🗺️ asaju-labs Roadmap

## Phase 1: 모노레포 인프라 및 뼈대 구축 (현재 완료)
- [x] Synology NAS 보안 및 네트워크 세팅 (Tailscale, Nginx Proxy Manager)
- [x] MariaDB 10 시스템 패키지 설치 및 최적화
- [x] Turborepo 기반 `asaju-labs` 모노레포 구축 (`apps`, `services`, `packages` 분리)

## Phase 2: 데이터 수집 파이프라인 (진행 예정)
- [ ] `packages/db-schema`: Prisma 설정 및 MariaDB 연동
- [ ] `services/sajudex-crawler`: 위키피디아(Wikidata) API 연동 크롤러 개발 (Extract)
- [ ] `services/sajudex-crawler`: 데이터 정제 및 메인 DB 이관 로직 (Transform & Load)

## Phase 3: 사주덱스 (Sajudex) M-Web 프론트엔드
- [ ] `packages/saju-core`: 사주 명식(천간/지지) 계산 로직 패키지 작성
- [ ] `apps/sajudex-mweb`: Next.js 기반 유명인 명식 검색 및 조회 화면 개발

## Phase 4: 사주큐브 (Sajucube) 연동 및 고도화
- [ ] `apps/sajucube-web`: 사주 6개 판 계산 및 정밀 분석 툴 개발 (기존 백로그 연동)
- [ ] `apps/sajudex-mobile`: React Native/Expo 기반 앱스토어 배포 검토
