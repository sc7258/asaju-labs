import { LuckRow, LuckItemProps } from "./luck-row";

export function DaewoonTimeline({
  startAgeLabel,
  items,
  showDetails = true,
  headerElement,
}: {
  startAgeLabel: string;
  items: LuckItemProps[];
  showDetails?: boolean;
  headerElement?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {showDetails && headerElement}
      <LuckRow clickable items={items} />
    </div>
  );
}
