import puppeteer from 'puppeteer';
import { prisma } from '../db/client';

const ASTRO_ALL_PAGES_URL = 'https://www.astro.com/astro-databank/Special:AllPages';

/**
 * Astro-Databank의 모든 인물 페이지 URL을 수집하여 DB에 시드로 등록합니다.
 * MediaWiki의 Special:AllPages를 페이징하며 탐색합니다.
 */
export async function runAstroDatabankDiscover(startUrl: string = ASTRO_ALL_PAGES_URL) {
  console.log('Starting AstroDatabank Discover Pipeline from:', startUrl);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "shell",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let currentUrl: string | null = startUrl;
    let pageCount = 0;
    let totalInserted = 0;

    while (currentUrl) {
      console.log(`\n[Discover] Fetching list page: ${currentUrl}`);
      await page.goto(currentUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('#mw-content-text', { timeout: 15000 }).catch(() => console.log('Timeout waiting for content.'));

      // 1. 현재 페이지의 모든 항목 링크 추출
      // mw-allpages-chunk 안의 링크들이 실제 프로필들입니다.
      const profiles = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.mw-allpages-chunk li a'));
        return links.map(a => {
          const title = a.getAttribute('title') || a.textContent || '';
          const href = (a as HTMLAnchorElement).href;
          return { title, url: href };
        });
      });

      console.log(`Found ${profiles.length} profiles on this page.`);

      // 2. 추출된 링크들을 DB에 저장 (이미 있으면 무시)
      let insertedCount = 0;
      for (const p of profiles) {
        if (!p.url.includes('/astro-databank/')) continue; // 방어 로직
        
        try {
          await prisma.rawAstroDatabank.upsert({
            where: { url: p.url },
            update: {}, // 이미 있으면 냅둠
            create: {
              url: p.url,
              title: p.title,
              rawHtml: '', // 아직 본문 HTML은 수집하지 않은 상태
              processStatus: 'PENDING'
            }
          });
          insertedCount++;
        } catch (err) {
          // Ignore unique constraint errors or parallel upsert issues
        }
      }
      
      totalInserted += insertedCount;
      console.log(`Inserted ${insertedCount} new profiles to DB.`);

      // 3. 'Next page' 링크 찾기 (다음 페이지로 이동)
      const nextLink = await page.evaluate(() => {
        const navLinks = Array.from(document.querySelectorAll('.mw-allpages-nav a'));
        // 텍스트에 "Next"나 "다음"이 포함된 링크 찾기 (보통 'Next page' 형식임)
        const next = navLinks.find(a => a.textContent?.includes('Next'));
        return next ? (next as HTMLAnchorElement).href : null;
      });

      if (nextLink) {
        currentUrl = nextLink;
        pageCount++;
        
        // 차단을 막기 위해 1~2초 휴식
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 1000));
        
        // // (테스트용) 너무 오래 걸리니 3페이지만 하고 멈추게 하려면 주석 해제
        // if (pageCount >= 3) {
        //   console.log('Testing limit reached (3 pages). Stopping discover.');
        //   break;
        // }
      } else {
        console.log('No next page found. Discover completed!');
        break; // 루프 종료
      }
    }

    console.log(`\n✅ Discover Pipeline Finished! Total discovered profiles: ${totalInserted}`);

  } catch (error) {
    console.error('Failed in AstroDatabank Discover:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
