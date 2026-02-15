import json
import random

from .db import get_db, init_db

from .settings import PIECE_SIZE, MAX_OFFSET, SNAP_THRESOLD

import math

class Player:
    def __init__(self, sock, nickname, playerID):
        self.sock = sock
        self.nickname = nickname
        self.plrID = playerID

    async def send(self, data):
        await self.sock.send(json.dumps(data))

    def toJson(self):
        return {
            "id": self.plrID,
            "nickname": self.nickname
        }




class Piece:
    def __init__(self, x, y, correctX, correctY, imageX, imageY, gridX, gridY, corners, spine_dir, pieceID):
        self.x = x
        self.y = y
        self.correctX = correctX
        self.correctY = correctY
        self.imageX = imageX
        self.imageY = imageY
        self.gridX = gridX
        self.gridY = gridY
        self.corners = corners
        self.spine_dir = spine_dir
        self.pieceID = pieceID
        self.correct = False
        

    def toJson(self):
        return {
            "x": self.x,
            "y": self.y,
            "gridX": self.gridX,
            "gridY": self.gridY,
            "correctX": self.correctX,
            "correctY": self.correctY,
            "correct": self.correct,
            "imageX": self.imageX,
            "imageY": self.imageY,
            "corners": self.corners,
            "spine_dir": self.spine_dir,
            "pieceID": self.pieceID,
            "zoom": 1,
            "yOffset": 0
        }

