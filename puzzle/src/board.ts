import { MARGIN, MAX_OFFSET, PIECE_SIZE } from "./const.js";
import { Piece } from "./piece.js";
import { range, shuffle } from "./utils.js";



export class Board
{
    image: HTMLImageElement;
    boardWidth: number;
    boardHeight: number;
    imageWidth: number;
    imageHeight: number;
    cellSize: number;
    pieces: Piece[] = [];
    isNetwork: boolean = false;
    cellX: number = -1;
    cellY: number = -1;

    constructor(image: HTMLImageElement, boardWidth: number, boardHeight: number, cellSize: number)
    {
        
        this.cellSize = cellSize;
        this.image = image;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.imageWidth = PIECE_SIZE * boardWidth;
        this.imageHeight = PIECE_SIZE * boardHeight;
    }

    generatePieces()
    {
                
        // 1. 교차점(Junctions) 생성
        const junctions: number[][][] = [];
        for (let y = 0; y <= this.boardHeight; y++) {
            junctions[y] = [];
            for (let x = 0; x <= this.boardWidth; x++) {
                const isEdge = (x === 0 || x === this.boardWidth || y === 0 || y === this.boardHeight);
                junctions[y][x] = [
                    isEdge ? 0 : (Math.random() - 0.5) * MAX_OFFSET,
                    isEdge ? 0 : (Math.random() - 0.5) * MAX_OFFSET
                ];
            }
        }

        // 2. 변의 돌출 방향 (Horizontal & Vertical edges) 생성
        // hSpines[y][x]는 (x,y)와 (x+1,y) 사이의 변 방향
        const hSpines: number[][] = [];
        for (let y = 0; y <= this.boardHeight; y++) {
            hSpines[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                hSpines[y][x] = (y === 0 || y === this.boardHeight) ? 0 : (Math.random() > 0.5 ? 1 : -1);
            }
        }
        const vSpines: number[][] = [];
        for (let y = 0; y < this.boardHeight; y++) {
            vSpines[y] = [];
            for (let x = 0; x <= this.boardWidth; x++) {
                vSpines[y][x] = (x === 0 || x === this.boardWidth) ? 0 : (Math.random() > 0.5 ? 1 : -1);
            }
        }

        // 3. 조각 데이터 구성
        let pieces: Piece[] = [];

        // 아래에 조각이 배치될 때 랜덤하게 배치하기 위한 배열
        let pieceOrder = shuffle(range(this.cellSize ** 2))

        

        const half = PIECE_SIZE / 2;
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const data = {
                    imageX: x * PIECE_SIZE - PIECE_SIZE,
                    imageY: y * PIECE_SIZE - PIECE_SIZE, 
                    // 각 변의 돌출 방향 (0:상, 1:우, 2:하, 3:좌)
                    // 아래 변과 왼쪽 변은 인접 조각과 반대 방향이어야 함
                    spine_dir: [hSpines[y][x], -vSpines[y][x+1], -hSpines[y+1][x], vSpines[y][x]],
                    corners: [
                        [-half + junctions[y][x][0],     -half + junctions[y][x][1]], // 좌상
                        [half + junctions[y][x+1][0],    -half + junctions[y][x+1][1]], // 우상
                        [half + junctions[y+1][x+1][0],  half + junctions[y+1][x+1][1]], // 우하
                        [-half + junctions[y+1][x][0],    half + junctions[y+1][x][1]]  // 좌하
                    ]
                };
                
                let piece = new Piece(
                    x * (PIECE_SIZE) + PIECE_SIZE / 2,
                    y * (PIECE_SIZE) + PIECE_SIZE / 2,
                    (pieceOrder[y * this.cellSize + x] % (2*this.cellSize)) * PIECE_SIZE / 2,
                    Math.floor(pieceOrder[y * this.cellSize + x] / (2*this.cellSize)) * PIECE_SIZE / 2,
                    
                    x,
                    
                    y,
                    data.corners,
                    data.spine_dir,
                    
                    
                    // x: x * (PIECE_SIZE) + 104 + (PIECE_SIZE) / 2,
                    // y: y * (PIECE_SIZE) + 104 + PIECE_SIZE / 2,
                    data.imageX,
                    data.imageY
                );
                piece.init_offscreen_canvas();
                pieces.push(piece);
            }
        }
        
        this.pieces = pieces
        return pieces;
    }
    

    static instance: Board;
}




