import { Prisma, PrismaClient } from "@repo/db-schema";

export interface UpsertRawWikipediaInput {
  wikidataId: string;
  title: string;
  language?: string;
  sourceUrl: string;
  rawJson: Prisma.InputJsonValue;
  rawHash?: string;
  rawRevisionId?: string;
}

export class RawWikipediaRepository {
  constructor(private readonly db: PrismaClient) {}

  async count(): Promise<number> {
    return this.db.rawWikipedia.count();
  }

  async upsert(input: UpsertRawWikipediaInput) {
    return this.db.rawWikipedia.upsert({
      where: {
        wikidataId: input.wikidataId,
      },
      create: {
        wikidataId: input.wikidataId,
        title: input.title,
        language: input.language ?? "ko",
        sourceUrl: input.sourceUrl,
        rawJson: input.rawJson,
        rawHash: input.rawHash,
        rawRevisionId: input.rawRevisionId,
      },
      update: {
        title: input.title,
        language: input.language ?? "ko",
        sourceUrl: input.sourceUrl,
        rawJson: input.rawJson,
        rawHash: input.rawHash,
        rawRevisionId: input.rawRevisionId,
        processStatus: "PENDING",
        processError: null,
        scrapedAt: new Date(),
      },
    });
  }
}
