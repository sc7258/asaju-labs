# 현재 상태

## 진행 상태
- 만세력 MVP의 기본 흐름은 동작 중이다.
- 입력값을 받아 만세력을 계산하고 결과를 화면에 표시할 수 있다.
- 공유 URL, OG 이미지, 첫 Vercel 배포, PWA 설치 기반까지 반영된 상태다.

## 완료된 항목
- Next.js App Router 초기 구성
- `@gracefullight/saju` 기반 만세력 계산
- 성별, 양력/음력/윤달, 생년월일시 입력 처리
- compact 입력 바와 결과 보드 UI
- 사주, 천을귀인, 공망, 대운, 세운 표시
- 붙여쓴 생년월일시 입력 포맷 처리
- 생년월일시 입력 중 `8자리/10자리/12자리` 자동 반영
- 연속 자동 반영의 히스토리 덮어쓰기
- 자동 반영 중에도 입력창의 편집 초안 유지
- 첫 진입 시 현재 날짜/시간 기본 명식
- 시간 미입력 시 시주 `?` 표시 및 `12:00` 기준 근사 계산
- 입춘 이전 출생자의 연운 기준 연도 보정(`solarYearUsed`)
- 생성/공유 아이콘 버튼
- 앱 정보 버튼과 버전 표시
- 공유 버튼과 앱 정보 버튼만 노출하는 단순 액션 영역
- 상단 compact 툴바의 전날/다음날 버튼 추가
- 상단 툴바의 성별/양력/음력 정사각형 버튼 정리
- 성별/양음력 선택 변경 시 즉시 GET 제출로 6판 다시 계산
- 공유 버튼 클릭 시 최신 폼 값 기준 주소로 먼저 동기화한 뒤 공유/복사
- 존재하지 않는 윤달 날짜는 일반 음력으로 조용히 보정하지 않고 입력 오류로 처리
- 현재 입력값 기준 공유 URL 생성
- 현재 입력값 기준 동적 OG 메타데이터 생성
- 공유용 OG 이미지(`/api/og`) 렌더링
- 공유용 OG 이미지를 `사주 + 천을귀인/공망 + 대운` 중심 보드형으로 조정
- 시간 없는 입력에서도 차샘 OG 이미지가 `?` 시주를 안전하게 렌더하도록 보정
- 차샘 OG 이미지에서 32글자를 유지하면서 부허/본차/허자 3그룹 구분, 타일 간격, divider, 브랜드 배지를 포함한 레이아웃 미세 조정을 완료
- 로컬/사설망 환경에서 공개 배포 주소 기준 공유 URL 생성
- Vercel 프로젝트 `sajucube` 생성 및 프로덕션 배포
- PWA manifest, app icon, apple icon, service worker, 프로덕션 전용 등록 처리
- 차샘만세력 차력의 `없는 음력 날짜` 보정 규칙을 위한 후보 선택 헬퍼와 테스트 추가
- 차샘만세력의 `본원 -> 차력 -> 허자 본원 -> 허자 차력` 날짜 체인 헬퍼와 예시 테스트 추가
- 차샘만세력의 `본원 -> 부허자 차력 -> 부허자 본원` 역방향 날짜 체인 헬퍼와 예시 테스트 추가
- 차샘만세력 부허자 단계의 `없는 양력 날짜`를 전날/전전날/다음날/다다음날 후보와 오전/오후 규칙으로 보정
- 차샘만세력 6판용 서버 상태 생성과 기본 접힘 UI 구조 추가
- 차샘만세력 OG를 6판 8자 요약 이미지로 변경
- 사주판 출생 정보에 음력 생일 요약을 추가하고, 윤달 입력 시 양력 요약 접두를 `윤`으로 조정
- 차샘 6판 헤더의 표시명을 `홍길동` 대신 `부허 본원`, `부허 차력`, `본원`, `차력`, `허자 본원`, `허자 차력`으로 변경
- 음력 입력과 차샘 날짜 체인의 양음력 변환을 `korean-lunar-calendar` 기반 한국 기준으로 교체
- 차샘만세력의 체인 출발점은 `solar` 입력이면 입력 숫자 그대로, `lunar` 입력이면 변환된 실제 양력 생일을 사용
- 부허자 단계에서 실제로 존재하지 않는 양력 날짜가 나오면, 인접 4일 후보 중 목표 음력 숫자와 일치하는 날을 먼저 찾고 없으면 오전은 전날, 오후는 다음날로 보정한다.
- 일반 만세력 화면의 음력 요약/라벨도 `korean-lunar-calendar` 기준으로 통일했다.

