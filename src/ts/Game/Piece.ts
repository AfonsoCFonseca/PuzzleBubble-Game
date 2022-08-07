import { Position } from "../game.interfaces";
import { gameScene, wallGroup, player } from "../Scenes/GameScene"
import { BACKGROUND, BALL_SPEED, HALF_SCREEN } from "../Utils/gameValues";
import { makeAnimation } from "../Utils/utils";

export default class Piece extends Phaser.GameObjects.Sprite {

    private tweenMovement: Phaser.Tweens.Tween = null;
    private movements = 0;

    constructor() {
        super(gameScene, HALF_SCREEN.WIDTH, BACKGROUND.HEIGHT - 100, 'bubble_1', 0)
        gameScene.physics.add.existing(this);
        gameScene.physics.world.enable(this);
        gameScene.add.existing(this).setDepth(1).setOrigin(0.5, 0.5);
    }

    public shoot(aimLine: Phaser.Geom.Line, secondAimLines: Phaser.Geom.Line[], 
        callback?: Function) {

            this.move(secondAimLines[0].getPointA(), 0, BALL_SPEED / 2 );

    }

    private move( {x, y}, nextPos, speed ) {
        makeAnimation(this, { x, y }, speed, () => {
            const nextLine = player.getSecondaryAimLines()[nextPos];
            if(nextLine) {
                nextPos++
                this.move(nextLine.getPointB(), nextPos, BALL_SPEED)
            }
        })
    }

    private deletePiece() {
        console.log("destroyed")
        this.destroy();
    }
}