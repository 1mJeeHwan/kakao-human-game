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
  getStats
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

module.exports = router;
