/**
 * 인간 키우기 게임 서버
 * 카카오톡 챗봇 기반 게임
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDatabase } = require('./config/database');
const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

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
  res.json({ status: 'healthy' });
});

// 게임 API 라우트
app.use('/game', gameRoutes);

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
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();
