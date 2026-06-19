import fs from "node:fs";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";

import { WikidataEntity } from "./wikidata-client";

export interface WikidataDumpReadOptions {
  filePath: string;
  skip?: number;
  limit?: number;
}

export async function* readWikidataJsonDump(
  options: WikidataDumpReadOptions,
): AsyncGenerator<WikidataEntity> {
  const stream = openDumpStream(options.filePath);
  const lines = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });
  const skip = options.skip ?? 0;
  const limit = options.limit;
  let seenEntities = 0;
  let yieldedEntities = 0;

  try {
    for await (const line of lines) {
      const entity = parseDumpLine(line);

      if (!entity) {
        continue;
      }

      if (seenEntities < skip) {
        seenEntities += 1;
        continue;
      }

      if (limit !== undefined && yieldedEntities >= limit) {
        break;
      }

      seenEntities += 1;
      yieldedEntities += 1;
      yield entity;
    }
  } finally {
    lines.close();
  }
}

function openDumpStream(filePath: string): Readable {
  if (filePath.endsWith(".bz2")) {
    const child = spawn("bzip2", ["-dc", filePath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      child.stdout.destroy(error);
    });

    return child.stdout;
  }

  return fs.createReadStream(filePath);
}

function parseDumpLine(line: string): WikidataEntity | undefined {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine === "[" || trimmedLine === "]") {
    return undefined;
  }

  const jsonLine = trimmedLine.endsWith(",")
    ? trimmedLine.slice(0, -1)
    : trimmedLine;

  return JSON.parse(jsonLine) as WikidataEntity;
}
