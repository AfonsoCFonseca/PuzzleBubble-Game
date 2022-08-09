export let gameManager: GameManager

import { SIDES } from '../game.interfaces';
import { player } from '../Scenes/GameScene';

import { BACKGROUND, GREEN_COLOR, HALF_SCREEN, RED_COLOR, WALL } from '../Utils/gameValues';
import { drawLine, getPointFromWall, isOriginalPoint } from '../Utils/utils';

export let myGraphics;
export default class GameManager {

    private leftWall: Phaser.Geom.Rectangle;
    private rightWall: Phaser.Geom.Rectangle;
    public aimLine: Phaser.Geom.Line;

    constructor(graphics) {
        gameManager = this;
        myGraphics = graphics;
        this.start();
    }

    private start() {
        this.createGeoms();
    }

    public update() {
        myGraphics.clear();
        this.renderGeoms();
    }

    public getAimLine() {
        return this.aimLine;
    }

    private createGeoms() {
        this.leftWall = new Phaser.Geom.Rectangle(0, 0, WALL.WIDTH, BACKGROUND.HEIGHT);
        this.rightWall = new Phaser.Geom.Rectangle(BACKGROUND.WIDTH - WALL.WIDTH, 0, WALL.WIDTH, BACKGROUND.HEIGHT)
        this.aimLine = new Phaser.Geom.Line(HALF_SCREEN.WIDTH,BACKGROUND.HEIGHT - 100, WALL.WIDTH, 0);
    }

    private renderGeoms() {
        myGraphics.strokeRectShape(this.leftWall);
        myGraphics.strokeRectShape(this.rightWall);
        myGraphics.lineStyle(2, GREEN_COLOR);
        myGraphics.strokeLineShape(this.aimLine);

        this.renderLines();
    }

    private renderLines() {
        let currentLine = this.aimLine;
        let isOriginal = true;
        let currentPoint, side, previousPoint, shouldRepeat;
        let counter = 0;
        do {
            shouldRepeat = false;
            previousPoint = isOriginal ? currentLine.getPointA() : currentPoint;
            if(isOriginal) {
                let intersectionLeft  = Phaser.Geom.Intersects.GetLineToRectangle(currentLine, this.leftWall);
                let intersectionRight  = Phaser.Geom.Intersects.GetLineToRectangle(currentLine, this.rightWall);
                ({ side, currentPoint } = getPointFromWall(intersectionLeft) || getPointFromWall(intersectionRight) || {})
            } else {
                const wall = side === SIDES.LEFT ? this.rightWall : this.leftWall;
                let intersection  = Phaser.Geom.Intersects.GetLineToRectangle(currentLine, wall);
                ({ side, currentPoint }  = getPointFromWall(intersection) || {});
            }

            if (currentPoint) {
                currentLine = this.createAuxLine(currentPoint, previousPoint);
                player.setSecondaryAimLine(currentLine, counter);
                isOriginal = false;
                shouldRepeat = true;
            } else {
                player.removeSecondaryAimLine(counter);
            }
            counter++;
        } while(shouldRepeat)
    }

    private createAuxLine(currentPoint, previousPoint) {
        //calculates the difference between the original point and the intersected point
        const diffX = previousPoint.x - currentPoint.x;
        const diffY = previousPoint.y - currentPoint.y;
        //applies that difference at the future secondaryAimLine pointB
        const secondaryLinePointB_X = currentPoint.x + diffX * (isOriginalPoint(previousPoint) ? 2 : 1)
        const secondaryLinePointB_Y = currentPoint.y - diffY;

        const secondaryAimLine = drawLine(currentPoint, secondaryLinePointB_X, secondaryLinePointB_Y)

        return secondaryAimLine;
    }
}
