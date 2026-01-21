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
  '회사원': 'office_worker.png',
  '공무원': 'government_worker.png',
  '알바생': 'part_timer.png',
  '백수': 'unemployed.png',
  '학생': 'student.png',
  '농부': 'farmer.png',
  '상인': 'merchant.png',
  '운전기사': 'driver.png',
  '청소부': 'cleaner.png',
  '경비원': 'security_guard.png',
  '배달원': 'delivery_rider.png',
  '점원': 'store_clerk.png',

  // ========== 고급 (Uncommon) - 14개 ==========
  '요리사': 'chef.png',
  '개발자': 'developer.png',
  '디자이너': 'designer.png',
  '건축가': 'architect.png',
  '가수': 'singer.png',
  '배우': 'actor.png',
  '화가': 'painter.png',
  '운동선수': 'athlete.png',
  '전사': 'warrior.png',
  '궁수': 'archer.png',
  '사진작가': 'photographer.png',
  '작가': 'writer.png',
  '유튜버': 'youtuber.png',
  '스트리머': 'streamer.png',

  // ========== 희귀 (Rare) - 12개 ==========
  '의사': 'doctor.png',
  '변호사': 'lawyer.png',
  '교수': 'professor.png',
  '연구원': 'researcher.png',
  '마법사': 'wizard.png',
  '기사': 'knight.png',
  '탐정': 'detective.png',
  '모험가': 'adventurer.png',
  '파일럿': 'pilot.png',
  '외교관': 'diplomat.png',
  '프로게이머': 'pro_gamer.png',
  '사업가': 'businessman.png',

  // ========== 전설 (Legendary) - 8개 ==========
  '용사': 'hero.png',
  '대마법사': 'archmage.png',
  '연금술사': 'alchemist.png',
  '용병': 'mercenary.png',
  '암살자': 'assassin.png',
  '현자': 'sage.png',
  '드래곤슬레이어': 'dragon_slayer.png',
  '대부호': 'billionaire.png'
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
    return `${IMAGE_BASE_URL}default.png`;
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
