/**
 * 게임 API 라우터
 */

const express = require('express');
const router = express.Router();

const {
  startGame,
  upgradeHuman,
  sellHuman,
  getRates,
  getCollection,
  claimReward,
  getUpdates,
  getStats,
  getHelp
} = require('../controllers/gameController');

// 게임 시작 / 상태 조회
router.post('/start', startGame);

// 인간 성장
router.post('/upgrade', upgradeHuman);

// 인간 판매
router.post('/sell', sellHuman);

// 확률표 조회
router.post('/rates', getRates);

// 도감 조회
router.post('/collection', getCollection);

// 도감 보상 수령
router.post('/reward', claimReward);

// 업데이트 공지
router.post('/updates', getUpdates);

// 통계 조회
router.post('/stats', getStats);

// 도움말 (챗봇)
router.post('/help', getHelp);

// 게임 정보 웹페이지 (GET) - 비용표, 칭호표, 직업표
router.get('/info', (req, res) => {
  const { UPGRADE_TABLE } = require('../utils/gameConfig');
  const { TITLES, TITLE_GRADES } = require('../utils/titles');
  const { JOBS, JOB_GRADES } = require('../utils/jobs');

  // 판매가 계산 함수
  const getSellPrice = (level) => {
    if (level === 0) return 0;
    const SELL_PRICE_MULTIPLIER = 100;
    const DEATH_START_LEVEL = 7;
    if (level < DEATH_START_LEVEL) {
      return Math.pow(2, level) * SELL_PRICE_MULTIPLIER;
    } else {
      const riskMultiplier = Math.pow(2, level - DEATH_START_LEVEL + 1);
      return Math.pow(2, level) * SELL_PRICE_MULTIPLIER * riskMultiplier;
    }
  };

  // 숫자 포맷
  const formatNum = (n) => n.toLocaleString('ko-KR');

  // 성장 테이블 HTML
  let upgradeRows = '';
  for (const info of UPGRADE_TABLE) {
    const sellPrice = getSellPrice(info.level + 1);
    const ratio = ((info.cost / sellPrice) * 100).toFixed(1);
    const rowClass = info.level >= 10 ? 'danger' : info.level >= 5 ? 'warning' : '';
    upgradeRows += '<tr class="' + rowClass + '">' +
      '<td>' + info.level + '→' + (info.level + 1) + '</td>' +
      '<td class="success">' + info.success + '%</td>' +
      '<td>' + info.fail + '%</td>' +
      '<td class="death">' + info.death + '%</td>' +
      '<td>' + formatNum(info.cost) + 'G</td>' +
      '<td>' + formatNum(sellPrice) + 'G</td>' +
      '<td>' + ratio + '%</td>' +
      '</tr>';
  }

  // 칭호 테이블 HTML
  const gradeOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const gradeKorean = { common: '일반', uncommon: '고급', rare: '희귀', epic: '영웅', legendary: '전설' };
  const gradeColors = { common: '#808080', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };

  let titleRows = '';
  for (const grade of gradeOrder) {
    const titlesOfGrade = TITLES.filter(t => t.grade === grade);
    const bonus = titlesOfGrade[0]?.bonusRate * 100 || 0;
    titleRows += '<tr>' +
      '<td><span class="grade-badge" style="background:' + gradeColors[grade] + '">' + gradeKorean[grade] + '</span></td>' +
      '<td>+' + bonus + '%</td>' +
      '<td>' + titlesOfGrade.length + '개</td>' +
      '<td class="title-list">' + titlesOfGrade.map(t => t.name).join(', ') + '</td>' +
      '</tr>';
  }

  // 직업 테이블 HTML
  let jobRows = '';
  for (const grade of ['common', 'uncommon', 'rare', 'legendary']) {
    const jobsOfGrade = JOBS.filter(j => j.grade === grade);
    const bonus = jobsOfGrade[0]?.bonusRate * 100 || 0;
    jobRows += '<tr>' +
      '<td><span class="grade-badge" style="background:' + gradeColors[grade] + '">' + gradeKorean[grade] + '</span></td>' +
      '<td>+' + bonus + '%</td>' +
      '<td>' + jobsOfGrade.length + '개</td>' +
      '<td class="title-list">' + jobsOfGrade.map(j => j.name).join(', ') + '</td>' +
      '</tr>';
  }

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>인간 키우기 - 게임 정보</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      padding: 20px;
      color: #fff;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 30px; font-size: 28px; }
    h2 { margin: 30px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #667eea; }
    .card {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px 8px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
    th { background: rgba(102, 126, 234, 0.3); font-weight: 600; }
    tr:hover { background: rgba(255,255,255,0.05); }
    tr.warning { background: rgba(251, 191, 36, 0.1); }
    tr.danger { background: rgba(239, 68, 68, 0.1); }
    .success { color: #4ade80; font-weight: bold; }
    .death { color: #f87171; font-weight: bold; }
    .grade-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      color: white;
      font-size: 13px;
      font-weight: bold;
    }
    .title-list { text-align: left; font-size: 13px; color: #ccc; }
    .info-box {
      background: rgba(102, 126, 234, 0.2);
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-item {
      background: rgba(255,255,255,0.1);
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; color: #aaa; margin-top: 5px; }
    .nav-links {
      text-align: center;
      margin-bottom: 20px;
    }
    .nav-links a {
      color: #667eea;
      margin: 0 10px;
      text-decoration: none;
    }
    .nav-links a:hover { text-decoration: underline; }
    @media (max-width: 600px) {
      th, td { padding: 6px 4px; font-size: 12px; }
      .title-list { font-size: 11px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>👤 인간 키우기 게임 정보</h1>

    <div class="nav-links">
      <a href="/game/help">도움말</a> |
      <a href="/game/info">게임 정보</a> |
      <a href="https://github.com/1mJeeHwan/kakao-human-game">GitHub</a>
    </div>

    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-value">${TITLES.length}</div>
        <div class="stat-label">칭호 수</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${JOBS.length}</div>
        <div class="stat-label">직업 수</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">15</div>
        <div class="stat-label">최대 레벨</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">5,000G</div>
        <div class="stat-label">시작 골드</div>
      </div>
    </div>

    <div class="card">
      <h2>⚔️ 성장 확률표</h2>
      <div class="info-box">
        💡 5강 이후 점진적 난이도 증가, 10강 이후 본격적인 지옥 시작!<br>
        💀 사망 시 파괴 지원금 지급 (투자금의 50~200%)
      </div>
      <table>
        <thead>
          <tr>
            <th>레벨</th>
            <th>성공</th>
            <th>실패</th>
            <th>사망</th>
            <th>비용</th>
            <th>판매가</th>
            <th>비용률</th>
          </tr>
        </thead>
        <tbody>
          ${upgradeRows}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>🏷️ 칭호 목록 (총 ${TITLES.length}개)</h2>
      <div class="info-box">
        🎲 성장 성공 시 20% 확률로 칭호 변경!<br>
        💰 높은 등급일수록 판매 보너스 증가
      </div>
      <table>
        <thead>
          <tr>
            <th>등급</th>
            <th>보너스</th>
            <th>개수</th>
            <th>칭호 목록</th>
          </tr>
        </thead>
        <tbody>
          ${titleRows}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>💼 직업 목록 (총 ${JOBS.length}개)</h2>
      <div class="info-box">
        🎲 성장 성공 시 15% 확률로 직업 변경!<br>
        📈 레벨에 따라 직업 수식어 변경 (수습 → 견습 → 숙련 → 베테랑 → 마스터 → 그랜드마스터)
      </div>
      <table>
        <thead>
          <tr>
            <th>등급</th>
            <th>보너스</th>
            <th>개수</th>
            <th>직업 목록</th>
          </tr>
        </thead>
        <tbody>
          ${jobRows}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>🎁 도감 완성 보상</h2>
      <table>
        <thead>
          <tr><th>조건</th><th>보상</th></tr>
        </thead>
        <tbody>
          <tr><td>칭호 도감 완성</td><td>100,000G</td></tr>
          <tr><td>직업 도감 완성</td><td>150,000G</td></tr>
          <tr><td>전체 도감 완성</td><td>500,000G</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  res.send(html);
});

// 도움말 웹페이지 (GET)
router.get('/help', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>인간 키우기 - 도움말</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .command {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .command:last-child { border-bottom: none; }
    .command-name {
      font-weight: bold;
      color: #333;
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .command-desc { color: #666; }
    .tip {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin-top: 10px;
      border-radius: 0 8px 8px 0;
    }
    .grades { margin-top: 10px; }
    .grade {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      margin: 4px;
      font-size: 14px;
    }
    .grade.common { background: #e0e0e0; }
    .grade.uncommon { background: #4ade80; color: white; }
    .grade.rare { background: #60a5fa; color: white; }
    .grade.epic { background: #c084fc; color: white; }
    .grade.legendary { background: #fbbf24; }
    .footer {
      text-align: center;
      color: white;
      margin-top: 20px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>👤 인간 키우기</h1>

    <div class="card">
      <h2>🎮 기본 명령어</h2>
      <div class="command">
        <span class="command-name">시작</span>
        <span class="command-desc">내 인간 상태 확인</span>
      </div>
      <div class="command">
        <span class="command-name">성장</span>
        <span class="command-desc">인간 성장시키기</span>
      </div>
      <div class="command">
        <span class="command-name">판매</span>
        <span class="command-desc">인간 판매하기</span>
      </div>
      <div class="command">
        <span class="command-name">확률</span>
        <span class="command-desc">성장 확률표 보기</span>
      </div>
    </div>

    <div class="card">
      <h2>📚 도감 & 기록</h2>
      <div class="command">
        <span class="command-name">도감</span>
        <span class="command-desc">칭호/직업 수집 현황</span>
      </div>
      <div class="command">
        <span class="command-name">보상</span>
        <span class="command-desc">도감 완성 보상 받기</span>
      </div>
      <div class="command">
        <span class="command-name">기록</span>
        <span class="command-desc">플레이 통계 보기</span>
      </div>
    </div>

    <div class="card">
      <h2>📢 기타</h2>
      <div class="command">
        <span class="command-name">업데이트</span>
        <span class="command-desc">패치 노트 보기</span>
      </div>
      <div class="command">
        <span class="command-name">도움말</span>
        <span class="command-desc">명령어 안내 보기</span>
      </div>
    </div>

    <div class="card">
      <h2>🏷️ 등급 시스템</h2>
      <p style="color:#666; margin-bottom:10px;">칭호와 직업에는 등급이 있어요!</p>
      <div class="grades">
        <span class="grade common">일반</span>
        <span class="grade uncommon">🔹 고급</span>
        <span class="grade rare">✨ 희귀</span>
        <span class="grade epic">⭐ 영웅</span>
        <span class="grade legendary">🌟 전설</span>
      </div>
      <div class="tip">
        💡 높은 등급일수록 판매 보너스가 높아요!
      </div>
    </div>

    <div class="card">
      <h2>⚔️ 게임 팁</h2>
      <div class="tip">
        🎯 7강부터 판매가가 2배씩 증가해요!<br>
        💀 10강부터 사망 확률이 생겨요<br>
        💸 사망 시 파괴 지원금을 받을 수 있어요<br>
        🎲 성장 성공 시 칭호/직업이 바뀔 수 있어요
      </div>
    </div>

    <div class="footer">
      <p>카카오톡에서 채널 추가 후 플레이하세요!</p>
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

module.exports = router;
