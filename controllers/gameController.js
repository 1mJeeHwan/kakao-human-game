/**
 * 게임 컨트롤러 - 모든 게임 로직 처리
 */

const User = require('../models/User');
const { formatTitleInfo, GRADE_KOREAN: TITLE_GRADE_KOREAN, TITLES, SPECIAL_ABILITIES, ABILITY_DESCRIPTIONS } = require('../utils/titles');
const { formatJobInfo, getFullJobName, GRADE_KOREAN: JOB_GRADE_KOREAN, JOBS, shouldLoseJob, getJobLossMessage, getUnemployedJob, JOB_GRADES } = require('../utils/jobs');
const { getDeathMessage, getRefundMessage } = require('../utils/deathMessages');
const {
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  shouldChangeTitle,
  shouldChangeJob,
  calculateDeathSupport,
  formatGold,
  UPGRADE_TABLE,
  MAX_LEVEL,
  TITLE_CHANGE_CHANCE,
  JOB_CHANGE_CHANCE,
  SELL_PRICE_MULTIPLIER
} = require('../utils/gameConfig');
const {
  getHumanFullName,
  createKakaoResponse,
  createKakaoMixedResponse,
  DEFAULT_QUICK_REPLIES,
  UPGRADE_QUICK_REPLIES,
  SELL_QUICK_REPLIES,
  COLLECTION_QUICK_REPLIES,
  extractUserId,
  getGradeEmoji
} = require('../utils/helpers');
const { getJobImage, getStatusImage } = require('../utils/images');
const { checkSpecialEnding } = require('../utils/specialEndings');
const { checkAchievements, getAchievementProgress, formatAchievement, ACHIEVEMENTS } = require('../utils/achievements');

// ========== 봇 방지 시스템 ==========

// 유저별 쿨다운 추적 (메모리 기반)
const userCooldowns = new Map();

// 유저별 요청 기록 (이상 감지용)
const userRequestHistory = new Map();

// 설정
const COOLDOWN_MS = 500;            // 강화 쿨다운: 0.5초
const ANOMALY_WINDOW_MS = 60000;    // 이상 감지 윈도우: 1분
const ANOMALY_THRESHOLD = 60;       // 1분에 60회 이상 시 이상 감지
const FLAGGED_USERS = new Set();    // 플래그된 유저 목록

// ========== 서버 과부하 대기줄 시스템 ==========

// 현재 처리 중인 요청 수
let currentConcurrentRequests = 0;

// 설정 (Render 무료 티어 기준)
const MAX_CONCURRENT_REQUESTS = 50;   // 최대 동시 처리 요청
const QUEUE_MESSAGES = [
  '🚦 서버가 바빠요! 잠시만 기다려주세요~',
  '⏳ 접속자가 많습니다. 곧 차례가 옵니다!',
  '🎮 인기 폭발! 잠시 후 다시 시도해주세요.',
  '☕ 서버 휴식 중... 3초 후 다시 눌러주세요!',
  '🔥 핫한 게임! 조금만 기다려주세요~'
];

/**
 * 서버 과부하 체크
 * @returns {Object} { overloaded: boolean, currentLoad: number, message: string }
 */
function checkServerLoad() {
  const overloaded = currentConcurrentRequests >= MAX_CONCURRENT_REQUESTS;
  const message = overloaded
    ? QUEUE_MESSAGES[Math.floor(Math.random() * QUEUE_MESSAGES.length)]
    : null;

  return {
    overloaded,
    currentLoad: currentConcurrentRequests,
    maxLoad: MAX_CONCURRENT_REQUESTS,
    message
  };
}

/**
 * 요청 시작 (카운터 증가)
 */
function requestStart() {
  currentConcurrentRequests++;
}

/**
 * 요청 종료 (카운터 감소)
 */
function requestEnd() {
  currentConcurrentRequests = Math.max(0, currentConcurrentRequests - 1);
}

/**
 * 쿨다운 체크
 * @returns {Object} { allowed: boolean, remainingMs: number }
 */
function checkCooldown(userId) {
  const now = Date.now();
  const lastRequest = userCooldowns.get(userId) || 0;
  const elapsed = now - lastRequest;

  if (elapsed < COOLDOWN_MS) {
    return { allowed: false, remainingMs: COOLDOWN_MS - elapsed };
  }

  userCooldowns.set(userId, now);
  return { allowed: true, remainingMs: 0 };
}

/**
 * 이상 행동 감지
 * @returns {Object} { suspicious: boolean, requestCount: number, flagged: boolean }
 */
function detectAnomaly(userId) {
  const now = Date.now();

  // 유저의 요청 기록 가져오기
  let history = userRequestHistory.get(userId) || [];

  // 1분 이내 요청만 유지
  history = history.filter(t => now - t < ANOMALY_WINDOW_MS);
  history.push(now);
  userRequestHistory.set(userId, history);

  const requestCount = history.length;
  const suspicious = requestCount >= ANOMALY_THRESHOLD;

  // 임계치 초과 시 플래그
  if (suspicious && !FLAGGED_USERS.has(userId)) {
    FLAGGED_USERS.add(userId);
    console.warn(`🚨 [ANOMALY] User ${userId} flagged: ${requestCount} requests/min`);
  }

  return {
    suspicious,
    requestCount,
    flagged: FLAGGED_USERS.has(userId)
  };
}