class Room:
    def __init__(self, imageURL, pieceCountH, pieceCountV, room_id=None):
        self.room_id = room_id
        self.imageURL = imageURL
        self.pieceCountH = pieceCountH
        self.pieceCountV = pieceCountV
        self.pieces = []
        self.users = []
        self.pickedPieceIDs = {}
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM rooms WHERE roomID = ?;", (self.room_id,))
        if not cursor.fetchall():
            
            self.create()  # 새 게임 생성
            self.save_room_to_db() # 방 정보와 조각들 DB 최초 저장
        else:
            self.load_pieces_from_db() # 기존 데이터 불러오기

    def save_room_to_db(self):
        conn = get_db()
        cursor = conn.cursor()
        
        # 1. 방 정보 저장
        cursor.execute(
            "INSERT INTO rooms (imageURL, pieceCountH, pieceCountV, roomID) VALUES (?, ?, ?, ?)",
            (self.imageURL, self.pieceCountH, self.pieceCountV, self.room_id)
        )
        
        
        # 2. 모든 조각 저장
        for p in self.pieces:
            cursor.execute('''
                INSERT INTO pieces (room_id, pieceID, x, y, correctX, correctY, imageX, imageY, gridX, gridY, corners, spine_dir, is_correct)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                self.room_id, p.pieceID, p.x, p.y, p.correctX, p.correctY, 
                p.imageX, p.imageY, p.gridX, p.gridY, 
                json.dumps(p.corners), json.dumps(p.spine_dir), 1 if p.correct else 0
            ))
        
        conn.commit()
        conn.close()

    def load_pieces_from_db(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pieces WHERE room_id = ?", (self.room_id,))
        rows = cursor.fetchall()
        
        self.pieces = []
        for r in rows:
            piece = Piece(
                r['x'], r['y'], r['correctX'], r['correctY'], 
                r['imageX'], r['imageY'], r['gridX'], r['gridY'],
                json.loads(r['corners']), json.loads(r['spine_dir']), r['pieceID']
            )
            piece.correct = bool(r['is_correct'])
            self.pieces.append(piece)
        conn.close()

    # 실시간 좌표 업데이트용 메서드
    async def update_piece_db(self, piece):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE pieces SET x = ?, y = ?, is_correct = ? 
            WHERE room_id = ? AND pieceID = ?
        ''', (piece.x, piece.y, 1 if piece.correct else 0, self.room_id, piece.pieceID))
        conn.commit()
        conn.close()


    def create(self):
        next_piece_id = 1
        junctions = [[{"x": 0, "y": 0}] * (self.pieceCountH+1) for i in range(self.pieceCountV+1)]

        
        for y in range(self.pieceCountV):
            for x in range(self.pieceCountH):
                isEdge = (
                     x == 0
                     or y == 0 
                     or x == self.pieceCountH - 1
                     or y == self.pieceCountV - 1
                    )
                
                junctions[y][x] = {
                    "x": 0 if isEdge else (random.random() - 0.5) * MAX_OFFSET,
                    "y": 0 if isEdge else (random.random() - 0.5) * MAX_OFFSET
                }
        

        hSpines = [[0] * (self.pieceCountH+1) for i in range(self.pieceCountV+1)]

        for y in range(self.pieceCountV):
            for x in range(self.pieceCountH):
                hSpines[y][x] = 0 if y == 0 \
                     or y == self.pieceCountV \
                     else random.randint(0, 1) * 2 - 1
        vSpines = [[0] * (self.pieceCountH+1) for i in range(self.pieceCountV+1)]

        for y in range(self.pieceCountV):
            for x in range(self.pieceCountH):
                vSpines[y][x] = 0 if x == 0 \
                     or x == self.pieceCountH \
                     else random.randint(0, 1) * 2 - 1
        half = PIECE_SIZE / 2
        for y in range(self.pieceCountV):
            for x in range(self.pieceCountH):
                data = {
                    "imageX": x * PIECE_SIZE,
                    "imageY": y * PIECE_SIZE,
                    "spine_dir": [hSpines[y][x], -vSpines[y][x+1], -hSpines[y+1][x], vSpines[y][x]],
                    "corners": [
                        {"x": -half + junctions[y][x]["x"], "y": -half + junctions[y][x]["y"]},
                        {"x": half + junctions[y][x+1]["x"], "y": -half + junctions[y][x+1]["y"]},
                        {"x": half + junctions[y+1][x+1]["x"], "y": half + junctions[y+1][x+1]["y"]},
                        {"x": -half + junctions[y+1][x]["x"], "y": half + junctions[y+1][x]["y"]},
                    ],
                    "gridX": x,
                    "gridY": y,
                    "x": math.floor(random.random() * (6)) * 25 + 100,
                    "y": math.floor(random.random() * (25)) * 25 + 100,
                    "correctX": 304 + x * PIECE_SIZE + PIECE_SIZE / 2,
                    "correctY": 104 + y * PIECE_SIZE + PIECE_SIZE / 2,
                    "zoom": 1,
                    "yOffset": 0,
                    "pieceID": next_piece_id
                }

                self.pieces.append(Piece(
                    data["x"], data["y"], data["correctX"], data["correctY"], data["imageX"],
                    data["imageY"], data["gridX"], data["gridY"], data["corners"], data["spine_dir"], data["pieceID"]
                ))
                next_piece_id += 1
        print(self.pieces)
    async def sendall(self, data):
        for user in self.users:
            await user.send(data)


    async def message(self, userID, msg):
        cmd = msg["command"]

        if cmd == "pick":
            if self.pickedPieceIDs.get(userID): return
            
            selectedPiece = list(filter(lambda x: x.pieceID == msg["pieceID"], self.pieces))[0]
            if selectedPiece.correct: return

            self.pickedPieceIDs[userID] = msg["pieceID"]
            await self.sendall(
                {
                    "command": "pick",
                    "pieceID": msg['pieceID'],
                    "userID": userID
                }
            )
        
        if cmd == "unpick":
            if self.pickedPieceIDs.get(userID) != msg["pieceID"]: return
            del self.pickedPieceIDs[userID]

            correctPieces = list(filter(lambda x: x.correct, self.pieces))

            selectedPiece = list(filter(lambda x: x.pieceID == msg["pieceID"], self.pieces))[0]

            if (
                (selectedPiece.x - selectedPiece.correctX) ** 2 + 
                (selectedPiece.y - selectedPiece.correctY) ** 2 < SNAP_THRESOLD):



                if (
                    selectedPiece.gridX == 0 or 
                    selectedPiece.gridY == 0 or 
                    selectedPiece.gridX == self.pieceCountH - 1 or 
                    selectedPiece.gridY == self.pieceCountV - 1
                ) or any(
                    abs(p.gridX - selectedPiece.gridX) + abs(p.gridY - selectedPiece.gridY) == 1
                    for p in correctPieces
                ):
                    selectedPiece.x = selectedPiece.correctX
                    selectedPiece.y = selectedPiece.correctY
                    selectedPiece.correct = True
                    await self.sendall(
                        {
                            "command": "set_piece",
                            "pieceID": msg["pieceID"],
                            "piece": selectedPiece.toJson()
                        }
                    )

                    await self.sendall(
                        {
                            "command": "correct",
                            "pieceID": msg["pieceID"],
                            
                        }
                    )
            await self.update_piece_db(selectedPiece)
            await self.sendall(
                {
                    "command": "unpick",
                    "pieceID": msg['pieceID'],
                    "userID": userID
                }
            )
        if cmd == "move":
            if self.pickedPieceIDs.get(userID) != msg["pieceID"]: return
            index = list(filter(lambda x: self.pieces[x].pieceID == msg["pieceID"], range(len(self.pieces))))[0]
            self.pieces[index].x = msg["x"]
            self.pieces[index].y = msg["y"]
            await self.sendall(
                {
                    "command": "set_piece",
                    "pieceID": msg["pieceID"],
                    "piece": self.pieces[index].toJson()
                }
            )

    async def join(self, userID, sock, data):
        player = Player(sock, data["nickname"], userID)
        await player.send({"command": "room_info", **self.toJson()})
        
        # for user in self.users:
        #     await player.send({"command": "player_info", **user.toJson()})

        self.users.append(player)

        await self.sendall({"command": "new_player", **data, "id": userID})


        
        

    def toJson(self):
        return {
            "players": list(map(lambda player: player.toJson(), self.users)),
            "pieces": list(map(lambda piece: piece.toJson(), self.pieces)),
            "imageURL": self.imageURL,
            "pieceCountH": self.pieceCountH,
            "pieceCountV": self.pieceCountV
        }
    
    def disconnect(self, userID):
        print("MAGE123")
        index = list(filter(lambda x: self.users[x].plrID == userID, range(len(self.users))))[0]

        del self.users[index]