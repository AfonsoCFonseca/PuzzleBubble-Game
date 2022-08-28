// export type TileType = 'W' | 'R' | 'Y' | 'G' | 'O' | 'B' | 'P';

export interface PieceConfigs {
    isPlayerPiece: boolean,
    isNextBall?: boolean,
    pieceColor: BALL_TYPES 
}

export interface Position {
    x: number,
    y: number
}

export enum SIDE {
    LEFT,
    RIGHT
}

export enum GAME_STATE {
    RUNNING,
    PAUSE
}

export enum BALL_TYPES {
    DARK_ORANGE,
    RED,
    GREEN,
    BLACK,
    BLUE,
    ORANGE,
    PINK,
    INVISIBLE
}