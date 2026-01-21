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
