import { BACKGROUND, HALF_SCREEN, PIECE, RAY_SPEED, TIME_BEFORE_DELETE_PIECE } from "../Utils/gameValues";
import GameManager, { gameManager } from "./GameManager";
import { aimArrow, gameScene } from "../Scenes/GameScene";
import Piece from "./Piece";
import { isMovementLimit, rndNumber } from "../Utils/utils";
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

        this.currentPiece = new Piece(this.playerPosition, true, rndNumber(0, 6));
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
                setTimeout(() => {
                    this.erasePiece();
                    this.generatePiece();
                }, TIME_BEFORE_DELETE_PIECE);
            })
            this.isShooting = true;
        }
    }

    public erasePiece() {
        this.currentPiece.destroy();
        this.currentPiece = null;
    }

    public generatePiece() {
        const newPiece = new Piece(this.playerPosition, true, rndNumber(0, 6));
        this.setCurrentPiece(newPiece);
        this.isShooting = false;
    }
}