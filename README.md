# 인간 키우기 게임

카카오톡 챗봇 기반의 인간 육성 게임입니다.

## 게임 설명

- 랜덤 칭호 + 직업 조합으로 유니크한 캐릭터 생성
- 강화 시스템으로 레벨업 (성공/실패/사망)
- 수식어에 따른 판매 보너스

### 조합 예시
```
"소심한 +0 수습 백수"
"천재적인 +7 숙련 개발자"
"전설의 +15 그랜드마스터 용사"
```

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 열고 MongoDB URI를 설정합니다:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/human-game
PORT=3000
NODE_ENV=development
```

### 3. 서버 실행
```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

### 4. 테스트
```bash
npm test
```

## API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| POST /game/start | 게임 시작 / 상태 조회 |
| POST /game/upgrade | 인간 강화 |
| POST /game/sell | 인간 판매 |
| POST /game/reroll/title | 칭호 변경 |
| POST /game/reroll/job | 직업 변경 |
| POST /game/rates | 확률표 조회 |

### 요청 형식 (카카오 오픈빌더)
```json
{
  "userRequest": {
    "user": {
      "id": "카카오유저ID"
    }
  }
}
```

## 프로젝트 구조

```
kakao_game_1/
├── server.js              # 메인 서버
├── package.json
├── .env.example
├── config/
│   └── database.js       # MongoDB 연결
├── models/
│   └── User.js           # 유저 스키마
├── routes/
│   └── game.js           # API 라우터
├── controllers/
│   └── gameController.js # 게임 로직
├── utils/
│   ├── titles.js         # 칭호 데이터
│   ├── jobs.js           # 직업 데이터
│   ├── gameConfig.js     # 강화 확률 테이블
│   └── helpers.js        # 헬퍼 함수
└── tests/
    └── game.test.js      # 테스트
```

## 게임 밸런스

### 칭호 확률
| 등급 | 확률 | 판매 보너스 |
|------|------|-------------|
| 일반 | 40% | +0% |
| 고급 | 30% | +10% |
| 희귀 | 20% | +25% |
| 영웅 | 8% | +50% |
| 전설 | 2% | +100% |

### 직업 확률
| 등급 | 확률 | 판매 보너스 |
|------|------|-------------|
| 일반 | 50% | +0% |
| 고급 | 30% | +15% |
| 희귀 | 15% | +30% |
| 전설 | 5% | +60% |

### 강화 확률
| 레벨 | 성공 | 사망 | 비용 |
|------|------|------|------|
| 0→1 | 100% | 0% | 100G |
| 5→6 | 80% | 5% | 1,500G |
| 10→11 | 30% | 30% | 20,000G |
| 14→15 | 3% | 70% | 200,000G |

## 배포

### Render.com
1. GitHub 연동
2. New Web Service 생성
3. 환경 변수 설정
4. 배포

### 카카오 오픈빌더
1. 채널 생성
2. 스킬 등록 (각 API 엔드포인트)
3. 시나리오 구성
4. 배포

## 라이선스

MIT License
