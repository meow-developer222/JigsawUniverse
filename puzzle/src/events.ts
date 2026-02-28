import { Board } from "./board.js";
import { EXIT_CELL_BTN_MARGIN, MARGIN, PIECE_SIZE, SNAP_THRESOLD, SPINE_HEIGHT } from "./const.js";
import { CellRenderer, FullRenderer } from "./render.js";

let offset = {x: 0, y: 0}


export function onMouseDown(e: MouseEvent)
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

function mouseDownInFullMode(e: MouseEvent)
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
function mouseDownInCellMode(e: MouseEvent) {
    for (let i=Board.instance.pieces.length - 1; i >= 0; i--)
    {
        let piece = Board.instance.pieces[i];
        if (
            e.offsetX >= piece.x + SPINE_HEIGHT &&
            e.offsetX < piece.x + SPINE_HEIGHT + PIECE_SIZE &&
            e.offsetY >= piece.y + SPINE_HEIGHT &&
            e.offsetY < piece.y + SPINE_HEIGHT + PIECE_SIZE &&
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
                break;

                
                
        }
    }

    if (e.offsetX >= EXIT_CELL_BTN_MARGIN && e.offsetX < MARGIN - EXIT_CELL_BTN_MARGIN && e.offsetY >= EXIT_CELL_BTN_MARGIN && e.offsetY < MARGIN - EXIT_CELL_BTN_MARGIN)
    {
        FullRenderer.instance.zoomOut();
    }
    
}

export function onMouseMove(e: MouseEvent)
{
    if (Board.instance.cellX == -1 && Board.instance.cellY == -1) // Full mode
    {

    }
    else // Cell mode
    {
        mouseMoveInCellMode(e);
    }
}
function mouseMoveInCellMode(e: MouseEvent) {

    if (CellRenderer.instance.mySelectedPiece != -1)
    {
        let mySelectedPiece = Board.instance.pieces.find((piece) => piece.pieceID == CellRenderer.instance.mySelectedPiece)!;
        mySelectedPiece.x = e.offsetX - offset.x;
        mySelectedPiece.y = e.offsetY - offset.y;
        
        CellRenderer.instance.render();
    }
}

export function onMouseUp(e: MouseEvent)
{
    if (Board.instance.cellX == -1 && Board.instance.cellY == -1) // Full mode
    {

    }
    else // Cell mode
    {
        mouseUpInCellMode(e);
    }
}
function mouseUpInCellMode(e: MouseEvent) {
    if (CellRenderer.instance.mySelectedPiece != -1)
    {
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
                    return;
                }
            }
        }
        // mySelectedPiece.correct();
        
        selectedPiece.deselect();
    }
}