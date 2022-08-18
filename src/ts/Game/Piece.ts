import { Position } from "../game.interfaces";
import { gameScene, wallGroup, player } from "../Scenes/GameScene"
import { AVERAGE_LINE_SIZE, BACKGROUND, BALL_SPEED, HALF_SCREEN, PIECE } from "../Utils/gameValues";
import { applyPythagoreanTheorem, makeAnimation } from "../Utils/utils";

export default class Piece extends Phaser.GameObjects.Sprite {

    shootingCallback: Function;

    constructor() {
        super(gameScene, HALF_SCREEN.WIDTH, BACKGROUND.HEIGHT - 100, 'bubble_1', 0)
        gameScene.physics.add.existing(this);
        gameScene.physics.world.enable(this);
        gameScene.add.existing(this).setDepth(1).setOrigin(0.5, 0.5);
    }

    public shoot(secondAimLines: Phaser.Geom.Line[], 
        callback?: Function) {
        this.shootingCallback = callback;
        const destinyPoint = secondAimLines[0]?.getPointA() || player.getAimLine().getPointB();
        const animSpeed = this.calculateSpeedToDistance(destinyPoint);
        this.move(destinyPoint, 0, animSpeed);

    }

    private move( {x, y}, nextPos, animSpeed) {

        // const xWithMargin = x + (this.x > x ? PIECE.WIDTH/2 : -PIECE.WIDTH/2);
        makeAnimation(this, { x, y }, animSpeed, () => {
            const nextLine = player.getSecondaryAimLines()[nextPos];
            if(nextLine) {
                nextPos++
                const animSpeed = this.calculateSpeedToDistance(nextLine.getPointB());
                this.move(nextLine.getPointB(), nextPos, animSpeed)
            } else {
                this.shootingCallback();
                this.deletePiece()
            }
        })
    }

    private deletePiece() {
        this.destroy();
    }
    
    private calculateSpeedToDistance({ x,y }: { x:number , y: number }):number {
        let finalX = this.x - x
        let finalY = this.y - y
        let lineDistance = applyPythagoreanTheorem(finalX, finalY);
        return (BALL_SPEED * lineDistance) / AVERAGE_LINE_SIZE
    }
}