// 메모리 정리 (1시간마다 오래된 데이터 삭제)
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 3600000;

  for (const [userId, lastTime] of userCooldowns.entries()) {
    if (now - lastTime > ONE_HOUR) {
      userCooldowns.delete(userId);
    }
  }

  for (const [userId, history] of userRequestHistory.entries()) {
    const recent = history.filter(t => now - t < ANOMALY_WINDOW_MS);
    if (recent.length === 0) {
      userRequestHistory.delete(userId);
    } else {
      userRequestHistory.set(userId, recent);
    }
  }

  console.log(`🧹 [CLEANUP] Cooldowns: ${userCooldowns.size}, Histories: ${userRequestHistory.size}, Flagged: ${FLAGGED_USERS.size}`);
}, 3600000);

// ========== 게임 로직 ==========

/**
 * 게임 시작 / 상태 조회
 */
async function startGame(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);
    const human = user.human;

    const humanName = getHumanFullName(human);
    const sellPrice = getSellPrice(human.level, human.title.bonusRate, human.job.bonusRate);

    const titleGradeKorean = TITLE_GRADE_KOREAN[human.title.grade] || human.title.grade;
    const jobGradeKorean = JOB_GRADE_KOREAN[human.job.grade] || human.job.grade;
    const titleBonus = Math.round(human.title.bonusRate * 100);
    const jobBonus = Math.round(human.job.bonusRate * 100);

    // 보유 능력 목록
    const activeAbilities = user.getActiveAbilities();
    let abilitiesText = '';
    if (activeAbilities.length > 0) {
      const abilityNames = activeAbilities.map(a => ABILITY_DESCRIPTIONS[a] || a).join('\n  ');
      abilitiesText = `\n\n✨ 보유 능력 (${activeAbilities.length}개)\n  ${abilityNames}`;
    }

    const text = `👤 나의 인간
━━━━━━━━━━━━━━━━━━
🏷️ ${humanName}

📊 수식어 정보
- 칭호: ${human.title.name} (${titleGradeKorean} +${titleBonus}%) ${getGradeEmoji(human.title.grade)}
- 직업: ${human.job.name} (${jobGradeKorean} +${jobBonus}%) ${getGradeEmoji(human.job.grade)}${abilitiesText}

💰 보유 골드: ${formatGold(user.gold)}
💵 판매 가격: ${formatGold(sellPrice)}

📈 통계
- 최고 레벨: +${user.stats.maxLevel}
- 총 시도: ${user.stats.totalAttempts}회
- 사망 횟수: ${user.stats.deathCount}회`;

    const imageUrl = getJobImage(human.job.name, human.job.grade, human.level, human.title.grade);
    return res.json(createKakaoMixedResponse(text, imageUrl, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('startGame 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 인간 성장
 */
async function upgradeHuman(req, res) {
  // 🚦 서버 과부하 체크 (대기줄)
  const loadStatus = checkServerLoad();
  if (loadStatus.overloaded) {
    console.warn(`🚦 [QUEUE] Server overloaded: ${loadStatus.currentLoad}/${loadStatus.maxLoad}`);
    return res.json(createKakaoResponse(loadStatus.message, UPGRADE_QUICK_REPLIES));
  }

  // 요청 카운터 증가
  requestStart();

  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    // 🛡️ 봇 방지: 쿨다운 체크
    const cooldownResult = checkCooldown(userId);
    if (!cooldownResult.allowed) {
      return res.json(createKakaoResponse('⏳ 너무 빨라요! 잠시 후 다시 시도해주세요.'));
    }

    // 🛡️ 봇 방지: 이상 감지
    const anomalyResult = detectAnomaly(userId);
    if (anomalyResult.flagged) {
      console.warn(`🚨 [BLOCKED] Flagged user attempted: ${userId}`);
      return res.json(createKakaoResponse('⚠️ 비정상적인 활동이 감지되었습니다.\n잠시 후 다시 시도해주세요.'));
    }

    const user = await User.findOrCreate(userId);
    const human = user.human;

    // 최대 레벨 체크
    if (human.level >= MAX_LEVEL) {
      const text = `🎉 이미 최대 레벨입니다!

👤 ${getHumanFullName(human)}

더 이상 성장할 수 없습니다.
판매하여 새로운 인간을 만나보세요!`;

      return res.json(createKakaoResponse(text, UPGRADE_QUICK_REPLIES));
    }

    const upgradeInfo = getUpgradeInfo(human.level);

    // 특수 능력: 비용 할인 체크 (누적 시스템)
    let actualCost = upgradeInfo.cost;
    let costDiscountText = '';
    if (user.hasAbility(SPECIAL_ABILITIES.COST_DOWN)) {
      actualCost = Math.floor(upgradeInfo.cost * 0.5);
      costDiscountText = ' (💸 50% 할인!)';
      user.useAbility(SPECIAL_ABILITIES.COST_DOWN);
    }

    // 골드 부족 체크
    if (user.gold < actualCost) {
      const text = `❌ 골드가 부족합니다!

필요: ${formatGold(actualCost)}${costDiscountText}
보유: ${formatGold(user.gold)}

💡 인간을 판매하여 골드를 획득하세요!`;

      return res.json(createKakaoResponse(text, SELL_QUICK_REPLIES));
    }

    // 골드 차감 및 통계 업데이트
    user.gold -= actualCost;
    user.stats.totalAttempts += 1;
    user.stats.totalGoldSpent += actualCost;
    user.human.totalSpentOnHuman = (user.human.totalSpentOnHuman || 0) + actualCost;

    // 성장 결과 계산
    let result = calculateUpgradeResult(human.level);

    // 능력 발동 추적
    let abilityActivated = null;

    // 특수 능력: 실패를 성공으로 (1회) - 100% 발동
    if (result === 'fail' && user.hasAbility(SPECIAL_ABILITIES.FAIL_TO_SUCCESS)) {
      result = 'success';
      user.useAbility(SPECIAL_ABILITIES.FAIL_TO_SUCCESS);
      abilityActivated = { name: ABILITY_DESCRIPTIONS[SPECIAL_ABILITIES.FAIL_TO_SUCCESS], type: 'failToSuccess' };
    }

    // 특수 능력: 실패 시 30% 확률로 성공 (1회)
    if (result === 'fail' && user.hasAbility(SPECIAL_ABILITIES.LUCK_UP)) {
      if (Math.random() < 0.3) {
        result = 'success';
        abilityActivated = { name: ABILITY_DESCRIPTIONS[SPECIAL_ABILITIES.LUCK_UP], type: 'luckUp' };
      }
      user.useAbility(SPECIAL_ABILITIES.LUCK_UP);
    }

    // 특수 능력: 사망 방지 (1회) - 100% 발동
    if (result === 'death' && user.hasAbility(SPECIAL_ABILITIES.DEATH_PROTECT)) {
      result = 'fail';
      user.useAbility(SPECIAL_ABILITIES.DEATH_PROTECT);
      abilityActivated = { name: ABILITY_DESCRIPTIONS[SPECIAL_ABILITIES.DEATH_PROTECT], type: 'deathProtect' };
    }

    // 특수 능력: 사망 시 50% 확률로 방어 (1회)
    if (result === 'death' && user.hasAbility(SPECIAL_ABILITIES.DEATH_RATE_DOWN)) {
      if (Math.random() < 0.5) {
        result = 'fail';
        abilityActivated = { name: ABILITY_DESCRIPTIONS[SPECIAL_ABILITIES.DEATH_RATE_DOWN], type: 'deathRateDown' };
      }
      user.useAbility(SPECIAL_ABILITIES.DEATH_RATE_DOWN);
    }

    const previousLevel = human.level;
    const previousName = getHumanFullName(human);
    const previousJobName = human.job.name;

    let text;

    if (result === 'success') {
      // 특수 능력: 성공 시 2레벨 상승 (1회)
      let doubleExpUsed = false;
      if (user.hasAbility(SPECIAL_ABILITIES.DOUBLE_EXP) && human.level + 2 <= MAX_LEVEL) {
        user.levelUp();
        user.levelUp();
        user.useAbility(SPECIAL_ABILITIES.DOUBLE_EXP);
        doubleExpUsed = true;
      } else {
        user.levelUp();
      }

      // 랜덤 칭호/직업 변경 체크
      let changeText = '';

      if (shouldChangeTitle()) {
        const { oldTitle, newTitle, isNewTitle, abilityAdded, abilitiesAddedCount } = user.rerollTitle();
        const newGradeKorean = TITLE_GRADE_KOREAN[newTitle.grade];
        const newBonus = Math.round(newTitle.bonusRate * 100);
        let specialText = '';

        // 다중 능력 지원
        const titleAbilities = newTitle.specials || (newTitle.special ? [newTitle.special] : []);
        if (abilityAdded && titleAbilities.length > 0) {
          const abilityDescriptions = titleAbilities.map(a => ABILITY_DESCRIPTIONS[a] || a).join('\n  ');
          specialText = `\n\n🎁🎁🎁 새 능력 획득! (${abilitiesAddedCount}개) 🎁🎁🎁\n  ${abilityDescriptions}`;
        } else if (!isNewTitle && titleAbilities.length > 0) {
          specialText = `\n  (이미 보유한 칭호 - 능력 추가 없음)`;
        }
        changeText += `\n\n🎲 칭호가 변경되었습니다!\n${oldTitle} → ${newTitle.name} (${newGradeKorean} +${newBonus}%) ${getGradeEmoji(newTitle.grade)}${specialText}`;
      }

      if (shouldChangeJob()) {
        const { oldJob, newJob, skipped } = user.rerollJob();

        // 동물 직업은 변경되지 않음 (메시지 표시 안함)
        if (!skipped) {
          const newGradeKorean = JOB_GRADE_KOREAN[newJob.grade];
          const newBonus = Math.round(newJob.bonusRate * 100);

          // 특수 직업 축하 문구
          let jobCelebration = '';
          if (newJob.grade === JOB_GRADES.ANIMAL) {
            jobCelebration = '\n\n🐾🐾🐾 동물 직업 등장! 🐾🐾🐾';
          } else if (newJob.grade === JOB_GRADES.LEGENDARY) {
            jobCelebration = '\n\n🌟🌟🌟 전설 직업 등장! 🌟🌟🌟';
          }

          changeText += `${jobCelebration}\n\n🎲 직업이 변경되었습니다!\n${oldJob} → ${newJob.name} (${newGradeKorean} +${newBonus}%) ${getGradeEmoji(newJob.grade)}`;
        }
      }

      const newName = getHumanFullName(user.human);
      const sellPrice = getSellPrice(user.human.level, user.human.title.bonusRate, user.human.job.bonusRate);

      // 다음 성장 정보
      const nextInfo = getUpgradeInfo(user.human.level);
      let nextInfoText = '';

      if (nextInfo) {
        nextInfoText = `

📈 다음 성장
- 비용: ${formatGold(nextInfo.cost)}
- 성공: ${nextInfo.success}%
- 사망: ${nextInfo.death}%`;
      } else {
        nextInfoText = '\n\n🎉 최대 레벨 달성!';
      }

      // 현재 보유 효과 표시
      const titleBonus = Math.round(user.human.title.bonusRate * 100);
      const jobBonus = Math.round(user.human.job.bonusRate * 100);
      const activeAbilities = user.getActiveAbilities();

      let effectsText = `

📋 현재 효과
- 칭호: ${user.human.title.name} (+${titleBonus}%)
- 직업: ${user.human.job.name} (+${jobBonus}%)`;

      if (activeAbilities.length > 0) {
        const abilityList = activeAbilities.map(a => ABILITY_DESCRIPTIONS[a] || a).join(', ');
        effectsText += `\n- 능력: ${abilityList}`;
      }

      const totalSpentSuccess = user.human.totalSpentOnHuman || 0;

      // 2레벨 상승 메시지
      const doubleExpText = doubleExpUsed ? '\n\n⚡⚡⚡ 2레벨 상승! ⚡⚡⚡' : '';

      // 능력 발동 메시지
      let abilityActivatedText = '';
      if (abilityActivated) {
        abilityActivatedText = `\n\n✨✨✨ 능력 발동! ✨✨✨\n${abilityActivated.name}`;
      }

      text = `✨ 성장 성공! ✨${abilityActivatedText}${doubleExpText}

👤 ${newName}

💰 사용: ${formatGold(actualCost)}${costDiscountText}
💰 누적 투자: ${formatGold(totalSpentSuccess)}
💰 남은 골드: ${formatGold(user.gold)}
💵 현재 판매가: ${formatGold(sellPrice)}${effectsText}${changeText}${nextInfoText}`;

      await user.save();
      const successImage = getJobImage(user.human.job.name, user.human.job.grade, user.human.level, user.human.title.grade);
      return res.json(createKakaoMixedResponse(text, successImage, UPGRADE_QUICK_REPLIES));

    } else if (result === 'death') {
      const oldHumanName = previousName;
      const totalSpent = user.human.totalSpentOnHuman || 0;

      // 특수 엔딩 체크
      const specialEnding = checkSpecialEnding(user);

      // 직업별 사망 메시지 (특수 엔딩이 있으면 특수 메시지 사용)
      const deathMsg = specialEnding ? specialEnding.deathMessage : getDeathMessage(previousJobName);

      // 파괴 지원금 계산
      let deathSupport = calculateDeathSupport(totalSpent);

      // 특수 능력: 파괴 지원금 2배 (누적 시스템)
      const doubleRefundCount = user.countAbility(SPECIAL_ABILITIES.DOUBLE_REFUND);
      if (doubleRefundCount > 0) {
        deathSupport.refundAmount *= Math.pow(2, doubleRefundCount);
        deathSupport.refundRate *= Math.pow(2, doubleRefundCount);
      }

      user.gold += deathSupport.refundAmount;

      // 잭팟 통계 업데이트
      if (deathSupport.isJackpot) {
        user.stats.jackpotCount += 1;
      }

      // 특수 능력: 사망해도 레벨 유지 (1회)
      const hasLevelProtect = user.hasAbility(SPECIAL_ABILITIES.LEVEL_PROTECT);
      const preservedLevel = hasLevelProtect ? previousLevel : 0;

      // 사망 처리 (특수 엔딩 정보 전달)
      const newHumanResult = user.handleDeath(specialEnding);

      // 레벨 유지 능력 적용
      if (hasLevelProtect && preservedLevel > 0) {
        user.human.level = preservedLevel;
        user.useAbility(SPECIAL_ABILITIES.LEVEL_PROTECT);
      }

      const newHumanName = getHumanFullName(user.human);

      // 파괴 지원금 메시지
      const refundMsg = getRefundMessage(deathSupport.refundRate);
      let supportText = '';
      if (deathSupport.refundAmount > 0) {
        supportText = `\n\n${refundMsg}\n💸 지원금: ${formatGold(deathSupport.refundAmount)} (${deathSupport.refundRate}%)`;
      } else {
        supportText = `\n\n${refundMsg}`;
      }

      // 특수 엔딩 텍스트
      let specialText = '';
      if (specialEnding) {
        specialText = `

🎊🎊🎊 특수 엔딩 발동! 🎊🎊🎊
━━━━━━━━━━━━━━━━━━
✨ ${specialEnding.flavor}`;
        if (specialEnding.nextJob) {
          specialText += `\n⚡ 다음 직업 확정: ${specialEnding.nextJob}`;
        }
        specialText += '\n━━━━━━━━━━━━━━━━━━';
      }

      // 새 인간의 특수 직업 축하 문구
      let newJobCelebration = '';
      if (!specialEnding) {  // 특수 엔딩이 아닐 때만 (특수 엔딩은 이미 축하 문구 있음)
        if (user.human.job.grade === JOB_GRADES.ANIMAL) {
          newJobCelebration = '\n🐾🐾🐾 동물 직업 등장! 🐾🐾🐾';
        } else if (user.human.job.grade === JOB_GRADES.LEGENDARY) {
          newJobCelebration = '\n🌟🌟🌟 전설 직업 등장! 🌟🌟🌟';
        }
      }

      // 새 인간의 특수능력 표시 (다중 능력 지원)
      let newAbilityText = '';
      const newActiveAbilities = user.getActiveAbilities();
      if (newActiveAbilities.length > 0) {
        const abilityList = newActiveAbilities.map(a => ABILITY_DESCRIPTIONS[a] || a).join('\n  ');
        newAbilityText = `\n✨ 보유 능력:\n  ${abilityList}`;
      }

      // 레벨 유지 메시지
      const levelProtectText = (hasLevelProtect && preservedLevel > 0)
        ? `\n\n📈📈📈 레벨 유지 발동! 📈📈📈\n+${preservedLevel} 레벨로 시작합니다!`
        : '';

      text = `💀 인간이 사망했습니다...

🪦 ${deathMsg}

고인: ${oldHumanName}
💰 투자금: ${formatGold(totalSpent)}${supportText}${specialText}${levelProtectText}

👤 새로운 인간이 도착했습니다!${newJobCelebration}
🏷️ ${newHumanName}${newAbilityText}

💰 남은 골드: ${formatGold(user.gold)}`;

      await user.save();
      const deathImage = getStatusImage('death', previousLevel);
      return res.json(createKakaoMixedResponse(text, deathImage, UPGRADE_QUICK_REPLIES));

    } else {
      // 실패 (유지)
      user.stats.failCount += 1;

      // 직업 상실 체크 (3% 확률로 백수가 됨)
      let jobLossText = '';
      if (shouldLoseJob() && human.job.name !== '백수') {
        const jobLossMsg = getJobLossMessage(human.job.name);
        const oldJobName = human.job.name;
        user.loseJob();
        jobLossText = `\n\n😱 ${jobLossMsg}\n💼 ${oldJobName} → 백수`;
      }

      const sellPrice = getSellPrice(human.level, human.title.bonusRate, user.human.job.bonusRate);
      const totalSpentFail = user.human.totalSpentOnHuman || 0;

      // 능력 발동으로 사망→실패 전환 메시지
      let abilityActivatedFailText = '';
      if (abilityActivated && (abilityActivated.type === 'deathProtect' || abilityActivated.type === 'deathRateDown')) {
        abilityActivatedFailText = `\n\n✨✨✨ 능력 발동! ✨✨✨\n${abilityActivated.name}\n💀 사망 → ❌ 실패로 전환!`;
      }

      text = `❌ 성장 실패!${abilityActivatedFailText}

👤 ${getHumanFullName(user.human)} (유지)

💰 사용: ${formatGold(actualCost)}${costDiscountText}
💰 누적 투자: ${formatGold(totalSpentFail)}
💰 남은 골드: ${formatGold(user.gold)}
💵 현재 판매가: ${formatGold(sellPrice)}${jobLossText}

📈 다음 성장
- 비용: ${formatGold(upgradeInfo.cost)}
- 성공: ${upgradeInfo.success}%
- 사망: ${upgradeInfo.death}%`;

      await user.save();
      const failImage = getStatusImage('fail', human.level);
      return res.json(createKakaoMixedResponse(text, failImage, UPGRADE_QUICK_REPLIES));
    }

  } catch (error) {
    console.error('upgradeHuman 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  } finally {
    // 요청 카운터 감소 (항상 실행)
    requestEnd();
  }
}

/**
 * 인간 판매
 */
async function sellHuman(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);
    const human = user.human;

    // 레벨 0 체크
    if (human.level === 0) {
      const text = `❌ +0 인간은 판매할 수 없습니다!

💡 최소 +1 이상 성장해야 판매할 수 있습니다.`;

      return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));
    }

    let sellPrice = getSellPrice(human.level, human.title.bonusRate, human.job.bonusRate);
    const basePrice = getSellPrice(human.level, 0, 0);  // 보너스 없는 순수 기본가
    const titleBonus = Math.round(human.title.bonusRate * 100);
    const jobBonus = Math.round(human.job.bonusRate * 100);

    // 특수 능력: 판매 시 추가 골드 (+10,000G)
    let bonusGoldText = '';
    const bonusGoldCount = user.countAbility(SPECIAL_ABILITIES.BONUS_GOLD);
    if (bonusGoldCount > 0) {
      const bonusGold = 10000 * bonusGoldCount;
      sellPrice += bonusGold;
      bonusGoldText = `\n- 💎 보너스 골드: +${formatGold(bonusGold)}`;
      // 사용 처리 (보유한 모든 BONUS_GOLD 능력 사용)
      for (let i = 0; i < bonusGoldCount; i++) {
        user.useAbility(SPECIAL_ABILITIES.BONUS_GOLD);
      }
    }

    // 특수 능력: 판매가 2배
    let doubleSellText = '';
    if (user.hasAbility(SPECIAL_ABILITIES.DOUBLE_SELL)) {
      sellPrice *= 2;
      doubleSellText = '\n- 💰 판매가 2배 적용!';
      user.useAbility(SPECIAL_ABILITIES.DOUBLE_SELL);
    }

    const soldHumanName = getHumanFullName(human);

    // 골드 추가 및 통계 업데이트
    user.gold += sellPrice;
    user.stats.totalGoldEarned += sellPrice;
    user.stats.totalHumansSold += 1;

    // 새 캐릭터 생성
    user.createNewHuman();
    const newHumanName = getHumanFullName(user.human);

    // 새 인간의 특수 직업 축하 문구
    let newJobCelebration = '';
    if (user.human.job.grade === JOB_GRADES.ANIMAL) {
      newJobCelebration = '\n🐾🐾🐾 동물 직업 등장! 🐾🐾🐾';
    } else if (user.human.job.grade === JOB_GRADES.LEGENDARY) {
      newJobCelebration = '\n🌟🌟🌟 전설 직업 등장! 🌟🌟🌟';
    }

    // 새 인간의 특수능력 표시 (다중 능력 지원)
    let newAbilityText = '';
    const newActiveAbilitiesSell = user.getActiveAbilities();
    if (newActiveAbilitiesSell.length > 0) {
      const abilityListSell = newActiveAbilitiesSell.map(a => ABILITY_DESCRIPTIONS[a] || a).join('\n  ');
      newAbilityText = `\n✨ 보유 능력:\n  ${abilityListSell}`;
    }

    const text = `💰 판매 완료!
━━━━━━━━━━━━━━━━━━
🪦 판매한 인간
${soldHumanName}

💵 정산 내역
- 기본가: ${formatGold(basePrice)}
- 칭호 보너스: +${titleBonus}%
- 직업 보너스: +${jobBonus}%${bonusGoldText}${doubleSellText}
━━━━━━━━━━━━━━━━━━
💵 총 획득: ${formatGold(sellPrice)}

💰 보유 골드: ${formatGold(user.gold)}

👤 새로운 인간이 도착!${newJobCelebration}
🏷️ ${newHumanName}${newAbilityText}`;

    const soldLevel = human.level;
    await user.save();
    const sellImage = getStatusImage('sell', soldLevel);
    return res.json(createKakaoMixedResponse(text, sellImage, SELL_QUICK_REPLIES));

  } catch (error) {
    console.error('sellHuman 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 확률표 조회
 */
async function getRates(req, res) {
  try {
    // 성장 확률표 생성
    let upgradeRatesText = '📊 성장 확률표\n━━━━━━━━━━━━━━';

    for (const info of UPGRADE_TABLE) {
      upgradeRatesText += `\n+${info.level}→+${info.level + 1}: ${info.success}% (사망 ${info.death}%) ${formatGold(info.cost)}`;
    }

    const text = `${upgradeRatesText}

🎲 성장 성공 시 변이
━━━━━━━━━━━━━━
칭호 변경: ${TITLE_CHANGE_CHANCE}%
직업 변경: ${JOB_CHANGE_CHANCE}%

🏷️ 칭호 등급
━━━━━━━━━━━━━━
일반: 40% (+0%)
고급: 30% (+10%)
희귀: 20% (+25%)
영웅: 8% (+50%)
전설: 2% (+100%)

💼 직업 등급
━━━━━━━━━━━━━━
일반: 50% (+0%)
고급: 30% (+15%)
희귀: 15% (+30%)
전설: 5% (+60%)`;

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getRates 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 도감 조회
 */
async function getCollection(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);

    // 전체 칭호/직업 수
    const totalTitles = TITLES.length;
    const totalJobs = JOBS.length;

    // 수집한 칭호/직업 수
    const collectedTitles = user.collection.titles.length;
    const collectedJobs = user.collection.jobs.length;

    // 수집률 계산
    const titleRate = Math.round((collectedTitles / totalTitles) * 100);
    const jobRate = Math.round((collectedJobs / totalJobs) * 100);
    const totalRate = Math.round(((collectedTitles + collectedJobs) / (totalTitles + totalJobs)) * 100);

    // 등급별 수집 현황 (칭호)
    const titlesByGrade = {
      legendary: TITLES.filter(t => t.grade === 'legendary'),
      epic: TITLES.filter(t => t.grade === 'epic'),
      rare: TITLES.filter(t => t.grade === 'rare'),
      uncommon: TITLES.filter(t => t.grade === 'uncommon'),
      common: TITLES.filter(t => t.grade === 'common')
    };

    // 등급별 수집 현황 (직업)
    const jobsByGrade = {
      legendary: JOBS.filter(j => j.grade === 'legendary'),
      uncommon: JOBS.filter(j => j.grade === 'uncommon'),
      rare: JOBS.filter(j => j.grade === 'rare'),
      common: JOBS.filter(j => j.grade === 'common')
    };

    // 칭호 도감 텍스트
    let titleText = '📖 칭호 도감\n━━━━━━━━━━━━━━';

    for (const [grade, titles] of Object.entries(titlesByGrade)) {
      const gradeKorean = TITLE_GRADE_KOREAN[grade] || grade;
      const collected = titles.filter(t => user.collection.titles.includes(t.name));
      const emoji = getGradeEmoji(grade);

      titleText += `\n${emoji} ${gradeKorean}: ${collected.length}/${titles.length}`;

      // 수집한 칭호 표시
      const collectedNames = collected.map(t => t.name).join(', ');
      const uncollectedCount = titles.length - collected.length;

      if (collectedNames) {
        titleText += `\n  ✓ ${collectedNames}`;
      }
      if (uncollectedCount > 0) {
        titleText += `\n  ? ${uncollectedCount}개 미발견`;
      }
    }

    // 직업 도감 텍스트
    let jobText = '\n\n💼 직업 도감\n━━━━━━━━━━━━━━';

    for (const [grade, jobs] of Object.entries(jobsByGrade)) {
      const gradeKorean = JOB_GRADE_KOREAN[grade] || grade;
      const collected = jobs.filter(j => user.collection.jobs.includes(j.name));
      const emoji = getGradeEmoji(grade);

      jobText += `\n${emoji} ${gradeKorean}: ${collected.length}/${jobs.length}`;

      const collectedNames = collected.map(j => j.name).join(', ');
      const uncollectedCount = jobs.length - collected.length;

      if (collectedNames) {
        jobText += `\n  ✓ ${collectedNames}`;
      }
      if (uncollectedCount > 0) {
        jobText += `\n  ? ${uncollectedCount}개 미발견`;
      }
    }

    // 보상 현황
    let rewardText = '\n\n🎁 수집 보상\n━━━━━━━━━━━━━━';

    const titleComplete = collectedTitles >= totalTitles;
    const jobComplete = collectedJobs >= totalJobs;
    const allComplete = titleComplete && jobComplete;

    rewardText += `\n칭호 완성 (${titleRate}%): ${titleComplete ? (user.collection.rewardsClaimed.titleComplete ? '✓ 수령완료' : '🎁 수령가능!') : '미완성'}`;
    rewardText += `\n직업 완성 (${jobRate}%): ${jobComplete ? (user.collection.rewardsClaimed.jobComplete ? '✓ 수령완료' : '🎁 수령가능!') : '미완성'}`;
    rewardText += `\n전체 완성 (${totalRate}%): ${allComplete ? (user.collection.rewardsClaimed.allComplete ? '✓ 수령완료' : '🎁 수령가능!') : '미완성'}`;

    if ((titleComplete && !user.collection.rewardsClaimed.titleComplete) ||
        (jobComplete && !user.collection.rewardsClaimed.jobComplete) ||
        (allComplete && !user.collection.rewardsClaimed.allComplete)) {
      rewardText += '\n\n💡 "보상받기"를 입력하세요!';
    }

    const text = `📚 도감 현황
━━━━━━━━━━━━━━━━━━
📊 전체 수집률: ${totalRate}%
🏷️ 칭호: ${collectedTitles}/${totalTitles} (${titleRate}%)
💼 직업: ${collectedJobs}/${totalJobs} (${jobRate}%)
${titleText}${jobText}${rewardText}`;

    return res.json(createKakaoResponse(text, COLLECTION_QUICK_REPLIES));

  } catch (error) {
    console.error('getCollection 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 도감 보상 수령
 */
async function claimReward(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);

    const totalTitles = TITLES.length;
    const totalJobs = JOBS.length;
    const collectedTitles = user.collection.titles.length;
    const collectedJobs = user.collection.jobs.length;

    const titleComplete = collectedTitles >= totalTitles;
    const jobComplete = collectedJobs >= totalJobs;
    const allComplete = titleComplete && jobComplete;

    let rewardGold = 0;
    let rewardText = '';

    // 칭호 완성 보상 (10,000G)
    if (titleComplete && !user.collection.rewardsClaimed.titleComplete) {
      rewardGold += 10000;
      user.collection.rewardsClaimed.titleComplete = true;
      rewardText += '🏷️ 칭호 도감 완성! +10,000G\n';
    }

    // 직업 완성 보상 (15,000G)
    if (jobComplete && !user.collection.rewardsClaimed.jobComplete) {
      rewardGold += 15000;
      user.collection.rewardsClaimed.jobComplete = true;
      rewardText += '💼 직업 도감 완성! +15,000G\n';
    }

    // 전체 완성 보상 (50,000G)
    if (allComplete && !user.collection.rewardsClaimed.allComplete) {
      rewardGold += 50000;
      user.collection.rewardsClaimed.allComplete = true;
      rewardText += '🌟 전체 도감 완성! +50,000G\n';
    }

    if (rewardGold > 0) {
      user.gold += rewardGold;
      await user.save();

      const text = `🎁 보상 수령 완료!
━━━━━━━━━━━━━━━━━━
${rewardText}
💰 총 획득: ${formatGold(rewardGold)}
💰 보유 골드: ${formatGold(user.gold)}`;

      return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));
    } else {
      const text = `❌ 수령할 보상이 없습니다!

💡 도감을 완성하면 보상을 받을 수 있습니다.

📊 현재 진행률
- 칭호: ${collectedTitles}/${totalTitles}${titleComplete ? ' ✓' : ''}
- 직업: ${collectedJobs}/${totalJobs}${jobComplete ? ' ✓' : ''}`;

      return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));
    }

  } catch (error) {
    console.error('claimReward 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 업데이트 공지
 */
async function getUpdates(req, res) {
  try {
    // 업데이트 내역 (최신순)
    const updates = [
      {
        version: '1.4.0',
        date: '2025.01.23',
        changes: [
          '✨ 새로운 특수 능력 추가',
          '- ⚡ 성공 시 2레벨 상승',
          '- 📈 사망해도 레벨 유지',
          '- 🔰 사망 시 50% 확률 방어',
          '🌟 전설 칭호 다중 능력 시스템',
          '- 전설 등급은 2개 능력 보유!',
          '⭐ 영웅 칭호 전부 능력 부여',
          '🍀 행운 능력 변경',
          '- 실패 시 30% 확률로 성공',
          '📖 웹 가이드 페이지 추가',
          '- /guide.html 에서 확인!'
        ]
      },
      {
        version: '1.3.0',
        date: '2025.01.22',
        changes: [
          '🐾 동물 직업 추가 (0.5%)',
          '- 11종: 강아지, 고양이 등',
          '- +80% 판매 보너스',
          '- 직업 변경 불가!',
          '💀 직업별 사망 메시지 605개',
          '⚖️ 강화 밸런스 조정',
          '- 3~7강 비용 하향',
          '- 1~6강 사망률 하향'
        ]
      },
      {
        version: '1.2.0',
        date: '2025.01.21',
        changes: [
          '📚 도감 시스템 추가',
          '- 칭호/직업 수집 현황 확인',
          '- 도감 완성 보상 추가',
          '📢 업데이트 공지 기능 추가'
        ]
      },
      {
        version: '1.1.0',
        date: '2025.01.20',
        changes: [
          '💀 파괴 지원금 시스템 추가',
          '- 사망 시 투자금 일부 환급',
          '- 잭팟 시 200% 환급!'
        ]
      },
      {
        version: '1.0.0',
        date: '2025.01.19',
        changes: [
          '🎮 게임 출시!',
          '- 인간 성장 시스템',
          '- 칭호/직업 랜덤 변경',
          '- 판매 시스템'
        ]
      }
    ];

    let text = '📢 업데이트 내역\n━━━━━━━━━━━━━━━━━━';

    for (const update of updates) {
      text += `\n\n📌 v${update.version} (${update.date})`;
      for (const change of update.changes) {
        text += `\n${change}`;
      }
    }

    text += '\n\n━━━━━━━━━━━━━━━━━━\n💡 건의사항은 개발자에게 문의하세요!';

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getUpdates 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 통계 조회
 */
async function getStats(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);
    const stats = user.stats;

    const successRate = stats.totalAttempts > 0
      ? Math.round((stats.successCount / stats.totalAttempts) * 100)
      : 0;

    const text = `📊 나의 기록
━━━━━━━━━━━━━━━━━━
🎮 플레이 기록
- 총 시도: ${stats.totalAttempts}회
- 성공: ${stats.successCount}회 (${successRate}%)
- 실패: ${stats.failCount}회
- 사망: ${stats.deathCount}회

🏆 최고 기록
- 최고 레벨: +${stats.maxLevel}
- 판매한 인간: ${stats.totalHumansSold}명

💰 재화 기록
- 총 수입: ${formatGold(stats.totalGoldEarned)}
- 총 지출: ${formatGold(stats.totalGoldSpent)}

🎲 변이 기록
- 칭호 변경: ${stats.totalTitleRerolls}회
- 직업 변경: ${stats.totalJobRerolls}회
- 전설 칭호: ${stats.legendaryTitleCount}회
- 전설 직업: ${stats.legendaryJobCount}회
- 잭팟 횟수: ${stats.jackpotCount}회`;

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getStats 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 도움말 / 명령어 안내
 */
async function getHelp(req, res) {
  try {
    const text = `📖 인간 키우기 도움말
━━━━━━━━━━━━━━━━━━

🎮 기본 명령어
━━━━━━━━━━━━━━
• 시작 - 내 인간 상태 확인
• 성장 - 인간 성장시키기
• 판매 - 인간 판매하기
• 확률 - 성장 확률표 보기

📚 도감 & 기록
━━━━━━━━━━━━━━
• 도감 - 수집 현황 보기
• 업적 - 업적 현황 보기
• 보상 - 도감 보상 받기
• 기록 - 플레이 통계 보기

📢 기타
━━━━━━━━━━━━━━
• 업데이트 - 패치 노트 보기
• 도움말 - 이 안내 보기

━━━━━━━━━━━━━━━━━━
💡 Tip: 하단 버튼으로도 이용 가능!`;

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getHelp 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 문의/건의
 */
async function getContact(req, res) {
  try {
    const text = `📬 문의 및 건의
━━━━━━━━━━━━━━━━━━

📧 GitHub Issues
github.com/1mJeeHwan/kakao-human-game

⚠️ 주의사항
• 비정상 플레이 시 제재될 수 있습니다`;

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getContact 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 업적 조회
 */
async function getAchievementsView(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);
    const progress = getAchievementProgress(user);
    const currentAchievements = user.collection?.achievements || [];

    // 최근 달성 업적 3개
    const recentAchievements = currentAchievements
      .slice(-3)
      .reverse()
      .map(id => ACHIEVEMENTS.find(a => a.id === id))
      .filter(a => a)
      .map(a => `${a.grade.emoji} ${a.name}`);

    // 등급별 진행도
    const gradeProgress = Object.entries(progress.byGrade)
      .map(([grade, data]) => `${data.emoji} ${data.completed}/${data.total}`)
      .join(' | ');

    // 다음 달성 가능 업적 힌트
    const nextAchievements = ACHIEVEMENTS
      .filter(a => !currentAchievements.includes(a.id))
      .slice(0, 3)
      .map(a => `⬜ ${a.grade.emoji} ${a.name}: ${a.description}`);

    const text = `🏆 업적 현황
━━━━━━━━━━━━━━━━━━
📊 전체 진행도: ${progress.completed}/${progress.total} (${progress.percentage}%)

${gradeProgress}

${recentAchievements.length > 0 ? `✨ 최근 달성:\n${recentAchievements.map(a => `   ${a}`).join('\n')}` : '아직 달성한 업적이 없습니다.'}

📋 다음 목표:
${nextAchievements.join('\n')}

💡 강화, 판매, 수집 등 다양한 활동으로
   업적을 달성하고 보상을 받으세요!`;

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getAchievementsView 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 업적 체크 및 보상 지급 (내부 함수)
 * @param {Object} user - 유저 객체
 * @param {Object} context - 추가 컨텍스트
 * @returns {Array} 새로 달성한 업적 목록
 */
async function processAchievements(user, context = {}) {
  const newAchievements = checkAchievements(user, context);

  if (newAchievements.length === 0) {
    return [];
  }

  // 업적 추가 및 보상 지급
  for (const achievement of newAchievements) {
    if (!user.collection.achievements.includes(achievement.id)) {
      user.collection.achievements.push(achievement.id);
      user.gold += achievement.reward;
      user.stats.totalGoldEarned += achievement.reward;
    }
  }

  return newAchievements;
}

/**
 * 업적 달성 메시지 생성
 * @param {Array} achievements - 달성한 업적 목록
 * @returns {string} 메시지
 */
function formatNewAchievements(achievements) {
  if (achievements.length === 0) return '';

  const achievementTexts = achievements.map(a =>
    `🏆 ${a.grade.emoji} ${a.name} 달성! (+${a.reward}G)`
  );

  return '\n\n' + achievementTexts.join('\n');
}

module.exports = {
  startGame,
  upgradeHuman,
  sellHuman,
  getRates,
  getCollection,
  claimReward,
  getUpdates,
  getStats,
  getHelp,
  getContact,
  getAchievementsView,
  processAchievements,
  formatNewAchievements,
  // 봇 방지 시스템 (관리자용)
  FLAGGED_USERS,
  userCooldowns,
  userRequestHistory,
  // 서버 과부하 대기줄 시스템 (관리자용)
  checkServerLoad,
  currentConcurrentRequests: () => currentConcurrentRequests,
  MAX_CONCURRENT_REQUESTS
};
