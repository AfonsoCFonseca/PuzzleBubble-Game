import { BACKGROUND, HALF_SCREEN, PIECE, RAY_SPEED, TIME_BEFORE_DELETE_PIECE } from "../Utils/gameValues";
import GameManager from "./GameManager";
import GameScene, { aimArrow, gameScene } from "../Scenes/GameScene";
import Piece from "./Piece";
import { isMovementLimit, rndNumber } from "../Utils/utils";
import { SIDE } from "../game.interfaces";
import { config, game } from "../App";

export default class Player {

    private aimLine: Phaser.Geom.Line;
    private secondaryAimLine: Phaser.Geom.Line[] = [];
    private currentPiece: Piece = null;
    private isShooting = false;
    private nextPiece: Piece;
    private playerPosition = {
        x: HALF_SCREEN.WIDTH, 
        y: BACKGROUND.HEIGHT - PIECE.HEIGHT + 10
    }
    private playerNextPosition = {
        x: HALF_SCREEN.WIDTH - 185, 
        y: BACKGROUND.HEIGHT - PIECE.HEIGHT + 5
    }

    constructor(gameManager: GameManager) {
        this.aimLine = gameManager.getAimLine();

        this.nextPiece = new Piece(this.playerNextPosition,{
            isPlayerPiece: true,
            pieceColor: rndNumber(0, 6),
            isNextBall: true,
        });
        this.currentPiece = new Piece(this.playerPosition,{
            isPlayerPiece: true,
            pieceColor: rndNumber(0, 6),
        });
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
            this.currentPiece.shoot(this.getSecondaryAimLines());
            this.isShooting = true;
        }
    }

    public endShootingProcess(collidedWithGrid: boolean) {
        const timeBeforeDelete = collidedWithGrid ? 0 : TIME_BEFORE_DELETE_PIECE;
        setTimeout(() => {
            this.currentPiece.eraseDebugString();
            if (collidedWithGrid === false) this.resetCurrentPiece();
            this.generatePiece();
            if (collidedWithGrid === false) gameScene.refreshCollision();
        }, timeBeforeDelete);
    }

    public resetCurrentPiece() {
        this.currentPiece.destroy();
        this.currentPiece = null;
    }

    public generatePiece() {
        const newPiece = new Piece(this.playerPosition, {
            isPlayerPiece: true,
            pieceColor:  this.nextPiece.getColor()
        })

        this.nextPiece.eraseDebugString();
        this.nextPiece = new Piece(this.playerNextPosition, {
            isPlayerPiece: true,
            pieceColor:  rndNumber(0, 6),
            isNextBall: true,
        });
        this.setCurrentPiece(newPiece);
        this.isShooting = false;
    }
}