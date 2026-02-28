import { AnimationTween, RawAnimation } from "./animation.js";
import { Board } from "./board.js"
import { draw_piece_path } from "./canvas_utils.js";
import { EXIT_CELL_BTN_MARGIN, MARGIN, PIECE_SIZE, SELECT_ZOOM_AMOUNT } from "./const.js"
import { Piece } from "./piece.js"



const BackIcon = new Image();

BackIcon.src = "/static/images/left.png";

export class CellRenderer
{

    static instance: CellRenderer;
    ctx: CanvasRenderingContext2D
    selectedPiece: Array<number>
    mySelectedPiece: number
    pieces: Array<Piece>
    cacheCanvas: OffscreenCanvas;
    cacheCtx: OffscreenCanvasRenderingContext2D;

    


    constructor(ctx: CanvasRenderingContext2D, pieces: Array<Piece>)
    {
        CellRenderer.instance = this;
        
        
        
        this.ctx = ctx;
        this.cacheCanvas = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
        this.cacheCtx = this.cacheCanvas.getContext("2d")!;
        
        this.selectedPiece = [];
        this.mySelectedPiece = -1;

        
        this.pieces = pieces.filter(
            (piece) => piece.gridX >= Board.instance.cellSize * Board.instance.cellX && piece.gridX < Board.instance.cellSize * (Board.instance.cellX+1) &&
                        piece.gridY >= Board.instance.cellSize * Board.instance.cellY && piece.gridY < Board.instance.cellSize * (Board.instance.cellY+1)
        )

        
        this.pieces.forEach(piece => {
            piece.y += Board.instance.cellSize * PIECE_SIZE + MARGIN * 2;
        });
    }

