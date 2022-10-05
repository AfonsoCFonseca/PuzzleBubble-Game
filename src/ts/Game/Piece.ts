import { BALL_TYPES as BALL_COLORS, PieceConfigs, Position } from "../game.interfaces";
import { gameScene, invisiblePiecesGroup, piecesGroup, player } from "../Scenes/GameScene"
import { AVERAGE_LINE_SIZE, BACKGROUND, BALL_SPEED, HALF_SCREEN, PIECE } from "../Utils/gameValues";
import { applyPythagoreanTheorem, getBallType, makeAnimation, rndNumber } from "../Utils/utils";

export default class Piece extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;

    private color: BALL_COLORS;
    private currentAnimation = null;
    private isPlayerPiece: boolean;
    private id: string;
    private isDebug = true;
    private textId:  Phaser.GameObjects.Text;
    
    constructor({ x, y }: Position, { isPlayerPiece, pieceColor, isNextBall }: PieceConfigs) {
        super(gameScene, x, y, 'bubbles', pieceColor)
        if (isNextBall) this.setScale(0.8);
        this.isPlayerPiece = isPlayerPiece;
        this.color = pieceColor || getBallType(pieceColor);
        this.id = this.generateNewId();

        this.setCollisionSpecs()

        if(!this.isPlayerPiece && this.color !== BALL_COLORS.INVISIBLE) piecesGroup.add(this);
        if(this.isEmpty()) invisiblePiecesGroup.add(this);

        if( this.isDebug ) this.textId = gameScene.add.text(x - 25, y - 15, this.id.substring(0,4), {fontSize: '28px'}).setDepth(2);
    }

    private setCollisionSpecs() {
        gameScene.physics.add.existing(this);
        if (this.isPlayerPiece === false) this.body.immovable = true;
        this.body.setCircle(PIECE.WIDTH/2);
        gameScene.add.existing(this).setDepth(1).setOrigin(0.5,0.5)
    }

    public getId(): string {
        return this.id
    }

    public getColor(): BALL_COLORS {
        return this.color;
    }

    public isEmpty(): boolean {
        return this.color === BALL_COLORS.INVISIBLE;
    }

    public switchForInvisible() {
        this.fellDown();
        this.setFrame(BALL_COLORS.INVISIBLE)
        this.color = BALL_COLORS.INVISIBLE;
        invisiblePiecesGroup.add(this);
        const pieceInGroup = piecesGroup.getChildren().find((currentPiece: Piece) => 
            currentPiece.getId() === this.id)
        piecesGroup.remove(pieceInGroup);
    }

    private fellDown() {
        var image = gameScene.add.image(this.x, this.y, 'bubbles', this.color);
        image.setTint(0x808080)
        makeAnimation(image, { x: image.x, y: BACKGROUND.HEIGHT+ image.y }, 500, () => 
            image.destroy());
    }

    public eraseDebugString() {
        if (this.isDebug) {
            this.textId.destroy();
        }
    }

    public updateDebugString({ x, y }: Position) {
        if (this.isDebug) {
            x -= 25;
            y -= 25;
            if(this.textId.active === false) this.textId = gameScene.add.text(x, y, this.id.substring(0,4), {fontSize: '28px'}).setDepth(2);
            else this.textId.setPosition(x, y);
        }
    }

    public shoot(secondAimLines: Phaser.Geom.Line[]) {
        const destinyPoint = secondAimLines[0]?.getPointA() || player.getAimLine().getPointB();
        const animSpeed = this.calculateSpeedToDistance(destinyPoint);
        const secondaryLines = [...player.getSecondaryAimLines()];
        this.shootingMove(destinyPoint, 0, animSpeed, secondaryLines);
    }

    public shootingMove( {x, y}, nextPos, animSpeed, secondaryLines) {
        this.move({ x, y }, animSpeed, () => {
            const nextLine = secondaryLines[nextPos];
            if(nextLine) {
                nextPos++
                const animSpeed = this.calculateSpeedToDistance(nextLine.getPointB());
                this.shootingMove(nextLine.getPointB(), nextPos, animSpeed, secondaryLines)
            } else {
                player.endShootingProcess(false);
            }
        })
    }

    public move({x,y}, animSpeed, callback) {
        this.currentAnimation = makeAnimation(this, { x, y }, animSpeed, callback)
    }

    public stopMovement() {
        this.body.immovable = true;
        if(this.currentAnimation) {
            this.currentAnimation.stop()
            player.endShootingProcess(true);
        } 
    }
    
    private calculateSpeedToDistance({ x,y }: { x:number , y: number }):number {
        let finalX = this.x - x
        let finalY = this.y - y
        let lineDistance = applyPythagoreanTheorem(finalX, finalY);
        return (BALL_SPEED * lineDistance) / AVERAGE_LINE_SIZE
    }

    private generateNewId() {
        return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
    }
}