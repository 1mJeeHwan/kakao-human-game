# Vultr 서울 서버 세팅 가이드

## 1. Vultr 계정 생성 및 서버 생성

### 1.1 회원가입
1. https://www.vultr.com 접속
2. 회원가입 (이메일 인증)
3. 결제 수단 등록 (카드 또는 PayPal)

### 1.2 서버(Droplet) 생성
1. **Products** → **Compute** → **Deploy Server**
2. 설정:
   - **Server Type**: Cloud Compute (Shared CPU)
   - **Server Location**: Seoul (서울)
   - **Server Image**: Ubuntu 22.04 LTS
   - **Server Size**: $6/mo (1 vCPU, 1GB RAM, 1TB Bandwidth)
   - **Server Hostname**: kakao-game (원하는 이름)
3. **Deploy Now** 클릭
4. 서버 생성 완료 (1-2분 소요)

### 1.3 서버 정보 확인
- **IP Address**: 서버 IP 주소 (예: 123.456.789.0)
- **Password**: root 비밀번호 (복사해두기)

---

## 2. 서버 접속 (SSH)

### Mac/Linux 터미널
```bash
ssh root@서버IP주소
# 비밀번호 입력
```

### Windows (PowerShell 또는 PuTTY)
```bash
ssh root@서버IP주소
```

---

## 3. 서버 초기 설정

### 3.1 시스템 업데이트
```bash
apt update && apt upgrade -y
```

### 3.2 Node.js 20 설치
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 3.3 설치 확인
```bash
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 3.4 PM2 설치 (프로세스 관리)
```bash
npm install -g pm2
```

### 3.5 Git 설치
```bash
apt install -y git
```

---

## 4. 프로젝트 배포

### 4.1 코드 클론
```bash
cd /root
git clone https://github.com/1mJeeHwan/kakao-human-game.git
cd kakao-human-game
```

### 4.2 의존성 설치
```bash
npm install
```

### 4.3 환경 변수 설정
```bash
nano .env
```

`.env` 파일 내용:
```env
PORT=3000
MONGODB_URI=mongodb+srv://사용자:비밀번호@클러스터.mongodb.net/데이터베이스명
NODE_ENV=production
```

저장: `Ctrl + O` → `Enter` → `Ctrl + X`

### 4.4 PM2로 서버 실행
```bash
pm2 start server.js --name kakao-game
pm2 save
pm2 startup
```

### 4.5 서버 상태 확인
```bash
pm2 status
pm2 logs kakao-game
```

---

## 5. Nginx 설치 및 리버스 프록시 설정

### 5.1 Nginx 설치
```bash
apt install -y nginx
```

### 5.2 Nginx 설정
```bash
nano /etc/nginx/sites-available/kakao-game
```

내용 입력:
```nginx
server {
    listen 80;
    server_name 서버IP주소;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 설정 활성화
```bash
ln -s /etc/nginx/sites-available/kakao-game /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 5.4 테스트
브라우저에서 `http://서버IP주소` 접속

---

## 6. HTTPS 설정 (도메인 있을 경우)

### 6.1 도메인 DNS 설정
도메인 관리 사이트에서 A 레코드 추가:
- **Type**: A
- **Host**: @ (또는 서브도메인)
- **Value**: 서버 IP 주소

### 6.2 Certbot 설치 (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
```

### 6.3 SSL 인증서 발급
```bash
certbot --nginx -d 도메인주소
```

### 6.4 자동 갱신 확인
```bash
certbot renew --dry-run
```

---

## 7. 카카오 챗봇 Webhook URL 변경

카카오 i 오픈빌더에서 스킬 URL 변경:
- 기존: `https://kakao-human-game.onrender.com/...`
- 변경: `http://서버IP주소/...` 또는 `https://도메인주소/...`

---

## 8. 이후 배포 방법 (코드 업데이트 시)

### 간단 배포 스크립트
```bash
cd /root/kakao-human-game
git pull origin main
npm install
pm2 restart kakao-game
```

### 원라인 명령어
```bash
cd /root/kakao-human-game && git pull && pm2 restart kakao-game
```

---

## 9. 유용한 명령어

### PM2 관련
```bash
pm2 status          # 서버 상태 확인
pm2 logs            # 로그 확인
pm2 restart all     # 재시작
pm2 stop all        # 중지
pm2 delete all      # 삭제
```

### Nginx 관련
```bash
systemctl status nginx   # 상태 확인
systemctl restart nginx  # 재시작
nginx -t                 # 설정 테스트
```

### 서버 모니터링
```bash
htop                # CPU/메모리 사용량 (apt install htop)
df -h               # 디스크 사용량
free -m             # 메모리 사용량
```

---

## 10. 문제 해결

### 서버 접속 안 될 때
```bash
pm2 logs kakao-game --lines 50   # 에러 로그 확인
```

### 포트 확인
```bash
netstat -tlnp | grep 3000        # 3000번 포트 사용 중인지 확인
```

### 방화벽 설정
```bash
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable
```

---

## 비용 요약

| 항목 | 월 비용 |
|------|--------|
| Vultr 서울 (1GB) | $6 (₩8,000) |
| 도메인 (선택) | ₩15,000/년 |
| **총** | **₩8,000/월** |

---

## 체크리스트

- [ ] Vultr 회원가입
- [ ] 서버 생성 (Seoul, Ubuntu 22.04, $6)
- [ ] SSH 접속
- [ ] Node.js, PM2, Git 설치
- [ ] 코드 클론 및 npm install
- [ ] .env 파일 설정
- [ ] PM2로 서버 실행
- [ ] Nginx 설정
- [ ] (선택) HTTPS 설정
- [ ] 카카오 Webhook URL 변경
