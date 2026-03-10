import { Board } from "./board.js";
import { Piece } from "./piece.js";



export interface PuzzleDataManager
{
    workspace: string;
    setPiece(arg0: Piece): void;
    setPieces(arg0: Piece[]): void;
    getAllPieces(): Promise<Piece[]>;
}

export class LocalPuzzleDataManager implements PuzzleDataManager
{

    initDB(name: string): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, 1);

            // DB 스키마 생성/변경 시 호출
            request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("pieces")) {
                // 'id'를 키로 사용하고 자동 증가 설정
                db.createObjectStore("pieces", { keyPath: 'pieceID'});
            }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    workspace: string;
    
    constructor(workspace: string)
    {
        // Board.instance.dataManager = this;
        this.workspace = workspace;
    }

    async setPiece(piece: Piece) {
        const db = await this.initDB(this.workspace);
        const transaction = db.transaction("pieces", 'readwrite');
        const store = transaction.objectStore("pieces");
        
        return new Promise((resolve, reject) => {
            const piece_ : {[key: string] : any} = JSON.parse(JSON.stringify(piece));
            
            const request = store.put(piece_);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllPieces(): Promise<Piece[]> {
        const db = await this.initDB(this.workspace);
        const transaction = db.transaction("pieces", 'readonly');
        const store = transaction.objectStore("pieces");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result as Piece[]);
            request.onerror = () => reject(request.error);
        });
    }

    // 데이터 업데이트 (Up
    setPieces(pieces: Piece[]): void {
        pieces.forEach((piece) => this.setPiece(piece))
    }
    
}