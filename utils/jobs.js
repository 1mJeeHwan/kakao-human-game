/**
 * 직업(접미 수식어) 데이터 및 관련 함수
 * 진화 가능한 직업 + 직업 상실 시스템
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
  SPECIAL: 'special',
  UNEMPLOYED: 'unemployed'
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

// 직업 목록 (총 50개+)
const JOBS = [
  // ========== 일반 (50%) ==========
  // 일반직
  { name: '회사원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '공무원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '알바생', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '백수', category: JOB_CATEGORIES.UNEMPLOYED, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '학생', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '농부', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '상인', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '운전기사', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '청소부', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '경비원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '배달원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },
  { name: '점원', category: JOB_CATEGORIES.OFFICE, grade: JOB_GRADES.COMMON, bonusRate: 0 },

  // ========== 고급 (30%) ==========
  // 기술직/예체능
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
  { name: '사진작가', category: JOB_CATEGORIES.TECHNICAL, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '작가', category: JOB_CATEGORIES.TECHNICAL, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '유튜버', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },
  { name: '스트리머', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.UNCOMMON, bonusRate: 0.15 },

  // ========== 희귀 (15%) ==========
  // 전문직/판타지
  { name: '의사', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '변호사', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '교수', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '연구원', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '마법사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '기사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '탐정', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '모험가', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '파일럿', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '외교관', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '프로게이머', category: JOB_CATEGORIES.ENTERTAINMENT, grade: JOB_GRADES.RARE, bonusRate: 0.3 },
  { name: '사업가', category: JOB_CATEGORIES.PROFESSIONAL, grade: JOB_GRADES.RARE, bonusRate: 0.3 },

  // ========== 전설 (5%) ==========
  // 특수직
  { name: '용사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '대마법사', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '연금술사', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '용병', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '암살자', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '현자', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '드래곤슬레이어', category: JOB_CATEGORIES.FANTASY, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 },
  { name: '대부호', category: JOB_CATEGORIES.SPECIAL, grade: JOB_GRADES.LEGENDARY, bonusRate: 0.6 }
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

// 직업 상실 확률 (성장 실패 시 일정 확률로 백수가 됨)
const JOB_LOSS_CHANCE = 3; // 3% 확률

// 직업 상실 메시지
const JOB_LOSS_MESSAGES = {
  '회사원': [
    '구조조정에 의해 해고되었습니다...',
    '상사 뒷담화가 걸려서 짤렸습니다...',
    '지각 3번으로 권고사직 당했습니다...',
    '"개인 사정"으로 퇴사 처리되었습니다...'
  ],
  '공무원': [
    '비리가 발각되어 파면당했습니다...',
    '감찰에 걸려서 해임되었습니다...',
    '민원인과의 다툼으로 면직...',
    '예산 낭비로 징계해임...'
  ],
  '알바생': [
    '"내일부터 안 나와도 돼"',
    '가게가 폐업했습니다...',
    '손님 컴플레인으로 해고...',
    '사장님이 잠수탔습니다...'
  ],
  '학생': [
    '학비 미납으로 제적당했습니다...',
    '출석 부족으로 자퇴 처리...',
    '학점 미달로 제적...',
    '학교가 폐교되었습니다...'
  ],
  '개발자': [
    '버그 때문에 해고당했습니다...',
    '프로젝트 펑크나서 권고사직...',
    'AI에게 대체되었습니다...',
    '깃허브 잔디가 너무 없어서 해고...'
  ],
  '요리사': [
    '위생 점검에 걸려 식당이 폐업...',
    '손님이 식중독에 걸려 해고...',
    '"맛이 없어요" 리뷰 폭탄으로 해고...',
    '불이 나서 가게가 사라졌습니다...'
  ],
  '가수': [
    '소속사에서 방출당했습니다...',
    '음반 판매 부진으로 계약 해지...',
    '스캔들로 연예계 퇴출...',
    '목이 나가서 은퇴...'
  ],
  '의사': [
    '의료사고로 면허 정지...',
    '환자 개인정보 유출로 해고...',
    '과로로 더 이상 일을 못합니다...',
    '병원이 파산했습니다...'
  ],
  '변호사': [
    '패소 연속으로 의뢰인 0명...',
    '변호사 자격 박탈...',
    '착수금 환불 요청 폭주로 파산...',
    '의뢰인에게 고소당했습니다...'
  ],
  '용사': [
    '마왕을 못 잡아서 해고...',
    '왕국에서 추방당했습니다...',
    '용사 자격을 박탈당했습니다...',
    '파티원들이 다 떠났습니다...'
  ],
  '마법사': [
    '마법사 길드에서 추방...',
    '마력이 사라졌습니다...',
    '금지 마법 사용으로 자격 박탈...',
    '마탑이 무너져 실직...'
  ]
};

// 기본 직업 상실 메시지
const DEFAULT_JOB_LOSS_MESSAGES = [
  '직장에서 해고당했습니다...',
  '어쩌다 보니 백수가 되었습니다...',
  '경기 불황으로 실직했습니다...',
  '갑자기 일자리를 잃었습니다...',
  '"당신은 해고입니다."'
];

/**
 * 랜덤 직업 뽑기
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
 */
