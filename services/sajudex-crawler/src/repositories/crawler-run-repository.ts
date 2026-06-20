import { CrawlRunStatus, Prisma, PrismaClient } from "@repo/db-schema";

type PrismaCrawlerRunClient = PrismaClient | Prisma.TransactionClient;

export interface FinishCrawlerRunInput {
  status: CrawlRunStatus;
  requestedCount: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
  message?: string | null;
}

export class CrawlerRunRepository {
  constructor(private readonly db: PrismaCrawlerRunClient) {}

  async start(command: string) {
    return this.db.crawlerRun.create({
      data: {
        source: "WIKIDATA",
        command,
        status: "RUNNING",
      },
    });
  }

  async finish(id: number, input: FinishCrawlerRunInput): Promise<void> {
    await this.db.crawlerRun.update({
      where: { id },
      data: {
        status: input.status,
        requestedCount: input.requestedCount,
        succeededCount: input.succeededCount,
        failedCount: input.failedCount,
        skippedCount: input.skippedCount,
        message: input.message,
        finishedAt: new Date(),
      },
    });
  }
}
