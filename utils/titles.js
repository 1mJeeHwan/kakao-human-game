/**
 * 칭호(접두 수식어) 데이터 및 관련 함수
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

// 칭호 목록
const TITLES = [
  // 일반 (40%)
  { name: '평범한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '순수한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '착한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '소심한', grade: TITLE_GRADES.COMMON, bonusRate: 0 },
  { name: '평화로운', grade: TITLE_GRADES.COMMON, bonusRate: 0 },

  // 고급 (30%)
  { name: '부지런한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '성실한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '밝은', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '듬직한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '정직한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },

  // 희귀 (20%)
  { name: '용맹한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '현명한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '천재적인', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '카리스마 있는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },

  // 영웅 (8%)
  { name: '위대한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '고귀한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },
  { name: '빛나는', grade: TITLE_GRADES.EPIC, bonusRate: 0.5 },

  // 전설 (2%)
  { name: '전설의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '신화적인', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 },
  { name: '불멸의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0 }
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

module.exports = {
  TITLE_GRADES,
  GRADE_KOREAN,
  GRADE_EMOJI,
  TITLES,
  GRADE_PROBABILITIES,
  rollTitle,
  formatTitleInfo
};
