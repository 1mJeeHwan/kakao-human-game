# 인간 키우기 - 카카오톡 챗봇 게임

## 프로젝트 개요

카카오톡 오픈빌더 기반의 방치형 육성 시뮬레이션 게임입니다.
랜덤 칭호와 직업 조합으로 인간을 생성하고, 강화하여 판매하는 게임입니다.

**라이브 서버:** https://kakao-human-game.onrender.com

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.18 |
| **Database** | MongoDB (Mongoose 8.0) |
| **Platform** | 카카오톡 오픈빌더 |
| **Hosting** | Render.com |

---

## 주요 의존성

```json
{
  "express": "^4.18.2",      // 웹 프레임워크
  "mongoose": "^8.0.3",      // MongoDB ODM
  "helmet": "^7.1.0",        // 보안 미들웨어
  "compression": "^1.7.4",   // 응답 압축
  "express-rate-limit": "^7.1.5",  // API 요청 제한
  "cors": "^2.8.5",          // CORS 처리
  "dotenv": "^16.3.1"        // 환경변수 관리
}
```

---

## 프로젝트 구조

```
kakao_game_1/
├── server.js              # Express 서버 진입점
├── config/
│   └── database.js        # MongoDB 연결 설정
├── controllers/
│   └── gameController.js  # 게임 로직 (강화, 판매, 사망 등)
├── models/
│   └── User.js            # 유저 스키마 (인간, 능력, 통계)
├── routes/
│   └── game.js            # API 라우트 정의
├── utils/
│   ├── gameConfig.js      # 강화 확률, 비용 테이블
│   ├── titles.js          # 칭호 데이터 + 특수 능력
│   ├── jobs.js            # 직업 데이터 + 레벨 수식어
│   ├── specialEndings.js  # 특수 엔딩 시스템
│   ├── achievements.js    # 업적 시스템
│   ├── deathMessages.js   # 직업별 사망 메시지
│   └── helpers.js         # 유틸 함수
└── public/
    └── guide.html         # 게임 가이드 웹페이지
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/game/start` | 게임 시작 / 상태 조회 |
| POST | `/game/upgrade` | 인간 강화 |
| POST | `/game/sell` | 인간 판매 |
| POST | `/game/rates` | 강화 확률표 조회 |
| POST | `/game/collection` | 도감 조회 |
| POST | `/game/achievements` | 업적 조회 |
| POST | `/game/stats` | 통계 조회 |
| POST | `/game/help` | 도움말 |
| GET | `/health` | 서버 상태 체크 |

---

## 게임 시스템

### 핵심 메카닉
- **강화 시스템**: 0강 → 20강, 레벨별 성공/실패/사망 확률
- **칭호 시스템**: 일반~전설 5등급, 특수 능력 보유
- **직업 시스템**: 일반~전설 + 동물 등급, 레벨별 수식어
- **특수 엔딩**: 사망 시 조건부 다음 직업 확정

### 특수 능력 (11종)
- 사망 방지, 실패→성공 변환, 2레벨 상승
- 판매가 2배, 보너스 골드, 비용 할인 등

### 판매가 공식
```
판매가 = 기본가 × (1 + 칭호보너스 + 직업보너스)
```

---

## 실행 방법

### 환경변수 (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

### 로컬 실행
```bash
npm install
npm run dev    # 개발 모드 (nodemon)
npm start      # 프로덕션 모드
```

---

## 배포

### Render.com 설정
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node 18+

### 자동 배포
```bash
git add . && git commit -m "message" && git push origin main
```
→ Render에서 자동 감지 및 배포

---

## 버전 히스토리

| 버전 | 날짜 | 주요 변경 |
|------|------|----------|
| 1.4.0 | 2025.01.23 | 다중 능력 시스템, 웹 가이드 페이지 |
| 1.3.0 | 2025.01.22 | 동물 직업, 직업별 사망 메시지 |
| 1.2.0 | 2025.01.21 | 도감 시스템, 업적 시스템 |
| 1.1.0 | 2025.01.20 | 파괴 지원금 시스템 |
| 1.0.0 | 2025.01.19 | 최초 출시 |

---

## 작성자

**지환** - 2025.01
