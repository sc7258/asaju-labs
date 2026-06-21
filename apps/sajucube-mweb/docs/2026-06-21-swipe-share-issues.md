# 2026-06-21 SajuCube 스와이프/공유/입력 전환 오류 정리

## 개요

2026-06-21에 `sajucube-mweb`에서 다음 문제가 연속으로 확인되었다.

- 좌우 이동이나 입력값 변경 시 화면이 깜빡이거나 전환이 어색했다.
- 공유 URL에 현재 화면의 `남/여`, `양력/음력/윤달`, `생년월일시`가 모두 반영되지 않았다.
- 일부 버튼은 눌리고 일부 버튼은 눌리지 않았다.
- 전환 애니메이션이 거의 보이지 않거나, 다음 화면으로 갔다가 다시 이전 화면이 보이는 식으로 흔들렸다.
- React에서 `useEffect` 의존성 배열 길이 변경 오류가 발생했다.
- 버전 테스트가 현재 `package.json` 버전과 맞지 않아 실패했다.
- 개발 서버가 비정상 상태가 되면 `localhost:3000`이 검은 화면으로 멈추기도 했다.

이 문서는 각 문제의 원인, 수정 방법, 검증 방법을 정리한다.

## 1. URL 동기화 때문에 생기던 화면 깜빡임

### 증상

- 좌우 이동 버튼 클릭
- 스와이프 이동
- `남/여` 변경
- `양력/음력/윤달` 변경
- 생년월일시 수정

위 동작 때마다 URL이 바뀌면서 화면이 깜빡였다.

### 원인

작업 전에는 워크스페이스가 현재 상태를 `router.push(...)`와 검색 파라미터에 계속 동기화하고 있었다.  
이 방식은 단순한 화면 내부 상태 변경도 App Router 네비게이션으로 처리하게 만들었고, 그 결과 다음 문제가 겹쳤다.

- 차트가 다시 계산되며 깜빡임 발생
- 터치/버튼 전환 중 라우팅이 끼어들어 애니메이션이 깨짐
- 브라우저 주소창이 너무 자주 바뀜

### 수정 방법

핵심 원칙을 다음처럼 바꿨다.

- 초기 진입 시에만 URL로 상태를 seed 한다.
- 이후 좌우 이동과 인라인 입력 수정은 로컬 상태만 바꾼다.
- 공유할 때만 현재 상태 기준으로 URL을 다시 만든다.

### 수정 파일

- `apps/sajucube-mweb/src/app/page.tsx`
- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`
- `packages/ui/src/manselyeok-form.tsx`
- `packages/ui/src/auto-submit-select.tsx`
- `packages/ui/src/birth-text-input.tsx`
- `packages/ui/src/share-link-button.tsx`

### 구현 요점

`page.tsx`

- 최초 검색 파라미터를 `initialParamsRecord`로 워크스페이스에 전달한다.

`manselyeok-workspace.tsx`

- 최초 URL 기준으로만 `initialEntry`를 만든다.
- 이후에는 `updateCurrentEntry(...)`로 현재 패널을 로컬에서 교체한다.
- 좌우 이동 `commitShift(...)`는 더 이상 `router.push(...)`를 호출하지 않는다.

`share-link-button.tsx`

- 공유 직전에 현재 폼 값을 다시 수집한다.
- 그 값으로 URL을 생성한다.
- 필요하면 `window.history.replaceState(...)`로 주소창만 최신 상태로 맞춘다.

## 2. 공유 URL에 남/여, 양/음, 윤달 정보가 빠지던 문제

### 증상

공유 URL이 다음처럼 `birthText`만 들어가거나 일부 값이 누락되었다.

`https://sajucube.vercel.app/?birthText=202606242056`

화면에는 `남/여`, `양력/음력`, `윤달`이 보이는데 URL에는 없어서 공유 결과가 화면과 달라졌다.

### 원인

`AutoSubmitSelect`에서 `name`을 구조 분해로 꺼낸 뒤 실제 DOM `<select>`에 다시 넣지 않고 있었다.  
그래서 `FormData`를 만들 때 `gender`, `calendarType`가 폼 데이터에 포함되지 않았다.

### 수정 방법

- `<select name={name}>`를 복구했다.
- 공유 URL 생성 시 폼 값을 다시 읽도록 했다.
- `lunar-leap`는 URL에서 다음 형식으로 정규화했다.
  - `calendarType=lunar`
  - `isLeapMonth=true`

### 수정 파일

- `packages/ui/src/auto-submit-select.tsx`
- `packages/ui/src/auto-submit-select.test.tsx`
- `packages/ui/src/share-link-button.tsx`
- `packages/ui/src/share-link-button.test.tsx`

