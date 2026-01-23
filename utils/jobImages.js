/**
 * 직업별 이미지 URL 관리
 * 46개 직업 이미지 (미리 생성된 이미지 사용)
 *
 * 이미지 호스팅: ImgBB 또는 Cloudinary 사용 권장
 * 이미지 사이즈: 256x256 픽셀
 * 스타일: 귀여운 치비 애니메이션 캐릭터
 */

// 이미지 베이스 URL (호스팅 서비스에 맞게 변경)
// ImgBB 예시: 'https://i.ibb.co/'
// Cloudinary 예시: 'https://res.cloudinary.com/your-cloud/image/upload/'
// GitHub Raw 예시: 'https://raw.githubusercontent.com/username/repo/main/images/'
const IMAGE_BASE_URL = process.env.JOB_IMAGE_BASE_URL || '/images/jobs/';

/**
 * 직업별 이미지 파일명
 * 키: 직업명, 값: 이미지 파일명
 */
const JOB_IMAGES = {
  // ========== 일반 (Common) - 12개 ==========
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

  // ========== 고급 (Uncommon) - 14개 ==========
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

  // ========== 희귀 (Rare) - 12개 ==========
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

  // ========== 전설 (Legendary) - 8개 ==========
  '용사': 'hero.webp',
  '대마법사': 'archmage.webp',
  '연금술사': 'alchemist.webp',
  '용병': 'mercenary.webp',
  '암살자': 'assassin.webp',
  '현자': 'sage.webp',
  '드래곤슬레이어': 'dragon_slayer.webp',
  '대부호': 'billionaire.webp'
};

/**
 * 등급별 CSS 클래스
 */
const GRADE_CSS_CLASSES = {
  common: 'grade-common',
  uncommon: 'grade-uncommon',
  rare: 'grade-rare',
  legendary: 'grade-legendary'
};

/**
 * 등급별 인라인 스타일 (카카오톡 호환)
 */
const GRADE_INLINE_STYLES = {
  common: 'border: 3px solid #808080; border-radius: 12px;',
  uncommon: 'border: 3px solid #22c55e; border-radius: 12px; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);',
  rare: 'border: 3px solid #3b82f6; border-radius: 12px; box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);',
  legendary: 'border: 4px solid #f59e0b; border-radius: 12px; box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);'
};

/**
 * 레벨별 CSS 클래스
 */
function getLevelClass(level) {
  if (level >= 13) return 'level-max';
  if (level >= 10) return 'level-high';
  if (level >= 5) return 'level-mid';
  return 'level-low';
}

/**
 * 직업 이미지 URL 가져오기
 * @param {string} jobName - 직업 이름
 * @returns {string} 이미지 URL
 */
function getJobImageUrl(jobName) {
  const filename = JOB_IMAGES[jobName];
  if (!filename) {
    // 없는 직업은 기본 이미지
    return `${IMAGE_BASE_URL}default.webp`;
  }
  return `${IMAGE_BASE_URL}${filename}`;
}

/**
 * 직업 이미지 + 등급 스타일 정보 가져오기
 * @param {string} jobName - 직업 이름
 * @param {string} grade - 직업 등급
 * @param {number} level - 현재 레벨
 * @returns {Object} 이미지 URL과 스타일 정보
 */
function getJobImageWithStyle(jobName, grade = 'common', level = 0) {
  return {
    url: getJobImageUrl(jobName),
    cssClass: `job-card ${GRADE_CSS_CLASSES[grade] || ''} ${getLevelClass(level)}`,
    inlineStyle: GRADE_INLINE_STYLES[grade] || GRADE_INLINE_STYLES.common,
    grade,
    level
  };
}

/**
 * 모든 직업 이미지 목록 (도감용)
 */
function getAllJobImages() {
  return Object.entries(JOB_IMAGES).map(([name, filename]) => ({
    name,
    url: `${IMAGE_BASE_URL}${filename}`
  }));
}

/**
 * 직업 이미지 존재 여부 확인
 */
function hasJobImage(jobName) {
  return JOB_IMAGES.hasOwnProperty(jobName);
}

module.exports = {
  IMAGE_BASE_URL,
  JOB_IMAGES,
  GRADE_CSS_CLASSES,
  GRADE_INLINE_STYLES,
  getJobImageUrl,
  getJobImageWithStyle,
  getAllJobImages,
  hasJobImage,
  getLevelClass
};
