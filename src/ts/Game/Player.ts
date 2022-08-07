import { RAY_SPEED } from "../Utils/gameValues";
import GameManager from "./GameManager";
import { makeAnimation } from '../Utils/utils';
import Piece from "./Piece";

export default class Player {

    private aimLine: Phaser.Geom.Line;
    private secondaryAimLine: Phaser.Geom.Line[] = [];
    private currentPiece: Piece = null;

    constructor(gameManager: GameManager) {
        this.aimLine = gameManager.getAimLine();

        this.currentPiece = new Piece();
    }

    public getCurrentPiece(): Piece {
        return this.currentPiece;
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
                Phaser.Geom.Line.RotateAroundPoint(this.aimLine, this.aimLine.getPointA(), -RAY_SPEED);
            }
        } else {
            Phaser.Geom.Line.RotateAroundPoint(this.aimLine, this.aimLine.getPointA(), RAY_SPEED);
        }
    }

    public shootPiece() {
        this.currentPiece.shoot(this.aimLine, this.getSecondaryAimLines() , () => {

        })
    }
}