## 3. 좌우 버튼, 앱정보 버튼, 공유 버튼 일부가 안 눌리던 문제

### 증상

- `남/여` 버튼은 눌리는데 다른 버튼은 안 눌리는 경우가 있었다.
- 좌우 이동 버튼, 앱정보 버튼, 공유 버튼이 반응하지 않았다.

### 원인

차트/뷰포트/오버레이/상단 폼이 겹치면서 쌓임 순서와 포인터 이벤트가 꼬여 있었다.  
특히 absolute 버튼 주변 레이어와 차트 레이어가 겹치면 클릭 가능한 영역이 막혔다.

### 수정 방법

- 상단 폼 컨테이너와 버튼에 `z-index`를 명확히 부여했다.
- 좌우 이동 버튼 래퍼의 `z-index`를 올렸다.
- 클릭을 막던 래퍼의 `pointer-events-none` 구조를 제거했다.
- 모바일 탭 인식을 위해 `touch-manipulation`을 추가했다.

### 수정 파일

- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`
- `packages/ui/src/manselyeok-form.tsx`
- `packages/ui/src/history-nav-button.tsx`
- `packages/ui/src/app-info-button.tsx`

## 4. 전환 애니메이션이 약하거나 흔들리던 문제

### 증상

- 버튼을 눌러도 애니메이션이 거의 안 보였다.
- 다음 화면으로 갔다가 다시 이전 화면이 비쳤다가 완료되는 느낌이 있었다.
- 드래그 후 복귀 애니메이션과 실제 전환 애니메이션이 충돌했다.

### 원인

다음 요인이 겹쳤다.

- 트랙 transform 반영이 `useEffect` 시점이라 한 프레임 늦을 수 있었다.
- 애니메이션 중에도 transition 제어가 다시 바뀌면서 체감이 약해졌다.
- 슬롯 교체 직전의 `dragOffsetRef` 값이 남아 이전 화면 잔상이 비칠 수 있었다.
- 차트 draft 상태가 현재 패널과 잠깐 어긋나며 이전 패널처럼 보일 수 있었다.

### 수정 방법

- 트랙 위치 반영을 `useLayoutEffect`로 옮겨 페인트 전에 맞췄다.
- 슬롯 교체 전에 `dragOffsetRef.current = 0`으로 초기화했다.
- 애니메이션 중에는 transition이 유지되도록 조정했다.
- 현재 패널 birth draft를 현재 슬롯 값과 다시 동기화했다.
- 클릭 전환 체감을 높이기 위해 슬라이드 시간을 늘리고, 이동 중 현재 패널에 약한 `opacity/scale` 변화를 추가했다.

### 수정 파일

- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`

## 5. React `useEffect` 의존성 배열 길이 변경 오류

### 증상

브라우저 콘솔에 다음 오류가 발생했다.

`The final argument passed to useEffect changed size between renders.`

### 원인

`useEffect(..., [isAnimating, isDragging, setTrackTransitionEnabled])` 형태였던 의존성 배열을 수정하는 과정에서  
일부 렌더에서는 `[isDragging, setTrackTransitionEnabled]`처럼 길이가 달라졌다.

React Hook 의존성 배열은 렌더마다 순서와 길이가 항상 같아야 한다.

### 수정 방법

의존성 배열을 다시 고정했다.

- `[isAnimating, isDragging, setTrackTransitionEnabled]`

`isAnimating`을 본문에서 직접 쓰지 않더라도, 길이를 흔들리게 바꾸지 않는 쪽이 더 안전했다.

### 수정 파일

- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`

## 6. 버전 테스트 실패

### 증상

테스트가 다음처럼 실패했다.

- 기대값: `0.1.2`
- 실제값: `0.1.30`

### 원인

테스트가 현재 `package.json` 버전이 아니라 오래된 문자열 `0.1.2`를 하드코딩하고 있었다.

### 수정 방법

테스트가 `package.json.version`을 직접 사용하도록 변경했다.

### 수정 파일

- `apps/sajucube-mweb/src/lib/app-version.test.ts`

## 7. 개발 서버가 검은 화면으로 멈추던 문제

### 증상

- `localhost:3000` 접속 시 검은 화면만 보임
- `manifest.webmanifest`, `favicon.ico`, HMR websocket 요청 실패
- 포트는 열려 있는데 실제 응답 바이트가 오지 않음

### 원인

백그라운드로 띄운 `next dev` 프로세스가 비정상 상태에 빠져 있었다.  
이때 로그에는 `EPIPE: broken pipe, write`가 확인되었다.

### 대응 방법

- 기존 `node`/`next dev` 프로세스를 정리한다.
- `npm.cmd run dev`를 다시 시작한다.
- `http://localhost:3000/`와 `manifest.webmanifest`가 실제로 `200 OK`를 주는지 확인한다.

