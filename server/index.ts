import { Server, Socket } from "socket.io";
import sqlite3 from "sqlite3";
import https from "https"; // http 대신 https 사용
import fs from "fs";
import path from "path";

// ESM 환경: 반드시 .js 확장자 포함
import { Board } from "./board.js";
import { Room } from "./rooms.js";
import { generateRandomString } from "./utils.js";
import { Player } from "./player.js";
import { SNAP_THRESOLD } from "./const.js";

// --- 1. SSL 인증서 설정 ---
// Let's Encrypt 경로 또는 Docker로 마운트된 인증서 경로
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/jigsaw.meowdev.co.kr/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/jigsaw.meowdev.co.kr/fullchain.pem')
};

// --- 2. SQLite DB 설정 ---
const db = new sqlite3.Database("./data/game_data.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      image_url TEXT,
      board_data TEXT
    )
  `, (err) => {
    if (err) console.error("❌ DB 초기화 에러:", err.message);
    else console.log("✅ DB 테이블 체크 완료");
  });
});

// --- 3. 상태 관리 변수 ---
let players: { [key: string]: Player } = {};
let rooms: { [key: string]: Room } = {};

// --- 4. DB에서 기존 방 정보 로드 ---
db.all("SELECT * FROM rooms", (err, rows: any[]) => {
  if (!err && rows) {
    rows.forEach(row => {
      try {
        const boardData = JSON.parse(row.board_data);
        const room = new Room(row.id, new Board(row.image_url, 24, 24, 8));
        room.board.pieces = boardData.pieces;
        rooms[row.id] = room;
      } catch (e) {
        console.error(`방(${row.id}) 복구 실패:`, e);
      }
    });
    console.log(`📦 DB에서 ${rows.length}개의 방 데이터를 복구했습니다.`);
  }
});

// --- 5. HTTPS 서버 및 Socket.io 설정 ---
const httpsServer = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("Puzzle HTTPS Server is Running");
});

const io = new Server(httpsServer, {
  cors: {
    origin: "https://jigsaw.meowdev.co.kr",
    methods: ["GET", "POST"],
    credentials: true
  },
  // WSS 환경에서 안정적인 연결을 위한 설정
  transports: ['websocket', 'polling']
});

// --- 6. Socket.io 핵심 로직 ---
io.on("connection", (socket: Socket) => {
  console.log("🔌 보안 연결됨 (WSS):", socket.id);

  // [입장]
  socket.on("join", (nickname: string, roomname: string) => {
    players[socket.id] = new Player(socket.id, nickname);
    
    if (!rooms[roomname]) {
      socket.emit("error", 404);
      return;
    }

    socket.join(roomname);
    io.to(roomname).emit("new_player", players[socket.id].toJson());
    
    socket.emit("players", Object.values(players).map(p => p.toJson()));
    socket.emit("board", JSON.stringify(rooms[roomname].board));
    console.log(`👤 ${nickname} 입장 -> 방: ${roomname}`);
  });

  // [방 생성]
  socket.on("create_room", (image_url: string, difficulty: number) => {
    const roomName = generateRandomString(16);
    const newBoard = new Board(image_url, difficulty * 6, difficulty * 6, 6);
    newBoard.generatePieces();
    
    rooms[roomName] = new Room(roomName, newBoard);

    const boardJson = JSON.stringify(rooms[roomName].board);
    db.run("INSERT OR REPLACE INTO rooms (id, image_url, board_data) VALUES (?, ?, ?)", 
      [roomName, image_url, boardJson]);

    socket.emit("goRoom", roomName);
    console.log(`🏠 새 방 생성 완료: ${roomName}`);
  });

  // [조각 선택]
  socket.on("select_piece", (piece_id: number) => {
    const roomName = Array.from(socket.rooms)[1];
    if (roomName && rooms[roomName]) {
      io.to(roomName).emit("select_piece", socket.id, piece_id);
    }
  });

  // [조각 이동]
  socket.on("move_piece", (piece_id: number, x: number, y: number) => {
    const roomName = Array.from(socket.rooms)[1];
    if (roomName && rooms[roomName]) {
      const piece = rooms[roomName].board.pieces.find(p => p.pieceID === piece_id);
      if (piece) {
        piece.x = x;
        piece.y = y;
        socket.to(roomName).emit("move_piece", socket.id, piece_id, x, y);
      }
    }
  });

  // [조각 해제 및 정답 판정]
  socket.on("deselect_piece", (piece_id: number) => {
    console.log("DESEL")
    const roomName = Array.from(socket.rooms)[1];
    if (!roomName || !rooms[roomName]) return;

    const board = rooms[roomName].board;
    const piece = board.pieces.find(p => p.pieceID === piece_id);
    
    if (piece) {
      io.to(roomName).emit("deselect_piece", socket.id, piece_id);
      console.log((piece.correctX - piece.x) ** 2 + (piece.correctY - piece.y) ** 2);
      // Snap 판정
      if ((piece.correctX - piece.x) ** 2 + (piece.correctY - piece.y) ** 2 <= SNAP_THRESOLD ** 2)
            {
                console.log("WOA AMAZING");
                const correctPieces = board.pieces.filter((p) => p.isCorrect);
                
                const isEdgePiece = piece.gridX % board.cellSize === 0 || 
                                piece.gridX % board.cellSize === board.cellSize - 1 || 
                                piece.gridY % board.cellSize === 0 || 
                                piece.gridY % board.cellSize === board.cellSize - 1;

                // 조건 B: 이미 맞춰진 조각 중 상하좌우(인접)에 있는 조각이 있는가?
                const isAdjacentToCorrect = correctPieces.some((p) => {
                    const dx = Math.abs(p.gridX - piece.gridX);
                    const dy = Math.abs(p.gridY - piece.gridY);
                    // 상하좌우 한 칸 차이 (dx+dy가 1이면 인접함)
                    return (dx + dy === 1);
                });

                if (isEdgePiece || isAdjacentToCorrect)
                {
                    piece.isCorrect = true;
                    piece.x = piece.correctX;
                    piece.y = piece.correctY;
                    io.to(roomName).emit("correct", socket.id, piece_id);
                }
            }
          
        
      }
      // DB 실시간 업데이트
      db.run("UPDATE rooms SET board_data = ? WHERE id = ?", [JSON.stringify(board), roomName]);
    
  });

  socket.on("disconnect", () => {
    console.log("❌ 보안 연결 종료:", socket.id);
    delete players[socket.id];
  });
});

// --- 7. 서버 실행 ---
const PORT = 6767;
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🔒 HTTPS Puzzle Server is running on port ${PORT}`);
});