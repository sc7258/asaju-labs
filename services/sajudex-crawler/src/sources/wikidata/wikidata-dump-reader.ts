import fs from "node:fs";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { Readable, Transform } from "node:stream";

import { WikidataEntity } from "./wikidata-client";

export interface WikidataDumpReadOptions {
  filePath: string;
  skip?: number;
  limit?: number;
}

export async function* readWikidataJsonDump(
  options: WikidataDumpReadOptions,
): AsyncGenerator<WikidataEntity> {
  const skip = options.skip ?? 0;
  const limit = options.limit;
  const rawStream = openDumpStream(options.filePath);

  let inputStream: Readable;

  if (skip > 0) {
    console.log(
      `[skip] Skipping ${skip.toLocaleString()} lines via raw byte scan...`,
    );
    const skipTransform = createSkipTransform(skip, (skipped) => {
      const pct = ((skipped / skip) * 100).toFixed(1);
      console.log(
        `[skip] ${skipped.toLocaleString()} / ${skip.toLocaleString()} (${pct}%)`,
      );
    });
    rawStream.pipe(skipTransform);
    inputStream = skipTransform;
  } else {
    inputStream = rawStream;
  }

  const lines = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  let yieldedEntities = 0;

  try {
    for await (const line of lines) {
      if (limit !== undefined && yieldedEntities >= limit) {
        break;
      }

      const trimmed = line.trim();

      if (!trimmed || !trimmed.startsWith("{")) {
        continue;
      }

      const entity = parseDumpLine(trimmed);

      if (!entity) {
        continue;
      }

      yieldedEntities += 1;
      yield entity;
    }
  } finally {
    lines.close();
  }
}

/**
 * bzip2 raw 청크에서 newline을 카운트해서 skip하는 Transform stream.
 * skip 완료 전까지는 데이터를 출력하지 않고, 완료 후부터 pass-through.
 * readline을 사용하지 않으므로 JSON.parse 오버헤드 없이 초고속 skip.
 */
function createSkipTransform(
  skipCount: number,
  onProgress: (skipped: number) => void,
): Transform {
  let skipped = 0;
  let lastProgressLog = 0;
  const PROGRESS_EVERY = 500_000;
  let skipDone = false;

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      // skip이 이미 완료된 경우 pass-through
      if (skipDone) {
        callback(null, chunk);
        return;
      }

      let outputStart = -1; // 이 청크에서 skip 완료 후 출력 시작 위치

      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] === 0x0a) {
          // '\n'
          skipped += 1;

          if (skipped - lastProgressLog >= PROGRESS_EVERY) {
            lastProgressLog = skipped;
            onProgress(skipped);
          }

          if (skipped >= skipCount) {
            skipDone = true;
            outputStart = i + 1;
            break;
          }
        }
      }

      if (skipDone && outputStart >= 0 && outputStart < chunk.length) {
        // 현재 청크의 나머지를 출력
        callback(null, chunk.subarray(outputStart));
      } else {
        // skip 진행 중 - 아무것도 출력하지 않음
        callback();
      }
    },

    flush(callback) {
      callback();
    },
  });
}

function openDumpStream(filePath: string): Readable {
  if (filePath.endsWith(".bz2")) {
    let bzip2Cmd = "bzip2";
    if (
      process.platform === "win32" &&
      fs.existsSync("C:\\Program Files\\Git\\usr\\bin\\bzip2.exe")
    ) {
      bzip2Cmd = "C:\\Program Files\\Git\\usr\\bin\\bzip2.exe";
    }

    const child = spawn(bzip2Cmd, ["-dc", filePath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      child.stdout.destroy(error);
    });

    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`[bzip2] process exited with code ${code}`);
      }
    });

    // bzip2가 실제로 데이터를 출력하는지 첫 청크 확인
    let firstChunkReceived = false;
    child.stdout.once("data", () => {
      if (!firstChunkReceived) {
        firstChunkReceived = true;
        console.log("[bzip2] First data chunk received - decompression started");
      }
    });

    return child.stdout;
  }

  return fs.createReadStream(filePath);
}

function parseDumpLine(trimmedLine: string): WikidataEntity | undefined {
  if (!trimmedLine.startsWith("{")) {
    return undefined;
  }

  const jsonLine = trimmedLine.endsWith(",")
    ? trimmedLine.slice(0, -1)
    : trimmedLine;

  try {
    return JSON.parse(jsonLine) as WikidataEntity;
  } catch {
    return undefined;
  }
}
