/**
 * 이미지 URL 관리
 * 우선순위: 1. 미리 생성된 정적 이미지 → 2. DiceBear 폴백
 * 레벨과 등급에 따라 더 화려한 이미지 생성
 */

// 정적 이미지 베이스 URL (환경변수 또는 로컬)
const STATIC_IMAGE_BASE = process.env.JOB_IMAGE_BASE_URL || '/images/jobs/';

// DiceBear 픽셀 아트 스타일 (폴백용)
const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/pixel-art/png';

// 정적 이미지 사용 여부 (이미지가 준비되면 true로 변경)
const USE_STATIC_IMAGES = process.env.USE_STATIC_IMAGES === 'true';

// 직업별 정적 이미지 파일명
const STATIC_JOB_IMAGES = {
  // 일반 (Common)
  '회사원': 'office_worker.webp',
  '공무원': 'government_worker.webp',
  '알바생': 'part_timer.webp',
  '백수': 'unemployed.webp',
  '학생': 'student.webp',
  '농부': 'farmer.webp',
  '상인': 'merchant.webp',
  '운전기사': 'driver.webp',
  '청소부': 'cleaner.webp',
  '경비원': 'security_guard.webp',
  '배달원': 'delivery_rider.webp',
  '점원': 'store_clerk.webp',
  // 고급 (Uncommon)
  '요리사': 'chef.webp',
  '개발자': 'developer.webp',
  '디자이너': 'designer.webp',
  '건축가': 'architect.webp',
  '가수': 'singer.webp',
  '배우': 'actor.webp',
  '화가': 'painter.webp',
  '운동선수': 'athlete.webp',
  '전사': 'warrior.webp',
  '궁수': 'archer.webp',
  '사진작가': 'photographer.webp',
  '작가': 'writer.webp',
  '유튜버': 'youtuber.webp',
  '스트리머': 'streamer.webp',
  // 희귀 (Rare)
  '의사': 'doctor.webp',
  '변호사': 'lawyer.webp',
  '교수': 'professor.webp',
  '연구원': 'researcher.webp',
  '마법사': 'wizard.webp',
  '기사': 'knight.webp',
  '탐정': 'detective.webp',
  '모험가': 'adventurer.webp',
  '파일럿': 'pilot.webp',
  '외교관': 'diplomat.webp',
  '프로게이머': 'pro_gamer.webp',
  '사업가': 'businessman.webp',
  // 전설 (Legendary)
  '용사': 'hero.webp',
  '대마법사': 'archmage.webp',
  '연금술사': 'alchemist.webp',
  '용병': 'mercenary.webp',
  '암살자': 'assassin.webp',
  '현자': 'sage.webp',
  '드래곤슬레이어': 'dragon_slayer.webp',
  '대부호': 'billionaire.webp',
  // 동물 (Animal)
  '강아지': 'puppy.webp',
  '고양이': 'cat.webp',
  '토끼': 'bunny.webp',
  '햄스터': 'hamster.webp',
  '펭귄': 'penguin.webp',
  '판다': 'panda.webp',
  '여우': 'fox.webp',
  '곰': 'bear.webp',
  '늑대': 'wolf.webp',
  '사자': 'lion.webp',
  '도마뱀': 'lizard.webp'
};

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
  '청소부': 'cleaner_broom',
  '경비원': 'security_guard',
  '배달원': 'delivery_rider',
  '점원': 'store_clerk',

  // 기술직
  '요리사': 'chef_hat_white',
  '개발자': 'developer_glasses',
  '디자이너': 'designer_creative',
  '건축가': 'architect_helmet',
  '사진작가': 'photographer_camera',
  '작가': 'writer_pen',

  // 예체능
  '가수': 'singer_microphone',
  '배우': 'actor_star',
  '화가': 'painter_brush',
  '운동선수': 'athlete_medal',
  '유튜버': 'youtuber_video',
  '스트리머': 'streamer_gaming',

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
  '파일럿': 'pilot_plane',
  '외교관': 'diplomat_flag',
  '프로게이머': 'progamer_trophy',
  '사업가': 'businessman_money',

  // 특수직
  '탐정': 'detective_magnifier',
  '모험가': 'adventurer_backpack',
  '용사': 'hero_legendary_sword',
  '대마법사': 'archmage_ancient_power',
  '연금술사': 'alchemist_potion',
  '용병': 'mercenary_battle',
  '암살자': 'assassin_shadow',
  '현자': 'sage_wisdom',
  '드래곤슬레이어': 'dragonslayer_epic',
  '대부호': 'billionaire_rich',

  // 동물
  '강아지': 'puppy_cute_dog',
  '고양이': 'cat_cute_kitty',
  '토끼': 'bunny_cute_rabbit',
  '햄스터': 'hamster_cute_chubby',
  '펭귄': 'penguin_cute_tuxedo',
  '판다': 'panda_cute_bamboo',
  '여우': 'fox_cute_orange',
  '곰': 'bear_cute_brown',
  '늑대': 'wolf_cute_gray',
  '사자': 'lion_cute_mane',
  '도마뱀': 'lizard_cute_green'
};

