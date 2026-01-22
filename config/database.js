/**
 * MongoDB 데이터베이스 연결 설정
 */

const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 20,           // 동시 연결 20개 (무료 티어 최적)
      minPoolSize: 2,            // 최소 2개 유지
      serverSelectionTimeoutMS: 5000,  // 서버 선택 타임아웃
      socketTimeoutMS: 45000     // 소켓 타임아웃
    });

    console.log('MongoDB 연결 성공');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 연결 끊김');
    });

  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    throw error;
  }
}

module.exports = { connectDatabase };
