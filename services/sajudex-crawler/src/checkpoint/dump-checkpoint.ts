import fs from "node:fs";
import path from "node:path";

export interface DumpCheckpoint {
  filePath: string;
  scannedCount: number;
  matchedCount: number;
  importedCount: number;
  failedCount: number;
  savedAt: string;
}

function resolveCheckpointPath(dumpFilePath: string): string {
  const dir = path.dirname(dumpFilePath);
  const base = path.basename(dumpFilePath);
  return path.join(dir, "." + base + ".checkpoint.json");
}

export function loadCheckpoint(dumpFilePath: string): DumpCheckpoint | null {
  const checkpointPath = resolveCheckpointPath(dumpFilePath);

  if (!fs.existsSync(checkpointPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(checkpointPath, "utf8");
    const checkpoint = JSON.parse(raw) as DumpCheckpoint;

    if (checkpoint.filePath !== dumpFilePath) {
      console.warn(
        "[checkpoint] filePath mismatch, ignoring checkpoint: " + checkpointPath,
      );
      return null;
    }

    return checkpoint;
  } catch {
    console.warn("[checkpoint] Failed to read checkpoint, starting fresh: " + checkpointPath);
    return null;
  }
}

export function saveCheckpoint(
  dumpFilePath: string,
  counts: Omit<DumpCheckpoint, "filePath" | "savedAt">,
): void {
  const checkpointPath = resolveCheckpointPath(dumpFilePath);
  const checkpoint: DumpCheckpoint = {
    filePath: dumpFilePath,
    ...counts,
    savedAt: new Date().toISOString(),
  };

  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2), "utf8");
}

export function deleteCheckpoint(dumpFilePath: string): void {
  const checkpointPath = resolveCheckpointPath(dumpFilePath);

  if (fs.existsSync(checkpointPath)) {
    fs.unlinkSync(checkpointPath);
  }
}
