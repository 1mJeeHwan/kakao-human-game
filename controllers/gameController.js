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

module.exports = {
  startGame,
  upgradeHuman,
  sellHuman,
  getRates
};