// 상태별 시드 (DiceBear 폴백용)
const STATUS_SEEDS = {
  success: 'success_sparkle_green',
  fail: 'fail_broken_gray',
  death: 'death_skull_dark',
  sell: 'sell_gold_coins',
  reroll: 'reroll_dice_random'
};

// 상태별 정적 이미지 파일명
const STATIC_STATUS_IMAGES = {
  death: 'death.webp',
  sell: 'sell.webp',
  fail: 'fail.webp'
};

// 등급별 배경색 (기본)
const GRADE_BACKGROUNDS = {
  common: 'b6b6b6',      // 회색
  uncommon: '4ade80',    // 초록
  rare: '60a5fa',        // 파랑
  epic: 'c084fc',        // 보라
  legendary: 'fbbf24'    // 금색
};

// 레벨별 배경 그라데이션 효과 (레벨이 높을수록 화려함)
const LEVEL_EFFECTS = {
  low: { scale: 100, radius: 0 },      // 0-4
  mid: { scale: 110, radius: 10 },     // 5-9
  high: { scale: 120, radius: 20 },    // 10-12
  max: { scale: 130, radius: 30 }      // 13-15
};

// 칭호 등급별 추가 효과
const TITLE_GRADE_EFFECTS = {
  common: '',
  uncommon: '&accessories=variant01',
  rare: '&accessories=variant02&accessoriesProbability=100',
  epic: '&accessories=variant03&accessoriesProbability=100',
  legendary: '&accessories=variant04&accessoriesProbability=100'
};

/**
 * 레벨에 따른 효과 가져오기
 */
function getLevelEffect(level) {
  if (level >= 13) return LEVEL_EFFECTS.max;
  if (level >= 10) return LEVEL_EFFECTS.high;
  if (level >= 5) return LEVEL_EFFECTS.mid;
  return LEVEL_EFFECTS.low;
}

/**
 * 레벨에 따른 배경색 조정 (높을수록 더 진하고 화려함)
 */
function getEnhancedBackground(baseColor, level) {
  // 레벨에 따라 배경색 변형
  if (level >= 13) {
    // 최고 레벨: 금빛 테두리 효과
    return 'ffd700';
  } else if (level >= 10) {
    // 높은 레벨: 더 진한 색상
    return baseColor;
  } else if (level >= 5) {
    // 중간 레벨: 약간 밝게
    return baseColor;
  }
  return baseColor;
}

/**
 * 정적 이미지 URL 가져오기 (이미지가 준비된 경우)
 * @param {string} jobName - 직업 이름
 * @returns {string|null} 정적 이미지 URL 또는 null
 */
function getStaticJobImage(jobName) {
  if (!USE_STATIC_IMAGES) return null;

  const filename = STATIC_JOB_IMAGES[jobName];
  if (filename) {
    return `${STATIC_IMAGE_BASE}${filename}`;
  }
  return null;
}

/**
 * 직업 이미지 URL 생성 (레벨과 등급 반영)
 * @param {string} jobName - 직업 이름
 * @param {string} jobGrade - 직업 등급
 * @param {number} level - 현재 레벨
 * @param {string} titleGrade - 칭호 등급
 * @returns {string} 이미지 URL
 */
