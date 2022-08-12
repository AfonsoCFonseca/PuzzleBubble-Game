// export type TileType = 'W' | 'R' | 'Y' | 'G' | 'O' | 'B' | 'P';

export interface Position {
    x: number,
    y: number
}

export enum SIDES {
    LEFT,
    RIGHT
}

export enum GAME_STATE {
    RUNNING,
    PAUSE
}