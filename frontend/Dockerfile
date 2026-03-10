
# 기반 이미지 선택
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 요구 패키지 복사 및 설치 (requirements.txt가 있다면)

RUN pip install --no-cache-dir flask gunicorn

# 소스 복사
COPY . .

# Uvicorn 실행 (8090 포트)
EXPOSE 6710
# 실행 명령
CMD ["gunicorn", "puzzle:app", "--bind", "0.0.0.0:6710"]

