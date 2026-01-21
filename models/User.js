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
      bonusRate: { type: Number, required: true }
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
    totalHumansSold: { type: Number, default: 0 }
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
});

// 인덱스 설정
userSchema.index({ 'stats.maxLevel': -1 });
userSchema.index({ 'human.level': -1 });
userSchema.index({ gold: -1 });

/**
 * 새 캐릭터 생성 (랜덤 칭호 + 직업)
 */
userSchema.methods.createNewHuman = function() {
  const title = rollTitle();
  const job = rollJob();

  this.human = {
    level: 0,
    title: {
      name: title.name,
      grade: title.grade,
      bonusRate: title.bonusRate
    },
    job: {
      name: job.name,
      category: job.category,
      grade: job.grade,
      bonusRate: job.bonusRate
    },
    totalSpentOnHuman: 0
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
};

/**
 * 칭호 리롤
 */
userSchema.methods.rerollTitle = function() {
  const newTitle = rollTitle();
  const oldTitle = this.human.title.name;

  this.human.title = {
    name: newTitle.name,
    grade: newTitle.grade,
    bonusRate: newTitle.bonusRate
  };

  // 도감에 추가
  this.addTitleToCollection(newTitle.name);

  this.stats.totalTitleRerolls += 1;

  if (newTitle.grade === 'legendary') {
    this.stats.legendaryTitleCount += 1;
  }

  return { oldTitle, newTitle };
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
 */
userSchema.methods.handleDeath = function() {
  this.stats.deathCount += 1;
  this.createNewHuman();
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
