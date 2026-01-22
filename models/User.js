/**
 * User 모델 스키마
 */

const mongoose = require('mongoose');
const { rollTitle } = require('../utils/titles');
const { rollJob, getJobPrefix } = require('../utils/jobs');
const { INITIAL_GOLD } = require('../utils/gameConfig');

const userSchema = new mongoose.Schema({
  kakaoUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  human: {
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 15
    },

    title: {
      name: { type: String, required: true },
      grade: { type: String, required: true },
      bonusRate: { type: Number, required: true },
      special: { type: String, default: null },
      specialUsed: { type: Boolean, default: false }
    },

    job: {
      name: { type: String, required: true },
      category: { type: String, required: true },
      grade: { type: String, required: true },
      bonusRate: { type: Number, required: true }
    },

    // 현재 인간에게 사용한 총 골드 (파괴 지원금 계산용)
    totalSpentOnHuman: {
      type: Number,
      default: 0
    },

    // 현재 인간의 생애 동안 획득한 칭호 목록 (능력 중복 방지용)
    obtainedTitles: {
      type: [String],
      default: []
    },

    // 현재 인간의 누적 특수 능력 목록
    abilities: {
      type: [{
        name: { type: String, required: true },
        used: { type: Boolean, default: false }
      }],
      default: []
    },

    // 특수 엔딩으로 인한 다음 직업 고정
    nextJobLocked: {
      name: { type: String, default: null },
      reason: { type: String, default: null }
    }
  },

  // 특수 엔딩 기록
  specialEndings: {
    // 발동된 특수 엔딩 ID 목록
    triggered: {
      type: [String],
      default: []
    },
    // 마지막 특수 엔딩
    lastEnding: {
      id: { type: String, default: null },
      message: { type: String, default: null },
      triggeredAt: { type: Date, default: null }
    }
  },

  gold: {
    type: Number,
    default: INITIAL_GOLD
  },

  stats: {
    totalAttempts: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    deathCount: { type: Number, default: 0 },
    maxLevel: { type: Number, default: 0 },
    totalGoldEarned: { type: Number, default: 0 },
    totalGoldSpent: { type: Number, default: 0 },
    totalTitleRerolls: { type: Number, default: 0 },
    totalJobRerolls: { type: Number, default: 0 },
    legendaryTitleCount: { type: Number, default: 0 },
    legendaryJobCount: { type: Number, default: 0 },
    jackpotCount: { type: Number, default: 0 },
    totalHumansSold: { type: Number, default: 0 },
    specialEndingCount: { type: Number, default: 0 }
  },

  // 도감 시스템
  collection: {
    // 획득한 칭호 목록
    titles: {
      type: [String],
      default: []
    },
    // 획득한 직업 목록
    jobs: {
      type: [String],
      default: []
    },
    // 달성한 업적
    achievements: {
      type: [String],
      default: []
    },
    // 보상 수령 여부
    rewardsClaimed: {
      titleComplete: { type: Boolean, default: false },
      jobComplete: { type: Boolean, default: false },
      allComplete: { type: Boolean, default: false }
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  lastPlayedAt: {
    type: Date,
    default: Date.now
  }
}, {
  suppressReservedKeysWarning: true  // 'collection' 필드명 경고 무시
});

// 인덱스 설정 (쿼리 최적화)
userSchema.index({ 'stats.maxLevel': -1 });
userSchema.index({ 'human.level': -1 });
userSchema.index({ gold: -1 });
userSchema.index({ lastPlayedAt: -1 });  // 비활성 유저 정리용
userSchema.index({ createdAt: 1 });      // 통계용

/**
 * 새 캐릭터 생성 (랜덤 칭호 + 직업, 또는 특수 엔딩으로 고정된 직업)
 * @param {string|null} lockedJobName - 특수 엔딩으로 고정된 직업 이름
 */
userSchema.methods.createNewHuman = function(lockedJobName = null) {
  const title = rollTitle();

  // 직업 결정: 고정된 직업이 있으면 사용, 없으면 랜덤
  let job;
  if (lockedJobName) {
    const { getJobByName } = require('../utils/specialEndings');
    job = getJobByName(lockedJobName);
    if (!job) {
      // 고정 직업을 찾지 못하면 랜덤으로
      job = rollJob();
    }
  } else {
    job = rollJob();
  }

  // 초기 능력 설정
  const initialAbilities = [];
  if (title.special) {
    initialAbilities.push({ name: title.special, used: false });
  }

  this.human = {
    level: 0,
    title: {
      name: title.name,
      grade: title.grade,
      bonusRate: title.bonusRate,
      special: title.special || null,
      specialUsed: false
    },
    job: {
      name: job.name,
      category: job.category,
      grade: job.grade,
      bonusRate: job.bonusRate
    },
    totalSpentOnHuman: 0,
    obtainedTitles: [title.name],
    abilities: initialAbilities,
    nextJobLocked: { name: null, reason: null }
  };

  // 도감에 추가
  this.addTitleToCollection(title.name);
  this.addJobToCollection(job.name);

  // 전설 등급 통계 업데이트
  if (title.grade === 'legendary') {
    this.stats.legendaryTitleCount += 1;
  }
  if (job.grade === 'legendary') {
    this.stats.legendaryJobCount += 1;
  }

  return { title, job, wasLocked: !!lockedJobName };
};

/**
 * 칭호 리롤
 */
userSchema.methods.rerollTitle = function() {
  const newTitle = rollTitle();
  const oldTitle = this.human.title.name;

  // 이미 획득한 칭호인지 확인
  const isNewTitle = !this.human.obtainedTitles.includes(newTitle.name);
  let abilityAdded = false;

  // 새 칭호면 obtainedTitles에 추가하고 능력 부여
  if (isNewTitle) {
    this.human.obtainedTitles.push(newTitle.name);

    // 특수 능력이 있으면 abilities에 추가
    if (newTitle.special) {
      this.human.abilities.push({ name: newTitle.special, used: false });
      abilityAdded = true;
    }
  }

  this.human.title = {
    name: newTitle.name,
    grade: newTitle.grade,
    bonusRate: newTitle.bonusRate,
    special: newTitle.special || null,
    specialUsed: false
  };

  // 도감에 추가
  this.addTitleToCollection(newTitle.name);

  this.stats.totalTitleRerolls += 1;

  if (newTitle.grade === 'legendary') {
    this.stats.legendaryTitleCount += 1;
  }

  return { oldTitle, newTitle, isNewTitle, abilityAdded };
};

/**
 * 직업 리롤
 */
userSchema.methods.rerollJob = function() {
  const newJob = rollJob();
  const oldJob = this.human.job.name;

  this.human.job = {
    name: newJob.name,
    category: newJob.category,
    grade: newJob.grade,
    bonusRate: newJob.bonusRate
  };

  // 도감에 추가
  this.addJobToCollection(newJob.name);

  this.stats.totalJobRerolls += 1;

  if (newJob.grade === 'legendary') {
    this.stats.legendaryJobCount += 1;
  }

  return { oldJob, newJob };
};

/**
 * 레벨업
 */
userSchema.methods.levelUp = function() {
  this.human.level += 1;
  this.stats.successCount += 1;

  if (this.human.level > this.stats.maxLevel) {
    this.stats.maxLevel = this.human.level;
  }
};

/**
 * 도감에 칭호 추가
 */
userSchema.methods.addTitleToCollection = function(titleName) {
  if (!this.collection.titles.includes(titleName)) {
    this.collection.titles.push(titleName);
    return true; // 새로 추가됨
  }
  return false; // 이미 있음
};

/**
 * 도감에 직업 추가
 */
userSchema.methods.addJobToCollection = function(jobName) {
  if (!this.collection.jobs.includes(jobName)) {
    this.collection.jobs.push(jobName);
    return true; // 새로 추가됨
  }
  return false; // 이미 있음
};

/**
 * 업적 추가
 */
userSchema.methods.addAchievement = function(achievementId) {
  if (!this.collection.achievements.includes(achievementId)) {
    this.collection.achievements.push(achievementId);
    return true;
  }
  return false;
};

/**
 * 사망 처리 (새 캐릭터 생성)
 * @param {Object|null} specialEnding - 특수 엔딩 정보
 * @returns {Object} 새 캐릭터 정보
 */
userSchema.methods.handleDeath = function(specialEnding = null) {
  this.stats.deathCount += 1;

  let lockedJobName = null;

  // 특수 엔딩 처리
  if (specialEnding) {
    this.stats.specialEndingCount += 1;

    // 엔딩 기록
    if (!this.specialEndings) {
      this.specialEndings = { triggered: [], lastEnding: {} };
    }
    if (!this.specialEndings.triggered.includes(specialEnding.id)) {
      this.specialEndings.triggered.push(specialEnding.id);
    }
    this.specialEndings.lastEnding = {
      id: specialEnding.id,
      message: specialEnding.deathMessage,
      triggeredAt: new Date()
    };

    // 다음 직업 고정
    lockedJobName = specialEnding.nextJob;
  }

  return this.createNewHuman(lockedJobName);
};

/**
 * 직업 상실 처리 (백수로 변경)
 */
userSchema.methods.loseJob = function() {
  const { getUnemployedJob } = require('../utils/jobs');
  const unemployed = getUnemployedJob();

  this.human.job = {
    name: unemployed.name,
    category: unemployed.category,
    grade: unemployed.grade,
    bonusRate: unemployed.bonusRate
  };
};

/**
 * 특수 능력 사용 처리 (기존 호환용)
 */
userSchema.methods.useSpecialAbility = function() {
  this.human.title.specialUsed = true;
};

/**
 * 특정 능력 보유 여부 확인 (미사용 상태)
 * @param {string} abilityName - 능력 이름
 * @returns {boolean}
 */
userSchema.methods.hasAbility = function(abilityName) {
  if (!this.human.abilities) return false;
  return this.human.abilities.some(a => a.name === abilityName && !a.used);
};

/**
 * 특정 능력 사용 처리
 * @param {string} abilityName - 능력 이름
 * @returns {boolean} 사용 성공 여부
 */
userSchema.methods.useAbility = function(abilityName) {
  if (!this.human.abilities) return false;
  const ability = this.human.abilities.find(a => a.name === abilityName && !a.used);
  if (ability) {
    ability.used = true;
    return true;
  }
  return false;
};

/**
 * 특정 능력 개수 확인 (미사용)
 * @param {string} abilityName - 능력 이름
 * @returns {number}
 */
userSchema.methods.countAbility = function(abilityName) {
  if (!this.human.abilities) return 0;
  return this.human.abilities.filter(a => a.name === abilityName && !a.used).length;
};

/**
 * 모든 활성 능력 목록 조회
 * @returns {Array}
 */
userSchema.methods.getActiveAbilities = function() {
  if (!this.human.abilities) return [];
  return this.human.abilities.filter(a => !a.used).map(a => a.name);
};

/**
 * 신규 유저 생성 헬퍼
 */
userSchema.statics.createNewUser = async function(kakaoUserId) {
  const user = new this({ kakaoUserId });
  user.createNewHuman();
  await user.save();
  return user;
};

/**
 * 유저 조회 또는 생성
 */
userSchema.statics.findOrCreate = async function(kakaoUserId) {
  let user = await this.findOne({ kakaoUserId });

  if (!user) {
    user = await this.createNewUser(kakaoUserId);
  } else {
    user.lastPlayedAt = new Date();
    await user.save();
  }

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
