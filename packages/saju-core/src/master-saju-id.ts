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

/**
 * 년주, 월주, 일주를 입력받아 0 ~ 43199 사이의 고유하고 결정론적인 MasterSaju ID를 반환합니다.
 * ID = (년주 인덱스 * 12 * 60) + (월지 인덱스 * 60) + 일주 인덱스
 * 
 * @param yearPillar 년주 (예: '甲子')
 * @param monthPillar 월주 (예: '丙寅')
 * @param dayPillar 일주 (예: '戊辰')
 * @returns MasterSaju 테이블의 고유 Int ID
 */
export function calculateMasterSajuId(yearPillar: string, monthPillar: string, dayPillar: string): number {
  const yearIndex = getSexagenaryIndex(yearPillar);
  
  // 월주는 년주에 종속되므로 60갑자 인덱스가 아닌 지지(Month Branch)의 인덱스(0~11)만 사용합니다.
  // 자월=0, 축월=1, ... 해월=11
  const monthBranch = monthPillar.charAt(1);
  const monthIndex = BRANCHES.indexOf(monthBranch);
  
  if (monthIndex === -1) {
    throw new Error(`Invalid month branch: ${monthBranch} in ${monthPillar}`);
  }

  const dayIndex = getSexagenaryIndex(dayPillar);

  // 60 * 12 * 60 체계로 계산
  const id = (yearIndex * 12 * 60) + (monthIndex * 60) + dayIndex;
  
  return id;
}

/**
 * MasterSaju ID를 역산하여 다시 [년주, 월주(지지), 일주] 형태의 정보를 도출하는 유틸리티입니다.
 * 월간(Month Stem)은 년간(Year Stem)의 공식(오호둔)에 의해 결정되므로 여기서는 월지만 도출합니다.
 */
export function parseMasterSajuId(id: number) {
  if (id < 0 || id > 43199) {
    throw new Error('ID must be between 0 and 43199');
  }

  const dayIndex = id % 60;
  const remainingAfterDay = Math.floor(id / 60);
  
  const monthIndex = remainingAfterDay % 12;
  const yearIndex = Math.floor(remainingAfterDay / 12);

  return {
    yearPillar: SEXAGENARY_CYCLE[yearIndex],
    monthBranch: BRANCHES[monthIndex], // 월간은 별도 오호둔 공식으로 계산해야 함
    dayPillar: SEXAGENARY_CYCLE[dayIndex]
  };
}
