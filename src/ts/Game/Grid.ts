import { BACKGROUND, GRID_LENGTH, HALF_SCREEN, PIECE, WALL } from '../Utils/gameValues'
import Piece from './Piece';

export default class Grid {

    currentGrid: Piece[] = [];

    constructor() {
        this.buildGrid();
    }

    private buildGrid() {
        for (let i = 0; i < GRID_LENGTH.Y; i++) {
            const maxGridLenth = GRID_LENGTH.X - (i % 2 === 0 ? 0 : 1);
            for(let j = 0; j < maxGridLenth; j++) {

                const x = this.calculateXPosition(i, j);
                const y = this.calculateYPosition(i);

                this.currentGrid.push(new Piece({x, y}, false))
            }
        }
    }

    private calculateXPosition(i: number, j: number): number {
        //makes the 8 and 7 piece pattern symetrical
        let x = PIECE.WIDTH * j;
        const xMargin = i % 2 === 0 ? 0 : PIECE.WIDTH / 2; 
        // To centre an 8 piece array I decrement the 4xpiece width to halfscreen
        //with and add half piece width to compensate for the piece setOrigin()
        const marginToCenter = (HALF_SCREEN.WIDTH - PIECE.WIDTH * 4) + PIECE.WIDTH / 2;
        x += xMargin + marginToCenter
        return x;
    }

    private calculateYPosition(i: number): number {
        const closeHeightMargin = 15; // margin to make diagonal height touching
        let y = (PIECE.HEIGHT - closeHeightMargin) * i
        y += PIECE.HEIGHT / 2 + WALL.TOP_HEIGHT
        return y;
    }
}