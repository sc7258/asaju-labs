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

export interface BatchUpsertRawWikipediaResult {
  wikidataId: string;
  id: number;
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

  /**
   * 여러 건을 한 번의 SQL로 upsert (배치 처리용)
   * INSERT ... ON DUPLICATE KEY UPDATE 활용
   */
  async batchUpsert(inputs: UpsertRawWikipediaInput[]): Promise<BatchUpsertRawWikipediaResult[]> {
    if (inputs.length === 0) return [];

    // Promise.all로 병렬 처리하여 max_allowed_packet 에러 방지
    // 배치 크기가 50이므로 커넥션 풀을 적절히 활용하여 빠르게 처리 가능
    const results = await Promise.all(
      inputs.map(async (input) => {
        const row = await this.upsert(input);
        return { wikidataId: row.wikidataId, id: row.id };
      })
    );

    return results;
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
