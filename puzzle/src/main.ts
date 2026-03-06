import { Board } from "./board.js";
import { onMouseDown, onMouseMove, onMouseUp } from "./events.js";
import { Piece } from "./piece.js";
import { CellRenderer, FullRenderer } from "./render.js";
import { calculateFinishedPercent } from "./utils.js";


let pieces = [];

function initGame(imageURL: string, boardWidth: number, boardHeight: number, startPieces?: {correctX: number, correctY: number, x: number, y: number, gridX: any, gridY: any, corners: number[][], spine_dir: number[], imageX: number, imageY: number, isCorrect: boolean}[])
{
    const canvas: HTMLCanvasElement = document.getElementById('puzzle') as HTMLCanvasElement;

    
    if (!(canvas instanceof HTMLCanvasElement))
    {
        console.error("no canvas.");
        return
    }
    let ctx = canvas.getContext("2d")!;   
    
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    let pieces = []

    

    let image = new Image();
    image.src = imageURL;
    image.onload = () => onImageLoaded(image, ctx, boardWidth, boardHeight, startPieces ?? [])

    
}

function onImageLoaded(
    image: HTMLImageElement,
    ctx: CanvasRenderingContext2D, 
    boardWidth: number, boardHeight: 
    number, startPieces: {correctX: number, correctY: number, x: number, y: number, gridX: any, gridY: any, corners: number[][], spine_dir: number[], imageX: number, imageY: number, isCorrect: boolean}[])
{
    
    Board.instance = new Board(image, boardWidth, boardHeight, 8);

    let rawSavedPieces = Board.instance.dataManager.getAllPieces();

    

    let savedPieces: Piece[] = [];

    if (Board.instance.isNetwork)
    {
        let pieces = startPieces.map((pieceData) => Piece.fromJson(pieceData));
        pieces.forEach((piece) => piece.init_offscreen_canvas());
        onPieceLoaded(pieces, ctx);
    }
    else
    {
        rawSavedPieces.then((jsonPieces) => {
            
            
            if (jsonPieces.length != 0)
            {
                let pieces = jsonPieces.map((pieceData) => Piece.fromJson(pieceData));
                pieces.forEach((piece) => piece.init_offscreen_canvas());
                onPieceLoaded(pieces, ctx);
            }
            else
            {
                let pieces = Board.instance.generatePieces();
                Board.instance.dataManager.setPieces(pieces);
                onPieceLoaded(pieces, ctx);
            }
        });
    }

    

    
    
    
}

function onPieceLoaded(pieces: Piece[], ctx: CanvasRenderingContext2D)
{

    
    Board.instance.pieces = pieces;
    // Board.instance.cellX = 0;
    // Board.instance.cellY = 0;
    // let cellRenderer: CellRenderer = new CellRenderer(ctx, pieces);
    // cellRenderer.reloadOffscreenCanvas();
    // cellRenderer.render();

    let fullRenderer: FullRenderer = new FullRenderer(ctx);

    


    fullRenderer.reloadOffscreenCanvas(calculateFinishedPercent(pieces));
    fullRenderer.render();  
}




declare global {
  interface Window {
    initGame: Function;
    onPieceDrag: Function;
    onPiecePick: Function;
    onPieceUnPick: Function;
    updatePiece: Function;
    updatePieces: Function;
  }
}


// initGame("/static/images/library.png", 24, 24);
window.initGame = initGame;