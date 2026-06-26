# asaju-labs Monorepo - Workspace Instructions

이 파일은 `asaju-labs` 워크스페이스에서 Gemini CLI 에이전트가 코딩 및 인프라 작업을 수행할 때 반드시 준수해야 할 프로젝트 전용 지침서입니다.

## 1. 프로젝트 구조 및 패키지 격리 (Architecture)
이 프로젝트는 **Turborepo** 기반의 모노레포입니다. 새로운 코드를 작성할 때 반드시 역할에 맞는 폴더에 위치시켜야 합니다.

*   **`apps/`**: 사용자 대상 웹/앱 프로젝트
    *   명명 규칙: 반응형/PC(`-web`), 모바일 전용 웹(`-mweb`), 앱스토어 네이티브 앱(`-mobile`)
*   **`services/`**: 백그라운드 크롤러, 봇, 전용 API 서버 등 화면이 없는 서비스
    *   예: `sajudex-crawler`
*   **`packages/`**: 모든 앱과 서비스가 공유하는 핵심 부품
    *   **`saju-core`**: 만세력 계산, 오행 분석 등 핵심 순수 비즈니스 로직. (앱에 종속시키지 말고 무조건 이곳에 작성)
    *   **`db-schema`**: Prisma 스키마 및 데이터베이스 클라이언트
    *   **`ui`**: 공통 React 컴포넌트

## 2. 필수 기술 스택 및 제약 사항 (Tech Stack)
*   **패키지 매니저:** 무조건 **`pnpm`**을 사용합니다. (`npm`, `yarn` 사용 금지)
*   **언어:** TypeScript를 기본으로 사용합니다.
*   **프론트엔드:** Next.js (React)
*   **데이터베이스:** MariaDB 10 (ORM: Prisma)

## 3. 명령어 규칙 (CLI Rules)
*   **패키지 설치:** 워크스페이스 루트에서 실행하거나 필터를 사용하세요.
    *   예: `pnpm add axios --filter sajudex-crawler`
*   **스크립트 실행:** 루트에서 turbo를 활용하세요.
    *   예: `pnpm turbo run build`, `pnpm turbo run dev`

## 4. 참조 문서 위치 (Reference)
기획, 아키텍처, 크롤러 설계 등에 대한 상세 히스토리는 옵시디언 볼트에 위치해 있습니다. 문맥 파악이 필요할 경우 아래 경로의 `.md` 파일들을 참고하세요.
*   **절대 경로:** `/home/sc7258/SynologyDrive/_obsidian_vaults/intellian/20_Projects/asaju.com/architecture/`

## 5. 현재 작업 컨텍스트 (Current Handoff)
다음 세션에서 "이 프로젝트에서 뭘 하면 돼?"라고 물으면 우선 아래를 확인하세요.

*   **현재 이어받을 작업:** `services/sajudex-crawler`
*   **상세 handoff:** `services/sajudex-crawler/HANDOFF.md`
*   **최근 완료:** `@repo/db-schema` Prisma schema 패키지, Sajudex DB 연결, Wikidata API/SPARQL 보조 수집, `latest-all.json.bz2` dump 스트리밍 raw import
*   **다음 우선순위:** `raw_wikipedia`에서 `curated_people`로 옮기는 `transform:wikidata` 구현
*   **먼저 확인할 명령:**
    *   `pnpm --filter sajudex-crawler build`
    *   `pnpm --filter sajudex-crawler dev -- db:check`

## 6. 도메인 용어 및 데이터 분리 규칙 (Terminology & Data Separation)
프로젝트 내에서 다음 두 용어의 역할과 저장소를 엄격히 구분합니다.

*   **명식록 (Public/Global Data):** 위키데이터나 나무위키 등 외부 출처에서 수집한 **유명인 사주/프로필 도감**입니다. `packages/db-schema`의 `curated_people` 테이블에 저장되며, 특정 사용자에게 종속되지 않는 공용 데이터입니다.
*   **인연록 (Private Data):** 앱 사용자가 직접 등록하고 관리하는 **지인(가족, 친구 등) 사주 목록**입니다. 크롤러의 수집 대상이 아니며, 메인 앱의 사용자 DB 쪽에서 식별자(`userId`)와 함께 완전히 별도의 테이블로 분리되어 관리됩니다. `curated_people` 테이블에 지인 정보를 섞지 않도록 주의하세요.

## 7. 보안 및 시크릿 관리 (Security & Secrets - CRITICAL MANDATE)
이 프로젝트에서 Gemini CLI 에이전트가 코드를 작성, 리뷰, 실행할 때 **운영 환경과 관련된 모든 시크릿(Secret) 정보의 유출 및 배포를 원천 차단**하기 위해 다음 규칙을 최우선으로 강제(Mandate)합니다.

*   **하드코딩 절대 금지:** 데이터베이스 접속 URL, API 키, Vercel/Synology 등의 클라우드 접속 정보, 내부 IP 주소, 비밀번호는 어떠한 경우에도 코드(JS/TS), 주석, `.md` 문서, 설정 파일 등에 하드코딩해서는 안 됩니다.
*   **환경 변수 활용:** 모든 민감한 설정 정보는 로컬의 `.env` 파일(Git 제외)과 배포 환경의 시스템 환경 변수를 통해서만 주입받도록 코드를 작성하세요.
*   **Example 파일 더미 데이터화:** Git에 커밋될 수 있는 `.env.example` 등의 템플릿 파일에는 반드시 `USER:PASSWORD@localhost` 형식의 **가짜 더미(Dummy) 데이터**만 작성해야 하며, 내부 인프라 구조나 실제 아이디를 유추할 수 있는 값을 남기지 마세요.
*   **스스로의 검열 (Self-Censorship):** 에이전트는 Shell 명령어를 실행하거나 코드를 변경/스테이징 할 때, 민감 정보가 포함된 파일이 실수로 스테이징(git add)되거나 로그에 출력되지 않도록 스스로 엄격하게 검열해야 합니다.
