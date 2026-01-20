/**
 * 게임 로직 테스트
 * 실행: npm test
 */

const { rollTitle, TITLE_GRADES } = require('../utils/titles');
const { rollJob, getJobPrefix, getFullJobName, JOB_GRADES } = require('../utils/jobs');
const {
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  getTitleRerollCost,
  getJobRerollCost,
  formatGold
} = require('../utils/gameConfig');

// 테스트 결과 카운터
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   오류: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertApprox(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(message || `Expected ~${expected}, got ${actual} (diff: ${diff})`);
  }
}

console.log('========================================');
console.log('인간 키우기 게임 테스트');
console.log('========================================\n');

// ==================== 칭호 테스트 ====================
console.log('--- 칭호 시스템 테스트 ---');

test('칭호 롤 - 유효한 칭호 반환', () => {
  const title = rollTitle();
  assert(title.name, '칭호 이름이 없습니다');
  assert(title.grade, '칭호 등급이 없습니다');
  assert(typeof title.bonusRate === 'number', 'bonusRate가 숫자가 아닙니다');
});

test('칭호 확률 검증 (10000회 시뮬레이션)', () => {
  const results = {
    [TITLE_GRADES.COMMON]: 0,
    [TITLE_GRADES.UNCOMMON]: 0,
    [TITLE_GRADES.RARE]: 0,
    [TITLE_GRADES.EPIC]: 0,
    [TITLE_GRADES.LEGENDARY]: 0
  };

  for (let i = 0; i < 10000; i++) {
    const title = rollTitle();
    results[title.grade]++;
  }

  // 허용 오차 5%
  assertApprox(results[TITLE_GRADES.COMMON], 4000, 500, '일반 칭호 확률 오류');
  assertApprox(results[TITLE_GRADES.UNCOMMON], 3000, 500, '고급 칭호 확률 오류');
  assertApprox(results[TITLE_GRADES.RARE], 2000, 500, '희귀 칭호 확률 오류');
  assertApprox(results[TITLE_GRADES.EPIC], 800, 300, '영웅 칭호 확률 오류');
  assertApprox(results[TITLE_GRADES.LEGENDARY], 200, 100, '전설 칭호 확률 오류');

  console.log(`   일반: ${results[TITLE_GRADES.COMMON]} (예상: 4000)`);
  console.log(`   고급: ${results[TITLE_GRADES.UNCOMMON]} (예상: 3000)`);
  console.log(`   희귀: ${results[TITLE_GRADES.RARE]} (예상: 2000)`);
  console.log(`   영웅: ${results[TITLE_GRADES.EPIC]} (예상: 800)`);
  console.log(`   전설: ${results[TITLE_GRADES.LEGENDARY]} (예상: 200)`);
});

// ==================== 직업 테스트 ====================
console.log('\n--- 직업 시스템 테스트 ---');

test('직업 롤 - 유효한 직업 반환', () => {
  const job = rollJob();
  assert(job.name, '직업 이름이 없습니다');
  assert(job.grade, '직업 등급이 없습니다');
  assert(job.category, '직업 카테고리가 없습니다');
  assert(typeof job.bonusRate === 'number', 'bonusRate가 숫자가 아닙니다');
});

test('직업 확률 검증 (10000회 시뮬레이션)', () => {
  const results = {
    [JOB_GRADES.COMMON]: 0,
    [JOB_GRADES.UNCOMMON]: 0,
    [JOB_GRADES.RARE]: 0,
    [JOB_GRADES.LEGENDARY]: 0
  };

  for (let i = 0; i < 10000; i++) {
    const job = rollJob();
    results[job.grade]++;
  }

  // 허용 오차 5%
  assertApprox(results[JOB_GRADES.COMMON], 5000, 500, '일반 직업 확률 오류');
  assertApprox(results[JOB_GRADES.UNCOMMON], 3000, 500, '고급 직업 확률 오류');
  assertApprox(results[JOB_GRADES.RARE], 1500, 400, '희귀 직업 확률 오류');
  assertApprox(results[JOB_GRADES.LEGENDARY], 500, 200, '전설 직업 확률 오류');

  console.log(`   일반: ${results[JOB_GRADES.COMMON]} (예상: 5000)`);
  console.log(`   고급: ${results[JOB_GRADES.UNCOMMON]} (예상: 3000)`);
  console.log(`   희귀: ${results[JOB_GRADES.RARE]} (예상: 1500)`);
  console.log(`   전설: ${results[JOB_GRADES.LEGENDARY]} (예상: 500)`);
});

test('레벨별 직업 수식어', () => {
  assert(getJobPrefix(0) === '수습', 'level 0 수식어 오류');
  assert(getJobPrefix(1) === '견습', 'level 1 수식어 오류');
  assert(getJobPrefix(3) === '견습', 'level 3 수식어 오류');
  assert(getJobPrefix(4) === '', 'level 4 수식어 오류');
  assert(getJobPrefix(6) === '', 'level 6 수식어 오류');
  assert(getJobPrefix(7) === '숙련', 'level 7 수식어 오류');
  assert(getJobPrefix(10) === '베테랑', 'level 10 수식어 오류');
  assert(getJobPrefix(13) === '마스터', 'level 13 수식어 오류');
  assert(getJobPrefix(15) === '그랜드마스터', 'level 15 수식어 오류');
});

