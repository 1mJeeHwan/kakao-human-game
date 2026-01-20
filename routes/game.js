/**
 * 게임 API 라우터
 */

const express = require('express');
const router = express.Router();

const {
  startGame,
  upgradeHuman,
  sellHuman,
  rerollTitle,
  rerollJob,
  getRates
} = require('../controllers/gameController');

// 게임 시작 / 상태 조회
router.post('/start', startGame);

// 인간 강화
router.post('/upgrade', upgradeHuman);

// 인간 판매
router.post('/sell', sellHuman);

// 칭호 리롤
router.post('/reroll/title', rerollTitle);

// 직업 리롤
router.post('/reroll/job', rerollJob);

// 확률표 조회
router.post('/rates', getRates);

module.exports = router;
