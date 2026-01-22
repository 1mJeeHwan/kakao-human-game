/**
 * 업적 시스템
 * 다양한 조건 달성 시 업적 해금 및 보상
 */

// 업적 카테고리
const ACHIEVEMENT_CATEGORIES = {
  GROWTH: 'growth',       // 성장 관련
  DEATH: 'death',         // 사망 관련
  WEALTH: 'wealth',       // 재화 관련
  COLLECTION: 'collection', // 수집 관련
  SPECIAL: 'special',     // 특수 업적
  ENDING: 'ending'        // 특수 엔딩 관련
};

// 업적 등급
const ACHIEVEMENT_GRADES = {
  BRONZE: { name: 'bronze', emoji: '🥉', multiplier: 1 },
  SILVER: { name: 'silver', emoji: '🥈', multiplier: 2 },
  GOLD: { name: 'gold', emoji: '🥇', multiplier: 3 },
  DIAMOND: { name: 'diamond', emoji: '💎', multiplier: 5 },
  LEGENDARY: { name: 'legendary', emoji: '👑', multiplier: 10 }
};

/**
 * 업적 목록
 */
const ACHIEVEMENTS = [
  // ========== 성장 업적 ==========
  {
    id: 'first_upgrade',
    name: '첫 발걸음',
    description: '첫 번째 강화 성공',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => user.stats.successCount >= 1,
    reward: 100
  },
  {
    id: 'level_5',
    name: '성장하는 인간',
    description: '5강 달성',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => user.stats.maxLevel >= 5,
    reward: 200
  },
  {
    id: 'level_10',
    name: '숙련된 인간',
    description: '10강 달성',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => user.stats.maxLevel >= 10,
    reward: 500
  },
  {
    id: 'level_13',
    name: '전설의 문턱',
    description: '13강 달성',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.maxLevel >= 13,
    reward: 1000
  },
  {
    id: 'level_15',
    name: '완벽한 인간',
    description: '15강 달성 (만렙)',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.LEGENDARY,
    condition: (user) => user.stats.maxLevel >= 15,
    reward: 5000
  },
  {
    id: 'upgrades_100',
    name: '노력파',
    description: '강화 100회 성공',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => user.stats.successCount >= 100,
    reward: 300
  },
  {
    id: 'upgrades_500',
    name: '강화의 달인',
    description: '강화 500회 성공',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.successCount >= 500,
    reward: 1000
  },
  {
    id: 'upgrades_1000',
    name: '강화의 신',
    description: '강화 1000회 성공',
    category: ACHIEVEMENT_CATEGORIES.GROWTH,
    grade: ACHIEVEMENT_GRADES.DIAMOND,
    condition: (user) => user.stats.successCount >= 1000,
    reward: 3000
  },

  // ========== 사망 업적 ==========
  {
    id: 'first_death',
    name: '첫 번째 실패',
    description: '첫 사망 경험',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => user.stats.deathCount >= 1,
    reward: 50
  },
  {
    id: 'death_10',
    name: '불굴의 의지',
    description: '10번 사망',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => user.stats.deathCount >= 10,
    reward: 100
  },
  {
    id: 'death_50',
    name: '죽음의 베테랑',
    description: '50번 사망',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => user.stats.deathCount >= 50,
    reward: 300
  },
  {
    id: 'death_100',
    name: '불사의 경지',
    description: '100번 사망',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.deathCount >= 100,
    reward: 1000
  },
  {
    id: 'death_500',
    name: '윤회의 달인',
    description: '500번 사망',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.DIAMOND,
    condition: (user) => user.stats.deathCount >= 500,
    reward: 3000
  },
  {
    id: 'jackpot_first',
    name: '행운아',
    description: '첫 잭팟 획득',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => user.stats.jackpotCount >= 1,
    reward: 500
  },
  {
    id: 'jackpot_5',
    name: '잭팟 수집가',
    description: '잭팟 5회 획득',
    category: ACHIEVEMENT_CATEGORIES.DEATH,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.jackpotCount >= 5,
    reward: 1500
  },

  // ========== 재화 업적 ==========
  {
    id: 'gold_1000',
    name: '저축의 시작',
    description: '골드 1,000G 보유',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => user.gold >= 1000,
    reward: 100
  },
  {
    id: 'gold_10000',
    name: '부자의 꿈',
    description: '골드 10,000G 보유',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => user.gold >= 10000,
    reward: 500
  },
  {
    id: 'gold_50000',
    name: '재벌',
    description: '골드 50,000G 보유',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.gold >= 50000,
    reward: 2000
  },
  {
    id: 'gold_100000',
    name: '거부',
    description: '골드 100,000G 보유',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.DIAMOND,
    condition: (user) => user.gold >= 100000,
    reward: 5000
  },
  {
    id: 'sell_first',
    name: '첫 거래',
    description: '첫 인간 판매',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => user.stats.totalHumansSold >= 1,
    reward: 100
  },
  {
    id: 'sell_10',
    name: '인력 시장',
    description: '인간 10명 판매',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => user.stats.totalHumansSold >= 10,
    reward: 300
  },
  {
    id: 'sell_50',
    name: '인간 브로커',
    description: '인간 50명 판매',
    category: ACHIEVEMENT_CATEGORIES.WEALTH,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.totalHumansSold >= 50,
    reward: 1000
  },

  // ========== 수집 업적 ==========
  {
    id: 'titles_10',
    name: '칭호 수집가',
    description: '칭호 10개 수집',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => (user.collection?.titles?.length || 0) >= 10,
    reward: 200
  },
  {
    id: 'titles_30',
    name: '칭호 매니아',
    description: '칭호 30개 수집',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => (user.collection?.titles?.length || 0) >= 30,
    reward: 500
  },
  {
    id: 'titles_all',
    name: '칭호 마스터',
    description: '모든 칭호 수집',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.DIAMOND,
    condition: (user, context) => {
      const totalTitles = context?.totalTitles || 50;
      return (user.collection?.titles?.length || 0) >= totalTitles;
    },
    reward: 5000
  },
  {
    id: 'jobs_10',
    name: '직업 수집가',
    description: '직업 10개 수집',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) => (user.collection?.jobs?.length || 0) >= 10,
    reward: 200
  },
  {
    id: 'jobs_30',
    name: '직업 매니아',
    description: '직업 30개 수집',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => (user.collection?.jobs?.length || 0) >= 30,
    reward: 500
  },
  {
    id: 'jobs_all',
    name: '직업 마스터',
    description: '모든 직업 수집',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.DIAMOND,
    condition: (user, context) => {
      const totalJobs = context?.totalJobs || 46;
      return (user.collection?.jobs?.length || 0) >= totalJobs;
    },
    reward: 5000
  },
  {
    id: 'legendary_title',
    name: '전설의 칭호',
    description: '전설 등급 칭호 획득',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.legendaryTitleCount >= 1,
    reward: 1000
  },
  {
    id: 'legendary_job',
    name: '전설의 직업',
    description: '전설 등급 직업 획득',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => user.stats.legendaryJobCount >= 1,
    reward: 1000
  },
  {
    id: 'legendary_both',
    name: '전설의 조합',
    description: '전설 칭호 + 전설 직업 동시 보유',
    category: ACHIEVEMENT_CATEGORIES.COLLECTION,
    grade: ACHIEVEMENT_GRADES.LEGENDARY,
    condition: (user) =>
      user.human?.title?.grade === 'legendary' &&
      user.human?.job?.grade === 'legendary',
    reward: 3000
  },

  // ========== 특수 업적 ==========
  {
    id: 'reroll_10',
    name: '운명 거부자',
    description: '리롤 10회 사용',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    grade: ACHIEVEMENT_GRADES.BRONZE,
    condition: (user) =>
      (user.stats.totalTitleRerolls || 0) + (user.stats.totalJobRerolls || 0) >= 10,
    reward: 100
  },
  {
    id: 'reroll_50',
    name: '운명 조작자',
    description: '리롤 50회 사용',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) =>
      (user.stats.totalTitleRerolls || 0) + (user.stats.totalJobRerolls || 0) >= 50,
    reward: 500
  },
  {
    id: 'unemployed_10',
    name: '프로 백수',
    description: '백수로 10강 달성',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) =>
      user.human?.job?.name === '백수' && user.human?.level >= 10,
    reward: 2000
  },
  {
    id: 'unemployed_15',
    name: '백수의 전설',
    description: '백수로 15강 달성',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    grade: ACHIEVEMENT_GRADES.LEGENDARY,
    condition: (user) =>
      user.human?.job?.name === '백수' && user.human?.level >= 15,
    reward: 10000
  },
  {
    id: 'speedrun',
    name: '스피드런',
    description: '1000G 이하로 10강 달성',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) =>
      user.human?.level >= 10 && (user.human?.totalSpentOnHuman || 0) <= 1000,
    reward: 2000
  },

  // ========== 특수 엔딩 업적 ==========
  {
    id: 'ending_first',
    name: '운명의 장난',
    description: '첫 특수 엔딩 경험',
    category: ACHIEVEMENT_CATEGORIES.ENDING,
    grade: ACHIEVEMENT_GRADES.SILVER,
    condition: (user) => (user.stats?.specialEndingCount || 0) >= 1,
    reward: 500
  },
  {
    id: 'ending_5',
    name: '운명의 총아',
    description: '특수 엔딩 5회 경험',
    category: ACHIEVEMENT_CATEGORIES.ENDING,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => (user.stats?.specialEndingCount || 0) >= 5,
    reward: 1000
  },
  {
    id: 'ending_10',
    name: '운명의 지배자',
    description: '특수 엔딩 10회 경험',
    category: ACHIEVEMENT_CATEGORIES.ENDING,
    grade: ACHIEVEMENT_GRADES.DIAMOND,
    condition: (user) => (user.stats?.specialEndingCount || 0) >= 10,
    reward: 3000
  },
  {
    id: 'ending_isekai',
    name: '이세계 여행자',
    description: '이세계 엔딩 경험',
    category: ACHIEVEMENT_CATEGORIES.ENDING,
    grade: ACHIEVEMENT_GRADES.GOLD,
    condition: (user) => (user.specialEndings?.triggered || []).includes('isekai'),
    reward: 1000
  },
  {
    id: 'ending_dragon',
    name: '용의 계승자',
    description: '용의 피 각성 엔딩 경험',
    category: ACHIEVEMENT_CATEGORIES.ENDING,
    grade: ACHIEVEMENT_GRADES.LEGENDARY,
    condition: (user) => (user.specialEndings?.triggered || []).includes('dragon_blood'),
    reward: 3000
  },
  {
    id: 'ending_variety',
    name: '만능 엔딩러',
    description: '서로 다른 특수 엔딩 10종 경험',
    category: ACHIEVEMENT_CATEGORIES.ENDING,
    grade: ACHIEVEMENT_GRADES.LEGENDARY,
    condition: (user) => (user.specialEndings?.triggered || []).length >= 10,
    reward: 5000
  }
];

