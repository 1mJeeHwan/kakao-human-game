/**
 * 게임 컨트롤러 - 모든 게임 로직 처리
 */

const User = require('../models/User');
const { formatTitleInfo, GRADE_KOREAN: TITLE_GRADE_KOREAN } = require('../utils/titles');
const { formatJobInfo, getFullJobName, GRADE_KOREAN: JOB_GRADE_KOREAN } = require('../utils/jobs');
const {
  getUpgradeInfo,
  calculateUpgradeResult,
  getSellPrice,
  getTitleRerollCost,
  getJobRerollCost,
  formatGold,
  UPGRADE_TABLE,
  MAX_LEVEL
} = require('../utils/gameConfig');
const {
  getHumanFullName,
  createKakaoResponse,
  DEFAULT_QUICK_REPLIES,
  UPGRADE_QUICK_REPLIES,
  SELL_QUICK_REPLIES,
  REROLL_QUICK_REPLIES,
  extractUserId,
  getGradeEmoji
} = require('../utils/helpers');

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

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('startGame 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 인간 강화
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

더 이상 강화할 수 없습니다.
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

    // 강화 결과 계산
    const result = calculateUpgradeResult(human.level);
    const previousLevel = human.level;
    const previousName = getHumanFullName(human);

    let text;

    if (result === 'success') {
      user.levelUp();
      const newName = getHumanFullName(user.human);
      const sellPrice = getSellPrice(user.human.level, user.human.title.bonusRate, user.human.job.bonusRate);

      // 다음 강화 정보
      const nextInfo = getUpgradeInfo(user.human.level);
      let nextInfoText = '';

      if (nextInfo) {
        nextInfoText = `

📈 다음 강화
- 비용: ${formatGold(nextInfo.cost)}
- 성공: ${nextInfo.success}%
- 사망: ${nextInfo.death}%`;
      } else {
        nextInfoText = '\n\n🎉 최대 레벨 달성!';
      }

      text = `✨ 강화 성공! ✨

👤 ${newName}

💰 사용: ${formatGold(upgradeInfo.cost)}
💰 남은 골드: ${formatGold(user.gold)}
💵 현재 판매가: ${formatGold(sellPrice)}${nextInfoText}`;

    } else if (result === 'death') {
      const oldHumanName = previousName;
      user.handleDeath();
      const newHumanName = getHumanFullName(user.human);

      text = `💀 인간이 사망했습니다...

🪦 고인: ${oldHumanName}

👤 새로운 인간이 도착했습니다!
🏷️ ${newHumanName}

💰 남은 골드: ${formatGold(user.gold)}

😢 다음에는 더 좋은 인간이 오길...`;

    } else {
      // 실패 (유지)
      user.stats.failCount += 1;
      const sellPrice = getSellPrice(human.level, human.title.bonusRate, human.job.bonusRate);

      text = `❌ 강화 실패!

👤 ${getHumanFullName(human)} (유지)

💰 사용: ${formatGold(upgradeInfo.cost)}
💰 남은 골드: ${formatGold(user.gold)}
💵 현재 판매가: ${formatGold(sellPrice)}

📈 다음 강화
- 비용: ${formatGold(upgradeInfo.cost)}
- 성공: ${upgradeInfo.success}%
- 사망: ${upgradeInfo.death}%`;
    }

    await user.save();
    return res.json(createKakaoResponse(text, UPGRADE_QUICK_REPLIES));

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

💡 최소 +1 이상 강화해야 판매할 수 있습니다.`;

      return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));
    }

    const sellPrice = getSellPrice(human.level, human.title.bonusRate, human.job.bonusRate);
    const basePrice = Math.pow(2, human.level) * 1000;
    const titleBonus = Math.round(human.title.bonusRate * 100);
    const jobBonus = Math.round(human.job.bonusRate * 100);

    const soldHumanName = getHumanFullName(human);

    // 골드 추가 및 통계 업데이트
    user.gold += sellPrice;
    user.stats.totalGoldEarned += sellPrice;

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

    await user.save();
    return res.json(createKakaoResponse(text, SELL_QUICK_REPLIES));

  } catch (error) {
    console.error('sellHuman 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 칭호 리롤
 */
async function rerollTitle(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);
    const cost = getTitleRerollCost(user.human.level);

    // 골드 부족 체크
    if (user.gold < cost) {
      const text = `❌ 골드가 부족합니다!

칭호 변경 비용: ${formatGold(cost)}
보유: ${formatGold(user.gold)}`;

      return res.json(createKakaoResponse(text, REROLL_QUICK_REPLIES));
    }

    // 골드 차감
    user.gold -= cost;
    user.stats.totalGoldSpent += cost;

    // 리롤
    const { oldTitle, newTitle } = user.rerollTitle();

    const oldBonus = Math.round((TITLE_GRADE_KOREAN[oldTitle] ? 0 : oldTitle.bonusRate || 0) * 100);
    const newBonus = Math.round(newTitle.bonusRate * 100);
    const newGradeKorean = TITLE_GRADE_KOREAN[newTitle.grade];

    const humanName = getHumanFullName(user.human);

    const text = `🎲 칭호 변경!

이전: ${oldTitle}
현재: ${newTitle.name} (${newGradeKorean} +${newBonus}%) ${getGradeEmoji(newTitle.grade)}

💰 사용: ${formatGold(cost)}
💰 남은: ${formatGold(user.gold)}

👤 ${humanName}`;

    await user.save();
    return res.json(createKakaoResponse(text, REROLL_QUICK_REPLIES));

  } catch (error) {
    console.error('rerollTitle 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 직업 리롤
 */
async function rerollJob(req, res) {
  try {
    const userId = extractUserId(req.body);

    if (!userId) {
      return res.json(createKakaoResponse('유저 정보를 찾을 수 없습니다.'));
    }

    const user = await User.findOrCreate(userId);
    const cost = getJobRerollCost(user.human.level);

    // 골드 부족 체크
    if (user.gold < cost) {
      const text = `❌ 골드가 부족합니다!

직업 변경 비용: ${formatGold(cost)}
보유: ${formatGold(user.gold)}`;

      return res.json(createKakaoResponse(text, REROLL_QUICK_REPLIES));
    }

    // 골드 차감
    user.gold -= cost;
    user.stats.totalGoldSpent += cost;

    // 리롤
    const { oldJob, newJob } = user.rerollJob();

    const newBonus = Math.round(newJob.bonusRate * 100);
    const newGradeKorean = JOB_GRADE_KOREAN[newJob.grade];

    const humanName = getHumanFullName(user.human);

    const text = `🎲 직업 변경!

이전: ${oldJob}
현재: ${newJob.name} (${newGradeKorean} +${newBonus}%) ${getGradeEmoji(newJob.grade)}

💰 사용: ${formatGold(cost)}
💰 남은: ${formatGold(user.gold)}

👤 ${humanName}`;

    await user.save();
    return res.json(createKakaoResponse(text, REROLL_QUICK_REPLIES));

  } catch (error) {
    console.error('rerollJob 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

/**
 * 확률표 조회
 */
async function getRates(req, res) {
  try {
    // 강화 확률표 생성
    let upgradeRatesText = '📊 강화 확률표\n━━━━━━━━━━━━━━';

    for (const info of UPGRADE_TABLE) {
      upgradeRatesText += `\n+${info.level}→+${info.level + 1}: ${info.success}% (사망 ${info.death}%) ${formatGold(info.cost)}`;
    }

    const text = `${upgradeRatesText}

🏷️ 칭호 확률
━━━━━━━━━━━━━━
일반: 40% (평범한, 순수한...)
고급: 30% (부지런한, 성실한...)
희귀: 20% (용맹한, 천재적인...)
영웅: 8% (위대한, 고귀한...)
전설: 2% (전설의, 신화적인...)

💼 직업 확률
━━━━━━━━━━━━━━
일반: 50% (회사원, 백수...)
고급: 30% (요리사, 개발자...)
희귀: 15% (의사, 마법사...)
전설: 5% (용사, 연금술사...)`;

    return res.json(createKakaoResponse(text, DEFAULT_QUICK_REPLIES));

  } catch (error) {
    console.error('getRates 오류:', error);
    return res.json(createKakaoResponse('오류가 발생했습니다. 다시 시도해주세요.'));
  }
}

module.exports = {
  startGame,
  upgradeHuman,
  sellHuman,
  rerollTitle,
  rerollJob,
  getRates
};
