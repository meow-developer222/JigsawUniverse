

// npm install socket.io

import { Server, Socket } from "socket.io";
import { Board } from "./board.ts";
import { Room } from "./rooms.ts";
import { generateRandomString } from "./utils.ts";
import { Player } from "./player.ts";
import { SNAP_THRESOLD } from "./const.ts";


// 포트 번호만 인자로 전달하면 독립형 서버가 생성됩니다.
const io = new Server(6767, {
  cors: {
    origin: "*", // 실제 서비스 시에는 특정 도메인으로 제한하세요.
  }
});

let players: {[key: string]: Player} = {};

let rooms: {[key: string]: Room} = {};




io.on("connection", (socket: Socket) => {
  
  socket.on("join", (nickname: string, roomname: string) =>
    {
      console.log(roomname, rooms);
      players[socket.id] = new Player(socket.id, nickname);
      
      if (!Object.keys(rooms).includes(roomname))
      {
        console.log("안되잖아!");
        socket.emit("error", 404);
        return;
      }

      io.to(roomname).emit("new_player", players[socket.id].toJson());
      socket.join(roomname);

      console.log("조인!");

      
      
      
      
      socket.emit("players", Object.values(players).map((player) => player.
      toJson()));
      socket.emit("board", JSON.stringify(rooms[roomname].board));
    }
  )

  console.log("누군가 들어왔습니다");
  
  
  socket.on("select_piece", (piece_id: number) => {

    console.log(socket.rooms.size);
    if (socket.rooms.size != 0)
    {
      console.log([...socket.rooms][1]);
      io.to([...socket.rooms][1]).emit("select_piece", socket.id, piece_id);
      
    }
    else
    {
      socket.disconnect();
    }
    
  });

  socket.on("create_room", (image_url: string) => {
    let roomName = generateRandomString(16);

    rooms[roomName] = new Room(roomName, new Board(image_url, 24, 24, 8));
    rooms[roomName].board.generatePieces();

    
    socket.emit("goRoom", roomName);

    
    
  });


  socket.on("deselect_piece", (piece_id: number) => {
    
    if (socket.rooms.size != 0)
    {
      io.to([...socket.rooms][1]).emit("deselect_piece", socket.id, piece_id);

      let selectedPiece = rooms[[...socket.rooms][1]].board.pieces.find((piece) => piece.pieceID == piece_id)!;
      
      // CellRenderer.instance.deselect(mySelectedPiece);]
    
      console.log(selectedPiece);
          
      if ((selectedPiece.correctX - selectedPiece.x) ** 2 + (selectedPiece.correctY - selectedPiece.y) ** 2 <= SNAP_THRESOLD ** 2)
      {
          console.log("123123dfhjkdsfhgfhfg");
          const correctPieces = rooms[[...socket.rooms][1]].board.pieces.filter((p) => p.isCorrect);
          
          const isEdgePiece = selectedPiece.gridX === 0 || 
                          selectedPiece.gridX === rooms[[...socket.rooms][1]].board.cellSize - 1 || 
                          selectedPiece.gridY === 0 || 
                          selectedPiece.gridY === rooms[[...socket.rooms][1]].board.cellSize - 1;

          // 조건 B: 이미 맞춰진 조각 중 상하좌우(인접)에 있는 조각이 있는가?
          const isAdjacentToCorrect = correctPieces.some((p) => {
              const dx = Math.abs(p.gridX - selectedPiece.gridX);
              const dy = Math.abs(p.gridY - selectedPiece.gridY);
              // 상하좌우 한 칸 차이 (dx+dy가 1이면 인접함)
              return (dx + dy === 1);
          });

          if (isEdgePiece || isAdjacentToCorrect)
          {
              
              io.to([...socket.rooms][1]).emit("correct", socket.id, piece_id);
              console.log("CORRECT")
              // return;
          }
      }
      
      
    }
    else
    {
      socket.disconnect();
    }
    
  });

  

  socket.on("move_piece", (piece_id: number, x: number, y: number) => {
    
    if (socket.rooms.size != 0)
    {
      let selectedPiece = rooms[[...socket.rooms][1]].board.pieces.find((piece) => piece.pieceID == piece_id)!;

      selectedPiece.x = x;
      selectedPiece.y = y;
      io.to([...socket.rooms][1]).emit("move_piece", socket.id, piece_id, x, y);
      
    }
    else
    {
      
      socket.disconnect();
    }
    
  });

  socket.on("disconnect", () => {
    
    delete players[socket.id];
  });


});



console.log("Socket.IO 서버가 3000번 포트에서 실행 중입니다.");