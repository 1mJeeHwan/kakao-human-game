/**
 * 관리자 API 라우터
 * 보안: ADMIN_KEY 환경변수로 인증
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const {
  FLAGGED_USERS,
  userCooldowns,
  userRequestHistory,
  checkServerLoad,
  currentConcurrentRequests,
  MAX_CONCURRENT_REQUESTS
} = require('../controllers/gameController');

// 비밀번호 시도 제한
const passwordAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5분

/**
 * 1차 비밀번호 검증 (Admin Key 없이 접근 가능)
 * POST /admin/verify-password
 */
router.post('/verify-password', (req, res) => {
  const { password } = req.body;
  const clientIP = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  // 환경변수 확인
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_PASSWORD_SALT) {
    return res.status(500).json({ error: 'Password not configured' });
  }

  // 잠금 확인
  const attemptInfo = passwordAttempts.get(clientIP) || { count: 0, lockUntil: 0 };
  if (Date.now() < attemptInfo.lockUntil) {
    const remaining = Math.ceil((attemptInfo.lockUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: 'Too many attempts',
      lockoutSeconds: remaining
    });
  }

  // 비밀번호 해시 생성 (salt + password)
  const hash = crypto
    .createHash('sha256')
    .update(process.env.ADMIN_PASSWORD_SALT + password)
    .digest('hex');

  if (hash === process.env.ADMIN_PASSWORD_HASH) {
    // 성공 시 시도 횟수 초기화
    passwordAttempts.delete(clientIP);
    return res.json({ success: true });
  } else {
    // 실패 시 시도 횟수 증가
    attemptInfo.count++;
    if (attemptInfo.count >= MAX_ATTEMPTS) {
      attemptInfo.lockUntil = Date.now() + LOCKOUT_DURATION;
      attemptInfo.count = 0;
    }
    passwordAttempts.set(clientIP, attemptInfo);

    const remaining = MAX_ATTEMPTS - attemptInfo.count;
    return res.status(401).json({
      error: 'Invalid password',
      remainingAttempts: remaining > 0 ? remaining : 0
    });
  }
});

// 관리자 인증 미들웨어
function adminAuth(req, res, next) {
  const adminKey = req.headers['x-admin-key'] || req.body.adminKey || req.query.adminKey;

  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ error: 'ADMIN_KEY not configured' });
  }

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  next();
}

// 이하 라우트는 Admin Key 필요
router.use(adminAuth);

/**
 * 서버 상태 조회
 * GET /admin/status
 */
