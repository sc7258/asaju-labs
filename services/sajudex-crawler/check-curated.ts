import { prisma } from './src/db/client';

async function main() {
  const curatedCounts = await prisma.curatedPerson.groupBy({
    by: ['source'],
    _count: {
      _all: true,
    },
  });
  console.log('CuratedPerson by Source:', curatedCounts);
  
  const rawWikipediaCount = await prisma.rawWikipedia.count();
  console.log('Total Raw Wikipedia:', rawWikipediaCount);
  
  const wikidataSeeds = await prisma.wikidataPeopleSeed.groupBy({
    by: ['status'],
    _count: {
      _all: true
    }
  });
  console.log('Wikidata Seeds by Status:', wikidataSeeds);
}

main().finally(() => prisma.$disconnect());
