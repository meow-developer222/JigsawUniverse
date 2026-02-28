import { setImage, setPieces, render, setBoardSize, createOffscreenCanvas, pieces, PIECE_SIZE, deselectNetworkPiece, selectNetworkPiece, setCamPos, camX, camY} from "./main.js";


const canvas = document.getElementById("puzzle");

let webSocket;


const LOBBY = 0;
const IN_ROOM = 0;

let state = LOBBY;

let room_info = {};

let camOffset = {x: 0, y: 0, camX: 0, camY: 0};

let camMoving = false;

let players = {};

let currentlySelecting = {};

let image;

let room = {};

function error() {  }

function recieveMessage(msg) {
    console.log(msg);
    let data = JSON.parse(msg.data);

    
    if (data.command === "code") {
        if (data.code != 200)
        {
            error(data.message)
        }
    }

    if (data.command === "set_piece")
    {
        
        
        setPieces(pieces.map((piece) => {return piece.pieceID == data.pieceID ? {off_canvas: piece.off_canvas, ...data.piece} : piece}));
        render(image);
        
        

    }

    if (data.command === "new_player")
    {
        players.push(data);
        console.log("New player arrived");
    }
    

    if (data.command === "room_info") {
        state = IN_ROOM;
        image = new Image();
        console.log(data.imageURL);
        image.src = data.imageURL;
        players = data.players;
        room = data;

        setImage(image);
        
        
        

        
        
        
        image.onload = () => {
            
            setBoardSize(data.pieceCountH, data.pieceCountV);
            
            
            
            setPieces(data.pieces.map((x) => {return {...x, off_canvas: createOffscreenCanvas(x, image)}}));
            render(image);
            
        }
        
    }

    if (data.command === "pick") {
        console.log(players);
        selectNetworkPiece(data.pieceID, players.find((x) => x.id == data.userID).nickname);
        console.log("MAGE");
        render(image);
        
    }

    if (data.command === "unpick") {
        deselectNetworkPiece(data.pieceID);
        render(image);
        
    }
}

function send(msg) {
    if (webSocket.readyState == WebSocket.OPEN) 
    {
        webSocket.send(JSON.stringify(msg));
    }
    else
    {
        console.warn("WebSocket not open. Ready state: " + webSocket.readyState);
    }
    

}

function hello(nickname, roomID) {
    send({"command": "join", "roomID": roomID, "nickname": nickname})
}

export function setupNetworkGame(roomID) {

    console.log(webSocket);
    if (webSocket && webSocket.readyState == WebSocket.OPEN)
    {
        console.log("closing");
        webSocket.close();
    }
    console.log(webSocket);
    webSocket = null;
    webSocket = new WebSocket("ws://jigsaw.meowdev.co.kr:6767");

    webSocket.onclose = function(event) {
        console.log("WebSocket closed with code: " + event.code + ", reason: " + event.reason);
        // Perform cleanup or initiate a reconnection attempt here
    };

    webSocket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };


    webSocket.onmessage = recieveMessage;
    webSocket.onopen = () => hello(document.getElementById("nickname").value, roomID);
    

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("mouseup", mouseUp);

    canvas.addEventListener("touchstart", touchDown);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchUp);
    
}

let selectedPieceID = 0;
let offset = {};

function getTouchPos(canvas, e) {
    console.log(e);
    const rect = canvas.getBoundingClientRect();
    return {
        offsetX: e.changedTouches[0].pageX - rect.left,
        offsetY: e.changedTouches[0].pageY - rect.top,
        preventDefault: e.preventDefault
    };
}

function touchDown(e) {mouseDown(getTouchPos(canvas, e))}
function touchMove(e) {mouseMove(getTouchPos(canvas, e))}
function touchUp(e) {mouseUp(getTouchPos(canvas, e))}


