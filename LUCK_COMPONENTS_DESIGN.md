# 🌟 대운/세운 컴포넌트 분리 설계 (Luck Components Design)

현재 `manselyeok-chart.tsx` 내부에 강하게 결합되어 있는 `<LuckRow />`를 완전히 독립된 UI 컴포넌트로 분리하고, 사주큐브 및 사주덱스에서 자유롭게 재사용할 수 있도록 설계한 구조입니다.

## 📁 파일 구조 (packages/ui/src/)

```text
packages/ui/src/
├── luck-row.tsx          # 운(Luck) 한 칸 한 칸을 10개씩 그리는 가장 기초적인 공통 UI
├── daewoon-timeline.tsx  # LuckRow를 감싸서 대운(10년 단위) 전용으로 보여주는 컴포넌트
└── sewoon-list.tsx       # LuckRow를 감싸서 세운(1년 단위) 전용으로 보여주는 컴포넌트
```

## 💻 1. `luck-row.tsx` (기초 UI 컴포넌트)
`Link` 라우팅과 오행 색상(`elementTheme`)을 모두 처리하는 순수 UI 렌더러입니다.

```tsx
import Link from "next/link";
import { elementTheme, getElementThemeKeyFromChar } from "@repo/saju-core";
import { isPlainLeftClick } from "./utils"; // 기존 파일 참조

export interface LuckItem {
  marker: string;
  topLabel: string;
  stem: string;
  branch: string;
  isHighlighted: boolean;
  href?: string;
  onSelect?: () => void;
}

export function LuckRow({ items, clickable }: { items: LuckItem[]; clickable?: boolean }) {
  const highlightClass = "border-[#2f97d2] shadow-[0_0_0_2px_#7dc6ee] relative z-[1]";
  const highlightLabelClass = "text-[#3f95c7]";
  const highlightColumnClass = "bg-[#e3f5ff] ring-2 ring-[#7dc6ee] shadow-[inset_0_0_0_1px_#c8e9fb]";
  const highlightDotClass = "bg-[#5db2e0]";

  return (
    <div className="grid grid-cols-[repeat(10,26px)] justify-center gap-[2px] sm:grid-cols-[repeat(10,32px)] md:grid-cols-[repeat(10,36px)]">
      {items.map((item) => {
        const stemTheme = elementTheme[getElementThemeKeyFromChar(item.stem)];
        const branchTheme = elementTheme[getElementThemeKeyFromChar(item.branch)];

        // 기존 렌더링 로직 유지 (Link 혹은 div 렌더링)
        // ...
      })}
    </div>
  );
}
```

## 💻 2. `daewoon-timeline.tsx`
대운 데이터만 전담해서 처리합니다.

```tsx
import { ChartRowHeader } from "./chart-row-header";
import { LuckRow, LuckItem } from "./luck-row";

export function DaewoonTimeline({
  startAgeLabel,
  items,
  showDetails = true,
}: {
  startAgeLabel: string;
  items: LuckItem[];
  showDetails?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {showDetails && <ChartRowHeader detail={startAgeLabel} label="대운" />}
      <LuckRow clickable items={items} />
    </div>
  );
}
```

## 💻 3. `sewoon-list.tsx`
선택된 대운에 해당하는 10년 치 세운 배열을 그립니다.

```tsx
import { ChartRowHeader } from "./chart-row-header";
import { LuckRow, LuckItem } from "./luck-row";

export function SewoonList({
  rangeLabel,
  items,
  showDetails = true,
}: {
  rangeLabel: string;
  items: LuckItem[];
  showDetails?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {showDetails && <ChartRowHeader detail={rangeLabel} label="세운" />}
      <LuckRow clickable items={items} />
    </div>
  );
}
```

## 🔄 `manselyeok-chart.tsx` 리팩토링 후 기대 모습
700줄이 넘던 원본 파일의 하단부가 아래처럼 획기적으로 짧아지고 깔끔해집니다.

```tsx
// AS-IS (과거)
<div className="...">
  <ChartRowHeader detail={viewModel.startAgeLabel} label="대운" />
  <LuckRow clickable items={majorLuckItems} />
</div>

// TO-BE (분리 후)
<DaewoonTimeline 
  startAgeLabel={viewModel.startAgeLabel} 
  items={majorLuckItems} 
  showDetails={showDetails} 
/>
<SewoonList 
  rangeLabel={selectedMajorLuckRangeLabel} 
  items={yearlyLuckItems} 
  showDetails={showDetails} 
/>
```
