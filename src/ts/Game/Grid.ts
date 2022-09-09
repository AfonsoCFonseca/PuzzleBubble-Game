import { debugMap } from '../debugMap';
import { BALL_TYPES } from '../game.interfaces';
import { gameScene, grid, invisiblePiecesGroup, player } from '../Scenes/GameScene';
import { GRID_LENGTH, HALF_SCREEN, PIECE, WALL } from '../Utils/gameValues'
import { calculateClosestInvisiblePiece, convertAxisToArrayPosition, makeAnimation, rndNumber } from '../Utils/utils';
import Piece from './Piece';

export default class Grid {

    currentGrid: Piece[][] = [];

    constructor() {
        this.buildGrid(false);
    }

    private buildGrid(debug: boolean = false) {
        const yLenght = debug ? debugMap.length : GRID_LENGTH.Y
        for (let i = 0; i < yLenght; i++) {
            this.currentGrid[i] = []
            const maxGridLenth = GRID_LENGTH.X - (i % 2 === 0 ? 0 : 1);
            const xLenght = debug ? debugMap[i].length : maxGridLenth
            for(let j = 0; j < xLenght; j++) {
                const pieceColor = debug ? debugMap[i][j] : rndNumber(0, 6);
                this.createAndAddNewPieceToGrid(i, j, pieceColor)
            }
        }

        this.fillRestWithEmpties();
    }

    private fillRestWithEmpties() {
        for(let i = this.currentGrid.length; i < GRID_LENGTH.MAX_HEIGHT; i++) {
            this.currentGrid[i] = []
            const maxGridLenth = GRID_LENGTH.X - (i % 2 === 0 ? 0 : 1);
            for(let j = 0; j < maxGridLenth; j++) {
                this.createAndAddNewPieceToGrid(i, j, 7)
            }
        }
    }

    private createAndAddNewPieceToGrid(i: number, j: number, pieceType: BALL_TYPES = null) {
        const x = this.calculateXPosition(i, j);
        const y = this.calculateYPosition(i);

        this.currentGrid[i].push(new Piece({x, y}, {
            isPlayerPiece: false,
            pieceColor: pieceType
        }))
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

    public addPlayerPieceToGrid(playerPiece: Piece, gridPieces: Piece, callback) {
        const self = this;
        playerPiece.changeForGridPiece();
        const invisiblePiecesArr = this.overlapInvisiblePieces(playerPiece);
        // A delay is needed to collect every overlap, since the overlap method fires a
        // callback for every time a event is found
        setTimeout(() => {
            const selectedInvisiblePiece = calculateClosestInvisiblePiece(playerPiece, invisiblePiecesArr);
            //TODO HEREEEE
            playerPiece.move(selectedInvisiblePiece, 10, null);
            self.addNewPieceToGridAndRemoveInvisible(selectedInvisiblePiece, playerPiece, selectedInvisiblePiece);
            callback();
        }, 50)
    }

    private overlapInvisiblePieces(playerPiece: Piece) {
        let invisiblePiecesArr = [];
        const currentPieceCollider = gameScene.physics.add.overlap(playerPiece,
            invisiblePiecesGroup, (playerPiece, invisibleGridPieces) => {
                invisiblePiecesArr.push(invisibleGridPieces as Piece);
            });
    
        gameScene.physics.world.removeCollider(currentPieceCollider);
        return invisiblePiecesArr;
    }

    // TODO acho que está a passar demasiadas vezes no timeout onde estou a chamar este metodo
    // tambem estou a ter um erro quando envio demasiadas pieces no level y 
    private addNewPieceToGridAndRemoveInvisible({ x, y }, piece: Piece, selectedInvisiblePiece: Piece) {
        const {i, j} = convertAxisToArrayPosition({ x, y });
        this.currentGrid[i][j] = piece;

        invisiblePiecesGroup.getChildren().forEach((child) => {
            const currentChild = child as Piece;
            if(currentChild.getId() === selectedInvisiblePiece.getId()) {
                invisiblePiecesGroup.remove(currentChild)
            }
        })
    }
}
