# SajuCube Webapp

출생 정보를 입력하면 만세력(사주) 표를 보여주는 웹앱이다.  
일반 만세력과 차샘 만세력 두 가지 방식을 지원한다.

## 주요 기능

- 성별, 양력/음력, 윤달 여부, 생년월일시 입력
- 만세력 4주(년·월·일·시 천간지지) 표시
- 천을귀인, 공망 표시
- 대운 10칸, 세운 10칸 표시
- 차샘 만세력: 부허자·차역 변환으로 도출된 6개 패널 동시 표시
- 생년월일 기준 공유 링크 및 OG 이미지 생성
- PWA 지원

## 기술 스택

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Vitest** — 단위 테스트
- **Supabase** — 인증 및 데이터
- [`@gracefullight/saju`](https://github.com/gracefullight/saju) — 사주 계산
- [`korean-lunar-calendar`](https://github.com/usingsky/korean-lunar-calendar) — 한국 음양력 변환
- **Luxon** — 날짜/시각 처리

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 확인할 수 있다.

## 주요 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run test` | 전체 테스트 실행 |
| `npm run test:watch` | 테스트 watch 모드 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run check` | lint + typecheck |
| `npm run verify` | lint + typecheck + test |

## 문서

- [차샘 만세력 계산 방법](docs/chasam-manselyeok-calculation.md)
