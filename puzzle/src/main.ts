import { Board } from "./board.js";
import { onMouseDown, onMouseMove, onMouseUp } from "./events.js";
import { CellRenderer, FullRenderer } from "./render.js";


let pieces = [];

function initGame(imageURL: string, boardWidth: number, boardHeight: number)
{
    const canvas = document.getElementById('puzzle');
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
    image.onload = () => onImageLoaded(image, ctx, boardWidth, boardHeight)

    
}

function onImageLoaded(image: HTMLImageElement, ctx: CanvasRenderingContext2D, boardWidth: number, boardHeight: number)
{
    
    Board.instance = new Board(image, boardWidth, boardHeight, 8);
    Board.instance.pieces = Board.instance.generatePieces();
    // Board.instance.cellX = 0;
    // Board.instance.cellY = 0;
    // let cellRenderer: CellRenderer = new CellRenderer(ctx, pieces);
    // cellRenderer.reloadOffscreenCanvas();
    // cellRenderer.render();

    let fullRenderer: FullRenderer = new FullRenderer(ctx);


    fullRenderer.reloadOffscreenCanvas(
        [
            [0.5, 0.5, 0],
            [0.4, 0.2, 1],
            [0.3, 0.5, 1],
        ]
    );
    fullRenderer.render();  
    
}

initGame("/static/images/test2.png", 24, 24);