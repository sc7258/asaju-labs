import { PrismaClient, WikidataSeedStatus } from "@repo/db-schema";

export interface DiscoveredWikidataPersonSeed {
  wikidataId: string;
  label?: string;
  description?: string;
  birthDate?: string;
}

export class WikidataPeopleSeedRepository {
  constructor(private readonly db: PrismaClient) {}

  async countByStatus(): Promise<Array<{ status: WikidataSeedStatus; count: number }>> {
    const rows = await this.db.wikidataPeopleSeed.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    return rows.map((row) => ({ status: row.status, count: row._count._all }));
  }

  async upsertDiscoveredMany(seeds: DiscoveredWikidataPersonSeed[]): Promise<number> {
    let upsertedCount = 0;

    for (const seed of seeds) {
      await this.db.wikidataPeopleSeed.upsert({
        where: {
          wikidataId: seed.wikidataId,
        },
        create: {
          wikidataId: seed.wikidataId,
          label: seed.label,
          description: seed.description,
          birthDate: seed.birthDate,
        },
        update: {
          label: seed.label,
          description: seed.description,
          birthDate: seed.birthDate,
          errorMessage: null,
        },
      });

      upsertedCount += 1;
    }

    return upsertedCount;
  }

  async findPending(limit: number) {
    return this.db.wikidataPeopleSeed.findMany({
      where: {
        status: {
          in: ["PENDING", "FAILED"],
        },
      },
      orderBy: [
        { status: "asc" },
        { discoveredAt: "asc" },
      ],
      take: limit,
    });
  }

  async markFetching(id: number): Promise<void> {
    await this.db.wikidataPeopleSeed.update({
      where: { id },
      data: {
        status: "FETCHING",
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  }

  async markFetchedByWikidataId(
    wikidataId: string,
    rawWikipediaId: number,
    seed?: DiscoveredWikidataPersonSeed,
  ): Promise<void> {
    await this.db.wikidataPeopleSeed.upsert({
      where: { wikidataId },
      create: {
        wikidataId,
        label: seed?.label,
        description: seed?.description,
        birthDate: seed?.birthDate,
        status: "FETCHED",
        rawWikipediaId,
        fetchedAt: new Date(),
      },
      update: {
        label: seed?.label,
        description: seed?.description,
        birthDate: seed?.birthDate,
        status: "FETCHED",
        rawWikipediaId,
        errorMessage: null,
        fetchedAt: new Date(),
      },
    });
  }

  async markFetched(id: number, rawWikipediaId: number): Promise<void> {
    await this.db.wikidataPeopleSeed.update({
      where: { id },
      data: {
        status: "FETCHED",
        rawWikipediaId,
        errorMessage: null,
        fetchedAt: new Date(),
      },
    });
  }

  async markFailed(id: number, error: unknown): Promise<void> {
    await this.db.wikidataPeopleSeed.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage: formatError(error),
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
