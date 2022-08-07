import { SIDE, SIDES } from '../game.interfaces';
import { myGraphics } from '../Game/GameManager';
import { gameScene } from '../Scenes/GameScene';
import { BACKGROUND, PLAYER_POS, RED_COLOR, WALL } from './gameValues';

export const makeAnimation = (target: Phaser.GameObjects.Image, { x, y }: {x: number, y: number},
        duration:number, callback?: Function): Phaser.Tweens.Tween =>  {
        
    const tween = gameScene.tweens.add({
        targets: target,
        x,       
        y,
        ease: 'Linear',     
        duration,
        repeat: 0,
        onComplete() {
            if(callback) callback();
        }
    });

    return tween;

}

export const getPointFromWall = (intersections: Phaser.Geom.Point []) => {
    let currentPoint = null;
    let side = null;
    intersections.forEach((point:Phaser.Geom.Point) => {
        if(point.x === WALL.WIDTH || point.x === (BACKGROUND.WIDTH - WALL.WIDTH)) {
            currentPoint = point;
            side = point.x === WALL.WIDTH ? SIDES.LEFT : SIDES.RIGHT;
            return;
        }
    })

    if(!currentPoint && !side) return null;

    return {
        currentPoint,
        side
    }
}

export const isOriginalPoint = (point: Phaser.Geom.Point): boolean => {
    if(point.x === PLAYER_POS.WIDTH) return true;
    return false
}   

export const drawLine = (currentPoint, secondaryLinePointB_X, secondaryLinePointB_Y) => {
    const line = new Phaser.Geom.Line(currentPoint.x, currentPoint.y, secondaryLinePointB_X, secondaryLinePointB_Y);
    myGraphics.lineStyle(3, RED_COLOR);
    myGraphics.strokeLineShape(line);
    return line;
}