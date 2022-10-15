import { debugMap } from '../debugMap';
import { BALL_TYPES, Position } from '../game.interfaces';
import { gameScene, invisiblePiecesGroup, piecesGroup } from '../Scenes/GameScene';
import { BASE_SCORE, debugOptMap, GRID_LENGTH, HALF_SCREEN, PIECE, WALL } from '../Utils/gameValues'
import { calculateClosestInvisiblePiece, convertAxisToArrayPosition, getPointFromWall, idAlreadyExistInArray, removeDuplicates, rndNumber } from '../Utils/utils';
import { gameManager } from './GameManager';
import Piece from './Piece';

export default class Grid {

    currentGrid: Piece[][] = [];

    constructor() {
        this.buildGrid(debugOptMap);
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
        // margin to make diagonal height touching
        let y = (PIECE.HEIGHT - PIECE.HEIGHT_CLOSE_MARGIN) * i
        y += PIECE.HEIGHT / 2 + WALL.TOP_HEIGHT
        return y;
    }

    public addPlayerPieceToGrid(playerPiece: Piece, callback) {
        const self = this;
        playerPiece.stopMovement();
        let invisiblePiecesArr = this.overlapInvisiblePieces(playerPiece);
        // A delay is needed to collect every overlap, since the overlap method fires a
        // callback for every time a event is found
        setTimeout(() => {
            if(invisiblePiecesArr.length <= 0) invisiblePiecesArr = playerPiece.getLastOverlapedPieces();
            invisiblePiecesArr = removeDuplicates(invisiblePiecesArr);
            const selectedInvisiblePiece = calculateClosestInvisiblePiece(playerPiece, invisiblePiecesArr);
            if(!gameManager.isGameOver(selectedInvisiblePiece.y)) {
                playerPiece.move(selectedInvisiblePiece, 10, () => {
                    self.removeInvisiblePiece(selectedInvisiblePiece);
                    self.addNewPieceToGrid(selectedInvisiblePiece, playerPiece);
                    const matchedPieces = self.checkForMatch(selectedInvisiblePiece, playerPiece);
                    self.popUpPieces(matchedPieces);
                    callback();
                });
            } else {
                this.currentGrid.forEach(lineOfPieces => {
                    lineOfPieces.forEach(piece => {
                        piece.makePieceGrey()
                    })
                })
                playerPiece.makePieceGrey();
                gameScene.gameOver();
            }
            
        }, 50)
    }

