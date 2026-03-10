
// import { io } from "socket.io-client";
import { Board } from "./board.js";
import { CellRenderer, FullRenderer } from "./render.js";
import { calculateFinishedPercent } from "./utils.js";
import { Piece } from "./piece.js";
import { onMouseDown, onMouseMove, onMouseUp } from "./events.js";

const socket = io("https://jigsaw.meowdev.co.kr:6767", {
    transports: ["websocket"]
});


window.addEventListener('load', function() {
    var hash = window.location.hash; // '#' 문자를 포함한 값 가져옴 (예: '#example')
    console.log(hash);
    if (hash == "#newroom") {
        document.getElementById("newroom")!.style.display = "flex";
        // #을 제거하고 사용하고 싶다면
        // var hashWithoutHash = hash.substring(1); 
        
    }
    else
    {
        document.getElementById("nicknameDialog")!.style.display = "flex";
        console.log(window.location.pathname.split("/"));
        console.log(window.location.pathname.split("/")[window.location.pathname.split("/").length-1]);
        
    }
});

function join()
{
    socket.emit("join", (document.getElementById("nicknameInput") as HTMLInputElement).value, window.location.pathname.split("/")[window.location.pathname.split("/").length-1]);
    document.getElementById("nicknameDialog")!.style.display = "none";
    console.log("JOIN")
}

document.getElementById("nickname")!.onclick = join;
document.getElementById("nicknameInput")!.onsubmit = join;


const canvas: HTMLCanvasElement = document.getElementById('puzzle') as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;   


let players: {[key: string]: {id: string, nickname: string}} = {};

export function startMulti()
{
    socket.emit("create_room", selectedData.image, selectedDifficulty);
}

socket.on("goRoom", (roomName: string) => {
    location.href = "/multi_play/" + roomName
});


socket.on("players", (players_: {id: string, nickname: string}[]) => {
    players_.forEach((player) => players[player.id] = player)
});


socket.on("new_player", (player: {id: string, nickname: string}) => {
    players[player.id] = player;
});


socket.on("error", (code: number) => {
    if (code === 404)
    {
        location.href = "/multi_play#newroom";
        console.log("NOPE");
    }
});


socket.on("select_piece", (playerID: number, pieceID: number) => {
    let piece = Board.instance.pieces.find((piece) => piece.pieceID == pieceID)!;
    console.log("SELECT");
    piece.selectedBy = players[playerID].nickname;
    if (pieceID === CellRenderer.instance.mySelectedPiece) return;
    
    
    if (piece.gridX >= Board.instance.cellSize * Board.instance.cellX && piece.gridX < Board.instance.cellSize * (Board.instance.cellX+1) &&
                        piece.gridY >= Board.instance.cellSize * Board.instance.cellY && piece.gridY < Board.instance.cellSize * (Board.instance.cellY+1))
    {
        console.log(pieceID, CellRenderer.instance.mySelectedPiece);
        CellRenderer.instance.selectedPiece.push(piece.pieceID);
        CellRenderer.instance.reloadOffscreenCanvas();
        piece.select();
    }
    

});

socket.on("move_piece", (playerID: number, pieceID: number, x: number, y: number) => {
    if (pieceID === CellRenderer.instance.mySelectedPiece) return;
    let piece = Board.instance.pieces.find((piece) => piece.pieceID == pieceID)!;
    console.log(x, y);
    piece.x = x;
    piece.y = y;
    CellRenderer.instance.render();

});


socket.on("deselect_piece", (playerID: number, pieceID: number) => {
    console.log("MAWGMGSKHDFJHGSDJhfv weiufyve uyr4442343");
    let piece = Board.instance.pieces.find((piece) => piece.pieceID == pieceID)!;
    piece.selectedBy = "";
    if (pieceID === CellRenderer.instance.mySelectedPiece) {
        CellRenderer.instance.render();
        console.log("MAWGMGSKHDFJHGSDJhfv weiufyve uyr");
        return;

    }
    

    if (piece.gridX >= Board.instance.cellSize * Board.instance.cellX && piece.gridX < Board.instance.cellSize * (Board.instance.cellX+1) &&
                        piece.gridY >= Board.instance.cellSize * Board.instance.cellY && piece.gridY < Board.instance.cellSize * (Board.instance.cellY+1))
    {
        CellRenderer.instance.selectedPiece = CellRenderer.instance.selectedPiece.filter(x => x != pieceID);
        CellRenderer.instance.reloadOffscreenCanvas();
        piece.deselect();
        
    }

    
    

});

socket.on("correct", (playerID: number, pieceID: number) => {
    let piece = Board.instance.pieces.find((piece) => piece.pieceID == pieceID)!;
    piece.correct();

});


socket.on("board", (boardJSON: string) => {
    
    
    let board = JSON.parse(boardJSON);
    let pieces = board.pieces.map((pieceJSON: {
        correctX: number;
        correctY: number;
        x: number; 
        y: number; 
        gridX: any; 
        gridY: any; 
        corners: number[][]; 
        spine_dir: number[]; 
        imageX: number; 
        imageY: number; 
        isCorrect: boolean; }) => Piece.fromJson(pieceJSON));
    
    
    

    const image = new Image();

    image.src = board.image_url;

    

    image.onload = () => onImageLoaded(image, board, pieces);
    
        
    
    
})

function onImageLoaded(image: HTMLImageElement, board: {boardWidth: number, boardHeight: number, cellSize: number}, pieces: Piece[])
{
    
    Board.instance = new Board(image, board.boardWidth, board.boardHeight, board.cellSize);
    Board.instance.isNetwork = true;
    Board.instance.pieces = pieces;

    pieces.forEach((piece: Piece) => {
        piece.init_offscreen_canvas();
    });

    let fullRenderer: FullRenderer = new FullRenderer(ctx);
    
    fullRenderer.reloadOffscreenCanvas(calculateFinishedPercent(pieces));
    fullRenderer.render();  
}

    
canvas.addEventListener("pointerdown", (e) => onMouseDown({offsetX: e.clientX - canvas.offsetLeft, offsetY: e.clientY - canvas.offsetTop}));
canvas.addEventListener("pointermove", (e) => onMouseMove({offsetX: e.clientX - canvas.offsetLeft, offsetY: e.clientY - canvas.offsetTop}));
canvas.addEventListener("pointerup", (e) => onMouseUp());

window.onPiecePick = (pieceID: number) => 
{
    console.log(pieceID);
    socket.emit("select_piece", pieceID);
}

window.onPieceUnPick = (pieceID: number) => 
{
    socket.emit("deselect_piece", pieceID);
}

window.onPieceDrag = (pieceID: number, x: number, y: number) => 
{
    socket.emit("move_piece", pieceID, x, y);
}