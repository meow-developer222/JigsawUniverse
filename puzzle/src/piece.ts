import { Board } from "./board.js";
import { draw_piece_path } from "./canvas_utils.js"
import { AnimationTween, RawAnimation } from "./animation.js"

import { CORRECT_ZOOM_AMOUNT, CORRECT_ZOOM_DURATION, PIECE_SIZE, SELECT_ZOOM_AMOUNT, SELECT_ZOOM_DURATION, SPINE_HEIGHT, SPINE_WIDTH } from "./const.js"
import { CellRenderer } from "./render.js";


export class Piece
{
    

    corners: number[][];
    spine_dir: number[];
    off_canvas: OffscreenCanvas;
    imageX: number;
    imageY: number;
    x: number;
    y: number;
    correctX: number;
    correctY: number;
    gridX: number;
    gridY: number;
    pieceID: number;
    zoom: number;
    yOffset: number;
    selectedBy: string;

    correctZoom: number = 1;
    correctAlpha: number = 1;

    selectAnim: RawAnimation;
    deselectAnim: RawAnimation
    correctAnim: RawAnimation;
    white: boolean;
    isCorrect: boolean = false;
    
    static fromJson(json: object)
    {
        return 
    }


    init_offscreen_canvas()
    {
    
        const size = PIECE_SIZE + Math.max(SPINE_HEIGHT, SPINE_WIDTH) * 4;
        

        const ctx = this.off_canvas.getContext('2d')!;


        const padding = Math.max(SPINE_HEIGHT, SPINE_WIDTH) + 10;
        draw_piece_path(ctx, this);
        ctx.clip();
        ctx.drawImage(
            Board.instance.image, 
            -this.imageX - padding, -this.imageY - padding, Board.instance.imageWidth, Board.instance.imageHeight
            
        );
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgb(27, 24, 16)";
        
        
        ctx.stroke();


        
        
    }

    static nextPieceID = 0

    constructor(correctX: number, correctY: number, x: number, y: number, gridX: any, gridY: any, corners: number[][], spine_dir: number[], imageX: number, imageY: number)
    {
        this.white = false;
        const size = PIECE_SIZE + Math.max(SPINE_HEIGHT, SPINE_WIDTH) * 4;
        this.off_canvas = new OffscreenCanvas(size, size);
        this.correctX = correctX
        this.selectAnim = new RawAnimation(SELECT_ZOOM_DURATION, [new AnimationTween(1, SELECT_ZOOM_AMOUNT, "zoom")], this.zooming.bind(this));
        this.deselectAnim = new RawAnimation(SELECT_ZOOM_DURATION, [new AnimationTween(SELECT_ZOOM_AMOUNT, 1, "zoom")], this.zooming.bind(this));
        this.correctAnim = new RawAnimation(CORRECT_ZOOM_DURATION, [new AnimationTween(1, CORRECT_ZOOM_AMOUNT, "zoom"), new AnimationTween(1, 0, "alpha")], this.correcting.bind(this), () => CellRenderer.instance.correctWhiteEnd(this));
        this.correctY = correctY
        this.x = x
        this.y = y
        this.gridX = gridX
        this.gridY = gridY
        this.corners = corners
        this.spine_dir = spine_dir
        this.zoom = 1
        this.yOffset = 0
        this.imageX = imageX,
        this.imageY = imageY
        this.selectedBy = "";
        this.pieceID = Piece.nextPieceID++;
    }

    select()
    {
        
        this.selectAnim.play();
    }

    deselect() {
        this.deselectAnim.play();
    }

    correct() {
        this.white = true;
        this.isCorrect = true;
        
        
        this.deselectAnim.stop();
        this.zoom = 1;
        this.correctAnim.play();
    }

    correcting(data: {zoom: number, alpha: number})
    {
        this.correctAlpha = data.alpha;
        this.correctZoom = data.zoom;

        CellRenderer.instance.render();
    }

    zooming(data: {[key: string]: number; zoom: number})
    {
        this.zoom = data.zoom;
        
        CellRenderer.instance.render();
    }
}


