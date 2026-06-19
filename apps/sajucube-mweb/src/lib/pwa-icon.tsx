function Tile({
  background,
  border,
}: {
  background: string;
  border: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        borderRadius: 24,
        border: `8px solid ${border}`,
        background,
        boxShadow: "inset 0 4px 16px rgba(255,255,255,0.22)",
      }}
    />
  );
}

export function PwaIconArt() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 74,
        boxSizing: "border-box",
        borderRadius: 110,
        background:
          "linear-gradient(180deg, #f2ece2 0%, #fbfaf7 38%, #efe8dc 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 24,
          }}
        >
          <Tile background="#93d5b1" border="#7dc79f" />
          <Tile background="#e66d8f" border="#da5f82" />
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 24,
          }}
        >
          <Tile background="#f0c969" border="#e2bb57" />
          <Tile background="#6d7591" border="#5e6785" />
        </div>
      </div>
    </div>
  );
}