function mouseDown(e) {
    
    let x = e.offsetX;
    let y = e.offsetY;

    // 배열을 뒤에서부터 확인 (맨 위에 그려진 요소를 먼저 찾기 위함)
    for (let i = pieces.length - 1; i >= 0; i--) {
        let element = pieces[i];

        // 클릭 범위 확인 (중심점 기준)
        if ((element.x - camX - PIECE_SIZE / 2) < (x) && (x) < (element.x - camX + PIECE_SIZE / 2) && 
            (element.y - camY - PIECE_SIZE / 2) < (y) && (y) < (element.y - camY + PIECE_SIZE / 2)) {
            
            // 1. 선택된 요소를 배열에서 제거하고 맨 뒤로 보냄 (우선순위 최상단 이동)
            

            // 2. 선택된 요소 정보 업데이트
            selectedPieceID = element.pieceID;
            offset.x = x - element.x;
            offset.y = y - element.y;
            
            // requestAnimationFrame(selectPiece);

            send({
                "command": "pick",
                "pieceID": selectedPieceID
            });
            console.log("MAGE");
            
            // 3. 하나를 찾았으면 더 이상 반복할 필요 없음 (중요!)
            return; 
        }
    }
    camMoving = true;
    camOffset.x = x;
    camOffset.y = y;
    camOffset.camX = camX;
    camOffset.camY = camY;
}

function mouseMove(e) {
    
    // setCamPos(e.offsetX - camOffset.x, e.offsetY - camOffset.y)
    if (camMoving)
    {
        
        let x = (-e.offsetX + camOffset.x) + camOffset.camX;
        let y = (-e.offsetY + camOffset.y) + camOffset.camY;
        

        
        x = Math.min(x, room.pieceCountH * PIECE_SIZE - canvas.width + 1000);
        x = Math.max(x, 0);
        
        y = Math.min(y, room.pieceCountV * PIECE_SIZE - canvas.height + 500);
        y = Math.max(y, 0);
        console.log(room.pieceCountH * PIECE_SIZE - canvas.width + 1000);
        setCamPos(x, y);
        render(image);
    }
    
    if (!selectedPieceID) return;

    
    

    send({
        "command": "move",
        "x": e.offsetX - offset.x,
        "y": e.offsetY - offset.y,
        "pieceID": selectedPieceID
    })
    // 조각의 위치를 마우스 위치 - 클릭 시 오프셋으로 설정
    // selectedPiece.x = e.offsetX - offset.x;
    // selectedPiece.y = e.offsetY - offset.y;
    
    
}
function mouseUp(e) {
    
    camMoving = false;
    if (selectedPieceID == 0) return;

    // 1. 거리 계산 (피타고라스 정리)
    // const distanceSq = (selectedPiece.correctX - selectedPiece.x) ** 2 + (selectedPiece.correctY - selectedPiece.y) ** 2;
    // const thresholdSq = SNAP_THRESOLD ** 2;

    // if (distanceSq < thresholdSq) {
    //     // 이미 맞춰진 조각들만 필터링
    //     const correctPieces = pieces.filter((p) => p.correct);

        // 조건 A: 테두리에 위치한 조각인가?
        // const isEdgePiece = selectedPiece.gridX === 0 || 
        //                    selectedPiece.gridX === pieceCountH - 1 || 
        //                    selectedPiece.gridY === 0 || 
        //                    selectedPiece.gridY === pieceCountV - 1;

        // // 조건 B: 이미 맞춰진 조각 중 상하좌우(인접)에 있는 조각이 있는가?
        // const isAdjacentToCorrect = correctPieces.some((p) => {
        //     const dx = Math.abs(p.gridX - selectedPiece.gridX);
        //     const dy = Math.abs(p.gridY - selectedPiece.gridY);
        //     // 상하좌우 한 칸 차이 (dx+dy가 1이면 인접함)
        //     return (dx + dy === 1);
        // });

        // // 테두리이거나, 옆에 맞춘 조각이 있을 때만 스냅 성공
        // if (isEdgePiece || isAdjacentToCorrect) {
        //     console.log("Snap Success!");
        //     selectedPiece.x = selectedPiece.correctX;
        //     selectedPiece.y = selectedPiece.correctY;
        //     selectedPiece.correct = true; // 조각의 상태를 '맞춤'으로 변경
        //     render(image);
        // }

        send({
                "command": "unpick",
                "pieceID": selectedPieceID
        });
    

    
    selectedPieceID = 0;
}


// setupNetworkGame(67);


let start = document.getElementById("startbtn");
console.log(start);
start.onclick = (a) => setupNetworkGame(start.getAttribute("roomID"));

window.onbeforeunload = function() {
    if (socket) {
        // 서버에 종료 신호를 보내고 닫음
        console.log("MAG123123E");
        webSocket.close();
    }
};