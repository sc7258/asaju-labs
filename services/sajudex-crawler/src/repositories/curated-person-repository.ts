import {
  BirthCalendarStatus,
  BirthDatePrecision,
  CrawlSource,
  Prisma,
  PrismaClient,
} from "@repo/db-schema";

export interface UpsertCuratedPersonInput {
  displayName: string;
  sortName?: string | null;
  birthYear?: number | null;
  birthMonth?: number | null;
  birthDay?: number | null;
  birthPrecision: BirthDatePrecision;
  birthCalendarStatus: BirthCalendarStatus;
  deathYear?: number | null;
  deathMonth?: number | null;
  deathDay?: number | null;
  citizenshipCountryName?: string | null;
  birthPlaceName?: string | null;
  birthCountryName?: string | null;
  occupationName?: string | null;
  source: CrawlSource;
  sourceId: string;
  sourceUrl: string;
  rawWikipediaId: number;
  sajuYearStem?: string | null;
  sajuYearBranch?: string | null;
  sajuMonthStem?: string | null;
  sajuMonthBranch?: string | null;
  sajuDayStem?: string | null;
  sajuDayBranch?: string | null;
  sajuComputedAt?: Date | null;
}

type PrismaCuratedPersonClient = PrismaClient | Prisma.TransactionClient;

export class CuratedPersonRepository {
  constructor(private readonly db: PrismaCuratedPersonClient) {}

  async upsert(input: UpsertCuratedPersonInput) {
    return this.db.curatedPerson.upsert({
      where: {
        source_sourceId: {
          source: input.source,
          sourceId: input.sourceId,
        },
      },
      create: {
        displayName: input.displayName,
        sortName: input.sortName,
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        birthPrecision: input.birthPrecision,
        birthCalendarStatus: input.birthCalendarStatus,
        deathYear: input.deathYear,
        deathMonth: input.deathMonth,
        deathDay: input.deathDay,
        citizenshipCountryName: input.citizenshipCountryName,
        birthPlaceName: input.birthPlaceName,
        birthCountryName: input.birthCountryName,
        occupationName: input.occupationName,
        source: input.source,
        sourceId: input.sourceId,
        sourceUrl: input.sourceUrl,
        rawWikipediaId: input.rawWikipediaId,
        sajuYearStem: input.sajuYearStem,
        sajuYearBranch: input.sajuYearBranch,
        sajuMonthStem: input.sajuMonthStem,
        sajuMonthBranch: input.sajuMonthBranch,
        sajuDayStem: input.sajuDayStem,
        sajuDayBranch: input.sajuDayBranch,
        sajuComputedAt: input.sajuComputedAt,
      },
      update: {
        displayName: input.displayName,
        sortName: input.sortName,
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        birthPrecision: input.birthPrecision,
        birthCalendarStatus: input.birthCalendarStatus,
        deathYear: input.deathYear,
        deathMonth: input.deathMonth,
        deathDay: input.deathDay,
        citizenshipCountryName: input.citizenshipCountryName,
        birthPlaceName: input.birthPlaceName,
        birthCountryName: input.birthCountryName,
        occupationName: input.occupationName,
        sourceUrl: input.sourceUrl,
        rawWikipediaId: input.rawWikipediaId,
        sajuYearStem: input.sajuYearStem,
        sajuYearBranch: input.sajuYearBranch,
        sajuMonthStem: input.sajuMonthStem,
        sajuMonthBranch: input.sajuMonthBranch,
        sajuDayStem: input.sajuDayStem,
        sajuDayBranch: input.sajuDayBranch,
        sajuComputedAt: input.sajuComputedAt,
      },
    });
  }
}
