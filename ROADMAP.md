# 🗺️ asaju-labs Roadmap & Critical Path

이 문서는 프로젝트의 전체 진행 방향과, 기능 간의 의존성(선후 관계)을 고려한 핵심 개발 순서를 정의합니다.

## 🚨 Critical Path (절대적인 개발 순서)
정식 DB에 완벽한 명식 데이터를 적재하고 화면을 그리기 위해서는 반드시 아래의 순서를 지켜야 합니다.
1. **Core 모듈화:** 기존 사주큐브 로직 ➔ `packages/saju-core` 이관 (가장 먼저!)
2. **데이터 파이프라인:** 위키피디아 수집 ➔ 정제기에서 `saju-core` 호출하여 명식 계산 ➔ 정식 DB 적재
3. **화면 개발:** 정식 DB를 바라보는 `sajudex-mweb` 개발

---

## Phase 1: 모노레포 인프라 및 뼈대 구축 (현재 완료)
- [x] Synology NAS 보안 및 네트워크 세팅 (Tailscale, Nginx Proxy Manager)
- [x] MariaDB 10 시스템 패키지 설치 및 최적화
- [x] Turborepo 기반 `asaju-labs` 모노레포 구축 (`apps`, `services`, `packages` 분리)

## Phase 2: 사주큐브 코어 모듈화 (가장 우선!)
- [ ] `packages/saju-core`: 기존 사주큐브에서 '만세력 계산 루틴(천간/지지 도출)'을 완벽히 분리
- [ ] `packages/db-schema`: 명식 조합 검색을 위한 일주, 월주 등 파생 컬럼을 포함한 Prisma 모델 설계

## Phase 3: 데이터 수집 및 정제 (ETL)
- [ ] `services/sajudex-crawler`: 위키피디아(Wikidata) API 연동 1차 수집기 개발 (Extract - Raw 저장)
- [ ] `services/sajudex-crawler`: 생일 없는 데이터 필터링 로직 구현 (Transform - 검증)
- [ ] `services/sajudex-crawler`: **[핵심]** `saju-core` 패키지를 호출하여 사주 8글자를 계산하고 최종 `curated_people` 메인 DB에 적재 (Load)

## Phase 4: 사주덱스 (Sajudex) M-Web 프론트엔드
- [ ] `apps/sajudex-mweb`: Next.js 기반 뼈대 세팅
- [ ] 완벽하게 가공된 메인 DB를 바라보는 유명인/지인 명식 검색 및 조회 화면 (일주/조합 검색)
- [ ] 인물 간의 명리학적 관계(합/충 등)를 시각화하는 '관계망(Network Graph)' UI 개발

## Phase 5: 사주큐브 (Sajucube) 모바일 웹 고도화
- [x] `apps/sajucube-mweb`: Next.js 기반 앱 셋업 및 자체 UI 컴포넌트(`@repo/ui`) 연동
- [x] 차샘 만세력 6개 사주판(Panel) UI 구현 및 Zen 스타일(글래스모피즘) 툴바 개편
- [ ] **[성능 최적화]** 차트 렌더링 SSR ➔ CSR 전환 및 제스처 도입:
  - 클라이언트 사이드 연산(CSR) 아키텍처로 리팩토링하여 네트워크 딜레이 없는 즉각적인 렌더링 구현
  - Shallow Routing을 연동하여 URL 기반의 상태 보존 및 완벽한 공유 기능 유지
  - 좌우 스와이프 제스처(Swipe Gesture)를 통한 직관적인 날짜 이동 기능 추가 (터치 충돌 방지 정밀 제어)
- [ ] **Sajudex ↔ Sajucube 연동:** 사주덱스에서 검색한 인물을 사주큐브의 정밀 분석 화면으로 매끄럽게 브릿지