import { BALL_TYPES as BALL_COLORS, Position } from "../game.interfaces";
import { gameScene, piecesGroup, player } from "../Scenes/GameScene"
import { AVERAGE_LINE_SIZE, BACKGROUND, BALL_SPEED, HALF_SCREEN, PIECE } from "../Utils/gameValues";
import { applyPythagoreanTheorem, getBallType, makeAnimation, rndNumber } from "../Utils/utils";

export default class Piece extends Phaser.GameObjects.Sprite {

    shootingCallback: Function;
    private color: BALL_COLORS;
    private currentAnimation = null;
    private isPlayerPiece: boolean;
    
    constructor({ x, y }: Position, isPlayerPiece: boolean) {
        let spritePositon = rndNumber(0, 6, true)
        super(gameScene, x, y, 'bubbles', spritePositon)
        this.isPlayerPiece = isPlayerPiece;
        this.color = getBallType(spritePositon)
        gameScene.physics.add.existing(this);
        gameScene.physics.world.enable(this);
        gameScene.add.existing(this).setDepth(1).setOrigin(0.5,0.5);
        // var ball2 = this.physics.add.image(700, 240, 'wizball');
        // this.setCircle(46);


        
        if(!isPlayerPiece) {
            piecesGroup.add(this);
        }
    }

    public shoot(secondAimLines: Phaser.Geom.Line[], 
        callback?: Function) {
        this.shootingCallback = callback;
        const destinyPoint = secondAimLines[0]?.getPointA() || player.getAimLine().getPointB();
        const animSpeed = this.calculateSpeedToDistance(destinyPoint);
        const secondaryLines = [...player.getSecondaryAimLines()];
        this.move(destinyPoint, 0, animSpeed, secondaryLines);

    }

    private move( {x, y}, nextPos, animSpeed, secondaryLines) {

        // const xWithMargin = x + (this.x > x ? PIECE.WIDTH/2 : -PIECE.WIDTH/2);
        this.currentAnimation = makeAnimation(this, { x, y }, animSpeed, () => {
            const nextLine = secondaryLines[nextPos];
            if(nextLine) {
                nextPos++
                const animSpeed = this.calculateSpeedToDistance(nextLine.getPointB());
                this.move(nextLine.getPointB(), nextPos, animSpeed, secondaryLines)
            } else {
                this.shootingCallback();
            }
        })
    }

    public stopMovement() {
        if(this.currentAnimation) this.currentAnimation.stop()
    }
    
    private calculateSpeedToDistance({ x,y }: { x:number , y: number }):number {
        let finalX = this.x - x
        let finalY = this.y - y
        let lineDistance = applyPythagoreanTheorem(finalX, finalY);
        return (BALL_SPEED * lineDistance) / AVERAGE_LINE_SIZE
    }
}