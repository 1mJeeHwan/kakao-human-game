/**
 * 간단한 인메모리 캐시
 * DB 부하 감소용 (무료 최적화)
 */

class SimpleCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000;  // 기본 1분
    this.maxSize = options.maxSize || 1000;  // 최대 1000개

    // 주기적 정리 (5분마다)
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * 캐시에서 값 가져오기
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // 만료 확인
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 캐시에 값 저장
   */
  set(key, value, ttl = this.ttl) {
    // 최대 크기 초과시 가장 오래된 항목 삭제
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  /**
   * 캐시에서 삭제
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * 특정 패턴의 키 모두 삭제
   */
  deletePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 만료된 항목 정리
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시 통계
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }

  /**
   * 전체 캐시 비우기
   */
  clear() {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
const userCache = new SimpleCache({
  ttl: 30000,    // 유저 데이터 30초 캐시
  maxSize: 500   // 최대 500명
});

const statsCache = new SimpleCache({
  ttl: 60000,    // 통계 1분 캐시
  maxSize: 100
});

module.exports = {
  SimpleCache,
  userCache,
  statsCache
};
