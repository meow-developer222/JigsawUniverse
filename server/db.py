import sqlite3
import json

def get_db():
    conn = sqlite3.connect("main.db")
    conn.row_factory = sqlite3.Row  # 결과를 딕셔너리처럼 접근 가능하게 함
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 방 정보 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rooms (
            roomID INTEGER PRIMARY KEY,
            imageURL TEXT,
            pieceCountH INTEGER,
            pieceCountV INTEGER
        )
    ''')
    
    # 퍼즐 조각 상태 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pieces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER,
            pieceID INTEGER,
            x REAL, y REAL,
            correctX REAL, correctY REAL,
            imageX REAL, imageY REAL,
            gridX INTEGER, gridY INTEGER,
            corners TEXT, -- JSON string
            spine_dir TEXT, -- JSON string
            is_correct INTEGER DEFAULT 0,
            FOREIGN KEY(room_id) REFERENCES rooms(room_id)
        )
    ''')
    conn.commit()
    conn.close()

# 서버 실행 시 초기화 호출 필요
init_db()