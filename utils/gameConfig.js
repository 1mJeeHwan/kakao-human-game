/**
 * 게임 설정 및 성장 확률 테이블
 */

// 초기 골드
const INITIAL_GOLD = 5000;

// 최대 레벨
const MAX_LEVEL = 20;

// 성장 확률 테이블
// - 처음부터 실패/사망 확률 존재 (1%씩 시작)
// - 5강 이후 점진적 증가
// - 10강 이후 대폭 증가
// - 15강 이후 극한 난이도
// - 성공 확률은 절대 0% 아님
// - 비용: 8강 이후 = 다음레벨 판매가 × 성공확률 × 2
// success + death + fail = 100
const UPGRADE_TABLE = [
  { level: 0, success: 98, death: 1, fail: 1, cost: 2 },
  // 1~6강: 사망률 30%로 감소
  { level: 1, success: 96, death: 1, fail: 3, cost: 5 },
  { level: 2, success: 93, death: 1, fail: 6, cost: 10 },
  // 3~7강: 비용 = 현재 판매가 × 10%
  { level: 3, success: 89, death: 2, fail: 9, cost: 8 },
  { level: 4, success: 84, death: 2, fail: 14, cost: 16 },
  // 5강 이후 점진적 증가 (성공률 ×0.8 적용, 사망률 30%)
  { level: 5, success: 60, death: 5, fail: 35, cost: 32 },
  { level: 6, success: 52, death: 6, fail: 42, cost: 64 },
  { level: 7, success: 44, death: 25, fail: 31, cost: 192 },
  // 8강 이후: 비용 <= 현재레벨 판매가 / 4
  { level: 8, success: 36, death: 29, fail: 35, cost: 1400 },
  { level: 9, success: 28, death: 33, fail: 39, cost: 4300 },
  // 10강 이후 대폭 증가
  { level: 10, success: 20, death: 43, fail: 37, cost: 12000 },
  { level: 11, success: 18, death: 50, fail: 32, cost: 26000 },
  { level: 12, success: 12, death: 60, fail: 28, cost: 89000 },
  { level: 13, success: 7, death: 70, fail: 23, cost: 302000 },
  { level: 14, success: 3, death: 80, fail: 17, cost: 1560000 },
  // 15강 이후 극한 난이도
  { level: 15, success: 2, death: 85, fail: 13, cost: 3760000 },
  { level: 16, success: 1.5, death: 88, fail: 10.5, cost: 10150000 },
  { level: 17, success: 1, death: 90, fail: 9, cost: 24370000 },
  { level: 18, success: 0.5, death: 92, fail: 7.5, cost: 43870000 },
  { level: 19, success: 0.1, death: 95, fail: 4.9, cost: 31580000 }
];

// 파괴 지원금 확률 테이블 (총 30% 확률)
const DEATH_SUPPORT_TABLE = [
  { refundRate: 0.5, chance: 20 },    // 50% 환급: 20% 확률
  { refundRate: 0.7, chance: 7 },     // 70% 환급: 7% 확률
  { refundRate: 0.9, chance: 2 },     // 90% 환급: 2% 확률
  { refundRate: 1.0, chance: 0.9 },   // 100% 환급: 0.9% 확률
  { refundRate: 2.0, chance: 0.1 }    // 200% 환급 (잭팟): 0.1% 확률
  // 나머지 70%: 환급 없음
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
const SELL_PRICE_MULTIPLIER = 10;

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

// 가속 시작 레벨
const ACCEL_START_LEVEL = 7;   // 1.5배 가속 시작
const ACCEL_BOOST_LEVEL = 12;  // 1.8배 가속 시작

/**
 * 판매 가격 계산
 * - 1~6강: 기본 증가 (2^level * 10)
 * - 7~11강: 1.5배씩 가속
 * - 12강+: 1.8배씩 가속
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

  if (level < ACCEL_START_LEVEL) {
    // 1~6강: 기본 증가 (2^level * 10)
    basePrice = Math.pow(2, level) * SELL_PRICE_MULTIPLIER;
  } else if (level < ACCEL_BOOST_LEVEL) {
    // 7~11강: 1.5배씩 가속
    const base6 = Math.pow(2, 6) * SELL_PRICE_MULTIPLIER;  // 6강 기준
    const accelLevels = level - ACCEL_START_LEVEL + 1;
    basePrice = base6 * Math.pow(1.5, accelLevels) * Math.pow(2, level - 6);
  } else {
    // 12강+: 1.8배씩 가속
    const base6 = Math.pow(2, 6) * SELL_PRICE_MULTIPLIER;
    const accel7to11 = Math.pow(1.5, 5);  // 7~11강까지 1.5배 5번
    const accelLevels = level - ACCEL_BOOST_LEVEL + 1;
    basePrice = base6 * accel7to11 * Math.pow(1.8, accelLevels) * Math.pow(2, level - 6);
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