## 현재 규칙
- 대운과 세운은 기본적으로 10개 기준으로 표시한다.
- 대운을 선택하면 해당 대운 범위의 세운을 보여준다.
- 선택된 대운 범위 안에 올해가 있으면 올해 세운을 기본 선택한다.
- 올해가 범위 안에 없으면 첫 번째 세운을 기본 선택한다.
- 시간이 비어 있으면 시주는 `?`로 표시하고 계산은 `12:00` 기준 근사값으로 처리한다.
- 시간이 비어 있어도 차샘 OG 이미지는 `?` 시주를 중립 타일로 렌더해 이미지 생성이 깨지지 않는다.
- 공유 버튼은 현재 폼의 최신 입력값으로 URL을 조합해 공유/복사한다.
- 상단 툴바의 성별/양음력 선택은 변경 즉시 다시 계산되도록 바로 제출한다.
- 공유 버튼은 현재 폼의 최신 입력값으로 URL을 만들 뿐 아니라, 주소창도 그 값으로 먼저 동기화한다.
- 윤달 입력은 실제로 존재하는 윤달 날짜일 때만 유효하며, 없는 윤달 날짜는 에러로 막는다.
- 공유 미리보기 이미지는 현재 입력 파라미터로 생성한 만세력 보드를 사용한다.
- 메타데이터, manifest, 공유 표기 이름은 `SajuCube`로 통일한다.
- 앱 버전은 `package.json` 기준으로 관리하고, 우측 상단 `앱 정보` 버튼에서만 확인할 수 있다.
- 배포 직전에는 patch 버전을 기본적으로 올리고, minor 버전은 요청 시에만 올린다.
- 생년월일시 입력은 `8자리(날짜)`, `10자리(시까지)`, `12자리(분까지)` 시점에 자동으로 다시 계산한다.
- 짧은 시간 안의 연속 자동 반영은 `replace` 방식으로 덮어써서 `뒤로 가기`가 중간 입력 상태에 멈추지 않는다.
- 자동 반영은 클라이언트 라우팅으로 처리하고, 사용자가 계속 입력 중이면 서버 응답으로 돌아온 짧은 값이나 `00` 보정값이 입력창을 덮어쓰지 않는다.
- 입력창의 최신 draft 생년월일시는 별도 클라이언트 저장소로 관리하고, 차트는 draft와 다른 오래된 자동 반영 응답을 무시한다.
- 검색 파라미터 없이 시작하면 서울 현재 날짜/시간 기준 명식을 바로 보여준다.
- 차샘만세력 OG는 부허자/허자 패널에서 일주/월주만 표시하고, 남는 공간을 사주 글자 확대에 사용한다.
- 차샘만세력 OG는 현재 32글자 전체를 유지하고, 각 타일 `3px` 테두리, 패널 내부 간격 `15px`, 그룹 간격 `20px`, 그룹 내부 상하 간격 `30px`, divider `5px` 기준으로 조정돼 있다.
- 공유 OG 이미지에는 좌상단 `SajuCube` 브랜드 배지와 4색 큐브 마크를 함께 표시한다.
- 메인 보드와 공유 이미지의 천을귀인/공망 위 영역에는 `성별 이름`과 양력 기준 출생 시각 요약을 표시한다.
- 음력으로 입력해도 좌측 출생 정보 요약은 항상 변환된 양력 날짜로 보여준다.
- 공유 이미지에서는 출생 정보를 천을귀인/공망 바로 위 같은 열로 배치하고, 천을귀인/공망 셀 크기를 주변 사주 타일에 가깝게 맞춘다.
- 기둥 위치, 적중 위치, 대운/세운 머리말, 대운/세운 구분선, 사주판 배경색은 기본으로 숨기고/끄고, 설정에서 켠 경우에만 메인 보드와 공유 이미지에 함께 반영한다.
- manifest 링크와 manifest 내부 아이콘 경로에는 빌드별 버전 쿼리를 붙여 설치 아이콘 갱신을 유도한다.
- 서비스 워커는 `manifest.webmanifest`, `icon`, `apple-icon`, `favicon.ico`를 캐시 대상에서 제외한다.
- PWA 서비스 워커는 프로덕션에서만 등록한다.

