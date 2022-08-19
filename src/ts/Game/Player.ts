import { BACKGROUND, HALF_SCREEN, PIECE, RAY_SPEED } from "../Utils/gameValues";
import GameManager, { gameManager } from "./GameManager";
import { aimArrow } from "../Scenes/GameScene";
import Piece from "./Piece";
import { isMovementLimit } from "../Utils/utils";
import { SIDE } from "../game.interfaces";

export default class Player {

    private aimLine: Phaser.Geom.Line;
    private secondaryAimLine: Phaser.Geom.Line[] = [];
    private currentPiece: Piece = null;
    private isShooting = false;
    private playerPosition = {
        x: HALF_SCREEN.WIDTH, 
        y: BACKGROUND.HEIGHT - PIECE.HEIGHT + 10
    }

    constructor(gameManager: GameManager) {
        this.aimLine = gameManager.getAimLine();

        this.currentPiece = new Piece(this.playerPosition);
    }

    public getCurrentPiece(): Piece {
        return this.currentPiece;
    }

    public setCurrentPiece(piece: Piece) {
        this.currentPiece = piece;
    }

    public getAimLine(): Phaser.Geom.Line {
        return this.aimLine;
    }

    public setSecondaryAimLine(line: Phaser.Geom.Line, index) {
        this.secondaryAimLine[index] = line;
    }

    public getSecondaryAimLines(): Phaser.Geom.Line [] {
        return this.secondaryAimLine;
    }

    public removeSecondaryAimLine(index) {
        this.secondaryAimLine.splice(index, 1)
    }

    public move(side: SIDE) {
        if (side === SIDE.LEFT) { 
            if (isMovementLimit(aimArrow.rotation, SIDE.LEFT)) {
                aimArrow.rotation += -RAY_SPEED;
                Phaser.Geom.Line.RotateAroundPoint(this.aimLine, this.aimLine.getPointA(), -RAY_SPEED);
            }
        } else {
            if (isMovementLimit(aimArrow.rotation, SIDE.RIGHT)) {
                aimArrow.rotation += RAY_SPEED;
                Phaser.Geom.Line.RotateAroundPoint(this.aimLine, this.aimLine.getPointA(), RAY_SPEED);
            }
        }
    }

    public shootPiece() {
        if (this.isShooting === false) {
            this.currentPiece.shoot(this.getSecondaryAimLines() , () => {
                this.erasePiece();
                this.generatePiece();
                this.isShooting = false;
            })
            this.isShooting = true;
        }
    }

    private erasePiece() {
        this.currentPiece = null;
    }

    private generatePiece() {
        const newPiece = new Piece(this.playerPosition);
        this.setCurrentPiece(newPiece);
    }
}