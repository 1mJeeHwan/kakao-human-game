/**
 * 게임 설정 및 성장 확률 테이블
 */

// 초기 골드 (감소)
const INITIAL_GOLD = 5000;

// 최대 레벨
const MAX_LEVEL = 15;

// 성장 확률 테이블 (비용 증가)
// success + death + fail = 100
const UPGRADE_TABLE = [
  { level: 0, success: 100, death: 0, fail: 0, cost: 200 },
  { level: 1, success: 95, death: 0, fail: 5, cost: 400 },
  { level: 2, success: 90, death: 0, fail: 10, cost: 600 },
  { level: 3, success: 85, death: 5, fail: 10, cost: 1000 },
  { level: 4, success: 75, death: 10, fail: 15, cost: 1800 },
  { level: 5, success: 65, death: 15, fail: 20, cost: 3500 },
  { level: 6, success: 55, death: 20, fail: 25, cost: 6000 },
  { level: 7, success: 45, death: 25, fail: 30, cost: 10000 },
  { level: 8, success: 35, death: 30, fail: 35, cost: 18000 },
  { level: 9, success: 25, death: 35, fail: 40, cost: 30000 },
  { level: 10, success: 18, death: 42, fail: 40, cost: 50000 },
  { level: 11, success: 12, death: 48, fail: 40, cost: 80000 },
  { level: 12, success: 7, death: 55, fail: 38, cost: 130000 },
  { level: 13, success: 4, death: 65, fail: 31, cost: 200000 },
  { level: 14, success: 2, death: 75, fail: 23, cost: 350000 }
];

// 성장 성공 시 칭호/직업 변경 확률 (%)
const TITLE_CHANGE_CHANCE = 20;  // 20% 확률로 칭호 변경
const JOB_CHANGE_CHANCE = 15;    // 15% 확률로 직업 변경

// 판매 가격 기본 배수 (감소: 1000 → 500)
const SELL_PRICE_MULTIPLIER = 500;

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

/**
 * 판매 가격 계산 (감소된 보상)
 * @param {number} level - 현재 레벨
 * @param {number} titleBonusRate - 칭호 보너스율 (0~1)
 * @param {number} jobBonusRate - 직업 보너스율 (0~0.6)
 * @returns {number} 판매 가격
 */
function getSellPrice(level, titleBonusRate, jobBonusRate) {
  if (level === 0) {
    return 0;
  }

  // 기본가 감소: 2^level * 500 (기존 1000에서 감소)
  const basePrice = Math.pow(2, level) * SELL_PRICE_MULTIPLIER;
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
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  shouldChangeTitle,
  shouldChangeJob,
  formatGold
};
