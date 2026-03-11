import { AnimationTween, RawAnimation } from "./animation.js";
import { Board } from "./board.js";
import { draw_piece_path } from "./canvas_utils.js";
import { EXIT_CELL_BTN_MARGIN, MARGIN, PALLETE, PIECE_SIZE } from "./const.js";
const BackIcon = new Image();
BackIcon.src = "/static/images/left.png";
export class CellRenderer {
    static instance;
    ctx;
    selectedPiece;
    mySelectedPiece;
    pieces;
    cacheCanvas;
    cacheCtx;
    constructor(ctx, pieces) {
        CellRenderer.instance = this;
        this.ctx = ctx;
        this.cacheCanvas = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
        this.cacheCtx = this.cacheCanvas.getContext("2d");
        this.selectedPiece = [];
        this.mySelectedPiece = -1;
        this.pieces = pieces.filter((piece) => piece.gridX >= Board.instance.cellSize * Board.instance.cellX && piece.gridX < Board.instance.cellSize * (Board.instance.cellX + 1) &&
            piece.gridY >= Board.instance.cellSize * Board.instance.cellY && piece.gridY < Board.instance.cellSize * (Board.instance.cellY + 1));
        this.pieces.forEach(piece => {
            if (piece.y <= Math.floor(Board.instance.cellSize ** 2 / (2 * Board.instance.cellSize)) * PIECE_SIZE / 2)
                piece.y += Board.instance.cellSize * PIECE_SIZE + MARGIN * 2;
        });
    }
    reloadOffscreenCanvas() {
        // console.log(this.pieces.length);
        // this.cacheCtx.fillStyle = "#ffffff";
        // this.cacheCtx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.cacheCtx.fillStyle = PALLETE[3];
        this.cacheCtx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // this.cacheCtx.fillRect(0, 0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
        // this.cacheCtx.fillStyle = "#ffffff";
        // this.cacheCtx.fillRect(MARGIN - Board.instance.cellSize * Board.instance.cellX, MARGIN - Board.instance.cellSize * Board.instance.cellY, Board.instance.cellSize * PIECE_SIZE + PIECE_SIZE, Board.instance.cellSize * PIECE_SIZE + PIECE_SIZE);
        // this.cacheCtx.fillRect(-Board.instance.cellSize * PIECE_SIZE * Board.instance.cellX + MARGIN, -Board.instance.cellSize * PIECE_SIZE * Board.instance.cellY + MARGIN, Board.instance.imageWidth, Board.instance.imageHeight);
        // this.cacheCtx.globalAlpha = 0.8
        this.cacheCtx.save();
        this.cacheCtx.rect(0, 0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
        this.cacheCtx.clip();
        this.cacheCtx.filter = 'grayscale(70%)';
        this.cacheCtx.drawImage(Board.instance.image, -Board.instance.cellSize * PIECE_SIZE * Board.instance.cellX + MARGIN, -Board.instance.cellSize * PIECE_SIZE * Board.instance.cellY + MARGIN, Board.instance.imageWidth, Board.instance.imageHeight);
        this.cacheCtx.filter = "none";
        this.cacheCtx.restore();
        // this.cacheCtx.globalAlpha = 1
        this.cacheCtx.lineWidth = 8;
        this.cacheCtx.strokeStyle = "#fff";
        this.cacheCtx.strokeRect(MARGIN, MARGIN, Board.instance.cellSize * PIECE_SIZE, Board.instance.cellSize * PIECE_SIZE);
        this.pieces.forEach(piece => {
            if (this.selectedPiece.includes(piece.pieceID))
                return;
            // console.log(piece.gridX, piece.gridY);
            this.cacheCtx.drawImage(piece.off_canvas, piece.x, piece.y);
        });
        this.cacheCtx.fillStyle = PALLETE[1];
        this.cacheCtx.fillRect(EXIT_CELL_BTN_MARGIN, EXIT_CELL_BTN_MARGIN, MARGIN - EXIT_CELL_BTN_MARGIN * 2, MARGIN - EXIT_CELL_BTN_MARGIN * 2);
        this.cacheCtx.strokeStyle = PALLETE[0];
        this.cacheCtx.lineWidth = 3;
        this.cacheCtx.strokeRect(EXIT_CELL_BTN_MARGIN, EXIT_CELL_BTN_MARGIN, MARGIN - EXIT_CELL_BTN_MARGIN * 2, MARGIN - EXIT_CELL_BTN_MARGIN * 2);
        this.cacheCtx.drawImage(BackIcon, EXIT_CELL_BTN_MARGIN * 2, EXIT_CELL_BTN_MARGIN * 2, MARGIN - EXIT_CELL_BTN_MARGIN * 4, MARGIN - EXIT_CELL_BTN_MARGIN * 4);
    }
    render() {
        this.ctx.drawImage(this.cacheCanvas, 0, 0);
        this.selectedPiece.forEach(pieceID => {
            let piece = this.pieces.find((x) => x.pieceID === pieceID);
            if (piece.selectedBy) {
                this.ctx.translate(piece.x - piece.off_canvas.width * (piece.zoom - 1) / 2, piece.y - piece.off_canvas.height * (piece.zoom - 1) / 2);
                this.ctx.scale(piece.zoom, piece.zoom);
                draw_piece_path(this.ctx, piece);
                this.ctx.strokeStyle = "#7AAACE";
                this.ctx.lineWidth = 7;
                this.ctx.globalAlpha = piece.correctAlpha;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
                this.ctx.scale(1 / piece.zoom, 1 / piece.zoom);
                this.ctx.translate(-piece.x + piece.off_canvas.width * (piece.zoom - 1) / 2, -piece.y + piece.off_canvas.height * (piece.zoom - 1) / 2);
                this.ctx.beginPath();
                this.ctx.lineWidth = 4;
                this.ctx.moveTo(piece.x + PIECE_SIZE + 40, piece.y + 5);
                this.ctx.lineTo(piece.x + PIECE_SIZE + 60, piece.y - 5);
                this.ctx.stroke();
                this.ctx.fillStyle = "#7AAACE";
                this.ctx.fillRect(piece.x + PIECE_SIZE + 65, piece.y - 15, 60, 20);
                this.ctx.fillStyle = "#fff";
                this.ctx.font = "14px bold";
                this.ctx.textBaseline = "hanging";
                this.ctx.fillText(piece.selectedBy.length > 6 ? piece.selectedBy.slice(0, 5) + "..." : piece.selectedBy, piece.x + PIECE_SIZE + 67, piece.y - 13);
            }
            if (piece.zoom != 1) {
                this.ctx.translate(piece.x, piece.y);
                this.ctx.scale(piece.zoom, piece.zoom);
                this.ctx.drawImage(piece.off_canvas, -piece.off_canvas.width / 2 * (piece.zoom - 1), -piece.off_canvas.height / 2 * (piece.zoom - 1));
                if (piece.selectedBy) {
                }
                this.ctx.scale(1 / piece.zoom, 1 / piece.zoom);
                this.ctx.translate(-piece.x, -piece.y);
                // this.ctx.translate(-(piece.off_canvas.width * (piece.zoom - 1)), -(piece.off_canvas.height * (piece.zoom - 1)))
                return;
            }
            this.ctx.drawImage(piece.off_canvas, piece.x, piece.y);
            if (piece.white) {
                this.ctx.translate(piece.x - piece.off_canvas.width * (piece.correctZoom - 1) / 2, piece.y - piece.off_canvas.height * (piece.correctZoom - 1) / 2);
                this.ctx.scale(piece.correctZoom, piece.correctZoom);
                draw_piece_path(this.ctx, piece);
                this.ctx.strokeStyle = "#fff";
                this.ctx.lineWidth = 5;
                this.ctx.globalAlpha = piece.correctAlpha;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
                this.ctx.scale(1 / piece.correctZoom, 1 / piece.correctZoom);
                this.ctx.translate(-piece.x + piece.off_canvas.width * (piece.correctZoom - 1) / 2, -piece.y + piece.off_canvas.height * (piece.correctZoom - 1) / 2);
            }
        });
    }
    deselect(piece) {
        this.selectedPiece = this.selectedPiece.filter((e) => e !== piece.pieceID);
    }
    correctWhiteEnd(piece) {
        piece.white = false;
        this.render();
        this.deselect(piece);
    }
}
export class FullRenderer {
    cacheCanvas;
    cacheCtx;
    ctx;
    imgX = 0;
    imgY = 0;
    imgW = 0;
    static instance;
    imgH = 0;
    zoom = 1;
    camX = 0;
    camY = 0;
    constructor(ctx) {
        FullRenderer.instance = this;
        this.cacheCanvas = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
        this.cacheCtx = this.cacheCanvas.getContext("2d");
        this.ctx = ctx;
    }
    zoomTo(cx, cy) {
        let cellWidth = Board.instance.boardWidth / Board.instance.cellSize;
        let cellHeight = Board.instance.boardHeight / Board.instance.cellSize;
        // 1. 셀의 원본 크기 계산
        const cellW = this.imgW / cellWidth;
        const cellH = this.imgH / cellHeight;
        // 2. 목표 배율 (Target Zoom) 계산
        // 양옆 마진을 뺀 가용 너비에 셀 너비를 맞춥니다.
        const availableWidth = this.ctx.canvas.width - (MARGIN * 2);
        const targetZoom = availableWidth / cellW;
        /* 3. 목표 좌표 (Target camX, camY) 계산
        render 함수에서 scale 후 translate(-camX, -camY)를 하므로,
        (camX, camY)는 캔버스의 (0,0) 지점에 올 원본 좌표를 의미합니다.
        
        하지만 우리는 마진을 원하므로,
        실제로는 (0,0)보다 약간 '덜' 밀어야 마진이 생깁니다.
        */
        // 왼쪽 마진을 고려한 X 좌표
        // (이미지 좌표) - (마진을 배율로 나눈 값)
        const targetX = (this.imgX + cx * cellW) - (MARGIN / targetZoom);
        // 위쪽 마진을 고려한 Y 좌표
        const targetY = (this.imgY + cy * cellH) - (MARGIN / targetZoom);
        console.log(cx, cy);
        // 4. 애니메이션 실행
        let anim = new RawAnimation(500, [
            new AnimationTween(this.camX, targetX, "camX"),
            new AnimationTween(this.camY, targetY, "camY"),
            new AnimationTween(this.zoom, targetZoom, "zoom"),
        ], this.zooming.bind(this), () => this.transition(cx, cy));
        anim.play();
    }
    zoomOut() {
        let cellWidth = Board.instance.boardWidth / Board.instance.cellSize;
        let cellHeight = Board.instance.boardHeight / Board.instance.cellSize;
        const cx = Board.instance.cellX;
        const cy = Board.instance.cellY;
        Board.instance.cellX = -1;
        Board.instance.cellY = -1;
        // 1. 셀의 원본 크기 계산
        const cellW = this.imgW / cellWidth;
        const cellH = this.imgH / cellHeight;
        // 2. 목표 배율 (Target Zoom) 계산
        // 양옆 마진을 뺀 가용 너비에 셀 너비를 맞춥니다.
        const availableWidth = this.ctx.canvas.width - (MARGIN * 2);
        const targetZoom = availableWidth / cellW;
        /* 3. 목표 좌표 (Target camX, camY) 계산
        render 함수에서 scale 후 translate(-camX, -camY)를 하므로,
        (camX, camY)는 캔버스의 (0,0) 지점에 올 원본 좌표를 의미합니다.
        
        하지만 우리는 마진을 원하므로,
        실제로는 (0,0)보다 약간 '덜' 밀어야 마진이 생깁니다.
        */
        // 왼쪽 마진을 고려한 X 좌표
        // (이미지 좌표) - (마진을 배율로 나눈 값)
        const targetX = (this.imgX + cx * cellW) - (MARGIN / targetZoom);
        // 위쪽 마진을 고려한 Y 좌표
        const targetY = (this.imgY + cy * cellH) - (MARGIN / targetZoom);
        // 4. 애니메이션 실행
        let anim = new RawAnimation(500, [
            new AnimationTween(targetX, 0, "camX"),
            new AnimationTween(targetY, 0, "camY"),
            new AnimationTween(targetZoom, 1, "zoom"),
        ], this.zooming.bind(this));
        anim.play();
    }
    transition(cx, cy) {
        Board.instance.cellX = cx;
        Board.instance.cellY = cy;
        // let pieces = Board.instance.generatePieces();
        // console.log(Board.instance.pieces);
        let cellRenderer = new CellRenderer(this.ctx, [...Board.instance.pieces]);
        cellRenderer.reloadOffscreenCanvas();
        cellRenderer.render();
    }
    zooming(data) {
        this.camX = data.camX;
        this.camY = data.camY;
        this.zoom = data.zoom;
        console.log("ZOOMING");
        this.render();
    }
    reloadOffscreenCanvas(cellData) {
        this.cacheCtx.fillStyle = PALLETE[3];
        // this.cacheCtx.fillRect(0, 0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
        this.cacheCtx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // 1. 이미지가 그려질 최대 허용 범위 계산
        const maxWidth = this.ctx.canvas.width - (MARGIN * 2);
        const maxHeight = Board.instance.cellSize * PIECE_SIZE + MARGIN * 2;
        console.log(maxHeight, this.ctx.canvas.height);
        // 2. 비율 유지 스케일 계산
        // 이미지의 가로와 세로 중 어디에 맞출지 결정
        const ratio = Math.min(maxWidth / Board.instance.image.width, maxHeight / Board.instance.image.height);
        // 3. 최종적으로 그려질 이미지의 크기
        const finalWidth = Board.instance.image.width * ratio;
        const finalHeight = Board.instance.image.height * ratio;
        this.imgW = finalWidth;
        this.imgH = finalHeight;
        // 4. 캔버스 정중앙 배치를 위한 시작 좌표(x, y) 계산
        const x = (this.ctx.canvas.width - finalWidth) / 2;
        const y = (Board.instance.cellSize * PIECE_SIZE + MARGIN * 2 - finalHeight) / 2;
        this.imgX = x;
        this.imgY = y;
        // 5. 캔버스 초기화 후 그리기
        this.cacheCtx.filter = 'grayscale(70%)';
        this.cacheCtx.drawImage(Board.instance.image, x, y, finalWidth, finalHeight);
        this.cacheCtx.filter = 'none';
        let cellWidth = Board.instance.boardWidth / Board.instance.cellSize;
        let cellHeight = Board.instance.boardHeight / Board.instance.cellSize;
        this.cacheCtx.strokeStyle = "#ffffff";
        this.cacheCtx.font = "30px Arial";
        for (let cy = 0; cy < cellHeight; cy++) {
            for (let cx = 0; cx < cellWidth; cx++) {
                this.cacheCtx.lineWidth = 4;
                let value = cellData[cy][cx];
                // 공통 좌표 및 크기 계산 (가독성을 위해 변수화)
                const cellW = finalWidth / cellWidth;
                const cellH = finalHeight / cellHeight;
                const posX = x + cellW * cx;
                const posY = y + cellH * cy;
                if (value === 1) {
                    this.cacheCtx.save();
                    // 1. 클리핑 영역 설정
                    this.cacheCtx.beginPath(); // 이전 경로가 영향을 주지 않도록 시작
                    this.cacheCtx.rect(posX, posY, cellW, cellH);
                    this.cacheCtx.clip();
                    // 2. 이미지 그리기 (이 이미지만 클리핑의 영향을 받음)
                    this.cacheCtx.drawImage(Board.instance.image, x, y, finalWidth, finalHeight);
                    this.cacheCtx.restore(); // 여기서 클리핑 해제!
                }
                // --- 여기서부터는 클리핑의 영향을 받지 않음 ---
                // 3. 텍스트 그리기
                this.cacheCtx.globalAlpha = 1;
                this.cacheCtx.fillStyle = "#ffffff";
                let textContent = (value * 100) + "%";
                let metrics = this.cacheCtx.measureText(textContent);
                const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                this.cacheCtx.fillText(textContent, posX + (cellW - metrics.width) / 2, posY + (cellH + textHeight) / 2);
                // 4. 테두리 그리기 (마지막에 그려야 텍스트나 이미지 위에 선명하게 올라옵니다)
                this.cacheCtx.strokeRect(posX, posY, cellW, cellH);
            }
        }
    }
    render() {
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camX, -this.camY);
        this.ctx.drawImage(this.cacheCanvas, 0, 0);
        this.ctx.translate(this.camX, this.camY);
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        // this.ctx.fillStyle = "white"
        this.ctx.fillStyle = PALLETE[3];
        this.ctx.fillRect(0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, this.ctx.canvas.width, this.ctx.canvas.height - Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
    }
}
//# sourceMappingURL=render.js.map