import { MARGIN, MAX_OFFSET, PIECE_SIZE } from "./const.js";
import { LocalPuzzleDataManager, PuzzleDataManager } from "./datamgr.js";
import { Piece } from "./piece.js";
import { CellRenderer } from "./render.js";
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
    dataManager: PuzzleDataManager = new LocalPuzzleDataManager("workspace1");
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
                    isEdge ? 0 : Math.floor((Math.random() - 0.5) * MAX_OFFSET),
                    isEdge ? 0 : Math.floor((Math.random() - 0.5) * MAX_OFFSET)
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
                    imageX: x * PIECE_SIZE - PIECE_SIZE, // 이미지 좌표는 보통 정배열입니다
                    imageY: y * PIECE_SIZE - PIECE_SIZE, 
                    
                    // 핵심: 인접한 조각과 맞물리도록 부호 설정
                    // hSpines[y][x]가 1(상단 조각의 아래쪽이 볼록)이라면, 
                    // 현재 조각의 위쪽(0)은 -1(오목)이어야 함.
                    spine_dir: [
                        -hSpines[y][x],      // 상 (위쪽 줄의 하단 변을 반전)
                        vSpines[y][x+1],    // 우 (자신의 오른쪽 변)
                        hSpines[y+1][x],    // 하 (자신의 아래쪽 변)
                        -vSpines[y][x]       // 좌 (왼쪽 줄의 오른쪽 변을 반전)
                    ],
                    
                    corners: [
                        [-half + junctions[y][x][0],     -half + junctions[y][x][1]],   // 좌상
                        [ half + junctions[y][x+1][0],   -half + junctions[y][x+1][1]],  // 우상
                        [ half + junctions[y+1][x+1][0],  half + junctions[y+1][x+1][1]], // 우하
                        [-half + junctions[y+1][x][0],    half + junctions[y+1][x][1]]   // 좌하
                    ]
                    
                };
                
                let piece = new Piece(
                    (x % Board.instance.cellSize) * (PIECE_SIZE) + PIECE_SIZE / 2,
                    (y % Board.instance.cellSize) * (PIECE_SIZE) + PIECE_SIZE / 2,
                    (pieceOrder[(y % this.cellSize) * this.cellSize + (x % this.cellSize)] % (2*this.cellSize)) * PIECE_SIZE / 2,
                    Math.floor(pieceOrder[(y % this.cellSize) * this.cellSize + (x % this.cellSize)] / (2*this.cellSize)) * PIECE_SIZE / 2,
                    
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

        console.log(pieces);
        
        this.pieces = pieces
        return pieces;
    }
    

    static instance: Board;
}




