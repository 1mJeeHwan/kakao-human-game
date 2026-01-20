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
      maxPoolSize: 10
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
