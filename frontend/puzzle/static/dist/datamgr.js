export class LocalPuzzleDataManager {
    initDB(name) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, 1);
            // DB 스키마 생성/변경 시 호출
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("pieces")) {
                    // 'id'를 키로 사용하고 자동 증가 설정
                    db.createObjectStore("pieces", { keyPath: 'pieceID' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    workspace;
    constructor(workspace) {
        // Board.instance.dataManager = this;
        this.workspace = workspace;
    }
    async setPiece(piece) {
        const db = await this.initDB(this.workspace);
        const transaction = db.transaction("pieces", 'readwrite');
        const store = transaction.objectStore("pieces");
        return new Promise((resolve, reject) => {
            const piece_ = JSON.parse(JSON.stringify(piece));
            const request = store.put(piece_);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async getAllPieces() {
        const db = await this.initDB(this.workspace);
        const transaction = db.transaction("pieces", 'readonly');
        const store = transaction.objectStore("pieces");
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    // 데이터 업데이트 (Up
    setPieces(pieces) {
        pieces.forEach((piece) => this.setPiece(piece));
    }
}
//# sourceMappingURL=datamgr.js.map