# Asaju MWEB Design System & Guidelines (차샘 테마)

이 문서는 sajucube-mweb을 비롯하여 향후 asaju-labs 내에서 개발될 모든 MWEB(Mobile Web) 애플리케이션이 공통으로 유지해야 할 디자인 철학과 UI/UX 원칙을 정의합니다.

목표는 사용자가 어떤 앱(사주큐브, 사주덱스 등)을 사용하더라도 "동일한 아사주(Asaju) 생태계" 안에 있다는 시각적 안정감과 고급스러움을 느끼게 하는 것입니다.

---

## 1. 디자인 철학 (Design Philosophy)

### "차분함(Calm), 섬세함(Delicate), 아날로그(Analog)"
사주 명리학이라는 학문의 깊이와 무게감을 현대적이고 세련된 방식으로 풀어냅니다.
- No Vivid Colors: 눈을 찌르는 원색(원색 파랑, 빨강 등)을 철저히 배제하고, 한 톤 다운된 파스텔 톤(Pastel)과 뮤트 톤(Muted)을 사용합니다.
- Soft Boundaries: 날카로운 직각 모서리 대신 부드러운 라운딩을 적극적으로 사용합니다.
- Paper & Glass: 전통적인 종이(Paper)의 질감을 연상시키는 따뜻한 배경색과, 현대적인 유리(Glassmorphism) 효과를 결합하여 입체감을 만듭니다.

---

## 2. 공통 오행(五行) 컬러 팔레트 (Ohaeng Colors)

명식, 아바타, 배지, 주요 액션 버튼 등 속성을 나타내야 할 때는 반드시 아래 정의된 차샘 만세력 공식 색상(Hex Code)을 하드코딩 혹은 theme.ts를 통해 사용합니다. (Tailwind의 기본 blue-500, red-500 등 사용 금지)

| 오행 | 속성 | 배경색 (bg-) | 텍스트색 (text-) | 테두리 (border-) | 용도 및 느낌 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 목(木) | 갑,을,인,묘 | #93d5b1 | #ffffff | #7dc79f | 에메랄드 / 긍정적 지표, 성장 |
| 화(火) | 병,정,사,오 | #e66d8f | #ffffff | #da5f82 | 로즈 핑크 / 강조(Like, Heart), 열정 |
| 토(土) | 무,기,진,술,축,미 | #f0c969 | #ffffff | #e2bb57 | 머스타드 옐로우 / 안정, 중립 |
| 금(金) | 경,신,유 | #fbfdff | #67718e | #afc9f2 | 순백색 / 차갑고 깨끗함 (글씨는 회파랑) |
| 수(水) | 임,계,해,자 | #6d7591 | #ffffff | #5e6785 | 슬레이트 네이비 / 기본 액션 버튼(Primary) |
| 미상 | 알수없음, 회색 | #f5f2ee | #8f8b86 | #cdc4ba | 웜그레이 / 비활성, 플레이스홀더 |

참고: 금(金) 기운의 경우 텍스트를 흰색으로 하면 보이지 않으므로, 반드시 특유의 블루그레이(#67718e) 색상을 사용합니다.

---

## 3. 배경 및 레이아웃 (Background & Layout)

### 앱 전체 배경 (App Background)
단순한 흰색이나 회색이 아닌, 은은한 미색(종이 질감)의 그라데이션을 사용합니다.
- CSS: bg-[linear-gradient(180deg,#f2ece2_0%,#fbfaf7_34%,#efe8dc_100%)] (사주큐브 기준) 또는 bg-[#F8FAFC] / bg-gray-50.
- 모바일 화면(max-w-md 또는 max-w-2xl 하단 중앙 정렬)에 최적화된 레이아웃을 사용합니다.

### 카드 및 컨테이너 (Cards & Containers)
정보를 담는 블록은 카드 형태로 분리하여 시각적 계층을 만듭니다.
- 그림자: 과한 섀도우 대신 은은한 그림자를 씁니다. shadow-[0_8px_30px_rgba(0,0,0,0.04)] 또는 Tailwind의 기본 shadow-sm.
- 블러 효과: 배경이 투명한 카드나 헤더(Header)의 경우 backdrop-blur-md 또는 backdrop-blur-xl을 사용하여 유리 느낌(Glassmorphism)을 줍니다.

---

## 4. 타이포그래피 (Typography)

- 색상 대비: 
  - 기본 텍스트(제목): text-gray-900 또는 text-stone-800
  - 본문 및 부가 정보: text-gray-500 또는 text-stone-500
  - 비활성/힌트: text-gray-400
- 폰트 두께: 
  - 제목이나 중요한 수치는 확실하게 font-bold를 주어 둥근 레이아웃 속에서 중심을 잡아줍니다.

---

## 5. UI 컴포넌트 원칙 (Components)

### 1) 버튼 (Buttons)
- Primary Action (예: 저장, 명식 추가): 수(水) 기운 톤(bg-[#6d7591])을 베이스로 사용하거나, 오행 컬러와 충돌하지 않는 차분한 무채색 계열을 사용합니다. 강렬한 원색 그라데이션 금지.
- Secondary Action (예: 취소, 뒤로가기): 배경이 투명하고 Hover 시 옅은 회색(hover:bg-gray-100)으로 변하는 둥근 버튼을 사용합니다.
- 상호작용: 모든 버튼은 눌렀을 때 살짝 줄어드는 active:scale-95 와 transition-all 애니메이션을 포함해야 합니다.

### 2) 입력창 (Inputs & Textareas)
- bg-white/70 또는 bg-gray-50/50 과 같이 속이 살짝 비치는 밝은 회색 바탕을 사용합니다.
- 안쪽으로 파인 듯한 느낌을 주기 위해 shadow-inner를 적극 활용합니다.
- 포커스 시 테두리 색상은 부드러운 블루그레이 계열(focus:ring-blue-500/20 focus:border-blue-500 등 파스텔톤)을 사용합니다.

### 3) 뱃지 (Badges) & 태그
- 오행 글자를 출력할 때는 배경에 가득 채우는 대신 텍스트 자체에 색상을 부여하거나(예: text-[#62b388]), 아주 연한 배경(bg-slate-50)에 테두리를 두른(border border-dashed) 섬세한 방식을 선호합니다.

---

## 6. 체크리스트 (Code Review Checklist)

새로운 UI를 만들 때 다음 질문에 "Yes"라고 답할 수 있어야 합니다.
- [ ] Tailwind의 원색 컬러(예: bg-blue-600, text-red-500) 대신 차샘 오행 컬러 헥스코드나 파스텔톤을 사용했는가?
- [ ] 카드와 버튼의 모서리가 충분히 둥글게(rounded-2xl 이상) 처리되었는가?
- [ ] 버튼 클릭 시 active:scale-95 와 같은 부드러운 피드백(Transition)이 존재하는가?
- [ ] 전체적인 분위기가 'IT 앱' 보다는 '고급스러운 아날로그 도서/다이어리' 느낌에 가까운가?

