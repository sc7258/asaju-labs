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

  /**
   * dump import 전용: 여러 seed를 한 번의 SQL로 FETCHED 상태로 upsert
   */
  async batchMarkFetchedByWikidataIds(
    items: Array<{ wikidataId: string; rawWikipediaId: number; seed?: DiscoveredWikidataPersonSeed }>,
  ): Promise<void> {
    if (items.length === 0) return;

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const placeholders = items.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const values: unknown[] = [];

    for (const item of items) {
      values.push(
        item.wikidataId,
        item.seed?.label ?? null,
        item.seed?.description ?? null,
        item.seed?.birthDate ?? null,
        item.rawWikipediaId,
        now,  // fetched_at
        now,  // created_at
        now,  // updated_at
        now,  // discovered_at
      );
    }

    await this.db.$executeRawUnsafe(
      `INSERT INTO wikidata_people_seeds
         (wikidata_id, label, description, birth_date, raw_wikipedia_id, fetched_at, created_at, updated_at, discovered_at, status)
       VALUES ${placeholders.replace(/\(([^)]+)\)/g, "($1, 'FETCHED')")}
       ON DUPLICATE KEY UPDATE
         label = VALUES(label),
         description = VALUES(description),
         birth_date = VALUES(birth_date),
         raw_wikipedia_id = VALUES(raw_wikipedia_id),
         status = 'FETCHED',
         error_message = NULL,
         fetched_at = VALUES(fetched_at),
         updated_at = VALUES(updated_at)`,
      ...values,
    );
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