test('전체 직업명 생성', () => {
  assert(getFullJobName('요리사', 0) === '수습 요리사', 'level 0 전체 직업명 오류');
  assert(getFullJobName('요리사', 5) === '요리사', 'level 5 전체 직업명 오류');
  assert(getFullJobName('마법사', 15) === '그랜드마스터 마법사', 'level 15 전체 직업명 오류');
});

// ==================== 강화 시스템 테스트 ====================
console.log('\n--- 강화 시스템 테스트 ---');

test('강화 정보 조회', () => {
  const info0 = getUpgradeInfo(0);
  assert(info0.success === 100, 'level 0 성공률 오류');
  assert(info0.death === 0, 'level 0 사망률 오류');
  assert(info0.cost === 100, 'level 0 비용 오류');

  const info7 = getUpgradeInfo(7);
  assert(info7.success === 60, 'level 7 성공률 오류');
  assert(info7.death === 15, 'level 7 사망률 오류');
  assert(info7.cost === 5000, 'level 7 비용 오류');

  const info14 = getUpgradeInfo(14);
  assert(info14.success === 3, 'level 14 성공률 오류');
  assert(info14.death === 70, 'level 14 사망률 오류');

  const info15 = getUpgradeInfo(15);
  assert(info15 === null, 'level 15는 null이어야 함');
});

test('강화 확률 검증 - level 0 (10000회)', () => {
  let success = 0;
  let death = 0;
  let fail = 0;

  for (let i = 0; i < 10000; i++) {
    const result = calculateUpgradeResult(0);
    if (result === 'success') success++;
    else if (result === 'death') death++;
    else fail++;
  }

  assert(success >= 9900, `level 0 성공률 오류: ${success}/10000`);
  assert(death === 0, `level 0 사망 발생: ${death}`);
});

test('강화 확률 검증 - level 7 (10000회)', () => {
  let success = 0;
  let death = 0;
  let fail = 0;

  for (let i = 0; i < 10000; i++) {
    const result = calculateUpgradeResult(7);
    if (result === 'success') success++;
    else if (result === 'death') death++;
    else fail++;
  }

  // 예상: 성공 60%, 사망 15%, 실패 25%
  assertApprox(success, 6000, 500, `level 7 성공률 오류: ${success}`);
  assertApprox(death, 1500, 400, `level 7 사망률 오류: ${death}`);
  assertApprox(fail, 2500, 500, `level 7 실패율 오류: ${fail}`);

  console.log(`   성공: ${success} (예상: 6000)`);
  console.log(`   사망: ${death} (예상: 1500)`);
  console.log(`   실패: ${fail} (예상: 2500)`);
});

// ==================== 판매 가격 테스트 ====================
console.log('\n--- 판매 가격 테스트 ---');

test('기본 판매 가격 계산', () => {
  assert(getSellPrice(0, 0, 0) === 0, 'level 0 판매가 오류');
  assert(getSellPrice(1, 0, 0) === 2000, 'level 1 판매가 오류');
  assert(getSellPrice(5, 0, 0) === 32000, 'level 5 판매가 오류');
  assert(getSellPrice(10, 0, 0) === 1024000, 'level 10 판매가 오류');
  assert(getSellPrice(15, 0, 0) === 32768000, 'level 15 판매가 오류');
});

test('수식어 보너스 판매 가격', () => {
  // level 10 + 전설 칭호(100%) + 전설 직업(60%) = 기본가 * 2.6
  const price = getSellPrice(10, 1.0, 0.6);
  assert(price === 2662400, `전설+전설 조합 판매가 오류: ${price}`);

  // level 10 + 희귀 칭호(25%) + 희귀 직업(30%) = 기본가 * 1.55
  const price2 = getSellPrice(10, 0.25, 0.3);
  assert(price2 === 1587200, `희귀+희귀 조합 판매가 오류: ${price2}`);
});

// ==================== 리롤 비용 테스트 ====================
console.log('\n--- 리롤 비용 테스트 ---');

test('칭호 리롤 비용', () => {
  assert(getTitleRerollCost(0) === 3000, 'level 0 칭호 리롤 비용 오류');
  assert(getTitleRerollCost(5) === 5500, 'level 5 칭호 리롤 비용 오류');
  assert(getTitleRerollCost(10) === 8000, 'level 10 칭호 리롤 비용 오류');
  assert(getTitleRerollCost(15) === 10500, 'level 15 칭호 리롤 비용 오류');
});

test('직업 리롤 비용', () => {
  assert(getJobRerollCost(0) === 5000, 'level 0 직업 리롤 비용 오류');
  assert(getJobRerollCost(5) === 10000, 'level 5 직업 리롤 비용 오류');
  assert(getJobRerollCost(10) === 15000, 'level 10 직업 리롤 비용 오류');
  assert(getJobRerollCost(15) === 20000, 'level 15 직업 리롤 비용 오류');
});

// ==================== 유틸리티 테스트 ====================
console.log('\n--- 유틸리티 테스트 ---');

test('골드 포맷팅', () => {
  assert(formatGold(1000) === '1,000G', '1000 포맷 오류');
  assert(formatGold(1000000) === '1,000,000G', '1000000 포맷 오류');
  assert(formatGold(32768000) === '32,768,000G', '32768000 포맷 오류');
});

// ==================== 결과 출력 ====================
console.log('\n========================================');
console.log(`테스트 결과: ${passed}개 통과, ${failed}개 실패`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
}
