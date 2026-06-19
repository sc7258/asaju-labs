import { RawWikipediaRepository } from "../repositories/raw-wikipedia-repository";
import { WikidataPeopleSeedRepository } from "../repositories/wikidata-people-seed-repository";
import { getFirstWikidataTimeValue, isHumanWithBirthDate } from "../sources/wikidata/wikidata-entity-filter";
import { readWikidataJsonDump } from "../sources/wikidata/wikidata-dump-reader";
import { mapWikidataEntityToRawInput } from "../sources/wikidata/wikidata-mapper";

export interface ImportWikidataJsonDumpOptions {
  filePath: string;
  limit?: number;
  skip?: number;
  progressEvery: number;
}

export interface ImportWikidataJsonDumpResult {
  scannedCount: number;
  matchedCount: number;
  importedCount: number;
  failedCount: number;
}

export async function importWikidataJsonDump(
  options: ImportWikidataJsonDumpOptions,
  rawWikipediaRepository: RawWikipediaRepository,
  seedRepository: WikidataPeopleSeedRepository,
): Promise<ImportWikidataJsonDumpResult> {
  let scannedCount = 0;
  let matchedCount = 0;
  let importedCount = 0;
  let failedCount = 0;

  for await (const entity of readWikidataJsonDump({
    filePath: options.filePath,
    skip: options.skip,
    limit: options.limit,
  })) {
    scannedCount += 1;

    if (!isHumanWithBirthDate(entity)) {
      logProgress(options.progressEvery, scannedCount, matchedCount, importedCount, failedCount);
      continue;
    }

    matchedCount += 1;

    try {
      const rawRow = await rawWikipediaRepository.upsert(mapWikidataEntityToRawInput(entity));
      await seedRepository.markFetchedByWikidataId(entity.id, rawRow.id, {
        wikidataId: entity.id,
        label: entity.labels?.ko?.value ?? entity.labels?.en?.value,
        description: entity.descriptions?.ko?.value ?? entity.descriptions?.en?.value,
        birthDate: getFirstWikidataTimeValue(entity, "P569"),
      });

      importedCount += 1;
    } catch (error) {
      failedCount += 1;
      console.error("Failed to import dump entity " + entity.id + ":", error);
    }

    logProgress(options.progressEvery, scannedCount, matchedCount, importedCount, failedCount);
  }

  return {
    scannedCount,
    matchedCount,
    importedCount,
    failedCount,
  };
}

function logProgress(
  progressEvery: number,
  scannedCount: number,
  matchedCount: number,
  importedCount: number,
  failedCount: number,
): void {
  if (progressEvery <= 0 || scannedCount % progressEvery !== 0) {
    return;
  }

  console.log(
    "dump progress scanned=" +
      scannedCount +
      ", matched=" +
      matchedCount +
      ", imported=" +
      importedCount +
      ", failed=" +
      failedCount,
  );
}
