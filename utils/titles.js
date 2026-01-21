/**
 * 칭호(접두 수식어) 데이터 및 관련 함수
 * 총 60개 이상의 다양한 칭호
 */

const TITLE_GRADES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

const GRADE_KOREAN = {
  [TITLE_GRADES.COMMON]: '일반',
  [TITLE_GRADES.UNCOMMON]: '고급',
  [TITLE_GRADES.RARE]: '희귀',
  [TITLE_GRADES.EPIC]: '영웅',
  [TITLE_GRADES.LEGENDARY]: '전설'
};

const GRADE_EMOJI = {
  [TITLE_GRADES.COMMON]: '',
  [TITLE_GRADES.UNCOMMON]: '🔹',
  [TITLE_GRADES.RARE]: '✨',
  [TITLE_GRADES.EPIC]: '⭐',
  [TITLE_GRADES.LEGENDARY]: '🌟'
};

// 칭호 목록 (총 65개)
const TITLES = [
  // ========== 일반 (40%) - 보너스 0% ==========
  // 평범한 수식어
  { name: '평범한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '순수한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '착한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '소심한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '평화로운', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '조용한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '무난한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '심심한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '졸린', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '배고픈', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  // 부정적/웃긴 수식어 (일반)
  { name: '냄새나는', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '찌질한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '한심한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '불쌍한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '눈물나는', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '멍청한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '어리버리한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '띨띨한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '덜렁대는', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '허당인', grade: TITLE_GRADES.COMMON, bonusRate: 0 },

  // ========== 고급 (30%) - 보너스 10% ==========
  // 긍정적 수식어
  { name: '부지런한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '성실한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '밝은', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '듬직한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '정직한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '활기찬', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '열정적인', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '다정한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '따뜻한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '명랑한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  // 외형 수식어
  { name: '반짝반짝', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '깔끔한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '단정한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '귀여운', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '멋진', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },

  // ========== 희귀 (20%) - 보너스 25% ==========
  // 능력 수식어
  { name: '용맹한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '현명한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '천재적인', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '카리스마 있는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '총명한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '기품있는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  // 신비로운 수식어
  { name: '신비로운', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '영롱한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '빛나는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '찬란한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '눈부신', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '화려한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },

  // ========== 영웅 (8%) - 보너스 50% ==========
  { name: '위대한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '고귀한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '성스러운', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '신성한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '불꽃의', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '번개의', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '폭풍의', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '황금빛', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },

  // ========== 전설 (2%) - 보너스 100% ==========
  { name: '전설의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '신화적인', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '불멸의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '태초의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '절대적인', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '초월한', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '우주의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '심연의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 }
];

// 등급별 확률
const GRADE_PROBABILITIES = {
  [TITLE_GRADES.COMMON]: 40,
  [TITLE_GRADES.UNCOMMON]: 30,
  [TITLE_GRADES.RARE]: 20,
  [TITLE_GRADES.EPIC]: 8,
  [TITLE_GRADES.LEGENDARY]: 2
};

/**
 * 랜덤 칭호 뽑기
 * @returns {Object} { name, grade, bonusRate }
 */
function rollTitle() {
  const roll = Math.random() * 100;
  let selectedGrade;
  let cumulative = 0;

  for (const [grade, probability] of Object.entries(GRADE_PROBABILITIES)) {
    cumulative += probability;
    if (roll < cumulative) {
      selectedGrade = grade;
      break;
    }
  }

  const titlesOfGrade = TITLES.filter(t => t.grade === selectedGrade);
  const randomIndex = Math.floor(Math.random() * titlesOfGrade.length);

  return { ...titlesOfGrade[randomIndex] };
}

/**
 * 칭호 정보 포맷팅
 * @param {Object} title - 칭호 객체
 * @returns {string} 포맷된 문자열
 */
function formatTitleInfo(title) {
  const gradeKorean = GRADE_KOREAN[title.grade];
  const bonusPercent = Math.round(title.bonusRate * 100);
  const emoji = GRADE_EMOJI[title.grade];

  return `${title.name} (${gradeKorean} +${bonusPercent}%) ${emoji}`.trim();
}

/**
 * 등급별 칭호 목록 가져오기
 * @param {string} grade - 등급
 * @returns {Array} 해당 등급의 칭호 배열
 */
function getTitlesByGrade(grade) {
  return TITLES.filter(t => t.grade === grade);
}

/**
 * 칭호 통계 가져오기
 * @returns {Object} 등급별 칭호 수
 */
function getTitleStats() {
  return {
    total: TITLES.length,
    common: getTitlesByGrade(TITLE_GRADES.COMMON).length,
    uncommon: getTitlesByGrade(TITLE_GRADES.UNCOMMON).length,
    rare: getTitlesByGrade(TITLE_GRADES.RARE).length,
    epic: getTitlesByGrade(TITLE_GRADES.EPIC).length,
    legendary: getTitlesByGrade(TITLE_GRADES.LEGENDARY).length
  };
}

module.exports = {
  TITLE_GRADES,
  GRADE_KOREAN,
  GRADE_EMOJI,
  TITLES,
  GRADE_PROBABILITIES,
  rollTitle,
  formatTitleInfo,
  getTitlesByGrade,
  getTitleStats
};
