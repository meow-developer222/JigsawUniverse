const canvas = document.getElementById("puzzle");
const ctx = canvas.getContext("2d");

export const PIECE_SIZE = 50;
const SPINE_WIDTH = 15;
const SPINE_HEIGHT = 15;
const SPINE_OFFSET = 10;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.75;

const SELECT_ZOOM_AMOUNT = 1.1;
const SELECT_ZOOM_DURATION = 75;
let select_zoom = 1;
let selectStart = 0;

const SNAP_THRESOLD = 20;
const MAX_OFFSET = 6; // 꼭짓점 랜덤 허용 범위

let IMAGE_WIDTH = 0;
let IMAGE_HEIGHT = 0;

export let camX = 0;
export let camY = 0;

let selectedNetworkPiece = {};



let pieceCountH = 0;
let pieceCountV = 0;

let cameraMoving = false;
let selectedPieceMovable = false;


const drop = new Audio('/static/sounds/drop.wav');



let image = null;
export var pieces = [];

let selectedPiece = null;
let offset = {};
let camOffset = {};

export function setImage(image2) { image = image2};


export function setPieces(pieces2) { pieces = pieces2};

export function setBoardSize(w, h) { pieceCountH = w; pieceCountV = h; IMAGE_WIDTH = w * PIECE_SIZE; IMAGE_HEIGHT = h * PIECE_SIZE};
export function setCamPos(x, y) {camX = x; camY = y;};

export function selectNetworkPiece(pieceID, nickname) {selectedNetworkPiece[pieceID] = nickname};
export function deselectNetworkPiece(pieceID) {delete selectedNetworkPiece[pieceID];};

function draw_piece_path(ctx, piece) {
    const half = PIECE_SIZE / 2;
    const padding = Math.max(SPINE_HEIGHT, SPINE_WIDTH) + 10;
    
    // ctx.save();
    // 캔버스 중앙으로 이동 (여백 고려)
    ctx.translate(half + padding, half + padding);
    // ctx.translate(piece.)
    ctx.beginPath();

    // 꼭짓점 정의 (이미 piece 데이터에 계산되어 들어옴)
    const c0 = piece.corners[0]; // 좌상
    const c1 = piece.corners[1]; // 우상
    const c2 = piece.corners[2]; // 우하
    const c3 = piece.corners[3]; // 좌하

    // 1. 위쪽 변 (c0 -> c1)
    ctx.moveTo(c0.x, c0.y);
    if (piece.spine_dir[0] !== 0) {
        const midX = (c0.x + c1.x) / 2;
        const midY = (c0.y + c1.y) / 2;
        ctx.lineTo(midX - SPINE_WIDTH / 2, midY);
        ctx.bezierCurveTo(
            midX - SPINE_WIDTH / 2 - SPINE_OFFSET, midY - SPINE_HEIGHT * piece.spine_dir[0],
            midX + SPINE_WIDTH / 2 + SPINE_OFFSET, midY - SPINE_HEIGHT * piece.spine_dir[0],
            midX + SPINE_WIDTH / 2, midY
        );
    }
    ctx.lineTo(c1.x, c1.y);

    // 2. 오른쪽 변 (c1 -> c2)
    if (piece.spine_dir[1] !== 0) {
        const midX = (c1.x + c2.x) / 2;
        const midY = (c1.y + c2.y) / 2;
        ctx.lineTo(midX, midY - SPINE_WIDTH / 2);
        ctx.bezierCurveTo(
            midX + SPINE_HEIGHT * piece.spine_dir[1], midY - SPINE_WIDTH / 2 - SPINE_OFFSET,
            midX + SPINE_HEIGHT * piece.spine_dir[1], midY + SPINE_WIDTH / 2 + SPINE_OFFSET,
            midX, midY + SPINE_WIDTH / 2
        );
    }
    ctx.lineTo(c2.x, c2.y);

    // 3. 아래쪽 변 (c2 -> c3)
    if (piece.spine_dir[2] !== 0) {
        const midX = (c2.x + c3.x) / 2;
        const midY = (c2.y + c3.y) / 2;
        ctx.lineTo(midX + SPINE_WIDTH / 2, midY);
        ctx.bezierCurveTo(
            midX + SPINE_WIDTH / 2 + SPINE_OFFSET, midY + SPINE_HEIGHT * piece.spine_dir[2],
            midX - SPINE_WIDTH / 2 - SPINE_OFFSET, midY + SPINE_HEIGHT * piece.spine_dir[2],
            midX - SPINE_WIDTH / 2, midY
        );
    }
    ctx.lineTo(c3.x, c3.y);

    // 4. 왼쪽 변 (c3 -> c0)
    if (piece.spine_dir[3] !== 0) {
        const midX = (c3.x + c0.x) / 2;
        const midY = (c3.y + c0.y) / 2;
        ctx.lineTo(midX, midY + SPINE_WIDTH / 2);
        ctx.bezierCurveTo(
            midX - SPINE_HEIGHT * piece.spine_dir[3], midY + SPINE_WIDTH / 2 + SPINE_OFFSET,
            midX - SPINE_HEIGHT * piece.spine_dir[3], midY - SPINE_WIDTH / 2 - SPINE_OFFSET,
            midX, midY - SPINE_WIDTH / 2
        );
    }
    ctx.lineTo(c0.x, c0.y);

    ctx.closePath();
    
    // 이미지 클리핑 및 그리기
}
function draw_piece(ctx, piece, image) {

    ctx.save();
    draw_piece_path(ctx, piece);
    ctx.clip();

    
    const padding = Math.max(SPINE_HEIGHT, SPINE_WIDTH) + 10;
    // 원본 이미지에서 해당 조각의 영역을 잘라옴
    ctx.drawImage(
        image, 
        -piece.imageX - padding, -piece.imageY - padding, IMAGE_WIDTH, IMAGE_HEIGHT
        
    );
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgb(27, 24, 16)";
    
    ctx.stroke();

    

    
    ctx.restore();
}

