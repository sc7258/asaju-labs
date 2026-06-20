import { Prisma, PrismaClient, RawProcessStatus } from "@repo/db-schema";

export interface UpsertRawWikipediaInput {
  wikidataId: string;
  title: string;
  language?: string;
  sourceUrl: string;
  rawJson: Prisma.InputJsonValue;
  rawHash?: string;
  rawRevisionId?: string;
}

type PrismaRawWikipediaClient = PrismaClient | Prisma.TransactionClient;

export class RawWikipediaRepository {
  constructor(private readonly db: PrismaRawWikipediaClient) {}

  async count(): Promise<number> {
    return this.db.rawWikipedia.count();
  }

  async findPendingForTransform(limit: number) {
    return this.db.rawWikipedia.findMany({
      where: {
        processStatus: {
          in: ["PENDING", "FAILED_RETRYABLE"],
        },
      },
      orderBy: [{ scrapedAt: "asc" }, { id: "asc" }],
      take: limit,
    });
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

  async markProcessed(id: number): Promise<void> {
    await this.updateProcessStatus(id, "PROCESSED");
  }

  async markProcessedWithoutBirthDate(id: number): Promise<void> {
    await this.updateProcessStatus(id, "PROCESSED_WITHOUT_BIRTH_DATE");
  }

  async markFailedRetryable(id: number, error: unknown): Promise<void> {
    await this.db.rawWikipedia.update({
      where: { id },
      data: {
        processStatus: "FAILED_RETRYABLE",
        processError: formatError(error),
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  }

  private async updateProcessStatus(
    id: number,
    processStatus: RawProcessStatus,
  ): Promise<void> {
    await this.db.rawWikipedia.update({
      where: { id },
      data: {
        processStatus,
        processError: null,
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
        processedAt:
          processStatus === "PROCESSED" || processStatus === "PROCESSED_WITHOUT_BIRTH_DATE"
            ? new Date()
            : null,
      },
    });
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
