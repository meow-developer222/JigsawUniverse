import { Board } from "./board.js";
import { EXIT_CELL_BTN_MARGIN, MARGIN, PIECE_SIZE, SNAP_THRESOLD, SPINE_HEIGHT } from "./const.js";
import { CellRenderer, FullRenderer } from "./render.js";
import { calculateFinishedPercent } from "./utils.js";

let offset = {x: 0, y: 0}


export function onMouseDown(e: {offsetX: number, offsetY: number})
{
    
    if (Board.instance.cellX == -1 && Board.instance.cellY == -1) // Full mode
    {
        mouseDownInFullMode(e); 
    }
    else // Cell mode
    {
        mouseDownInCellMode(e);
    }
}

function mouseDownInFullMode(e: {offsetX: number, offsetY: number})
{
    
    let cellWidth = Board.instance.boardWidth / Board.instance.cellSize;
    let cellHeight = Board.instance.boardHeight / Board.instance.cellSize;

    console.log(FullRenderer.instance.imgY)

    for (let cy=0; cy < cellHeight; cy++)
    {
        for(let cx=0; cx < cellWidth; cx++)
        {
            // console.log(e.offsetX, e.offsetY);
            if (e.offsetX >= FullRenderer.instance.imgX + FullRenderer.instance.imgW / cellWidth * cx &&
                e.offsetX < FullRenderer.instance.imgX + FullRenderer.instance.imgW / cellWidth * (cx+1) &&
                e.offsetY >= FullRenderer.instance.imgY + FullRenderer.instance.imgH / cellWidth * cy &&
                e.offsetY < FullRenderer.instance.imgY + FullRenderer.instance.imgH / cellWidth * (cy+1))
            {
                FullRenderer.instance.zoomTo(cx, cy);
                break;
            }
            
        }
    }
}
function mouseDownInCellMode(e: {offsetX: number, offsetY: number}) {

    // let mx = e.offsetX - PIECE_SIZE / 2;
    // let my = e.offsetY - PIECE_SIZE / 2;
    
    let mx = ((e.offsetX * Math.max(520 / window.innerWidth, 1)) | 0) - PIECE_SIZE / 2;
    let my = ((e.offsetY * Math.max(Math.max(520 / window.innerWidth, 1), 1)) | 0) - PIECE_SIZE / 2;
    // console.log(mx, my);
    for (let i=Board.instance.pieces.length - 1; i >= 0; i--)
    // for (let i=0; i < Board.instance.pieces.length; i++)
    {
        let piece = Board.instance.pieces[i];
        if (
            mx >= piece.x + SPINE_HEIGHT &&
            mx < piece.x + SPINE_HEIGHT + PIECE_SIZE &&
            my >= piece.y + SPINE_HEIGHT &&
            my < piece.y + SPINE_HEIGHT + PIECE_SIZE &&
            piece.gridX >= Board.instance.cellSize * Board.instance.cellX && piece.gridX < Board.instance.cellSize * (Board.instance.cellX+1) &&
            piece.gridY >= Board.instance.cellSize * Board.instance.cellY && piece.gridY < Board.instance.cellSize * (Board.instance.cellY+1) &&
            !piece.isCorrect) {

        
                CellRenderer.instance.selectedPiece.push(piece.pieceID);
                CellRenderer.instance.mySelectedPiece = piece.pieceID;
                CellRenderer.instance.reloadOffscreenCanvas();
                offset = {
                    x: e.offsetX - piece.x,
                    y: e.offsetY - piece.y
                }
                console.log(piece);
                piece.select();
                if (Board.instance.isNetwork) window.onPiecePick(piece.pieceID);
                break;

            
                
        }
    }

    

    if (e.offsetX >= EXIT_CELL_BTN_MARGIN && e.offsetX < MARGIN - EXIT_CELL_BTN_MARGIN && e.offsetY >= EXIT_CELL_BTN_MARGIN && e.offsetY < MARGIN - EXIT_CELL_BTN_MARGIN)
    {
        FullRenderer.instance.reloadOffscreenCanvas(calculateFinishedPercent(Board.instance.pieces));
        FullRenderer.instance.zoomOut();
    }


    
}

export function onMouseMove(e: {offsetX: number, offsetY: number})
{
    if (Board.instance.cellX == -1 && Board.instance.cellY == -1) // Full mode
    {

    }
    else // Cell mode
    {
        mouseMoveInCellMode(e);
    }
}
function mouseMoveInCellMode(e: {offsetX: number, offsetY: number}) {

    // let mx = ((e.offsetX * Math.max(520 / window.innerWidth, 1)) | 0);
    // let my = ((e.offsetY * Math.max(Math.max(520 / window.innerWidth, 1), 1)) | 0);

    let mx = e.offsetX;
    let my = e.offsetY;

    if (CellRenderer.instance.mySelectedPiece != -1)
    {
        console.log("XXXXXXXXXXXXXXXXXX");
        let mySelectedPiece = Board.instance.pieces.find((piece) => piece.pieceID == CellRenderer.instance.mySelectedPiece)!;
        mySelectedPiece.x = mx - offset.x;
        mySelectedPiece.y = my - offset.y;
        
        CellRenderer.instance.render();
        if (Board.instance.isNetwork) window.onPieceDrag(mySelectedPiece.pieceID, mySelectedPiece.x, mySelectedPiece.y);
    }
}

export function onMouseUp()
{
    if (Board.instance.cellX == -1 && Board.instance.cellY == -1) // Full mode
    {

    }
    else // Cell mode
    {
        mouseUpInCellMode();
    }
}
function mouseUpInCellMode() {

    
    if (CellRenderer.instance.mySelectedPiece != -1)
    {
        console.log("XXXXXXXXXXX444XXXXXXX");
        let selectedPiece = Board.instance.pieces.find((piece) => piece.pieceID == CellRenderer.instance.mySelectedPiece)!;
        CellRenderer.instance.mySelectedPiece = -1;
        // CellRenderer.instance.deselect(mySelectedPiece);]
        if (!Board.instance.isNetwork)
        {
            
            if ((selectedPiece.correctX - selectedPiece.x) ** 2 + (selectedPiece.correctY - selectedPiece.y) ** 2 <= SNAP_THRESOLD ** 2)
            {
                const correctPieces = Board.instance.pieces.filter((p) => p.isCorrect);
                
                const isEdgePiece = selectedPiece.gridX === 0 || 
                                selectedPiece.gridX === Board.instance.cellSize - 1 || 
                                selectedPiece.gridY === 0 || 
                                selectedPiece.gridY === Board.instance.cellSize - 1;

                // 조건 B: 이미 맞춰진 조각 중 상하좌우(인접)에 있는 조각이 있는가?
                const isAdjacentToCorrect = correctPieces.some((p) => {
                    const dx = Math.abs(p.gridX - selectedPiece.gridX);
                    const dy = Math.abs(p.gridY - selectedPiece.gridY);
                    // 상하좌우 한 칸 차이 (dx+dy가 1이면 인접함)
                    return (dx + dy === 1);
                });

                if (isEdgePiece || isAdjacentToCorrect)
                {
                    selectedPiece.correct();
                    // return;
                }
            }
        }
        else
        {
            window.onPieceUnPick(selectedPiece.pieceID);    
        }
        
        
        // mySelectedPiece.correct();

        Board.instance.dataManager!.setPiece(selectedPiece);

        if (!selectedPiece.isCorrect)
        {
            CellRenderer.instance.selectedPiece = CellRenderer.instance.selectedPiece.filter((x) => x !== CellRenderer.instance.mySelectedPiece);
            selectedPiece.deselect();
        }
        
    }
}