export function createOffscreenCanvas(piece, image) {
    const size = PIECE_SIZE + Math.max(SPINE_HEIGHT, SPINE_WIDTH) * 4;
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    draw_piece(ctx, piece, image);

    
    return canvas;
}

function setupGame(h, v, imageURL) {
    pieceCountH = h;
    pieceCountV = v;
    image = new Image();
    image.src = imageURL;
    image.onload = () => {
        IMAGE_WIDTH = pieceCountH * PIECE_SIZE;
        IMAGE_HEIGHT = pieceCountV * PIECE_SIZE;
        
        // 1. 교차점(Junctions) 생성
        const junctions = [];
        for (let y = 0; y <= pieceCountV; y++) {
            junctions[y] = [];
            for (let x = 0; x <= pieceCountH; x++) {
                const isEdge = (x === 0 || x === pieceCountH || y === 0 || y === pieceCountV);
                junctions[y][x] = {
                    x: isEdge ? 0 : (Math.random() - 0.5) * MAX_OFFSET,
                    y: isEdge ? 0 : (Math.random() - 0.5) * MAX_OFFSET
                };
            }
        }

        // 2. 변의 돌출 방향 (Horizontal & Vertical edges) 생성
        // hSpines[y][x]는 (x,y)와 (x+1,y) 사이의 변 방향
        const hSpines = [];
        for (let y = 0; y <= pieceCountV; y++) {
            hSpines[y] = [];
            for (let x = 0; x < pieceCountH; x++) {
                hSpines[y][x] = (y === 0 || y === pieceCountV) ? 0 : (Math.random() > 0.5 ? 1 : -1);
            }
        }
        const vSpines = [];
        for (let y = 0; y < pieceCountV; y++) {
            vSpines[y] = [];
            for (let x = 0; x <= pieceCountH; x++) {
                vSpines[y][x] = (x === 0 || x === pieceCountH) ? 0 : (Math.random() > 0.5 ? 1 : -1);
            }
        }

        // 3. 조각 데이터 구성
        pieces = [];
        const half = PIECE_SIZE / 2;
        for (let y = 0; y < pieceCountV; y++) {
            for (let x = 0; x < pieceCountH; x++) {
                const data = {
                    imageX: x * PIECE_SIZE,
                    imageY: y * PIECE_SIZE,
                    // 각 변의 돌출 방향 (0:상, 1:우, 2:하, 3:좌)
                    // 아래 변과 왼쪽 변은 인접 조각과 반대 방향이어야 함
                    spine_dir: [hSpines[y][x], -vSpines[y][x+1], -hSpines[y+1][x], vSpines[y][x]],
                    corners: [
                        { x: -half + junctions[y][x].x,     y: -half + junctions[y][x].y }, // 좌상
                        { x:  half + junctions[y][x+1].x,   y: -half + junctions[y][x+1].y }, // 우상
                        { x:  half + junctions[y+1][x+1].x, y:  half + junctions[y+1][x+1].y }, // 우하
                        { x: -half + junctions[y+1][x].x,   y:  half + junctions[y+1][x].y }  // 좌하
                    ]
                };

                pieces.push({
                    off_canvas: createOffscreenCanvas(data, image),
                    correctX: x * (PIECE_SIZE) + 4 + 300 + (PIECE_SIZE) / 2,
                    correctY: y * (PIECE_SIZE) + 104 + PIECE_SIZE / 2,
                    x: (Math.random() * (3) * 50) + 50,
                    y: (Math.random() * (canvas.height / 50 - 5) * 50 + 100),
                    
                    gridX: x,
                    
                    gridY: y,
                    corners: data.corners,
                    spine_dir: data.spine_dir,
                    zoom: 1,
                    yOffset: 0,
                    // x: x * (PIECE_SIZE) + 104 + (PIECE_SIZE) / 2,
                    // y: y * (PIECE_SIZE) + 104 + PIECE_SIZE / 2,
                    imageX: data.imageX,
                    imageY: data.imageY
                });
            }
        }
        render(image);
    };

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("mouseup", mouseUp);
}

