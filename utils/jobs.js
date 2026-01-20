/**
 * 직업(접미 수식어) 데이터 및 관련 함수
 */

const JOB_GRADES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  LEGENDARY: 'legendary'
};

const JOB_CATEGORIES = {
  OFFICE: 'office',
  PROFESSIONAL: 'professional',
  TECHNICAL: 'technical',
  ENTERTAINMENT: 'entertainment',
  FANTASY: 'fantasy',
  SPECIAL: 'special'
};

const GRADE_KOREAN = {
  [JOB_GRADES.COMMON]: '일반',
  [JOB_GRADES.UNCOMMON]: '고급',
  [JOB_GRADES.RARE]: '희귀',
  [JOB_GRADES.LEGENDARY]: '전설'
};

const GRADE_EMOJI = {
  [JOB_GRADES.COMMON]: '',
  [JOB_GRADES.UNCOMMON]: '🔹',
  [JOB_GRADES.RARE]: '✨',
  [JOB_GRADES.LEGENDARY]: '🌟'
};

// 직업 목록
const JOBS = [
  // 일반 (50%) - 일반직
  { name: '회사원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '공무원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '알바생', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '백수', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '학생', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '농부', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '상인', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '운전기사', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },

  // 고급 (30%) - 기술직/예체능
  { name: '요리사', category: JOB_CATEGORIES.TECHNICAL, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '개발자', category: JOB_CATEGORIES.TECHNICAL, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '디자이너', category: JOB_CATEGORIES.TECHNICAL, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '건축가', category: JOB_CATEGORIES.TECHNICAL, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '가수', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '배우', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '화가', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '운동선수', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '전사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '궁수', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },

  // 희귀 (15%) - 전문직/판타지
  { name: '의사', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '변호사', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '교수', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '연구원', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '마법사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '기사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '탐정', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '모험가', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },

  // 전설 (5%) - 특수직
  { name: '용사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '대마법사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '연금술사', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '용병', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '암살자', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '현자', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 }
];

// 등급별 확률
const GRADE_PROBABILITIES = {
  [JOB_GRADES.COMMON]: 50,
  [JOB_GRADES.UNCOMMON]: 30,
  [JOB_GRADES.RARE]: 15,
  [JOB_GRADES.LEGENDARY]: 5
};

// 레벨별 직업 수식어
const LEVEL_PREFIXES = [
  { minLevel: 0, maxLevel: 0, prefix: '수습' },
  { minLevel: 1, maxLevel: 3, prefix: '견습' },
  { minLevel: 4, maxLevel: 6, prefix: '' },
  { minLevel: 7, maxLevel: 9, prefix: '숙련' },
  { minLevel: 10, maxLevel: 12, prefix: '베테랑' },
  { minLevel: 13, maxLevel: 14, prefix: '마스터' },
  { minLevel: 15, maxLevel: 15, prefix: '그랜드마스터' }
];

/**
 * 랜덤 직업 뽑기
 * @returns {Object} { name, category, grade, bonusRate }
 */
function rollJob() {
  const roll = Math.random() * 100;
  let selectedGrade;
  let cumulative = 0;

  for (const [grade, probability] of Object.entries(GRADE_PROBABILITIES)) {
    cumulative += probability;
    if (roll < cumulative) {
      selectedGrade = grade;
      break;
    }
  }

  const jobsOfGrade = JOBS.filter(j => j.grade === selectedGrade);
  const randomIndex = Math.floor(Math.random() * jobsOfGrade.length);

  return { ...jobsOfGrade[randomIndex] };
}

/**
 * 레벨에 따른 직업 수식어 가져오기
 * @param {number} level - 현재 레벨
 * @returns {string} 직업 수식어
 */
function getJobPrefix(level) {
  const prefixData = LEVEL_PREFIXES.find(
    p => level >= p.minLevel && level <= p.maxLevel
  );
  return prefixData ? prefixData.prefix : '';
}

/**
 * 전체 직업명 가져오기 (수식어 포함)
 * @param {string} jobName - 직업 이름
 * @param {number} level - 현재 레벨
 * @returns {string} 전체 직업명
 */
function getFullJobName(jobName, level) {
  const prefix = getJobPrefix(level);
  return prefix ? `${prefix} ${jobName}` : jobName;
}

/**
 * 직업 정보 포맷팅
 * @param {Object} job - 직업 객체
 * @returns {string} 포맷된 문자열
 */
function formatJobInfo(job) {
  const gradeKorean = GRADE_KOREAN[job.grade];
  const bonusPercent = Math.round(job.bonusRate * 100);
  const emoji = GRADE_EMOJI[job.grade];

  return `${job.name} (${gradeKorean} +${bonusPercent}%) ${emoji}`.trim();
}

module.exports = {
  JOB_GRADES,
  JOB_CATEGORIES,
  GRADE_KOREAN,
  GRADE_EMOJI,
  JOBS,
  GRADE_PROBABILITIES,
  LEVEL_PREFIXES,
  rollJob,
  getJobPrefix,
  getFullJobName,
  formatJobInfo
};