function getJobPrefix(level) {
  const prefixData = LEVEL_PREFIXES.find(
    p => level >= p.minLevel && level <= p.maxLevel
  );
  return prefixData ? prefixData.prefix : '';
}

/**
 * 전체 직업명 가져오기 (수식어 포함)
 */
function getFullJobName(jobName, level) {
  const prefix = getJobPrefix(level);
  return prefix ? `${prefix} ${jobName}` : jobName;
}

/**
 * 직업 정보 포맷팅
 */
function formatJobInfo(job) {
  const gradeKorean = GRADE_KOREAN[job.grade];
  const bonusPercent = Math.round(job.bonusRate * 100);
  const emoji = GRADE_EMOJI[job.grade];

  return `${job.name} (${gradeKorean} +${bonusPercent}%) ${emoji}`.trim();
}

/**
 * 직업 상실 여부 결정
 * @returns {boolean} 직업 상실 여부
 */
function shouldLoseJob() {
  return Math.random() * 100 < JOB_LOSS_CHANCE;
}

/**
 * 직업 상실 메시지 가져오기
 * @param {string} jobName - 현재 직업
 * @returns {string} 직업 상실 메시지
 */
function getJobLossMessage(jobName) {
  const messages = JOB_LOSS_MESSAGES[jobName] || DEFAULT_JOB_LOSS_MESSAGES;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * 백수 직업 객체 가져오기
 */
function getUnemployedJob() {
  return JOBS.find(j => j.name === '백수') || {
    name: '백수',
    category: JOB_CATEGORIES.UNEMPLOYED,
    grade: JOB_GRADES.COMMON,
    bonusRate: 0
  };
}

/**
 * 등급별 직업 목록
 */
function getJobsByGrade(grade) {
  return JOBS.filter(j => j.grade === grade);
}

/**
 * 직업 통계
 */
function getJobStats() {
  return {
    total: JOBS.length,
    common: getJobsByGrade(JOB_GRADES.COMMON).length,
    uncommon: getJobsByGrade(JOB_GRADES.UNCOMMON).length,
    rare: getJobsByGrade(JOB_GRADES.RARE).length,
    legendary: getJobsByGrade(JOB_GRADES.LEGENDARY).length
  };
}

module.exports = {
  JOB_GRADES,
  JOB_CATEGORIES,
  GRADE_KOREAN,
  GRADE_EMOJI,
  JOBS,
  GRADE_PROBABILITIES,
  LEVEL_PREFIXES,
  JOB_LOSS_CHANCE,
  JOB_LOSS_MESSAGES,
  rollJob,
  getJobPrefix,
  getFullJobName,
  formatJobInfo,
  shouldLoseJob,
  getJobLossMessage,
  getUnemployedJob,
  getJobsByGrade,
  getJobStats
};
