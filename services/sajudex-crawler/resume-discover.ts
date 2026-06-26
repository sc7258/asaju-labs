import { runAstroDatabankDiscover } from './src/pipeline/discover-astrodatabank';

// Resume from the exact URL where it got killed
const resumeUrl = "https://www.astro.com/wiki/astro-databank/index.php?title=Special:AllPages&from=Lyon%2C+A.+Laurence";

runAstroDatabankDiscover(resumeUrl).then(() => {
  console.log('Discover completed!');
  process.exit(0);
}).catch(console.error);
