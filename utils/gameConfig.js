/**
 * 게임 설정 및 강화 확률 테이블
 */

// 초기 골드
const INITIAL_GOLD = 10000;

// 최대 레벨
const MAX_LEVEL = 15;

// 강화 확률 테이블
// success + death + fail = 100
const UPGRADE_TABLE = [
  { level: 0, success: 100, death: 0, fail: 0, cost: 100 },
  { level: 1, success: 100, death: 0, fail: 0, cost: 200 },
  { level: 2, success: 100, death: 0, fail: 0, cost: 300 },
  { level: 3, success: 95, death: 0, fail: 5, cost: 500 },
  { level: 4, success: 90, death: 0, fail: 10, cost: 800 },
  { level: 5, success: 80, death: 5, fail: 15, cost: 1500 },
  { level: 6, success: 70, death: 10, fail: 20, cost: 3000 },
  { level: 7, success: 60, death: 15, fail: 25, cost: 5000 },
  { level: 8, success: 50, death: 20, fail: 30, cost: 8000 },
  { level: 9, success: 40, death: 25, fail: 35, cost: 12000 },
  { level: 10, success: 30, death: 30, fail: 40, cost: 20000 },
  { level: 11, success: 20, death: 40, fail: 40, cost: 35000 },
  { level: 12, success: 10, death: 50, fail: 40, cost: 60000 },
  { level: 13, success: 5, death: 60, fail: 35, cost: 100000 },
  { level: 14, success: 3, death: 70, fail: 27, cost: 200000 }
];

// 리롤 비용 계산
const TITLE_REROLL_BASE_COST = 3000;
const TITLE_REROLL_LEVEL_COST = 500;

const JOB_REROLL_BASE_COST = 5000;
const JOB_REROLL_LEVEL_COST = 1000;

/**
 * 강화 정보 가져오기
 * @param {number} level - 현재 레벨
 * @returns {Object|null} 강화 정보 또는 null (최대 레벨인 경우)
 */
function getUpgradeInfo(level) {
  if (level >= MAX_LEVEL) {
    return null;
  }
  return UPGRADE_TABLE.find(u => u.level === level);
}

/**
 * 강화 결과 계산
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

/**
 * 판매 가격 계산
 * @param {number} level - 현재 레벨
 * @param {number} titleBonusRate - 칭호 보너스율 (0~1)
 * @param {number} jobBonusRate - 직업 보너스율 (0~0.6)
 * @returns {number} 판매 가격
 */
function getSellPrice(level, titleBonusRate, jobBonusRate) {
  if (level === 0) {
    return 0;
  }

  const basePrice = Math.pow(2, level) * 1000;
  const totalBonus = titleBonusRate + jobBonusRate;

  return Math.floor(basePrice * (1 + totalBonus));
}

/**
 * 칭호 리롤 비용 계산
 * @param {number} level - 현재 레벨
 * @returns {number} 리롤 비용
 */
function getTitleRerollCost(level) {
  return TITLE_REROLL_BASE_COST + (level * TITLE_REROLL_LEVEL_COST);
}

/**
 * 직업 리롤 비용 계산
 * @param {number} level - 현재 레벨
 * @returns {number} 리롤 비용
 */
function getJobRerollCost(level) {
  return JOB_REROLL_BASE_COST + (level * JOB_REROLL_LEVEL_COST);
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
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  getTitleRerollCost,
  getJobRerollCost,
  formatGold
};
