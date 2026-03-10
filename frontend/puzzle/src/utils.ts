import { Board } from "./board.js";
import { Piece } from "./piece.js";

export function shuffle(array: any[]) {
    // 원본 배열을 수정하지 않으려면 복사본을 만듭니다.
  const arr = [...array]; 
  for (let i = arr.length - 1; i > 0; i--) {
    // 0 이상 i 이하의 무작위 인덱스 생성
    const j = Math.floor(Math.random() * (i + 1));
    // 구조 분해 할당을 사용하여 요소 교환 (swap)
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function range(l: number) {
  let i = -1;
  let res = [];
  while (++i < l) {
    res.push(i);
  }
  return res;
};


export function calculateFinishedPercent(pieces: Piece[]) : number[][]
{
  let result: number[][] = [];

  for (let y=0; y < Board.instance.boardHeight / Board.instance.cellSize; y++)
  {
    result[y] = [];
    for (let x=0; x < Board.instance.boardHeight / Board.instance.cellSize; x++)
    {
      result[y][x] = Math.round(pieces.filter(
        (piece) => piece.gridX >= Board.instance.cellSize * x && piece.gridX < Board.instance.cellSize * (x+1) &&
              piece.gridY >= Board.instance.cellSize * y && piece.gridY < Board.instance.cellSize * (y+1) && piece.isCorrect
        ).length / Board.instance.cellSize ** 2 * 100) / 100;
    }
  }

  return result;


}