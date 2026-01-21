/**
 * 게임 설정 및 성장 확률 테이블
 */

// 초기 골드 (감소)
const INITIAL_GOLD = 5000;

// 최대 레벨
const MAX_LEVEL = 15;

// 성장 확률 테이블 (10강부터 파괴 시작)
// 실패율: 0,1,2,4,8,16,32,48,50,55 + 10강부터 파괴 10%씩 증가
// 비용 = 해당 레벨 판매가의 20%
// success + death + fail = 100
const UPGRADE_TABLE = [
  { level: 0, success: 100, death: 0, fail: 0, cost: 40 },
  { level: 1, success: 99, death: 0, fail: 1, cost: 80 },
  { level: 2, success: 98, death: 0, fail: 2, cost: 160 },
  { level: 3, success: 96, death: 0, fail: 4, cost: 320 },
  { level: 4, success: 92, death: 0, fail: 8, cost: 640 },
  { level: 5, success: 84, death: 0, fail: 16, cost: 1280 },
  { level: 6, success: 68, death: 0, fail: 32, cost: 5120 },
  { level: 7, success: 52, death: 0, fail: 48, cost: 20480 },
  { level: 8, success: 50, death: 0, fail: 50, cost: 81920 },
  { level: 9, success: 45, death: 0, fail: 55, cost: 327680 },
  { level: 10, success: 30, death: 10, fail: 60, cost: 1310720 },
  { level: 11, success: 15, death: 20, fail: 65, cost: 5242880 },
  { level: 12, success: 0, death: 30, fail: 70, cost: 20971520 },
  { level: 13, success: 0, death: 40, fail: 60, cost: 83886080 },
  { level: 14, success: 0, death: 50, fail: 50, cost: 335544320 }
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