이 문제는 앱 로직 문제라기보다 개발 서버 프로세스 상태 문제였다.

## 검증 방법

다음 명령으로 기본 검증을 수행했다.

```bash
cd apps/sajucube-mweb
npm.cmd run typecheck
npm.cmd run test
```

확인 포인트는 다음과 같다.

- `typecheck` 통과
- `vitest` 통과
- 공유 URL에 `gender`, `calendarType`, `isLeapMonth`, `birthText`가 올바르게 포함됨
- 좌우 버튼과 앱정보/공유 버튼이 실제 클릭 가능함
- 좌우 이동, 스와이프, 남/여 변경, 양/음/윤달 변경, 생년월일시 변경 시 URL이 즉시 바뀌지 않음
- 공유 시에만 주소창과 공유 링크가 현재 상태로 갱신됨
- 전환 시 깜빡임이 줄고 애니메이션이 자연스럽게 보임

## 재발 방지 체크리스트

- 화면 내부 상태 변경을 App Router 네비게이션으로 처리하지 않는다.
- 공유 URL 생성은 항상 현재 폼 값을 다시 읽어서 만든다.
- 폼 요소를 래핑하는 공용 컴포넌트는 `name` 전달이 실제 DOM까지 내려가는지 테스트한다.
- Hook 의존성 배열은 렌더마다 길이와 순서를 바꾸지 않는다.
- 절대 배치 버튼 위에 다른 레이어가 올라오지 않도록 `z-index`와 `pointer-events`를 같이 점검한다.
- 애니메이션 중간에 layout effect, drag offset, transition on/off가 서로 충돌하지 않는지 확인한다.

## 8. 후속 UI/응답성 튜닝

초기 오류 수정 이후, 실제 모바일 사용감 기준으로 다음 후속 조정을 추가했다.

### 8-1. 모바일 좌우 버튼 위치 조정

#### 배경

모바일 화면에서 좌우 이동 버튼이 카드 바깥에 충분히 걸쳐 보이지 않아, 화살표가 패널과 애매하게 겹치는 느낌이 있었다.

#### 수정 방법

- 모바일 기준으로 버튼 래퍼를 `left/right: 0`에 두고 `translateX(±50%)`를 적용했다.
- 그래서 버튼 중심이 패널의 좌우 끝선에 더 직접적으로 걸치도록 바꿨다.
- `md` 이상 데스크톱 배치는 기존 외곽 배치를 유지했다.

#### 수정 파일

- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`

### 8-2. 슬라이드 애니메이션 단순화

#### 배경

클릭 전환 시 끝부분에 약한 바운스 또는 자석처럼 붙는 감각이 남아 있었다.  
이 화면에서는 장식적인 탄성보다 빠르고 담백한 이동이 더 적합했다.

#### 수정 방법

- 현재 패널에 같이 들어가던 `opacity/scale` 보조 효과를 제거했다.
- 트랙 easing을 강한 감속 커브에서 `linear`로 바꿨다.
- 전환 시간을 `360ms -> 300ms -> 200ms`로 단계적으로 줄였다.

#### 최종 설정

- 전환 시간: `200ms`
- easing: `linear`

#### 수정 파일

- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`

### 8-3. 좌우 버튼 연타 응답성 개선

#### 배경

버튼을 눌렀을 때 애니메이션은 짧아졌지만, 실제로는 초당 1회 정도만 입력되는 것처럼 느껴졌다.

#### 원인

기존 구조는 화면 전환이 끝난 뒤에도, 다음 이웃 패널 데이터를 비동기로 계산해 가져올 때까지 `isAnimating` 해제가 늦어질 수 있었다.  
즉 사용자는 `200ms` 애니메이션만 기다리는 것이 아니라, 이웃 패널 준비 시간까지 같이 기다리고 있었다.

#### 수정 방법

- 전환 완료 시점과 "먼 쪽 이웃 패널 로딩"을 분리했다.
- 애니메이션이 끝나면 먼저 현재 패널 교체와 잠금 해제를 수행한다.
- 다음 이웃 패널은 뒤에서 비동기로 붙인다.

#### 효과

- 버튼 연타 체감이 애니메이션 시간에 더 가깝게 줄어들었다.
- 이전처럼 이웃 패널 계산이 끝날 때까지 전체 입력이 길게 잠기지 않는다.

#### 수정 파일

- `apps/sajucube-mweb/src/components/manselyeok-workspace.tsx`

## 관련 커밋

- `ddce8e2` - `Fix sajucube share URL sync and swipe transitions`
- `da453e8` - `Tune sajucube navigation responsiveness and document fixes`