function getJobImage(jobName, jobGrade = 'common', level = 0, titleGrade = 'common') {
  // 정적 이미지가 있으면 우선 사용
  const staticImage = getStaticJobImage(jobName);
  if (staticImage) {
    return staticImage;
  }

  // 폴백: DiceBear API 사용
  const seed = JOB_SEEDS[jobName] || jobName;
  const baseBgColor = GRADE_BACKGROUNDS[jobGrade] || GRADE_BACKGROUNDS.common;
  const bgColor = getEnhancedBackground(baseBgColor, level);
  const levelEffect = getLevelEffect(level);
  const titleEffect = TITLE_GRADE_EFFECTS[titleGrade] || '';

  // 레벨에 따른 시드 변형 (레벨이 붙으면 약간 다른 이미지)
  const enhancedSeed = `${seed}_lv${level}`;

  let url = `${DICEBEAR_BASE}?seed=${encodeURIComponent(enhancedSeed)}`;
  url += `&backgroundColor=${bgColor}`;
  url += `&scale=${levelEffect.scale}`;
  url += `&size=256`;

  // 높은 레벨은 둥근 모서리
  if (levelEffect.radius > 0) {
    url += `&radius=${levelEffect.radius}`;
  }

  // 칭호 등급에 따른 악세사리
  url += titleEffect;

  return url;
}

/**
 * 상태 이미지 URL 생성
 * @param {string} status - 상태 (success, fail, death, sell, reroll)
 * @param {number} level - 현재 레벨 (성공 시 더 화려하게)
 * @returns {string} 이미지 URL
 */
function getStatusImage(status, level = 0) {
  // 정적 이미지가 있으면 우선 사용
  if (USE_STATIC_IMAGES && STATIC_STATUS_IMAGES[status]) {
    return `${STATIC_IMAGE_BASE}${STATIC_STATUS_IMAGES[status]}`;
  }

  // 폴백: DiceBear API 사용
  const seed = STATUS_SEEDS[status] || status;

  // 상태별 배경색
  const bgColors = {
    success: level >= 10 ? 'ffd700' : (level >= 5 ? '22c55e' : '4ade80'),
    fail: 'ef4444',
    death: '1f2937',
    sell: level >= 10 ? 'ffd700' : 'f59e0b',
    reroll: 'a855f7'
  };

  const bgColor = bgColors[status] || 'cccccc';
  const levelEffect = getLevelEffect(level);

  let url = `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}_${level}`;
  url += `&backgroundColor=${bgColor}`;
  url += `&scale=${levelEffect.scale}`;
  url += `&size=256`;

  return url;
}

/**
 * 등급별 색상 코드
 * @param {string} grade - 등급
 * @returns {string} 색상 코드
 */
function getGradeColor(grade) {
  const colors = {
    common: '#808080',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };
  return colors[grade] || colors.common;
}

/**
 * 등급별 인라인 CSS 스타일 (카카오톡 호환)
 */
const GRADE_INLINE_STYLES = {
  common: 'border: 3px solid #808080; border-radius: 12px;',
  uncommon: 'border: 3px solid #22c55e; border-radius: 12px; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);',
  rare: 'border: 3px solid #3b82f6; border-radius: 12px; box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);',
  legendary: 'border: 4px solid #f59e0b; border-radius: 12px; box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);'
};

/**
 * 등급별 인라인 스타일 가져오기
 * @param {string} grade - 등급
 * @returns {string} 인라인 CSS 스타일
 */
function getGradeInlineStyle(grade) {
  return GRADE_INLINE_STYLES[grade] || GRADE_INLINE_STYLES.common;
}

/**
 * 이미지 URL + 스타일 정보 함께 가져오기
 * @param {string} jobName - 직업 이름
 * @param {string} jobGrade - 직업 등급
 * @param {number} level - 현재 레벨
 * @param {string} titleGrade - 칭호 등급
 * @returns {Object} 이미지 URL과 스타일 정보
 */
function getJobImageWithStyle(jobName, jobGrade = 'common', level = 0, titleGrade = 'common') {
  return {
    url: getJobImage(jobName, jobGrade, level, titleGrade),
    inlineStyle: getGradeInlineStyle(jobGrade),
    isStatic: USE_STATIC_IMAGES && !!STATIC_JOB_IMAGES[jobName],
    grade: jobGrade,
    level
  };
}

module.exports = {
  getJobImage,
  getStatusImage,
  getGradeColor,
  getStaticJobImage,
  getGradeInlineStyle,
  getJobImageWithStyle,
  JOB_SEEDS,
  STATUS_SEEDS,
  GRADE_BACKGROUNDS,
  GRADE_INLINE_STYLES,
  STATIC_JOB_IMAGES,
  USE_STATIC_IMAGES
};
