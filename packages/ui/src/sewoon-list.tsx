import { LuckRow, LuckItemProps } from "./luck-row";

export function SewoonList({
  rangeLabel,
  items,
  showDetails = true,
  headerElement,
}: {
  rangeLabel: string;
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
