import { GRID_LENGTH, PIECE } from '../Utils/gameValues'
import Piece from './Piece';

export default class Grid {

    currentGrid: Piece[] = [];

    constructor() {
        this.buildGrid();
    }

    buildGrid() {
        for (let i = 0; i < GRID_LENGTH.Y; i++) {
            for(let j = 0; j < GRID_LENGTH.X_1; j++) {
                const xMargin = i % 2 === 0 ? 0 : PIECE.WIDTH / 2;
                const x = xMargin + PIECE.WIDTH * j + PIECE.WIDTH
                const y = PIECE.HEIGHT * i + PIECE.HEIGHT

                this.currentGrid.push(new Piece({x, y}))
            }
        }
    }
}