import * as cheerio from 'cheerio';

export class AstroDatabankTransformer {
  /**
   * 2단계 Transform: Raw HTML에서 생년월일시와 Rodden Rating을 파싱합니다.
   * 아스트로 데이터뱅크는 MediaWiki 기반이므로 본문 텍스트 내의 표준화된 패턴을 정규식으로 추출합니다.
   */
  parseProfileHtml(html: string) {
    const $ = cheerio.load(html);
    
    // 본문 컨텐츠 영역 (MediaWiki의 기본 컨텐츠 영역)
    const contentText = $('#mw-content-text').text();
    
    // 1. 태어난 날짜 및 시간 추출 (예: "born on 24 February 1955 at 19:15 (= 07:15 PM )")
    // 다양한 텍스트 변형에 대응하기 위해 정규표현식 사용
    const birthPattern = /born on\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+at\s+(\d{1,2}:\d{2}))?/i;
    const birthMatch = contentText.match(birthPattern);
    
    // 2. Rodden Rating 추출 (예: "Rodden Rating AA")
    const roddenPattern = /Rodden Rating\s+([A-Z]{1,2})/i;
    const roddenMatch = contentText.match(roddenPattern);

    // 3. Gender 추출 (예: "Gender: M" 또는 "Gender: F")
    // HTML 상에서 'Gender</a>:  M' 형태로 있음. 텍스트로 뽑기 위해 cheerior 전체 html에서 검색하거나 정규식 사용
    const genderPattern = /Gender(?:<\/a>)?:\s*([MF])/i;
    const genderMatch = html.match(genderPattern);

    // 4. Place 추출 (예: "San Francisco, California")
    const placePattern = /<b>Place<\/b><\/td>\s*<td>\s*([^<]+)/i;
    const placeMatch = html.match(placePattern);

    // (월) Month 문자열을 숫자로 변환하는 맵
    const monthMap: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
    };

    let parsedData: any = {};

    if (birthMatch) {
      const day = parseInt(birthMatch[1]!, 10);
      const monthStr = birthMatch[2]!.toLowerCase();
      const year = parseInt(birthMatch[3]!, 10);
      const time = birthMatch[4] || null;

      parsedData = {
        ...parsedData,
        birthYear: year,
        birthMonth: monthMap[monthStr] || null,
        birthDay: day,
        birthTime: time, // '19:15' 포맷
      };
    }

    if (roddenMatch) {
      parsedData.roddenRating = roddenMatch[1]!.toUpperCase(); // 'AA', 'A', 'B' 등
    }

    if (genderMatch) {
      parsedData.gender = genderMatch[1]!.toUpperCase() === 'M' ? 'MALE' : 'FEMALE';
    }

    if (placeMatch) {
      let placeStr = placeMatch[1]!.trim();
      placeStr = placeStr.replace(/,\s*$/, ''); // 끝에 있는 콤마 제거
      parsedData.birthPlaceName = placeStr;
    }

    // 5. Wikipedia URL 추출
    const wikiLink = $('a[href*="wikipedia.org/wiki/"]').first().attr('href');
    if (wikiLink) {
      parsedData.wikipediaUrl = wikiLink;
    }

    return parsedData;
  }
}
