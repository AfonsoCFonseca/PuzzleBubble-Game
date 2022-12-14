import { BALL_TYPES, Position, SIDE } from '../game.interfaces';
import { myGraphics } from '../Game/GameManager';
import Piece from '../Game/Piece';
import { gameScene } from '../Scenes/GameScene';
import { BACKGROUND, LIMIT_MOV, PIECE, PLAYER_POS, RED_COLOR, WALL } from './gameValues';

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
            if(callback) {
                callback();
            } 
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
            side = point.x === WALL.WIDTH ? SIDE.LEFT : SIDE.RIGHT;
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

export const applyPythagoreanTheorem = (x:number , y: number): number => {
    x *= x
    y *= y
    let lineDistance = x + y
    return Math.sqrt(lineDistance )
}

export const isMovementLimit = (angle, side):boolean => {
    if (side === SIDE.LEFT && angle <= LIMIT_MOV.LEFT) {
        return false
    } else if (side === SIDE.RIGHT && angle >= LIMIT_MOV.RIGHT) {
        return false
    } else {
        return true;
    }
}

export function rndNumber(min: number, max: number, round = true): number {
    if (round) return Math.round(Math.random() * (max - min) + min);
    return Math.random() * (max - min) + min;
}

export function getBallType(pos: number): BALL_TYPES {
    switch(pos) {
        case 0: 
            return BALL_TYPES.DARK_ORANGE;
        case 1: 
            return BALL_TYPES.RED;
        case 2: 
            return BALL_TYPES.GREEN;
        case 3: 
            return BALL_TYPES.BLACK;
        case 4: 
            return BALL_TYPES.BLUE;
        case 5: 
            return BALL_TYPES.ORANGE;
        case 5: 
            return BALL_TYPES.PINK;
        default: 
            return BALL_TYPES.DARK_ORANGE;
    }
}

export function calculateClosestInvisiblePiece(playerPiece: Piece, 
    invisiblePieces: Piece[]): Piece {
        let totalOfDistancesArr: number[] = [];
        invisiblePieces.forEach( invisiblePiece => {
            const diffX = Math.max(Math.abs(playerPiece.x), Math.abs(invisiblePiece.x)) -
                Math.min(Math.abs(playerPiece.x), Math.abs(invisiblePiece.x))
            const diffY = Math.max(Math.abs(playerPiece.y), Math.abs(invisiblePiece.y)) -
                Math.min(Math.abs(playerPiece.y), Math.abs(invisiblePiece.y))
                totalOfDistancesArr.push(diffY + diffX);
        })

    return invisiblePieces[totalOfDistancesArr.indexOf(Math.min(...totalOfDistancesArr))];
}

export function convertAxisToArrayPosition({x, y}: {x: number, y: number}){
    return {
        i: Math.floor((y - WALL.TOP_HEIGHT) / (PIECE.HEIGHT - PIECE.HEIGHT_CLOSE_MARGIN)),
        j: Math.floor(x / PIECE.WIDTH) - 1
    }
}

export function idAlreadyExistInArray(id, arr: Piece[]): boolean {
    const found = arr.find(element => element.getId() === id);
    return found ? true : false;
}

export function removeDuplicates(pieceArr: Piece[]) {
    const uniqueArray = pieceArr.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === pieceArr.findIndex(obj => {
            return JSON.stringify(obj) === _value;
        });
    });

    return uniqueArray;
}

export function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
export function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}