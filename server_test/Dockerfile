# 1단계: 빌드
FROM node:20-slim AS builder

# SQLite3 빌드 필수 도구
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 의존성 설치 (typescript 포함)
COPY package*.json ./
RUN npm install
RUN npm install -g typescript

# 소스 복사 및 빌드
COPY . .
RUN tsc

RUN ls -al /app/dist

# 2단계: 실행
FROM node:20-slim

WORKDIR /app

# 빌드된 결과물과 실행용 node_modules만 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# SQLite 데이터 폴더 (쓰기 권한 보장)
RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 6767

# 실행 파일 경로 확인 (dist/index.js)
# CMD ["node", "dist/index.js"]