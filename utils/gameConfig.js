/**
 * 게임 설정 및 성장 확률 테이블
 */

// 초기 골드 (감소)
const INITIAL_GOLD = 5000;

// 최대 레벨
const MAX_LEVEL = 15;

// 성장 확률 테이블 (7강부터 파괴 확률 급증)
// 비용 = 해당 레벨 판매가의 20%
// success + death + fail = 100
const UPGRADE_TABLE = [
  { level: 0, success: 100, death: 0, fail: 0, cost: 40 },
  { level: 1, success: 90, death: 0, fail: 10, cost: 80 },
  { level: 2, success: 80, death: 0, fail: 20, cost: 160 },
  { level: 3, success: 70, death: 5, fail: 25, cost: 320 },
  { level: 4, success: 60, death: 10, fail: 30, cost: 640 },
  { level: 5, success: 50, death: 15, fail: 35, cost: 1280 },
  { level: 6, success: 40, death: 20, fail: 40, cost: 5120 },
  { level: 7, success: 30, death: 35, fail: 35, cost: 20480 },
  { level: 8, success: 25, death: 45, fail: 30, cost: 81920 },
  { level: 9, success: 20, death: 55, fail: 25, cost: 327680 },
  { level: 10, success: 15, death: 60, fail: 25, cost: 1310720 },
  { level: 11, success: 10, death: 65, fail: 25, cost: 5242880 },
  { level: 12, success: 7, death: 70, fail: 23, cost: 20971520 },
  { level: 13, success: 4, death: 76, fail: 20, cost: 83886080 },
  { level: 14, success: 2, death: 83, fail: 15, cost: 335544320 }
];

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
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  shouldChangeTitle,
  shouldChangeJob,
  formatGold
};