## 최근 검증
- `npm run test -- --run src/app/manifest.test.ts`
- `npm run test -- --run src/app/manifest.test.ts src/components/share-link-button.test.tsx src/lib/manselyeok-share.test.ts`
- `npm run test -- --run src/app/layout.test.ts src/app/manifest.test.ts`
- `npm run test -- --run src/lib/manselyeok.test.ts src/app/layout.test.ts src/app/manifest.test.ts src/lib/manselyeok-share.test.ts`
- `npm run check`
- `npm run build`
- `npm run test -- --run src/components/chasam-manselyeok-chart-client.test.tsx src/components/manselyeok-chart-client.test.tsx src/lib/manselyeok.test.ts src/lib/manselyeok-share.test.ts`
- `npm run check`

## 다음 작업 후보
- 택일을 쉽게 하기 위한 인접 날짜 이동 기능 추가
- 사주 8자를 기준으로 생년월일시를 역으로 찾는 기능 추가
- 차샘 명식자료 가져오기 기능 추가
  선행 조건: 소셜 로그인 기능 완료 후 진행
## 2026-04-05 보충 메모
- 대운/세운 선택은 이제 클라이언트에서 즉시 행이 바뀌고, URL도 함께 동기화된다.
- `src/components/manselyeok-chart-client.test.tsx`로 차트 상호작용 검증을 추가했다.
- 최신 검증:
- `npm run test -- --run src/components/manselyeok-chart-client.test.tsx src/lib/manselyeok.test.ts src/lib/manselyeok-share.test.ts`
- `npm run check`
## 2026-04-06 보충 메모
- `src/lib/korean-lunisolar.ts`를 추가해 한국천문연구원 기준의 `korean-lunar-calendar`를 양음력 변환 단일 진입점으로 사용한다.
- `src/lib/app-version.ts`를 추가해 `package.json version + 배포 build id`를 앱 정보용 단일 진입점으로 관리한다.
- `src/components/birth-text-input.tsx`에 디바운스 자동 제출을 추가해 날짜만 입력해도 결과가 먼저 반영되고, 시까지 입력하면 분 `00`으로 즉시 계산한다.
- `src/components/birth-text-input.tsx`의 자동 반영은 최근 자동 이동 시각을 기준으로 `push/replace`를 나눠, `1972 -> 1999-05-29 -> 1999-05-29 11:00` 같은 입력 흐름에서도 뒤로 가기가 중간 상태에 덜 걸리게 조정했다.
- `src/components/birth-text-input.tsx`의 자동 반영은 App Router 클라이언트 라우팅으로 바꾸고, 편집 중 서버 echo는 무시해 `1972 0126` 입력 뒤 시간을 이어 칠 때 입력창이 풀리지 않게 조정했다.
- `src/lib/birth-text-draft-store.ts`를 추가해 입력창의 최신 draft 생년월일시를 클라이언트에서 공유하고, `src/components/chasam-manselyeok-chart-client.tsx`는 draft와 다른 오래된 응답 payload를 화면에 반영하지 않도록 보강했다.
- `src/components/birth-text-input.tsx`의 키보드 접기(`blur`) 특수 확정 로직은 제거하고, 자동 반영과 검색 버튼 제출을 분리했다.
- `src/app/api/og/route.tsx`는 차샘만세력 OG에서 부허자/허자 패널을 일주/월주 2기둥만 보여주도록 줄이고, side tile을 더 크게 키워 전체 판독성을 높였다.
- `src/lib/manselyeok.ts`의 기본 입력값 생성은 고정 샘플 대신 현재 서울 시각을 사용하도록 바꿨고, `src/lib/manselyeok.test.ts`는 고정 시각으로 이를 검증한다.
- `src/lib/manselyeok.ts`, `src/lib/chasam-manselyeok.ts`가 더 이상 `@gracefullight/saju`의 `getSolarDate`/`getLunarDate`에 직접 의존하지 않는다.
- `src/lib/manselyeok.ts`의 화면용 음력 요약/라벨은 `saju.lunar` 대신 `src/lib/korean-lunisolar.ts`를 사용하도록 바꿨고, `src/lib/manselyeok.test.ts`에 `양 1397-05-15 -> 음 1397-04-10` 회귀 케이스를 추가했다.
- `src/lib/chasam-manselyeok-page.ts`는 `solar`와 `lunar` 입력에서 차샘 날짜 체인의 출발점을 다르게 잡는다.
- `src/lib/manselyeok.test.ts`, `src/lib/chasam-manselyeok-page.test.ts`에 `음 1976-10-28` 케이스를 고정해 `본원 양 1976-12-19 -> 차력 양 1977-02-06` 흐름을 검증한다.
- `src/lib/chasam-manselyeok.ts`에 차력의 앞/뒤 후보 중 양력 실제 거리가 더 가까운 쪽을 고르는 기초 헬퍼를 추가했다.
- `src/lib/chasam-manselyeok.test.ts`에 `1/30` 오후, `1/31` 오전처럼 오전/오후 규칙보다 양력 실제 거리 판단이 우선되는 케이스를 고정했다.
- `src/lib/chasam-manselyeok.ts`에 차샘만세력의 날짜 체인(`본원 -> 차력 -> 허자 본원 -> 허자 차력`) 계산 헬퍼를 추가했다.
- `src/lib/chasam-manselyeok.test.ts`에 `양 1972-01-26 -> 음 1972-01-26 -> 양 1972-03-11 -> 음 1972-03-11 -> 양 1972-04-24 -> 음 1972-04-24` 예시를 고정했다.
- `src/lib/chasam-manselyeok.ts`에 부허자 역방향 날짜 체인(`본원 -> 부허자 차력 -> 부허자 본원`) 계산 헬퍼를 함께 추가했다.
- `src/lib/chasam-manselyeok.test.ts`에 `양 1972-01-26 (음 1971-12-11) -> 양 1971-12-11 (음 1971-10-24) -> 양 1971-10-24 (음 1971-09-06)` 예시를 고정했다.
- `src/lib/chasam-manselyeok.ts`에 부허자 단계의 `없는 양력 날짜` 보정 헬퍼를 추가해 `1999-02-29` 같은 날짜도 오전/오후 규칙으로 안전하게 처리한다.
- `src/lib/chasam-manselyeok.test.ts`, `src/lib/chasam-manselyeok-page.test.ts`에 `양 1999-05-29` 회귀 케이스를 추가해 페이지가 에러 없이 6판을 만드는지 고정했다.
- `src/lib/chasam-manselyeok-page.ts`에 6개 독립 만세력 view model을 만드는 차샘만세력 페이지 상태 생성기를 추가했다.
- `src/components/chasam-manselyeok-chart-client.tsx`에 `부허자 -> 본원/차력 -> 허자` 세로 그룹형 6판 접힘 UI를 추가했다.
- `src/components/manselyeok-chart.tsx`를 접힘/펼침 가능한 재사용 보드로 확장했다.
- `src/lib/chasam-manselyeok-page.test.ts`, `src/components/chasam-manselyeok-chart-client.test.tsx`로 패널 순서와 기본 접힘 동작을 고정했다.
- `src/app/api/og/route.tsx`를 차샘만세력 6판 8자 요약 OG 이미지 렌더러로 교체했다.
- `src/app/api/og/route.tsx`는 OG 타일 색상 계산 시 글자 자체를 다시 해석하지 않고, `viewModel`에 들어 있는 오행 정보를 우선 사용해 `?` 시주에서도 안전하게 렌더한다.
- `src/components/chasam-manselyeok-chart-client.tsx`에 차샘 6판 전용 표시명 덮어쓰기를 추가해 헤더를 역할명으로 표기하도록 조정했다.
- `src/components/app-info-button.tsx`를 추가해 폼 우측 액션 영역에서 앱 버전과 빌드 id를 확인할 수 있게 했다.
- `src/components/manselyeok-form.tsx`에서 `표시 설정` 버튼을 숨기고, 액션 영역을 생성/공유/앱 정보로 단순화했다.
- 최신 검증:
- `npm run test -- --run src/lib/chasam-manselyeok.test.ts`
- `npm run test -- --run src/lib/chasam-manselyeok.test.ts src/lib/chasam-manselyeok-page.test.ts`
- `npm run test -- --run src/lib/app-version.test.ts src/components/app-info-button.test.tsx src/lib/chasam-manselyeok-page.test.ts`
- `npm run test -- --run src/components/birth-text-input.test.tsx src/components/manselyeok-form.test.tsx src/lib/manselyeok.test.ts`
- `npm run test -- --run src/app/api/og/route.test.tsx src/lib/chasam-manselyeok-page.test.ts src/lib/manselyeok.test.ts`
- `npm run typecheck`
- `npm run check`
- `npm run test -- --run src/components/chasam-manselyeok-chart-client.test.tsx src/components/manselyeok-chart-client.test.tsx src/lib/manselyeok.test.ts src/lib/manselyeok-share.test.ts`
- `npm run check`
## 2026-04-12 Update
- Updated `src/lib/chasam-manselyeok.ts` so missing lunar dates are resolved by nominal date closeness instead of converted solar distance.
- Added regression tests for `1973-12-29`, `1973-12-30`, and `1973-12-31` at `11:00` and `12:00`.
- Latest verification:
- `npm run test -- --run src/lib/chasam-manselyeok.test.ts`
- `npm run check`
