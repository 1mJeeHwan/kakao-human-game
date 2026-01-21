/**
 * 게임 설정 및 성장 확률 테이블
 */

// 초기 골드 (감소)
const INITIAL_GOLD = 5000;

// 최대 레벨
const MAX_LEVEL = 15;

// 성장 확률 테이블
// - 처음부터 실패/사망 확률 존재 (1%씩 시작)
// - 5강 이후 점진적 증가
// - 10강 이후 대폭 증가
// - 성공 확률은 절대 0% 아님
// - 비용: 성공률 높을수록 비용 비율 높음, 낮을수록 저렴 (도전 유도)
// success + death + fail = 100
const UPGRADE_TABLE = [
  { level: 0, success: 98, death: 1, fail: 1, cost: 20 },
  { level: 1, success: 96, death: 2, fail: 2, cost: 50 },
  { level: 2, success: 93, death: 3, fail: 4, cost: 100 },
  { level: 3, success: 89, death: 5, fail: 6, cost: 200 },
  { level: 4, success: 84, death: 7, fail: 9, cost: 500 },
  // 5강 이후 점진적 증가
  { level: 5, success: 75, death: 10, fail: 15, cost: 1000 },
  { level: 6, success: 65, death: 15, fail: 20, cost: 3000 },
  { level: 7, success: 55, death: 20, fail: 25, cost: 10000 },
  { level: 8, success: 45, death: 25, fail: 30, cost: 30000 },
  { level: 9, success: 35, death: 30, fail: 35, cost: 100000 },
  // 10강 이후 대폭 증가
  { level: 10, success: 25, death: 40, fail: 35, cost: 300000 },
  { level: 11, success: 18, death: 50, fail: 32, cost: 1000000 },
  { level: 12, success: 12, death: 60, fail: 28, cost: 3000000 },
  { level: 13, success: 7, death: 70, fail: 23, cost: 10000000 },
  { level: 14, success: 3, death: 80, fail: 17, cost: 30000000 }
];

// 파괴 지원금 확률 테이블
const DEATH_SUPPORT_TABLE = [
  { refundRate: 0.5, chance: 50 },    // 50% 환급: 50% 확률
  { refundRate: 0.7, chance: 30 },    // 70% 환급: 30% 확률
  { refundRate: 0.9, chance: 5 },     // 90% 환급: 5% 확률
  { refundRate: 1.0, chance: 1 },     // 100% 환급: 1% 확률
  { refundRate: 2.0, chance: 0.1 }    // 200% 환급 (잭팟): 0.1% 확률
];

/**
 * 파괴 지원금 계산
 * @param {number} totalSpent - 해당 인간에게 사용한 총 골드
 * @returns {Object} { refundAmount, refundRate, isJackpot }
 */
function calculateDeathSupport(totalSpent) {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const tier of DEATH_SUPPORT_TABLE) {
    cumulative += tier.chance;
    if (roll < cumulative) {
      return {
        refundAmount: Math.floor(totalSpent * tier.refundRate),
        refundRate: tier.refundRate * 100,
        isJackpot: tier.refundRate >= 2.0
      };
    }
  }

  // 나머지 확률 (13.9%): 환급 없음
  return {
    refundAmount: 0,
    refundRate: 0,
    isJackpot: false
  };
}

// 성장 성공 시 칭호/직업 변경 확률 (%)
const TITLE_CHANGE_CHANCE = 20;  // 20% 확률로 칭호 변경
const JOB_CHANGE_CHANCE = 15;    // 15% 확률로 직업 변경

// 판매 가격 기본 배수 (대폭 감소)
const SELL_PRICE_MULTIPLIER = 100;

/**
 * 성장 정보 가져오기
 * @param {number} level - 현재 레벨
 * @returns {Object|null} 성장 정보 또는 null (최대 레벨인 경우)
 */
function getUpgradeInfo(level) {
  if (level >= MAX_LEVEL) {
    return null;
  }
  return UPGRADE_TABLE.find(u => u.level === level);
}

/**
 * 성장 결과 계산
 * @param {number} level - 현재 레벨
 * @returns {string} 'success' | 'death' | 'fail'
 */
function calculateUpgradeResult(level) {
  const info = getUpgradeInfo(level);
  if (!info) {
    return 'max_level';
  }

  const roll = Math.random() * 100;

  if (roll < info.success) {
    return 'success';
  } else if (roll < info.success + info.death) {
    return 'death';
  } else {
    return 'fail';
  }
}

// 사망 확률 급증 레벨 (2배 보상 시작)
const DEATH_START_LEVEL = 7;

/**
 * 판매 가격 계산 (7강부터 2배씩 증가)
 * @param {number} level - 현재 레벨
 * @param {number} titleBonusRate - 칭호 보너스율 (0~1)
 * @param {number} jobBonusRate - 직업 보너스율 (0~0.6)
 * @returns {number} 판매 가격
 */
function getSellPrice(level, titleBonusRate, jobBonusRate) {
  if (level === 0) {
    return 0;
  }

  let basePrice;

  if (level < DEATH_START_LEVEL) {
    // 1~6강: 기본 증가 (2^level * 100)
    basePrice = Math.pow(2, level) * SELL_PRICE_MULTIPLIER;
  } else {
    // 7강+: 2배씩 가속 증가
    // 레벨 7부터는 기존 대비 2^(level-6)배 추가
    const riskMultiplier = Math.pow(2, level - DEATH_START_LEVEL + 1);
    basePrice = Math.pow(2, level) * SELL_PRICE_MULTIPLIER * riskMultiplier;
  }

  const totalBonus = titleBonusRate + jobBonusRate;
  return Math.floor(basePrice * (1 + totalBonus));
}

/**
 * 칭호 변경 여부 결정
 * @returns {boolean} 변경 여부
 */
function shouldChangeTitle() {
  return Math.random() * 100 < TITLE_CHANGE_CHANCE;
}

/**
 * 직업 변경 여부 결정
 * @returns {boolean} 변경 여부
 */
function shouldChangeJob() {
  return Math.random() * 100 < JOB_CHANGE_CHANCE;
}

/**
 * 골드 포맷팅
 * @param {number} gold - 골드 양
 * @returns {string} 포맷된 문자열
 */
function formatGold(gold) {
  return gold.toLocaleString('ko-KR') + 'G';
}

module.exports = {
  INITIAL_GOLD,
  MAX_LEVEL,
  UPGRADE_TABLE,
  TITLE_CHANGE_CHANCE,
  JOB_CHANGE_CHANCE,
  SELL_PRICE_MULTIPLIER,
  DEATH_SUPPORT_TABLE,
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  shouldChangeTitle,
  shouldChangeJob,
  calculateDeathSupport,
  formatGold
};
