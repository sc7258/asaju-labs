const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 60갑자 배열 캐싱
const SEXAGENARY_CYCLE = Array.from({ length: 60 }, (_, i) => {
  return STEMS[i % 10] + BRANCHES[i % 12];
});

/**
 * 60갑자 문자열(예: '甲子')을 입력받아 0~59 사이의 인덱스를 반환합니다.
 */
export function getSexagenaryIndex(pillar: string): number {
  const index = SEXAGENARY_CYCLE.indexOf(pillar);
  if (index === -1) {
    throw new Error(`Invalid pillar: ${pillar}`);
  }
  return index;
}

export function getStemIndex(stem: string): number {
  const index = STEMS.indexOf(stem);
  if (index === -1) throw new Error(`Invalid stem: ${stem}`);
  return index;
}

export function getBranchIndex(branch: string): number {
  const index = BRANCHES.indexOf(branch);
  if (index === -1) throw new Error(`Invalid branch: ${branch}`);
  return index;
}

export function pillarToHex(pillar: string): string {
  if (pillar.length !== 2) throw new Error(`Invalid pillar length: ${pillar}`);
  const s = getStemIndex(pillar.charAt(0));
  const b = getBranchIndex(pillar.charAt(1));
  return s.toString(16).toUpperCase() + b.toString(16).toUpperCase();
}

/**
 * 년주, 월주, 일주를 입력받아 6자리 Hex 문자열로 된 Saju Code를 반환합니다.
 * 포맷: {연간}{연지}{월간}{월지}{일간}{일지} (각 1자리 16진수)
 * 예: 甲子丙寅戊辰 -> 002244
 */
export function calculateSajuCode(yearPillar: string, monthPillar: string, dayPillar: string): string {
  return pillarToHex(yearPillar) + pillarToHex(monthPillar) + pillarToHex(dayPillar);
}

/**
 * Saju Code (예: '002244')를 역산하여 다시 [년주, 월주, 일주] 형태의 정보를 도출하는 유틸리티입니다.
 */
export function parseSajuCode(code: string) {
  if (code.length !== 6) {
    throw new Error('Saju Code must be a 6-character string');
  }

  const sYear = parseInt(code.charAt(0), 16);
  const bYear = parseInt(code.charAt(1), 16);
  const sMonth = parseInt(code.charAt(2), 16);
  const bMonth = parseInt(code.charAt(3), 16);
  const sDay = parseInt(code.charAt(4), 16);
  const bDay = parseInt(code.charAt(5), 16);

  return {
    yearPillar: STEMS[sYear] + BRANCHES[bYear],
    monthPillar: STEMS[sMonth] + BRANCHES[bMonth],
    dayPillar: STEMS[sDay] + BRANCHES[bDay]
  };
}
