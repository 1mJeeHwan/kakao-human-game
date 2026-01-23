/**
 * 인간 키우기 게임 서버
 * 카카오톡 챗봇 기반 게임
 */

require('dotenv').config();

// Sentry 에러 모니터링 (환경변수 설정 시 활성화)
const Sentry = process.env.SENTRY_DSN ? require('@sentry/node') : null;
if (Sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,  // 10% 샘플링
  });
  console.log('✅ Sentry 에러 모니터링 활성화');
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { connectDatabase } = require('./config/database');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// 보안 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },  // 이미지 외부 접근 허용
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // 인라인 스크립트 허용 (guide.html)
      styleSrc: ["'self'", "'unsafe-inline'"],   // 인라인 스타일 허용
      imgSrc: ["'self'", "data:", "https:"],     // 외부 이미지 허용
    }
  }
}));

// 응답 압축 (네트워크 대역폭 절약)
app.use(compression());

// Rate Limiting - 남용 방지
const apiLimiter = rateLimit({
  windowMs: 1000,        // 1초
  max: 10,               // 1초에 10번까지
  message: {
    version: "2.0",
    template: {
      outputs: [{
        simpleText: { text: "⚠️ 너무 빠르게 요청하고 있습니다!\n잠시 후 다시 시도해주세요." }
      }]
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 기본 미들웨어
app.use(cors());
app.use(express.json({ limit: '1mb' }));  // 요청 크기 제한

// 정적 파일 서빙 (이미지, CSS 등)
app.use(express.static(path.join(__dirname, 'public')));

// 요청 로깅 (개발용)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// 헬스 체크
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '인간 키우기 게임 서버',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const memUsage = process.memoryUsage();

  res.json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 프록시 신뢰 (Render 등 클라우드 환경)
app.set('trust proxy', 1);

// 게임 API 라우트 (Rate Limiting 적용)
app.use('/game', apiLimiter, gameRoutes);

// 관리자 API 라우트 (Rate Limiting 없음)
app.use('/admin', adminRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `${req.method} ${req.path} 경로를 찾을 수 없습니다.`
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);

  // Sentry로 에러 전송
  if (Sentry) {
    Sentry.captureException(err);
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: '서버 오류가 발생했습니다.'
  });
});

// 서버 시작
async function startServer() {
  try {
    // MongoDB 연결
    await connectDatabase();

    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`환경: ${process.env.NODE_ENV || 'production'}`);
      console.log(`최적화: helmet, compression, rate-limit 활성화`);
    });

    // Graceful Shutdown (안전한 종료)
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} 신호 수신, 서버를 안전하게 종료합니다...`);

      server.close(async () => {
        console.log('HTTP 서버 종료 완료');
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          console.log('MongoDB 연결 종료 완료');
          process.exit(0);
        } catch (err) {
          console.error('MongoDB 종료 오류:', err);
          process.exit(1);
        }
      });

      // 10초 후 강제 종료
      setTimeout(() => {
        console.error('강제 종료');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();
