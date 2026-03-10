import { Board } from "./board.ts";

export class Room
{
    name: string
    board: Board;
    selecting_piece: number[] = [];

    constructor(name: string, board: Board)
    {
        this.name = name;
        this.board = board;
    }
    
}