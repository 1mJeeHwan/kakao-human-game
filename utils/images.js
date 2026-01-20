/**
 * 이미지 URL 관리
 * DiceBear API로 픽셀 아트 스타일 아바타 생성
 */

// DiceBear 픽셀 아트 스타일 (무료, URL만으로 생성)
const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/pixel-art/png';

// 직업별 시드 (일관된 이미지 생성)
const JOB_SEEDS = {
  // 일반직
  '회사원': 'office_worker_suit',
  '공무원': 'government_official',
  '알바생': 'parttime_apron',
  '백수': 'unemployed_lazy',
  '학생': 'student_book',
  '농부': 'farmer_hat',
  '상인': 'merchant_gold',
  '운전기사': 'driver_cap',

  // 기술직
  '요리사': 'chef_hat_white',
  '개발자': 'developer_glasses',
  '디자이너': 'designer_creative',
  '건축가': 'architect_helmet',

  // 예체능
  '가수': 'singer_microphone',
  '배우': 'actor_star',
  '화가': 'painter_brush',
  '운동선수': 'athlete_medal',

  // 판타지
  '전사': 'warrior_sword_shield',
  '궁수': 'archer_bow_arrow',
  '마법사': 'wizard_magic_staff',
  '기사': 'knight_armor_horse',

  // 전문직
  '의사': 'doctor_stethoscope',
  '변호사': 'lawyer_justice',
  '교수': 'professor_graduate',
  '연구원': 'researcher_lab',

  // 특수직
  '탐정': 'detective_magnifier',
  '모험가': 'adventurer_backpack',
  '용사': 'hero_legendary_sword',
  '대마법사': 'archmage_ancient_power',
  '연금술사': 'alchemist_potion',
  '용병': 'mercenary_battle',
  '암살자': 'assassin_shadow',
  '현자': 'sage_wisdom'
};

// 상태별 시드
const STATUS_SEEDS = {
  success: 'success_sparkle_green',
  fail: 'fail_broken_gray',
  death: 'death_skull_dark',
  sell: 'sell_gold_coins',
  reroll: 'reroll_dice_random'
};

// 등급별 배경색 (DiceBear 파라미터)
const GRADE_BACKGROUNDS = {
  common: 'b0b0b0',      // 회색
  uncommon: '2ecc71',    // 초록
  rare: '3498db',        // 파랑
  epic: '9b59b6',        // 보라
  legendary: 'f39c12'    // 금색
};

/**
 * 직업 이미지 URL 생성
 * @param {string} jobName - 직업 이름
 * @param {string} grade - 등급 (optional)
 * @returns {string} 이미지 URL
 */
function getJobImage(jobName, grade = 'common') {
  const seed = JOB_SEEDS[jobName] || jobName;
  const bgColor = GRADE_BACKGROUNDS[grade] || GRADE_BACKGROUNDS.common;
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColor}&size=256`;
}

/**
 * 상태 이미지 URL 생성
 * @param {string} status - 상태 (success, fail, death, sell, reroll)
 * @returns {string} 이미지 URL
 */
function getStatusImage(status) {
  const seed = STATUS_SEEDS[status] || status;

  // 상태별 배경색
  const bgColors = {
    success: '2ecc71',
    fail: 'e74c3c',
    death: '2c3e50',
    sell: 'f39c12',
    reroll: '9b59b6'
  };

  const bgColor = bgColors[status] || 'cccccc';
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColor}&size=256`;
}

/**
 * 등급별 색상 코드
 * @param {string} grade - 등급
 * @returns {string} 색상 코드
 */
function getGradeColor(grade) {
  const colors = {
    common: '#808080',
    uncommon: '#2ecc71',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12'
  };
  return colors[grade] || colors.common;
}

module.exports = {
  getJobImage,
  getStatusImage,
  getGradeColor,
  JOB_SEEDS,
  STATUS_SEEDS,
  GRADE_BACKGROUNDS
};
