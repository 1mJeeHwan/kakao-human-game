/**
 * 게임 컨트롤러 - 모든 게임 로직 처리
 */

const User = require('../models/User');
const { formatTitleInfo, GRADE_KOREAN: TITLE_GRADE_KOREAN, TITLES } = require('../utils/titles');
const { formatJobInfo, getFullJobName, GRADE_KOREAN: JOB_GRADE_KOREAN, JOBS } = require('../utils/jobs');
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

    const text = `👤 나의 인간
━━━━━━━━━━━━━━━━━━
🏷️ ${humanName}

📊 수식어 정보
- 칭호: ${human.title.name} (${titleGradeKorean} +${titleBonus}%) ${getGradeEmoji(human.title.grade)}
- 직업: ${human.job.name} (${jobGradeKorean} +${jobBonus}%) ${getGradeEmoji(human.job.grade)}

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
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
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

    // 골드 부족 체크
    if (user.gold < upgradeInfo.cost) {
      const text = `❌ 골드가 부족합니다!

필요: ${formatGold(upgradeInfo.cost)}
보유: ${formatGold(user.gold)}

💡 인간을 판매하여 골드를 획득하세요!`;

      return res.json(createKakaoResponse(text, SELL_QUICK_REPLIES));
    }

    // 골드 차감 및 통계 업데이트
    user.gold -= upgradeInfo.cost;
    user.stats.totalAttempts += 1;
    user.stats.totalGoldSpent += upgradeInfo.cost;
    user.human.totalSpentOnHuman = (user.human.totalSpentOnHuman || 0) + upgradeInfo.cost;

    // 성장 결과 계산
    const result = calculateUpgradeResult(human.level);
    const previousLevel = human.level;
    const previousName = getHumanFullName(human);

    let text;

    if (result === 'success') {
      user.levelUp();

      // 랜덤 칭호/직업 변경 체크
      let changeText = '';

      if (shouldChangeTitle()) {
        const { oldTitle, newTitle } = user.rerollTitle();
        const newGradeKorean = TITLE_GRADE_KOREAN[newTitle.grade];
        const newBonus = Math.round(newTitle.bonusRate * 100);
        changeText += `\n\n🎲 칭호가 변경되었습니다!\n${oldTitle} → ${newTitle.name} (${newGradeKorean} +${newBonus}%) ${getGradeEmoji(newTitle.grade)}`;
      }

      if (shouldChangeJob()) {
        const { oldJob, newJob } = user.rerollJob();
        const newGradeKorean = JOB_GRADE_KOREAN[newJob.grade];
        const newBonus = Math.round(newJob.bonusRate * 100);
        changeText += `\n\n🎲 직업이 변경되었습니다!\n${oldJob} → ${newJob.name} (${newGradeKorean} +${newBonus}%) ${getGradeEmoji(newJob.grade)}`;
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

      text = `✨ 성장 성공! ✨

👤 ${newName}

💰 사용: ${formatGold(upgradeInfo.cost)}
💰 남은 골드: ${formatGold(user.gold)}
💵 현재 판매가: ${formatGold(sellPrice)}${changeText}${nextInfoText}`;

      await user.save();
      const successImage = getJobImage(user.human.job.name, user.human.job.grade, user.human.level, user.human.title.grade);
      return res.json(createKakaoMixedResponse(text, successImage, UPGRADE_QUICK_REPLIES));

    } else if (result === 'death') {
      const oldHumanName = previousName;
      const totalSpent = user.human.totalSpentOnHuman || 0;

      // 파괴 지원금 계산
      const deathSupport = calculateDeathSupport(totalSpent);
      user.gold += deathSupport.refundAmount;

      // 잭팟 통계 업데이트
      if (deathSupport.isJackpot) {
        user.stats.jackpotCount += 1;
      }

      user.handleDeath();
      const newHumanName = getHumanFullName(user.human);

      // 파괴 지원금 메시지
      let supportText = '';
      if (deathSupport.isJackpot) {
        supportText = `\n\n🎉🎉 잭팟! 🎉🎉\n💸 파괴 지원금: ${formatGold(deathSupport.refundAmount)} (${deathSupport.refundRate}%)`;
      } else if (deathSupport.refundAmount > 0) {
        supportText = `\n\n💸 파괴 지원금: ${formatGold(deathSupport.refundAmount)} (${deathSupport.refundRate}%)`;
      } else {
        supportText = '\n\n💸 파괴 지원금: 없음 (운이 없네요...)';
      }

      text = `💀 인간이 사망했습니다...