function selectPiece(ts)
{
    
    if (selectedPiece)
    {
        console.log(ts, selectStart);
        selectedPiece.zoom = 1 - ((ts - selectStart) / SELECT_ZOOM_DURATION) + SELECT_ZOOM_AMOUNT * (((ts - selectStart) / SELECT_ZOOM_DURATION));
        render(image);
        // console.log(SELECT_ZOOM_SPEED * (ts - selectStart), selectedPiece.zoom < SELECT_ZOOM_AMOUNT);
        if ((ts - selectStart) <= SELECT_ZOOM_DURATION)
        {
            
            
            requestAnimationFrame(selectPiece);
        }
        else
        {
            selectedPieceMovable = true;
            console.log("OO");
        }
        
    }
    
    
    
}

function deselectPiece(ts)
{
    console.log("A");
    if (selectedPiece)
    {
        selectedPiece.zoom = ((ts - selectStart) / SELECT_ZOOM_DURATION) + SELECT_ZOOM_AMOUNT * (1 - ((ts - selectStart) / SELECT_ZOOM_DURATION));
        render(image);
        if ((ts - selectStart) <= SELECT_ZOOM_DURATION)
        {
            requestAnimationFrame(deselectPiece);
        }
        else
        {
            selectedPiece = null;
        }
        
    }
    
}



export function render(image) {

    
    
    ctx.fillStyle = "#ddffdd"
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    // 배경 가이드라인 (선택사항)
    
    ctx.clearRect(300 - camX, 100 - camY, IMAGE_WIDTH, IMAGE_HEIGHT);

    ctx.globalAlpha = 0.4;
    ctx.drawImage(image, 300 - camX, 100 - camY, IMAGE_WIDTH, IMAGE_HEIGHT);
    ctx.globalAlpha = 1;

    

    const padding = PIECE_SIZE; // Offscreen 캔버스의 여백 보정값
    pieces.forEach(p => {
        
        ctx.save();
        
        
        ctx.fillStyle = "green";
        
        let zoom = 1;
        

        // 중심 좌표 계산
        if ((p.pieceID && selectedNetworkPiece.hasOwnProperty(p.pieceID)))
        {
            ctx.save();
            const centerX = p.x - (p.off_canvas.width) / 2;
            const centerY = p.y - (p.off_canvas.height) / 2;
            ctx.translate(centerX - camX, centerY - camY);

            // 1. 도형 안쪽 채우기
            draw_piece_path(ctx, p);
            ctx.lineJoin = 'miter';
            ctx.miterLimit = 10;
        
            ctx.lineWidth = 8;       // 테두리 두께
            ctx.strokeStyle = "#ec729b"; // 테두리 색상
            ctx.fillStyle = "#ec729b"; // 테두리 색상
            ctx.stroke();
            ctx.restore();
            ctx.drawImage(p.off_canvas, p.x - (p.off_canvas.width * zoom)/2 - camX, p.y - (p.off_canvas.height * zoom)/2 - p.yOffset - camY, p.off_canvas.width * p.zoom, p.off_canvas.height * p.zoom);
            ctx.fillStyle = "#ec729b"; // 테두리 색상
            ctx.save();
            
            ctx.translate(centerX - camX, centerY - camY);
            draw_piece_path(ctx, p);

            ctx.fillRect(p.off_canvas.width / 4, -25, 80, 15);
            
            
            ctx.fillStyle = "white";
            ctx.font = "bold 14px sans-serif"
            console.log(selectedNetworkPiece);
            
            ctx.fillText(selectedNetworkPiece[p.pieceID].length > 5 ? selectedNetworkPiece[p.pieceID].slice(0, 5) + "..." : selectedNetworkPiece[p.pieceID], p.off_canvas.width / 4, -13);
            // ctx.lineJoin = "round";  // 테두리 모서리를 둥글게 (퍼즐 등에 적합)
            
            

            ctx.restore();
            return;
        }
        
        ctx.drawImage(p.off_canvas, p.x - (p.off_canvas.width * zoom)/2 - camX, p.y - (p.off_canvas.height * zoom)/2 - p.yOffset - camY, p.off_canvas.width * p.zoom, p.off_canvas.height * p.zoom);

        ctx.restore();
        
        
        
        
    });
}