router.get('/status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const memUsage = process.memoryUsage();

    // 총 유저 수
    const totalUsers = await User.countDocuments();

    // 오늘 활성 유저 (24시간 내 접속)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } });

    // 서버 부하 상태
    const loadStatus = checkServerLoad();

    res.json({
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        totalUsers,
        activeUsers24h: activeUsers
      },
      serverLoad: {
        currentRequests: loadStatus.currentLoad,
        maxRequests: loadStatus.maxLoad,
        overloaded: loadStatus.overloaded,
        loadPercent: Math.round((loadStatus.currentLoad / loadStatus.maxLoad) * 100) + '%'
      },
      botPrevention: {
        cooldownTracking: userCooldowns.size,
        historyTracking: userRequestHistory.size,
        flaggedUsers: FLAGGED_USERS.size,
        flaggedList: Array.from(FLAGGED_USERS)
      }
    });
  } catch (error) {
    console.error('Admin status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 플래그된 유저 목록
 * GET /admin/flagged
 */
router.get('/flagged', (req, res) => {
  res.json({
    count: FLAGGED_USERS.size,
    users: Array.from(FLAGGED_USERS)
  });
});

/**
 * 유저 플래그 해제
 * POST /admin/unflag/:userId
 */
router.post('/unflag/:userId', (req, res) => {
  const { userId } = req.params;

  if (FLAGGED_USERS.has(userId)) {
    FLAGGED_USERS.delete(userId);
    // 쿨다운 기록도 초기화
    userCooldowns.delete(userId);
    userRequestHistory.delete(userId);

    console.log(`✅ [ADMIN] User ${userId} unflagged`);
    res.json({ success: true, message: `${userId} unflagged successfully` });
  } else {
    res.json({ success: false, message: `${userId} was not flagged` });
  }
});

/**
 * 모든 플래그 초기화
 * POST /admin/unflag-all
 */
router.post('/unflag-all', (req, res) => {
  const count = FLAGGED_USERS.size;
  FLAGGED_USERS.clear();
  userCooldowns.clear();
  userRequestHistory.clear();

  console.log(`✅ [ADMIN] All ${count} users unflagged`);
  res.json({ success: true, message: `${count} users unflagged` });
});

/**
 * 유저 조회
 * GET /admin/user/:oderId
 */
router.get('/user/:oderId', async (req, res) => {
  try {
    const { oderId } = req.params;
    const user = await User.findOne({ oderId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      oderId: user.oderId,
      gold: user.gold,
      human: {
        title: user.human.title.name,
        job: user.human.job.name,
        level: user.human.level
      },
      stats: user.stats,
      collection: {
        titlesCount: user.collection?.titles?.length || 0,
        jobsCount: user.collection?.jobs?.length || 0,
        achievementsCount: user.collection?.achievements?.length || 0
      },
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      isFlagged: FLAGGED_USERS.has(oderId)
    });
  } catch (error) {
    console.error('Admin user lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 골드 지급
 * POST /admin/give-gold
 * Body: { userId, amount, reason }
 */
router.post('/give-gold', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'userId and amount required' });
    }

    const user = await User.findOne({ oderId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const previousGold = user.gold;
    user.gold += parseInt(amount);
    await user.save();

    console.log(`✅ [ADMIN] Gave ${amount}G to ${userId}. Reason: ${reason || 'N/A'}`);

    res.json({
      success: true,
      userId,
      previousGold,
      addedGold: parseInt(amount),
      newGold: user.gold,
      reason: reason || 'N/A'
    });
  } catch (error) {
    console.error('Admin give-gold error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 유저 검색 (골드, 레벨 기준)
 * GET /admin/users?minGold=1000&minLevel=10&limit=20
 */
router.get('/users', async (req, res) => {
  try {
    const { minGold, minLevel, limit = 20 } = req.query;

    const query = {};
    if (minGold) query.gold = { $gte: parseInt(minGold) };
    if (minLevel) query['human.level'] = { $gte: parseInt(minLevel) };

    const users = await User.find(query)
      .select('oderId gold human.level human.title.name human.job.name stats.maxLevel lastActiveAt')
      .sort({ gold: -1 })
      .limit(parseInt(limit));

    res.json({
      count: users.length,
      users: users.map(u => ({
        oderId: u.oderId,
        gold: u.gold,
        level: u.human.level,
        maxLevel: u.stats.maxLevel,
        title: u.human.title.name,
        job: u.human.job.name,
        lastActive: u.lastActiveAt
      }))
    });
  } catch (error) {
    console.error('Admin users search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 통계 대시보드
 * GET /admin/stats
 */
router.get('/stats', async (req, res) => {
  try {
    // 총 유저 통계
    const totalUsers = await User.countDocuments();

    // 시간대별 활성 유저
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [activeHour, activeDay, activeWeek] = await Promise.all([
      User.countDocuments({ lastActiveAt: { $gte: oneHourAgo } }),
      User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      User.countDocuments({ lastActiveAt: { $gte: oneWeekAgo } })
    ]);

    // 골드 분포
    const goldStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalGold: { $sum: '$gold' },
          avgGold: { $avg: '$gold' },
          maxGold: { $max: '$gold' }
        }
      }
    ]);

    // 레벨 분포
    const levelStats = await User.aggregate([
      {
        $group: {
          _id: '$human.level',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        activeLastHour: activeHour,
        activeLastDay: activeDay,
        activeLastWeek: activeWeek
      },
      economy: goldStats[0] || { totalGold: 0, avgGold: 0, maxGold: 0 },
      levelDistribution: levelStats.reduce((acc, item) => {
        acc[`level_${item._id}`] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