    reloadOffscreenCanvas()
    {
        // console.log(this.pieces.length);
        this.cacheCtx.fillStyle = "#ffffff";
        this.cacheCtx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.cacheCtx.fillStyle = "#E8F5BD"
        
        this.cacheCtx.fillRect(0, 0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
        this.cacheCtx.fillStyle = "#ffffff";
        // this.cacheCtx.fillRect(MARGIN - Board.instance.cellSize * Board.instance.cellX, MARGIN - Board.instance.cellSize * Board.instance.cellY, Board.instance.cellSize * PIECE_SIZE + PIECE_SIZE, Board.instance.cellSize * PIECE_SIZE + PIECE_SIZE);
        
        
        
        this.cacheCtx.fillRect(-Board.instance.cellSize * PIECE_SIZE * Board.instance.cellX + MARGIN, -Board.instance.cellSize * PIECE_SIZE * Board.instance.cellY + MARGIN, Board.instance.imageWidth, Board.instance.imageHeight);
        // this.cacheCtx.globalAlpha = 0.8
        this.cacheCtx.save();
        this.cacheCtx.rect(0, 0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
        
        
        this.cacheCtx.clip();
        this.cacheCtx.drawImage(Board.instance.image, -Board.instance.cellSize * PIECE_SIZE * Board.instance.cellX + MARGIN, -Board.instance.cellSize * PIECE_SIZE * Board.instance.cellY + MARGIN, Board.instance.imageWidth, Board.instance.imageHeight);
        this.cacheCtx.restore();
        // this.cacheCtx.globalAlpha = 1
        this.cacheCtx.lineWidth = 8;
        this.cacheCtx.strokeStyle = "#fff"
        this.cacheCtx.strokeRect(MARGIN, MARGIN, Board.instance.cellSize * PIECE_SIZE, Board.instance.cellSize * PIECE_SIZE);
        
        
        
        
        this.pieces.forEach(piece => {
            if (this.selectedPiece.includes(piece.pieceID)) return;
            // console.log(piece.gridX, piece.gridY);
            this.cacheCtx.drawImage(piece.off_canvas, piece.x, piece.y);
        });

        this.cacheCtx.fillStyle = "#A2CB8B";
        this.cacheCtx.fillRect(EXIT_CELL_BTN_MARGIN, EXIT_CELL_BTN_MARGIN, MARGIN - EXIT_CELL_BTN_MARGIN * 2, MARGIN - EXIT_CELL_BTN_MARGIN * 2);
        this.cacheCtx.strokeStyle = "#84B179";
        this.cacheCtx.lineWidth = 3;
        this.cacheCtx.strokeRect(EXIT_CELL_BTN_MARGIN, EXIT_CELL_BTN_MARGIN, MARGIN - EXIT_CELL_BTN_MARGIN * 2, MARGIN - EXIT_CELL_BTN_MARGIN * 2);
        this.cacheCtx.drawImage(BackIcon, EXIT_CELL_BTN_MARGIN * 2, EXIT_CELL_BTN_MARGIN * 2, MARGIN - EXIT_CELL_BTN_MARGIN * 4, MARGIN - EXIT_CELL_BTN_MARGIN * 4)
    }

    render()
    {
        this.ctx.drawImage(this.cacheCanvas, 0, 0);
        this.selectedPiece.forEach(pieceID => {
            let piece = this.pieces.find((x) => x.pieceID === pieceID)!;
            
            
            if (piece.zoom != 1){
                
                this.ctx.translate(piece.x, piece.y)
                this.ctx.scale(piece.zoom, piece.zoom);
                this.ctx.drawImage(piece.off_canvas, -piece.off_canvas.width / 2 * (piece.zoom - 1), -piece.off_canvas.height / 2 * (piece.zoom - 1));
                this.ctx.scale(1 / piece.zoom, 1 / piece.zoom);
                this.ctx.translate(-piece.x, -piece.y)
                
                // this.ctx.translate(-(piece.off_canvas.width * (piece.zoom - 1)), -(piece.off_canvas.height * (piece.zoom - 1)))
                
                return;

                
            }
            this.ctx.drawImage(piece.off_canvas, piece.x, piece.y);
            if (piece.white)
            {
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

    deselect(piece: Piece)
    {
        this.selectedPiece = this.selectedPiece.filter((e) => e !== piece.pieceID);
    }

    

    correctWhiteEnd(piece: Piece)
    {
        

        piece.white = false;
        this.render();
        this.deselect(piece);
        
    }
}

export class FullRenderer
{
    
    cacheCanvas: OffscreenCanvas;
    cacheCtx: OffscreenCanvasRenderingContext2D;
    ctx: CanvasRenderingContext2D;
    imgX: number = 0;
    imgY: number = 0;
    imgW: number = 0;
    static instance: FullRenderer;
    imgH: number = 0;
    zoom: number = 1;
    camX: number = 0;
    camY: number = 0;

    


    constructor(ctx: CanvasRenderingContext2D)
    {
        FullRenderer.instance = this;
        this.cacheCanvas = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
        this.cacheCtx = this.cacheCanvas.getContext("2d")!;
        this.ctx = ctx;
    }

    zoomTo(cx: number, cy: number) {

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
        let anim = new RawAnimation(
            500,
            [
                new AnimationTween(this.camX, targetX, "camX"),
                new AnimationTween(this.camY, targetY, "camY"),
                new AnimationTween(this.zoom, targetZoom, "zoom"),
            ],
            this.zooming.bind(this),
            () => this.transition(cx, cy)
        );
        
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
        let anim = new RawAnimation(
            500,
            [
                new AnimationTween(targetX, 0, "camX"),
                new AnimationTween(targetY, 0, "camY"),
                new AnimationTween(targetZoom, 1, "zoom"),
            ],
            this.zooming.bind(this),
            
        );
        
        anim.play();
    }


    transition(cx: number, cy: number)
    {
        Board.instance.cellX = cx;
        Board.instance.cellY = cy;
        // let pieces = Board.instance.generatePieces();
        let cellRenderer: CellRenderer = new CellRenderer(this.ctx, [...Board.instance.pieces]);
        
        cellRenderer.reloadOffscreenCanvas();
        cellRenderer.render();
    }


    zooming(data: { camX: number; camY: number; zoom: number; })
    {
        this.camX = data.camX;
        this.camY = data.camY;
        this.zoom = data.zoom;
        console.log("ZOOMING");
        this.render();
    }

    reloadOffscreenCanvas(cellData: number[][])
    {
        this.cacheCtx.fillStyle = "#E8F5BD";
        this.cacheCtx.fillRect(0, 0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);


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
        
        this.cacheCtx.drawImage(Board.instance.image, x, y, finalWidth, finalHeight);

        let cellWidth = Board.instance.boardWidth / Board.instance.cellSize;
        let cellHeight = Board.instance.boardHeight / Board.instance.cellSize;
        this.cacheCtx.strokeStyle = "#ffffff";
        
        this.cacheCtx.font = "30px Arial";
        for (let cy=0; cy < cellHeight; cy++)
        {
            for(let cx=0; cx < cellWidth; cx++)
            {
                
                this.cacheCtx.lineWidth = 4;
                let value = cellData[cy][cx];
                this.cacheCtx.globalAlpha = 0.5 * value;
                // this.cacheCtx.fillStyle = "#ffffff";
                // this.cacheCtx.fillRect(x + finalWidth / cellWidth * cx, y + finalHeight / cellHeight * cy, finalWidth / cellWidth, finalHeight / cellHeight);
                let metrics = this.cacheCtx.measureText(value * 100 + "%");
                const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                this.cacheCtx.globalAlpha = 1;
                this.cacheCtx.fillStyle = "#ffffff";
                this.cacheCtx.fillText(value * 100 + "%", x + finalWidth / cellWidth * cx + (finalWidth / cellWidth - metrics.width) / 2, (y + finalHeight / cellHeight * cy) + (finalHeight / cellHeight + textHeight) / 2);

                this.cacheCtx.strokeRect(x + finalWidth / cellWidth * cx, y + finalHeight / cellHeight * cy, finalWidth / cellWidth, finalHeight / cellHeight);
            }
        }
    }

    render()
    {
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camX, -this.camY);
        
        this.ctx.drawImage(this.cacheCanvas, 0, 0)    
        this.ctx.translate(this.camX, this.camY);
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0, Board.instance.cellSize * PIECE_SIZE + MARGIN * 2, this.ctx.canvas.width, this.ctx.canvas.height - Board.instance.cellSize * PIECE_SIZE + MARGIN * 2);
    }
}