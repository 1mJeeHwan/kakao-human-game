/**
 * 칭호(접두 수식어) 데이터 및 관련 함수
 * 특수 능력이 있는 칭호 포함
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

// 특수 능력 타입
const SPECIAL_ABILITIES = {
  DEATH_PROTECT: 'deathProtect',      // 사망 1회 방지
  DOUBLE_SELL: 'doubleSell',          // 판매가 2배
  LUCK_UP: 'luckUp',                  // 성공률 +5%
  COST_DOWN: 'costDown',              // 비용 50% 할인
  JACKPOT_UP: 'jackpotUp',            // 잭팟 확률 2배
  BONUS_GOLD: 'bonusGold',            // 판매 시 추가 골드
  FAIL_TO_SUCCESS: 'failToSuccess',   // 실패를 성공으로 (1회)
  DOUBLE_REFUND: 'doubleRefund',      // 파괴 지원금 2배
  // 새로운 능력
  DEATH_RATE_DOWN: 'deathRateDown',   // 사망률 -10%
  DOUBLE_EXP: 'doubleExp',            // 성공 시 2레벨 상승 (1회)
  LEVEL_PROTECT: 'levelProtect'       // 실패해도 레벨 유지 (1회)
};

// 특수 능력 설명
const ABILITY_DESCRIPTIONS = {
  [SPECIAL_ABILITIES.DEATH_PROTECT]: '💫 사망 1회 방지',
  [SPECIAL_ABILITIES.DOUBLE_SELL]: '💰 판매가 2배',
  [SPECIAL_ABILITIES.LUCK_UP]: '🍀 성공률 +5%',
  [SPECIAL_ABILITIES.COST_DOWN]: '💸 성장 비용 50% 할인',
  [SPECIAL_ABILITIES.JACKPOT_UP]: '🎰 잭팟 확률 2배',
  [SPECIAL_ABILITIES.BONUS_GOLD]: '💎 판매 시 +10,000G',
  [SPECIAL_ABILITIES.FAIL_TO_SUCCESS]: '🔄 실패→성공 변환 (1회)',
  [SPECIAL_ABILITIES.DOUBLE_REFUND]: '🛡️ 파괴 지원금 2배',
  // 새로운 능력
  [SPECIAL_ABILITIES.DEATH_RATE_DOWN]: '🔰 사망 시 50% 확률로 방어 (1회)',
  [SPECIAL_ABILITIES.DOUBLE_EXP]: '⚡ 성공 시 2레벨 상승 (1회)',
  [SPECIAL_ABILITIES.LEVEL_PROTECT]: '📈 사망해도 레벨 유지 (1회)'
};

// 칭호 목록 (총 70개+)
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
  { name: '반짝반짝', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '깔끔한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '단정한', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '귀여운', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },
  { name: '멋진', grade: TITLE_GRADES.UNCOMMON, bonusRate: 0.1 },

  // ========== 희귀 (20%) - 보너스 25% + 일부 특수능력 ==========
  { name: '용맹한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '현명한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '천재적인', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '카리스마 있는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '총명한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '기품있는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '신비로운', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '영롱한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '빛나는', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  { name: '찬란한', grade: TITLE_GRADES.RARE, bonusRate: 0.25 },
  // 특수 능력 보유 (희귀)
  { name: '행운의', grade: TITLE_GRADES.RARE, bonusRate: 0.25, special: SPECIAL_ABILITIES.LUCK_UP },
  { name: '알뜰한', grade: TITLE_GRADES.RARE, bonusRate: 0.25, special: SPECIAL_ABILITIES.COST_DOWN },

  // ========== 영웅 (8%) - 보너스 50% + 특수능력 ==========
  { name: '위대한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.DOUBLE_EXP },
  { name: '고귀한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.LEVEL_PROTECT },
  { name: '성스러운', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.DEATH_RATE_DOWN },
  { name: '신성한', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.DEATH_PROTECT },
  // 특수 능력 보유 (영웅)
  { name: '불굴의', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.FAIL_TO_SUCCESS },
  { name: '축복받은', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.DEATH_PROTECT },
  { name: '황금빛', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.BONUS_GOLD },
  { name: '도박사', grade: TITLE_GRADES.EPIC, bonusRate: 0.5, special: SPECIAL_ABILITIES.JACKPOT_UP },

  // ========== 전설 (2%) - 보너스 100% + 강력한 특수능력 (다중) ==========
  { name: '전설의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.DEATH_PROTECT, SPECIAL_ABILITIES.LUCK_UP] },
  { name: '신화적인', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.DOUBLE_EXP, SPECIAL_ABILITIES.DEATH_RATE_DOWN] },
  // 특수 능력 보유 (전설) - 다중 능력
  { name: '불멸의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.DEATH_PROTECT, SPECIAL_ABILITIES.LEVEL_PROTECT] },
  { name: '태초의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.DOUBLE_SELL, SPECIAL_ABILITIES.BONUS_GOLD] },
  { name: '절대적인', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.LUCK_UP, SPECIAL_ABILITIES.DEATH_RATE_DOWN] },
  { name: '초월한', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.FAIL_TO_SUCCESS, SPECIAL_ABILITIES.DOUBLE_EXP] },
  { name: '우주의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.DOUBLE_REFUND, SPECIAL_ABILITIES.DEATH_PROTECT] },
  { name: '심연의', grade: TITLE_GRADES.LEGENDARY, bonusRate: 1.0, specials: [SPECIAL_ABILITIES.JACKPOT_UP, SPECIAL_ABILITIES.COST_DOWN] }
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
  const title = titlesOfGrade[randomIndex];

  // specials 배열 또는 single special 처리
  let specials = [];
  if (title.specials && title.specials.length > 0) {
    specials = title.specials;
  } else if (title.special) {
    specials = [title.special];
  }

  return {
    name: title.name,
    grade: title.grade,
    bonusRate: title.bonusRate,
    special: specials.length === 1 ? specials[0] : null,  // 하위 호환
    specials: specials  // 새로운 다중 능력 배열
  };
}

/**
 * 칭호 정보 포맷팅
 */
