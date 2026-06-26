import puppeteer from 'puppeteer';
import { prisma } from '../../db/client';

const ASTRO_BASE_URL = 'https://www.astro.com/astro-databank';

export class AstroDatabankClient {
  /**
   * 1단계 Extract: HTML을 그대로 수집해서 raw_astrodatabank에 넣습니다.
   * Cloudflare 봇 방어를 우회하기 위해 Puppeteer(헤드리스 브라우저)를 사용합니다.
   */
  async fetchAndStoreRawPage(title: string, url: string) {
    let browser;
    try {
      // 1. 브라우저 띄우기 (봇 방어를 피하기 위한 설정)
      browser = await puppeteer.launch({
        headless: "shell", // 디버깅 시 false로 변경하면 실제 브라우저가 뜨는 것을 볼 수 있습니다.
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      // 사람처럼 보이기 위한 User-Agent 설정
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2' }); // 네트워크가 조용해질 때까지(Cloudflare 통과 대기) 기다림

      // 추가로 본문 요소가 나타날 때까지 대기 (Cloudflare 통과 후 실제 페이지 로딩 보장)
      await page.waitForSelector('#mw-content-text', { timeout: 15000 }).catch(() => console.log('Timeout waiting for content, continuing anyway...'));

      const html = await page.content();

      // 2. Save Raw HTML to DB
      const result = await prisma.rawAstroDatabank.upsert({
        where: { url },
        update: {
          rawHtml: html,
          scrapedAt: new Date(),
        },
        create: {
          url,
          title,
          rawHtml: html,
        }
      });

      console.log(`Saved raw data for: ${title}`);
      return result;
    } catch (error) {
      console.error(`Failed to fetch AstroDatabank page: ${url}`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
