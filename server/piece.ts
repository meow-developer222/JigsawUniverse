



import { CORRECT_ZOOM_AMOUNT, CORRECT_ZOOM_DURATION, PIECE_SIZE, SELECT_ZOOM_AMOUNT, SELECT_ZOOM_DURATION, SPINE_HEIGHT, SPINE_WIDTH } from "./const.ts"



export class Piece
{
    

    corners: number[][];
    spine_dir: number[];
    
    imageX: number;
    imageY: number;
    x: number;
    y: number;
    correctX: number;
    correctY: number;
    gridX: number;
    gridY: number;
    pieceID: number;

    static nextPieceID: number = 0;
    zoom: number;
    yOffset: number;
    selectedBy: string;

    isCorrect: boolean;



    constructor(correctX: number, correctY: number, x: number, y: number, gridX: any, gridY: any, corners: number[][], spine_dir: number[], imageX: number, imageY: number, isCorrect: boolean = false)
    {
        this.isCorrect = isCorrect;
        
        const size = PIECE_SIZE + Math.max(SPINE_HEIGHT, SPINE_WIDTH) * 4;

        this.correctX = correctX
        
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

    static fromJson(data: {correctX: number, correctY: number, x: number, y: number, gridX: any, gridY: any, corners: number[][], spine_dir: number[], imageX: number, imageY: number, isCorrect: boolean})
    {
        
        return new Piece(
            data.correctX, data.correctY, data.x, data.y, data.gridX, data.gridY, data.corners, data.spine_dir, data.imageX, data.imageY, data.isCorrect
        );
    }

  

    correct() {
        
        this.isCorrect = true;
        
     
    }

  
}