function formatTitleInfo(title) {
  const gradeKorean = GRADE_KOREAN[title.grade];
  const bonusPercent = Math.round(title.bonusRate * 100);
  const emoji = GRADE_EMOJI[title.grade];

  let text = `${title.name} (${gradeKorean} +${bonusPercent}%) ${emoji}`;

  // 다중 능력 처리
  if (title.specials && title.specials.length > 0) {
    for (const ability of title.specials) {
      text += `\n  ${ABILITY_DESCRIPTIONS[ability]}`;
    }
  } else if (title.special) {
    text += `\n  ${ABILITY_DESCRIPTIONS[title.special]}`;
  }

  return text.trim();
}

/**
 * 특수 능력 설명 가져오기
 */
function getAbilityDescription(abilityType) {
  return ABILITY_DESCRIPTIONS[abilityType] || '';
}

/**
 * 등급별 칭호 목록
 */
function getTitlesByGrade(grade) {
  return TITLES.filter(t => t.grade === grade);
}

/**
 * 칭호 통계
 */
function getTitleStats() {
  return {
    total: TITLES.length,
    common: getTitlesByGrade(TITLE_GRADES.COMMON).length,
    uncommon: getTitlesByGrade(TITLE_GRADES.UNCOMMON).length,
    rare: getTitlesByGrade(TITLE_GRADES.RARE).length,
    epic: getTitlesByGrade(TITLE_GRADES.EPIC).length,
    legendary: getTitlesByGrade(TITLE_GRADES.LEGENDARY).length,
    withSpecial: TITLES.filter(t => t.special).length
  };
}

module.exports = {
  TITLE_GRADES,
  GRADE_KOREAN,
  GRADE_EMOJI,
  TITLES,
  GRADE_PROBABILITIES,
  SPECIAL_ABILITIES,
  ABILITY_DESCRIPTIONS,
  rollTitle,
  formatTitleInfo,
  getAbilityDescription,
  getTitlesByGrade,
  getTitleStats
};