/**
 * 유저의 업적 달성 여부 체크
 * @param {Object} user - 유저 객체
 * @param {Object} context - 추가 컨텍스트 (totalTitles, totalJobs 등)
 * @returns {Array} 새로 달성한 업적 목록
 */
function checkAchievements(user, context = {}) {
  const newAchievements = [];
  const currentAchievements = user.collection?.achievements || [];

  for (const achievement of ACHIEVEMENTS) {
    // 이미 달성한 업적은 스킵
    if (currentAchievements.includes(achievement.id)) {
      continue;
    }

    // 조건 체크
    try {
      if (achievement.condition(user, context)) {
        newAchievements.push(achievement);
      }
    } catch (err) {
      // 조건 체크 실패시 무시
      continue;
    }
  }

  return newAchievements;
}

/**
 * 업적 정보 가져오기
 * @param {string} achievementId - 업적 ID
 * @returns {Object|null} 업적 정보
 */
function getAchievement(achievementId) {
  return ACHIEVEMENTS.find(a => a.id === achievementId) || null;
}

/**
 * 카테고리별 업적 목록 가져오기
 * @param {string} category - 카테고리
 * @returns {Array} 업적 목록
 */
function getAchievementsByCategory(category) {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * 유저의 업적 진행도 계산
 * @param {Object} user - 유저 객체
 * @returns {Object} 진행도 정보
 */
function getAchievementProgress(user) {
  const currentAchievements = user.collection?.achievements || [];
  const total = ACHIEVEMENTS.length;
  const completed = currentAchievements.length;

  // 카테고리별 진행도
  const byCategory = {};
  for (const category of Object.values(ACHIEVEMENT_CATEGORIES)) {
    const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
    const categoryCompleted = categoryAchievements.filter(a =>
      currentAchievements.includes(a.id)
    ).length;
    byCategory[category] = {
      total: categoryAchievements.length,
      completed: categoryCompleted
    };
  }

  // 등급별 진행도
  const byGrade = {};
  for (const grade of Object.values(ACHIEVEMENT_GRADES)) {
    const gradeAchievements = ACHIEVEMENTS.filter(a => a.grade.name === grade.name);
    const gradeCompleted = gradeAchievements.filter(a =>
      currentAchievements.includes(a.id)
    ).length;
    byGrade[grade.name] = {
      total: gradeAchievements.length,
      completed: gradeCompleted,
      emoji: grade.emoji
    };
  }

  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
    byCategory,
    byGrade
  };
}

/**
 * 업적 텍스트 포맷
 * @param {Object} achievement - 업적 정보
 * @param {boolean} completed - 달성 여부
 * @returns {string} 포맷된 텍스트
 */
function formatAchievement(achievement, completed = false) {
  const status = completed ? '✅' : '⬜';
  return `${status} ${achievement.grade.emoji} ${achievement.name}\n   ${achievement.description}\n   보상: ${achievement.reward}G`;
}

module.exports = {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_GRADES,
  checkAchievements,
  getAchievement,
  getAchievementsByCategory,
  getAchievementProgress,
  formatAchievement
};
