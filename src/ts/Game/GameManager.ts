export let gameManager: GameManager

import { GAME_STATE, SIDE } from '../game.interfaces';
import GameScene, { gameScene, grid, player } from '../Scenes/GameScene';

import { BACKGROUND, GREEN_COLOR, HALF_SCREEN, HIGHSCORE_TEXT_POS, RED_COLOR, SCORE_TEXT_POS, WALL } from '../Utils/gameValues';
import { convertAxisToArrayPosition, drawLine, getCookie, getPointFromWall, isOriginalPoint, setCookie } from '../Utils/utils';

export let myGraphics;

export let initialAimLineAngle;
export default class GameManager {

    private leftWall: Phaser.Geom.Rectangle;
    private rightWall: Phaser.Geom.Rectangle;
    public aimLine: Phaser.Geom.Line;
    public currentGameState: GAME_STATE;

    private currentScoreText;
    private currentHighScoreText;
    public currentScore = 0;
    public highScore = getCookie('highscore') || 0;

    private totalPiecesShot = 0;
    private totalTimesToMoveGrid = 10;

    constructor(graphics) {
        gameManager = this;
        myGraphics = graphics;
        this.start();
    }

    private start() {
        this.currentGameState = GAME_STATE.RUNNING;
        this.createGeoms();
        this.drawScore();
    }

    public update() {
        myGraphics.clear();
        if (this.currentGameState === GAME_STATE.RUNNING) {
            this.renderGeoms();
        }
    }

    private drawScore() {
        this.currentScoreText = gameScene.add.text(SCORE_TEXT_POS.X, SCORE_TEXT_POS.Y, 
            this.highScore, { font: "45px Arial", align: "center" });

        this.currentHighScoreText = gameScene.add.text(HIGHSCORE_TEXT_POS.X, HIGHSCORE_TEXT_POS.Y, 
            this.currentScore, { font: "65px Arial", align: "center" });
    }

    public addScore(scoreToAdd: number) {
        this.currentScore += scoreToAdd;
        this.currentScoreText.setText(this.currentScore);
        if (this.currentScore >= this.highScore) {
            this.highScore = this.currentScore;
            setCookie('highscore', this.highScore, 7);
            this.currentHighScoreText.setText(this.highScore);
        }
    }

    public isGameOver(y): boolean {
        let { i } = convertAxisToArrayPosition({x: 0, y})
        if (i === 12 ) return true;
        return false;
    }

    public getCurrentGameState(): GAME_STATE {
        return this.currentGameState
    }

    public setCurrentGameState(current: GAME_STATE) {
        this.currentGameState = current;
    }

    public getAimLine() {
        return this.aimLine;
    }

    public resetAimLine() {
        // this.aimLine = new Phaser.Geom.Line(HALF_SCREEN.WIDTH,BACKGROUND.HEIGHT - 100, WALL.WIDTH, 0);
        this.aimLine.x1 = HALF_SCREEN.WIDTH
        this.aimLine.y1 = BACKGROUND.HEIGHT - 100
        this.aimLine.x2 = WALL.WIDTH
        this.aimLine.y2 = 0
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
                const wall = side === SIDE.LEFT ? this.rightWall : this.leftWall;
                let intersection  = Phaser.Geom.Intersects.GetLineToRectangle(currentLine, wall);
                ({ side, currentPoint } = getPointFromWall(intersection) || {});
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
        } while (shouldRepeat)
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

    public addTotalPiecesShot() {
        this.totalPiecesShot++;

        if(this.totalPiecesShot === this.totalTimesToMoveGrid - 2) {
            grid.downwardPieces(2);
        } else if(this.totalPiecesShot === this.totalTimesToMoveGrid - 1) {
            grid.downwardPieces(1);
        } else if(this.totalPiecesShot === this.totalTimesToMoveGrid) {
            grid.downwardPieces(0);
            if (this.totalTimesToMoveGrid > 5)
                this.totalTimesToMoveGrid = this.totalTimesToMoveGrid - 1;
            this.totalPiecesShot = 0
        }
    }
}
