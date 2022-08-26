import 'phaser';
import GameManager, { myGraphics } from '../Game/GameManager';
import Player from '../Game/Player'
import Piece from '../Game/Piece'

import { ARROW_IMAGE, BACKGROUND, GAMEOVER_BOARD, HALF_SCREEN, PIECE, WALL } from '../Utils/gameValues';
import { BALL_TYPES, GAME_STATE, SIDE } from '../game.interfaces';
import Grid from '../Game/Grid';

export let gameScene: Phaser.Scene;

export let player: Player;
export let grid: Grid;
export let gameManager: GameManager;

export let piecesGroup: Phaser.GameObjects.Group;
export let invisiblePiecesGroup: Phaser.GameObjects.Group;
export let gameOverGroup: Phaser.GameObjects.Group;

export let aimArrow: Phaser.GameObjects.Image;

let keys;

export default class GameScene extends Phaser.Scene {

    private leftWall;
    private rightWall;
    private bgColor;

    private currentPieceCollider;

    constructor() {
        super('GameScene');
        gameScene = this;
    }

    init(data) {
        this.bgColor = data.color || "0x" + Math.floor(Math.random()*16777215).toString(16);;
    }

    preload() {

        this.load.image('frame', 'assets/frame.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('aimArrow', 'assets/longarrow-black.png');
        this.load.image('buttonReset', 'assets/buttonReset.png')
        this.load.image('buttonMenu', 'assets/buttonMenu.png')

        this.load.spritesheet('bubbles', 'assets/bubbles.png', {
            frameWidth: PIECE.WIDTH,
            frameHeight: PIECE.HEIGHT
        });

        piecesGroup = this.add.group();
        invisiblePiecesGroup = this.add.group();
        gameOverGroup = this.add.group();
    }

    create() {
        keys = this.input.keyboard.addKeys({
            left: 'Q',
            right: 'E'
        });
        this.startGame();
    }

    update() {
        gameManager.update();
        this.setKeys()
    }

    private startGame() {
        const graphics = this.add.graphics({ lineStyle: { width: 5, color: 0x0000aa } });

        this.createFrameAndWalls();

        gameManager = new GameManager(graphics);
        grid = new Grid();
        player = new Player(gameManager);

        this.pieceCollision();
    }

    private resetGame() {
        myGraphics.clear();
        aimArrow.angle = ARROW_IMAGE.INITIAL_ANGLE;
        gameOverGroup.clear(true, true);
        gameManager.resetAimLine()
        gameManager.setCurrentGameState(GAME_STATE.RUNNING);
    }

    private gameOver() {
        gameManager.setCurrentGameState(GAME_STATE.PAUSE);
        const boardX = BACKGROUND.WIDTH / 2 - GAMEOVER_BOARD.WIDTH / 2
        const boardY = BACKGROUND.HEIGHT / 2 - GAMEOVER_BOARD.HEIGHT / 2
        const board = this.add.rectangle(boardX, boardY, GAMEOVER_BOARD.WIDTH, 
            GAMEOVER_BOARD.HEIGHT, this.bgColor).setOrigin(0,0).setDepth(1);

        const buttonReset = this.add.image(boardX + GAMEOVER_BOARD.WIDTH / 2 - 188,
            boardY ,'buttonReset').setDepth(1).setOrigin(0, 0);
        buttonReset.setInteractive({ useHandCursor: true });
        buttonReset.on('pointerup', () => this.resetGame());

        const buttonMainMenu = this.add.image(boardX + GAMEOVER_BOARD.WIDTH / 2 - 188,
            boardY + 100,'buttonMenu').setDepth(1).setOrigin(0, 0);
        buttonMainMenu.setInteractive({ useHandCursor: true });
        buttonMainMenu.on('pointerup', () => this.scene.start('MenuScene'));

        gameOverGroup.addMultiple([board, buttonReset, buttonMainMenu]);
    }

    private createFrameAndWalls() {
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.add.rectangle(0, 0, BACKGROUND.WIDTH, BACKGROUND.HEIGHT, 
            parseInt(this.bgColor), 0.3).setOrigin(0,0);
        aimArrow = this.add.image(HALF_SCREEN.WIDTH,
            BACKGROUND.HEIGHT - 100, 'aimArrow').setOrigin(0, 0.5);
        aimArrow.angle = ARROW_IMAGE.INITIAL_ANGLE;
        this.add.image(0, 0, 'frame').setOrigin(0, 0);
        this.leftWall = this.add.rectangle(0, 0, WALL.WIDTH, BACKGROUND.HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.leftWall);
        this.rightWall = this.add.rectangle(BACKGROUND.WIDTH - WALL.WIDTH, 0, 
            WALL.WIDTH, BACKGROUND.HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.rightWall);
    }

    public pieceCollision() {
        const self = this;

        this.currentPieceCollider = this.physics.add.collider(player.getCurrentPiece(), 
            piecesGroup, (playerPiece, gridPiece) => {
                if(player.getCurrentPiece() === playerPiece) {
                    grid.addPlayerPieceToGrid(playerPiece as Piece, gridPiece as Piece, () => {
                        player.generatePiece();
                        self.refreshCollision();
                    });
                }
        });
    }

    public refreshCollision() {
        if(this.currentPieceCollider){
            this.physics.world.removeCollider(this.currentPieceCollider);
            this.currentPieceCollider = null;
        }
        this.pieceCollision()
    }

    private setKeys() {
        if(gameManager.getCurrentGameState() === GAME_STATE.RUNNING) {
            if (this.input.keyboard.checkDown(keys.left)) {
                player.move(SIDE.LEFT)
            } else if (this.input.keyboard.checkDown(keys.right)){
                player.move(SIDE.RIGHT)
            }
            this.input.keyboard.on('keydown-SPACE', () => player.shootPiece());
        }
    }
}