function mouseDown(e) {
    let x = e.offsetX;
    let y = e.offsetY;
    console.log("MAGE");
    // 배열을 뒤에서부터 확인 (맨 위에 그려진 요소를 먼저 찾기 위함)
    for (let i = pieces.length - 1; i >= 0; i--) {
        let element = pieces[i];

        // 클릭 범위 확인 (중심점 기준)
        if ((element.x - PIECE_SIZE / 2) < x && x < (element.x + PIECE_SIZE / 2) && 
            (element.y - PIECE_SIZE / 2) < y && y < (element.y + PIECE_SIZE / 2)) {
            
            // 1. 선택된 요소를 배열에서 제거하고 맨 뒤로 보냄 (우선순위 최상단 이동)
            pieces.splice(i, 1);
            pieces.push(element);

            // 2. 선택된 요소 정보 업데이트
            selectedPiece = element;
            offset.x = x - element.x;
            offset.y = y - element.y;
            
            selectStart = document.timeline.currentTime;
            // requestAnimationFrame(selectPiece);
            
            // 3. 하나를 찾았으면 더 이상 반복할 필요 없음 (중요!)
            return; 
        }
    }
    
    cameraMoving = true;
    camOffset = {x: x, y: y}

}

function mouseMove(e) {
    if (cameraMoving)
    {
        // console.log("MAGE");
        // camX = e.offsetX - camOffset.x;
        // camY = e.offsetY - camOffset.y;

        // camX = Math.max(camX, 0);
        // camX = Math.min(camX, pieceCountH * PIECE_SIZE - canvas.width + 600);
        // camY = Math.max(camY, 0);
        // camY = Math.min(camY, pieceCountV * PIECE_SIZE - canvas.height + 600);
        
    }

    if (!selectedPiece) return;

    

    // 조각의 위치를 마우스 위치 - 클릭 시 오프셋으로 설정
    selectedPiece.x = e.offsetX - offset.x;
    selectedPiece.y = e.offsetY - offset.y;
    render(image);
    
}
function mouseUp(e) {
    cameraMoving = false;
    if (!selectedPiece) return;

    // 1. 거리 계산 (피타고라스 정리)
    const distanceSq = (selectedPiece.correctX - selectedPiece.x) ** 2 + (selectedPiece.correctY - selectedPiece.y) ** 2;
    const thresholdSq = SNAP_THRESOLD ** 2;
    
    if (distanceSq < thresholdSq) {
        // 이미 맞춰진 조각들만 필터링
        const correctPieces = pieces.filter((p) => p.correct);

        // 조건 A: 테두리에 위치한 조각인가?
        const isEdgePiece = selectedPiece.gridX === 0 || 
                           selectedPiece.gridX === pieceCountH - 1 || 
                           selectedPiece.gridY === 0 || 
                           selectedPiece.gridY === pieceCountV - 1;

        // 조건 B: 이미 맞춰진 조각 중 상하좌우(인접)에 있는 조각이 있는가?
        const isAdjacentToCorrect = correctPieces.some((p) => {
            const dx = Math.abs(p.gridX - selectedPiece.gridX);
            const dy = Math.abs(p.gridY - selectedPiece.gridY);
            // 상하좌우 한 칸 차이 (dx+dy가 1이면 인접함)
            return (dx + dy === 1);
        });

        // 테두리이거나, 옆에 맞춘 조각이 있을 때만 스냅 성공
        if (isEdgePiece || isAdjacentToCorrect) {
            console.log("Snap Success!");
            selectedPiece.x = selectedPiece.correctX;
            selectedPiece.y = selectedPiece.correctY;
            selectedPiece.correct = true; // 조각의 상태를 '맞춤'으로 변경
            render(image);
        }
    }


    
    
    selectedPiece = null;
}

function solve()
{
    pieces.forEach((x) => {x.x = x.correctX; x.y = x.correctY;});
    render(image);
}



// setupGame(16, 9, "/static/images/test.png");
