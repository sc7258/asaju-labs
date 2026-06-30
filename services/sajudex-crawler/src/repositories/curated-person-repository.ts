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
  imageUrl?: string | null;
  rawWikipediaId: number;
  sajuComputedAt?: Date | null;
  bonwonSajuCode?: string | null;
  charyeokSajuCode?: string | null;
  buheojaBonwonSajuCode?: string | null;
  buheojaCharyeokSajuCode?: string | null;
  heojaBonwonSajuCode?: string | null;
  heojaCharyeokSajuCode?: string | null;
}

type PrismaCuratedPersonClient = PrismaClient | Prisma.TransactionClient;

export class CuratedPersonRepository {
  constructor(private readonly db: PrismaCuratedPersonClient) {}

  async upsert(input: UpsertCuratedPersonInput) {
    const dataWithoutRelations = {
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
      imageUrl: input.imageUrl,
      rawWikipediaId: input.rawWikipediaId,
      sajuComputedAt: input.sajuComputedAt,
      bonwonSajuCode: input.bonwonSajuCode,
      charyeokSajuCode: input.charyeokSajuCode,
      buheojaBonwonSajuCode: input.buheojaBonwonSajuCode,
      buheojaCharyeokSajuCode: input.buheojaCharyeokSajuCode,
      heojaBonwonSajuCode: input.heojaBonwonSajuCode,
      heojaCharyeokSajuCode: input.heojaCharyeokSajuCode,
    };

    return this.db.curatedPerson.upsert({
      where: {
        source_sourceId: {
          source: input.source,
          sourceId: input.sourceId,
        },
      },
      create: {
        ...dataWithoutRelations,
      },
      update: {
        ...dataWithoutRelations,
      },
    });
  }
}
