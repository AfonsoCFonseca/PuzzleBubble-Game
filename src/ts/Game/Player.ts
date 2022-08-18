import { RAY_SPEED } from "../Utils/gameValues";
import GameManager, { gameManager } from "./GameManager";
import { aimArrow } from "../Scenes/GameScene";
import Piece from "./Piece";

export default class Player {

    private aimLine: Phaser.Geom.Line;
    private secondaryAimLine: Phaser.Geom.Line[] = [];
    private currentPiece: Piece = null;
    private isShooting = false;

    constructor(gameManager: GameManager) {
        this.aimLine = gameManager.getAimLine();

        this.currentPiece = new Piece();
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

    public move(side) {
        if (side === 'left') { 
            if(this.aimLine.getPointB().y < this.aimLine.getPointA().y) {
                aimArrow.rotation += -RAY_SPEED;
                Phaser.Geom.Line.RotateAroundPoint(this.aimLine, this.aimLine.getPointA(), -RAY_SPEED);
            }
        } else {
            aimArrow.rotation += RAY_SPEED;
            Phaser.Geom.Line.RotateAroundPoint(this.aimLine, this.aimLine.getPointA(), RAY_SPEED);
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
        const newPiece = new Piece();
        this.setCurrentPiece(newPiece);
    }
}