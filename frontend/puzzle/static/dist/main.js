import { Board } from "./board.js";
import { onMouseDown, onMouseMove, onMouseUp } from "./events.js";
import { Piece } from "./piece.js";
import { FullRenderer } from "./render.js";
import { calculateFinishedPercent } from "./utils.js";
let pieces = [];
function initGame(imageURL, boardWidth, boardHeight, startPieces) {
    const canvas = document.getElementById('puzzle');
    if (!(canvas instanceof HTMLCanvasElement)) {
        console.error("no canvas.");
        return;
    }
    let ctx = canvas.getContext("2d");
    console.log(canvas.offsetTop);
    canvas.addEventListener("pointerdown", (e) => onMouseDown({ offsetX: e.clientX - canvas.offsetLeft, offsetY: e.clientY - canvas.offsetTop }));
    canvas.addEventListener("pointermove", (e) => onMouseMove({ offsetX: e.clientX - canvas.offsetLeft, offsetY: e.clientY - canvas.offsetTop }));
    canvas.addEventListener("pointerup", (e) => onMouseUp());
    let pieces = [];
    let image = new Image();
    image.src = imageURL;
    image.onload = () => onImageLoaded(image, ctx, boardWidth, boardHeight, startPieces ?? []);
}
function onImageLoaded(image, ctx, boardWidth, boardHeight, startPieces) {
    Board.instance = new Board(image, boardWidth, boardHeight, 6);
    let rawSavedPieces = Board.instance.dataManager.getAllPieces();
    let savedPieces = [];
    if (Board.instance.isNetwork) {
        let pieces = startPieces.map((pieceData) => Piece.fromJson(pieceData));
        pieces.forEach((piece) => piece.init_offscreen_canvas());
        onPieceLoaded(pieces, ctx);
    }
    else {
        rawSavedPieces.then((jsonPieces) => {
            if (jsonPieces.length != 0) {
                let pieces = jsonPieces.map((pieceData) => Piece.fromJson(pieceData));
                pieces.forEach((piece) => piece.init_offscreen_canvas());
                onPieceLoaded(pieces, ctx);
            }
            else {
                let pieces = Board.instance.generatePieces();
                Board.instance.dataManager.setPieces(pieces);
                onPieceLoaded(pieces, ctx);
            }
        });
    }
}
function onPieceLoaded(pieces, ctx) {
    Board.instance.pieces = pieces;
    // Board.instance.cellX = 0;
    // Board.instance.cellY = 0;
    // let cellRenderer: CellRenderer = new CellRenderer(ctx, pieces);
    // cellRenderer.reloadOffscreenCanvas();
    // cellRenderer.render();
    let fullRenderer = new FullRenderer(ctx);
    fullRenderer.reloadOffscreenCanvas(calculateFinishedPercent(pieces));
    fullRenderer.render();
}
// initGame("/static/images/library.png", 24, 24);
window.initGame = initGame;
//# sourceMappingURL=main.js.map