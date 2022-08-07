// export type TileType = 'W' | 'R' | 'Y' | 'G' | 'O' | 'B' | 'P';

export interface Position {
    x: number,
    y: number
}

export enum SIDE {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    MAIN
}

export enum SIDES {
    LEFT,
    RIGHT
}