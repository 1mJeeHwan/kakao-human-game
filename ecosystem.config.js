/**
 * PM2 설정
 * Render 무료 티어: 단일 인스턴스 (fork 모드)
 * 유료 서버: 클러스터 모드로 변경 가능
 */
module.exports = {
  apps: [{
    name: 'human-game',
    script: 'server.js',
    instances: 1,          // 무료 티어: 단일 인스턴스
    exec_mode: 'fork',     // fork 모드 (메모리 절약)
    watch: false,
    max_memory_restart: '450M',  // 메모리 450MB 초과시 재시작 (512MB 제한 고려)
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