🪦 고인: ${oldHumanName}
💰 투자금: ${formatGold(totalSpent)}${supportText}

👤 새로운 인간이 도착했습니다!
🏷️ ${newHumanName}

💰 남은 골드: ${formatGold(user.gold)}`;

      await user.save();
      const deathImage = getStatusImage('death', previousLevel);
      return res.json(createKakaoMixedResponse(text, deathImage, UPGRADE_QUICK_REPLIES));

    } else {
      // 실패 (유지)
      user.stats.failCount += 1;
      const sellPrice = getSellPrice(human.level, human.title.bonusRate, human.job.bonusRate);

      text = `❌ 성장 실패!

👤 ${getHumanFullName(human)} (유지)

💰 사용: ${formatGold(upgradeInfo.cost)}
💰 남은 골드: ${formatGold(user.gold)}
💵 현재 판매가: ${formatGold(sellPrice)}

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

    const sellPrice = getSellPrice(human.level, human.title.bonusRate, human.job.bonusRate);
    const basePrice = Math.pow(2, human.level) * SELL_PRICE_MULTIPLIER;
    const titleBonus = Math.round(human.title.bonusRate * 100);
    const jobBonus = Math.round(human.job.bonusRate * 100);

    const soldHumanName = getHumanFullName(human);

    // 골드 추가 및 통계 업데이트
    user.gold += sellPrice;
    user.stats.totalGoldEarned += sellPrice;
    user.stats.totalHumansSold += 1;

    // 새 캐릭터 생성
    user.createNewHuman();
    const newHumanName = getHumanFullName(user.human);

    const text = `💰 판매 완료!
━━━━━━━━━━━━━━━━━━
🪦 판매한 인간
${soldHumanName}

💵 정산 내역
- 기본가: ${formatGold(basePrice)}
- 칭호 보너스: +${titleBonus}%
- 직업 보너스: +${jobBonus}%
━━━━━━━━━━━━━━━━━━
💵 총 획득: ${formatGold(sellPrice)}

💰 보유 골드: ${formatGold(user.gold)}

👤 새로운 인간이 도착!
🏷️ ${newHumanName}`;

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

    // 칭호 완성 보상 (100,000G)
    if (titleComplete && !user.collection.rewardsClaimed.titleComplete) {
      rewardGold += 100000;
      user.collection.rewardsClaimed.titleComplete = true;
      rewardText += '🏷️ 칭호 도감 완성! +100,000G\n';
    }

    // 직업 완성 보상 (150,000G)
    if (jobComplete && !user.collection.rewardsClaimed.jobComplete) {
      rewardGold += 150000;
      user.collection.rewardsClaimed.jobComplete = true;
      rewardText += '💼 직업 도감 완성! +150,000G\n';
    }

    // 전체 완성 보상 (500,000G)
    if (allComplete && !user.collection.rewardsClaimed.allComplete) {
      rewardGold += 500000;
      user.collection.rewardsClaimed.allComplete = true;
      rewardText += '🌟 전체 도감 완성! +500,000G\n';
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
          '- 잭팟 시 200% 환급!',
          '⚔️ 10강부터 사망 시작',
          '💰 7강부터 2배 판매가 보너스'
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

module.exports = {
  startGame,
  upgradeHuman,
  sellHuman,
  getRates,
  getCollection,
  claimReward,
  getUpdates,
  getStats,
  getHelp
};
