import { debugMap } from '../debugMap';
import { BALL_TYPES, Position } from '../game.interfaces';
import { gameScene, grid, invisiblePiecesGroup, piecesGroup, player } from '../Scenes/GameScene';
import { GRID_LENGTH, HALF_SCREEN, PIECE, WALL } from '../Utils/gameValues'
import { calculateClosestInvisiblePiece, convertAxisToArrayPosition, idAlreadyExistInArray, makeAnimation, rndNumber } from '../Utils/utils';
import Piece from './Piece';

export default class Grid {

    currentGrid: Piece[][] = [];

    constructor() {
        this.buildGrid(true);
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
        playerPiece.stopMovement();
        const invisiblePiecesArr = this.overlapInvisiblePieces(playerPiece);
        // A delay is needed to collect every overlap, since the overlap method fires a
        // callback for every time a event is found
        setTimeout(() => {
            const selectedInvisiblePiece = calculateClosestInvisiblePiece(playerPiece, invisiblePiecesArr);
            playerPiece.move(selectedInvisiblePiece, 10, null);
            self.removeInvisiblePiece(selectedInvisiblePiece);
            self.addNewPieceToGrid(selectedInvisiblePiece, playerPiece);
            self.checkForMatch(selectedInvisiblePiece, playerPiece);
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

    private addNewPieceToGrid({ x, y }, piece: Piece) {
        const {i, j} = convertAxisToArrayPosition({ x, y });
        this.currentGrid[i][j] = piece;
        piecesGroup.add(piece);
        piece.updateDebugString({ x, y });
    }

    private removeInvisiblePiece( selectedInvisiblePiece: Piece) {
        invisiblePiecesGroup.getChildren().forEach((child) => {
            const currentChild = child as Piece;
            if(currentChild.getId() === selectedInvisiblePiece.getId()) {
                invisiblePiecesGroup.remove(currentChild)
                currentChild.eraseDebugString();
                currentChild.destroy();
            }
        })
    }

    private checkForMatch({x, y}: Position, currentPiece: Piece) {
        let isMatch: boolean;
        let currentMatchingPiece = currentPiece;
        let currentX = x;
        let currentY = y;
        let piecesMatched: Piece[] = [];

        do {
            isMatch = false;
            const {i, j} = convertAxisToArrayPosition({ x: currentX, y: currentY });
            let adjPieces = this.getAdjacentPieces(i,j);
            
            adjPieces.forEach(adjPiece => {
                if(adjPiece.getColor() === currentMatchingPiece.getColor() && 
                    !idAlreadyExistInArray(adjPiece.getId(), piecesMatched)) {
                        isMatch = true;
                        piecesMatched.push(adjPiece);
                        currentMatchingPiece = adjPiece;
                        currentX = currentMatchingPiece.x;
                        currentY = currentMatchingPiece.y;
                }
            })
        } while(isMatch);

        console.log(piecesMatched)
    }

    private getAdjacentPieces(i: number, j: number): Piece[] {
        let adjacentArray: Piece[] = []
        //calculate horizontal
        if (j - 1 >= 0) adjacentArray.push(this.currentGrid[i][j - 1])
        const maxGridLenth = GRID_LENGTH.X - (i % 2 === 0 ? 0 : 1);
        if (j + 1 < maxGridLenth) adjacentArray.push(this.currentGrid[i][j + 1])

        //calculate vertical
        if (i - 1 >= 0) {
            const x = i % 2 === 0 ? j : j + 1
            if (this.currentGrid[i - 1][x - 1]) {
                adjacentArray.push(this.currentGrid[i - 1][x - 1])
            }
            if (this.currentGrid[i - 1][x]) {
                adjacentArray.push(this.currentGrid[i - 1][x])
            }
        }

        //TODO missing verical down

        return adjacentArray;
    }
}
