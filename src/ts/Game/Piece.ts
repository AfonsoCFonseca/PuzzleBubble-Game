import { BALL_TYPES as BALL_COLORS, PieceConfigs, Position } from "../game.interfaces";
import { gameScene, invisiblePiecesGroup, piecesGroup, player } from "../Scenes/GameScene"
import { AVERAGE_LINE_SIZE, BACKGROUND, BALL_SPEED, HALF_SCREEN, PIECE } from "../Utils/gameValues";
import { applyPythagoreanTheorem, getBallType, makeAnimation, rndNumber } from "../Utils/utils";

export default class Piece extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;

    shootingCallback: Function;
    private color: BALL_COLORS;
    private currentAnimation = null;
    private isPlayerPiece: boolean;
    
    constructor({ x, y }: Position, { isPlayerPiece, pieceColor, isNextBall }: PieceConfigs) {
        super(gameScene, x, y, 'bubbles', pieceColor)
        if (isNextBall) this.setScale(0.8);
        this.isPlayerPiece = isPlayerPiece;
        this.color = pieceColor || getBallType(pieceColor);

        this.setCollisionSpecs()

        if(!this.isPlayerPiece && this.color !== BALL_COLORS.INVISIBLE) piecesGroup.add(this);
        if(this.color === BALL_COLORS.INVISIBLE) invisiblePiecesGroup.add(this);
    }

    private setCollisionSpecs() {
        gameScene.physics.add.existing(this);
        if (this.isPlayerPiece === false) this.body.immovable = true;
        this.body.setCircle(PIECE.WIDTH/2);
        gameScene.add.existing(this).setDepth(1).setOrigin(0.5,0.5)
    }

    public getColor(): BALL_COLORS {
        return this.color;
    }

    public shoot(secondAimLines: Phaser.Geom.Line[], 
        callback?: Function) {
        this.shootingCallback = callback;
        const destinyPoint = secondAimLines[0]?.getPointA() || player.getAimLine().getPointB();
        const animSpeed = this.calculateSpeedToDistance(destinyPoint);
        const secondaryLines = [...player.getSecondaryAimLines()];
        this.shootingMove(destinyPoint, 0, animSpeed, secondaryLines);

    }

    public move({x,y}, animSpeed, callback) {
        return makeAnimation(this, { x, y }, animSpeed, () => {
            if(callback) callback()
        })
    }

    public shootingMove( {x, y}, nextPos, animSpeed, secondaryLines) {
        this.currentAnimation = this.move({ x, y }, animSpeed, () => {
            const nextLine = secondaryLines[nextPos];
            if(nextLine) {
                nextPos++
                const animSpeed = this.calculateSpeedToDistance(nextLine.getPointB());
                this.shootingMove(nextLine.getPointB(), nextPos, animSpeed, secondaryLines)
            } else {
                this.shootingCallback();
            }
        })
    }

    public changeForGridPiece() {
        this.stopMovement();
        piecesGroup.add(this);
        this.body.immovable = true;
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