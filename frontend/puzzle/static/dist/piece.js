import { Board } from "./board.js";
import { draw_piece_path } from "./canvas_utils.js";
import { AnimationTween, RawAnimation } from "./animation.js";
import { CORRECT_ZOOM_AMOUNT, CORRECT_ZOOM_DURATION, PIECE_SIZE, SELECT_ZOOM_AMOUNT, SELECT_ZOOM_DURATION, SPINE_HEIGHT, SPINE_WIDTH } from "./const.js";
import { CellRenderer } from "./render.js";
export class Piece {
    corners;
    spine_dir;
    off_canvas;
    imageX;
    imageY;
    x;
    y;
    correctX;
    correctY;
    gridX;
    gridY;
    pieceID;
    zoom;
    yOffset;
    selectedBy;
    correctZoom = 1;
    correctAlpha = 1;
    selectAnim;
    deselectAnim;
    correctAnim;
    white;
    isCorrect;
    init_offscreen_canvas() {
        const size = PIECE_SIZE + Math.max(SPINE_HEIGHT, SPINE_WIDTH) * 4;
        const ctx = this.off_canvas.getContext('2d');
        const padding = Math.max(SPINE_HEIGHT, SPINE_WIDTH) + 10;
        draw_piece_path(ctx, this);
        ctx.clip();
        ctx.drawImage(Board.instance.image, -this.imageX - padding, -this.imageY - padding, Board.instance.imageWidth, Board.instance.imageHeight);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgb(27, 24, 16)";
        ctx.stroke();
    }
    static nextPieceID = 0;
    constructor(correctX, correctY, x, y, gridX, gridY, corners, spine_dir, imageX, imageY, isCorrect = false) {
        this.isCorrect = isCorrect;
        this.white = false;
        const size = PIECE_SIZE + Math.max(SPINE_HEIGHT, SPINE_WIDTH) * 4;
        this.off_canvas = new OffscreenCanvas(size, size);
        this.correctX = correctX;
        this.selectAnim = new RawAnimation(SELECT_ZOOM_DURATION, [new AnimationTween(1, SELECT_ZOOM_AMOUNT, "zoom")], this.zooming.bind(this));
        this.deselectAnim = new RawAnimation(SELECT_ZOOM_DURATION, [new AnimationTween(SELECT_ZOOM_AMOUNT, 1, "zoom")], this.zooming.bind(this));
        this.correctAnim = new RawAnimation(CORRECT_ZOOM_DURATION, [new AnimationTween(1, CORRECT_ZOOM_AMOUNT, "zoom"), new AnimationTween(1, 0, "alpha")], this.correcting.bind(this), () => CellRenderer.instance.correctWhiteEnd(this));
        this.correctY = correctY;
        this.x = x;
        this.y = y;
        this.gridX = gridX;
        this.gridY = gridY;
        this.corners = corners;
        this.spine_dir = spine_dir;
        this.zoom = 1;
        this.yOffset = 0;
        this.imageX = imageX,
            this.imageY = imageY;
        this.selectedBy = "";
        this.pieceID = Piece.nextPieceID++;
    }
    static fromJson(data) {
        return new Piece(data.correctX, data.correctY, data.x, data.y, data.gridX, data.gridY, data.corners, data.spine_dir, data.imageX, data.imageY, data.isCorrect);
    }
    select() {
        console.log("MAGE");
        this.selectAnim.play();
    }
    deselect() {
        this.deselectAnim.play();
    }
    correct() {
        this.x = this.correctX;
        this.y = this.correctY;
        if (!CellRenderer.instance.selectedPiece.includes(this.pieceID)) {
            CellRenderer.instance.selectedPiece.push(this.pieceID);
            CellRenderer.instance.reloadOffscreenCanvas();
        }
        this.white = true;
        this.isCorrect = true;
        this.deselectAnim.stop();
        this.zoom = 1;
        this.correctAnim.play();
    }
    correcting(data) {
        this.correctAlpha = data.alpha;
        this.correctZoom = data.zoom;
        CellRenderer.instance.render();
    }
    zooming(data) {
        this.zoom = data.zoom;
        CellRenderer.instance.render();
    }
}
//# sourceMappingURL=piece.js.map