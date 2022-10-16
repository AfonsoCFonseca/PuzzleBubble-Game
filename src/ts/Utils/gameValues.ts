export const ARROW_IMAGE = { 
    WIDTH: 32,
    HEIGHT: 800,
    INITIAL_ANGLE: -108.5,
}

export const BACKGROUND = {
    WIDTH: 1250,
    HEIGHT: 1720
};

export const HALF_SCREEN = {
    WIDTH: BACKGROUND.WIDTH / 2,
    HEIGHT: BACKGROUND.HEIGHT / 2
};

export const GAMEOVER_BOARD = {
    WIDTH: BACKGROUND.WIDTH / 1.5,
    HEIGHT: BACKGROUND.HEIGHT / 3
};

export const WALL =  {
    WIDTH: 90,
    HEIGHT: BACKGROUND.HEIGHT,
    TOP_HEIGHT: 44,
}

export const PIECE = {
    WIDTH: 130,
    HEIGHT: 129,
    HEIGHT_CLOSE_MARGIN: 15,
}

export const LIMIT_MOV = {
    LEFT: -3.0,
    RIGHT: -0.1
}

export const GRID_LENGTH = {
    Y: 5,
    X: 8,
    MAX_HEIGHT: 13,
    MAX_WIDTH: 7
}

export const PLAYER_POS = { 
    WIDTH: HALF_SCREEN.WIDTH,
    HEIGHT: BACKGROUND.HEIGHT - 100
}

export const SCORE_TEXT_POS = {
    X: HALF_SCREEN.WIDTH + 200,
    Y: BACKGROUND.HEIGHT - 100
}

export const HIGHSCORE_TEXT_POS = {
    X: HALF_SCREEN.WIDTH + 190,
    Y: BACKGROUND.HEIGHT - 180
}

export const BUTTON_SIZE = {
    WIDTH: 376,
    HEIGHT: 81
}

export const RAY_SPEED = 0.03;
export const BALL_SPEED = 120;
export const AVERAGE_LINE_SIZE = HALF_SCREEN.WIDTH;
export const TIME_BEFORE_DELETE_PIECE = 100;
export const TIME_TO_FALL = 200;
export const BASE_SCORE = 100;

export const RED_COLOR = 0xFF0000;
export const GREEN_COLOR = 0x00aa00;

export const debugLogs = false;
export const debugOptMap = false;