    private overlapInvisiblePieces(playerPiece: Piece) {
        let invisiblePiecesArr = [];
        const currentPieceCollider = gameScene.physics.add.overlap(playerPiece,
            invisiblePiecesGroup, (playerPiece, invisibleGridPieces) => {
                invisiblePiecesArr.push(invisibleGridPieces as Piece);
            });
        gameScene.physics.world.removeCollider(currentPieceCollider);
        return invisiblePiecesArr
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

    private checkForMatch({x, y}: Position, currentPiece: Piece): Piece[] {
        let currentX = x;
        let currentY = y;
        let piecesMatched: Piece[] = [currentPiece];
        const MATCH_COLOR = currentPiece.getColor();

        let colorArr = [];
        let lastOne: boolean;

        do {
            lastOne = false;
            const {i, j} = convertAxisToArrayPosition({ x: currentX, y: currentY });
            let adjPieces = this.getAdjacentPieces(i,j);

            adjPieces.forEach(adjPiece => {
                if(adjPiece.getColor() === MATCH_COLOR && !idAlreadyExistInArray(adjPiece.getId(), piecesMatched)) {
                    piecesMatched.push(adjPiece);
                    colorArr.push(adjPiece);
                }
            })

            if(colorArr.length > 0) {
                currentX = colorArr[colorArr.length - 1].x;
                currentY = colorArr[colorArr.length - 1].y;
                colorArr.pop()
                if(colorArr.length === 0) lastOne = true;
            }
        } while(colorArr.length || lastOne === true)

        return piecesMatched;
    }

    private getAdjacentPieces(i: number, j: number): Piece[] {
        let adjacentArray: Piece[] = []
        //calculate horizontal
        if (j - 1 >= 0 && !this.currentGrid[i][j - 1].isEmpty()) 
            adjacentArray.push(this.currentGrid[i][j - 1])
        const maxGridLenth = GRID_LENGTH.X - (i % 2 === 0 ? 0 : 1);
        if (j + 1 < maxGridLenth && !this.currentGrid[i][j + 1].isEmpty()) 
            adjacentArray.push(this.currentGrid[i][j + 1])

        //calculate vertical
        if (i - 1 >= 0) {
            adjacentArray = [...adjacentArray, ...this.matchVerticalPieces('UP', i, j)];
        }

        if(i + 1 <= GRID_LENGTH.MAX_HEIGHT)
            adjacentArray = [...adjacentArray, ...this.matchVerticalPieces('DOWN', i, j)];

        return adjacentArray;
    }

    private matchVerticalPieces(state: 'UP' | 'DOWN', i: number, j: number) {
        const currentAdjVerticalArr = [];
        const x = i % 2 === 0 ? j : j + 1
        const y = state === 'DOWN' ? i + 1 : i - 1;
        if (this.currentGrid[y][x - 1] && !this.currentGrid[y][x - 1].isEmpty()) {
            currentAdjVerticalArr.push(this.currentGrid[y][x - 1])
        }
        if (this.currentGrid[y][x] && !this.currentGrid[y][x].isEmpty()) {
            currentAdjVerticalArr.push(this.currentGrid[y][x])
        }

        return currentAdjVerticalArr;
    }

    private popUpPieces(matchedPieces: Piece[]) {
        const self = this;
        if( matchedPieces.length >= 3) {
            this.fallPieces(matchedPieces)
            const separatedPieces = self.checkForSeparatedPieces();
            this.fallPieces(separatedPieces)

            gameManager.addScore( BASE_SCORE * matchedPieces.length)
        }
    }

    private fallPieces(piecesToFall) {
        piecesToFall.forEach(fallPiece => {
            this.currentGrid.forEach((line, indexLine) => {
                const index = line.findIndex(piece => piece.getId() === fallPiece.getId());
                if(index >= 0) {
                    this.currentGrid[indexLine][index].switchForInvisible();
                }
            });
        });
    }

    private checkForSeparatedPieces() {
        let notToFallPieces = [];

        this.currentGrid.forEach(line => {
            line.forEach( piece => {
                const {i, j} = convertAxisToArrayPosition({ x: piece.x, y: piece.y });
                if(i >= 1) {
                    if(piece.getColor() !== BALL_TYPES.INVISIBLE) {

                        const adjs = this.getAdjacentPieces(i, j);
                        adjs.forEach( adjPiece => {
                            const newPieces = notToFallPieces.find((currentP) => currentP.getId() === adjPiece.getId())
                            if(newPieces) {
                                const alreadyExists = notToFallPieces.find(currentP => 
                                    currentP.getId() === piece.getId())
                                if(!alreadyExists) notToFallPieces.push(piece);
                            }
                        })

                    }
                } else {
                    if(piece.getColor() !== BALL_TYPES.INVISIBLE) {
                        notToFallPieces.push(piece);
                    }
                }
            })
        })

        return this.getIsolatedPiecesFromGrid(notToFallPieces);
    }

    private getIsolatedPiecesFromGrid(notToFallPieces) {
        let isolatedPieces = [];
        this.currentGrid.forEach(line => {
            line.forEach(piece => {
                if(piece.getColor() !== BALL_TYPES.INVISIBLE) {
                    const found = notToFallPieces.find(notToFallPiece => 
                        notToFallPiece.getId() === piece.getId()) 
                    if(!found) isolatedPieces.push(piece);
                }
            })
        })

        return isolatedPieces;
    }
}
