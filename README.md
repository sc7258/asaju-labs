# 🪐 asaju-labs Monorepo

아사주(asaju.com) 생태계의 모든 하위 서비스(사주큐브, 사주덱스 등)를 통합 관리하는 **Turborepo 모노레포**입니다.

## 🏗️ Architecture

이 저장소는 역할에 따라 다음과 같이 완벽히 격리된 구조를 가집니다.

### 📱 Apps (`/apps`)
사용자에게 직접 제공되는 프론트엔드/클라이언트 애플리케이션입니다.
- **`sajudex-mweb`**: 사주덱스 (모바일 전용 웹 - Next.js)
- **`sajucube-web`**: 사주큐브 (웹 프론트엔드 - Next.js)
- **`sajudex-mobile`** *(예정)*: 앱스토어 배포용 네이티브 앱 (Expo/React Native)

### ⚙️ Services (`/services`)
사용자 화면이 없는 백그라운드 워커 및 데이터 파이프라인입니다.
- **`sajudex-crawler`**: 위키피디아, 나무위키 등 공개 인물 데이터 수집 봇 및 정제기

### 📦 Packages (`/packages`)
앱과 서비스들이 공통으로 가져다 쓰는(import) 핵심 모듈 및 설정입니다.
- **`saju-core`**: 🧠 핵심 비즈니스 로직 (만세력 계산식, 오행 분석 등)
- **`db-schema`**: 🗄️ Prisma ORM 스키마 및 DB 연결 클라이언트
- **`ui`**: 🎨 공통 디자인 시스템 (버튼, 카드 레이아웃 등)
- **`config`**: ESLint, TSConfig 등 공통 환경 설정

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# pnpm 워크스페이스를 통해 모든 앱/패키지의 의존성을 한 번에 설치합니다.
pnpm install
```

### 2. Useful Commands (Turbo)
루트 디렉토리에서 아래 명령어 한 줄로 하위의 모든 프로젝트를 제어할 수 있습니다.
- `pnpm turbo run dev`: 모든 웹앱과 서비스를 개발(Dev) 모드로 동시 실행
- `pnpm turbo run build`: 전체 프로젝트 병렬 빌드 및 캐싱
- `pnpm turbo run lint`: 전체 코드 린트 검사
