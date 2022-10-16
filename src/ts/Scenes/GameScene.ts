import 'phaser';
import GameManager, { myGraphics } from '../Game/GameManager';
import Player from '../Game/Player'
import Piece from '../Game/Piece'

import { ARROW_IMAGE, BACKGROUND, BUTTON_SIZE, GAMEOVER_BOARD, HALF_SCREEN, PIECE, WALL } from '../Utils/gameValues';
import { BALL_TYPES, GAME_STATE, SIDE } from '../game.interfaces';
import Grid from '../Game/Grid';

export let gameScene;

export let player: Player;
export let grid: Grid;
export let gameManager: GameManager;

export let piecesGroup: Phaser.GameObjects.Group;
export let invisiblePiecesGroup: Phaser.GameObjects.Group;

export let aimArrow: Phaser.GameObjects.Image;

let keys;

export default class GameScene extends Phaser.Scene {

    private leftWall;
    private rightWall;
    private topWall;
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
        this.load.image('ballFrame', 'assets/ballFrame.png')
        this.load.image('ballNextFrame', 'assets/ballNextFrame.png')

        this.load.spritesheet('bubbles', 'assets/bubbles.png', {
            frameWidth: PIECE.WIDTH,
            frameHeight: PIECE.HEIGHT
        });

        piecesGroup = this.add.group();
        invisiblePiecesGroup = this.add.group();
    }

    create() {
        keys = this.input.keyboard.addKeys({
            left: 'Q',
            right: 'E'
        });
        this.startGame();
        gameScene = this;
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

    public gameOver() {
        //Board
        gameManager.setCurrentGameState(GAME_STATE.PAUSE);
        const boardX = BACKGROUND.WIDTH / 2 - GAMEOVER_BOARD.WIDTH / 2
        const boardY = BACKGROUND.HEIGHT / 2 - GAMEOVER_BOARD.HEIGHT / 2
        this.add.rectangle(boardX, boardY, GAMEOVER_BOARD.WIDTH, 
            GAMEOVER_BOARD.HEIGHT, this.bgColor).setOrigin(0,0).setDepth(1);
        
        //Gamover & Score text
        gameScene.add.text( boardX + GAMEOVER_BOARD.WIDTH / 2, boardY + 100,
            'GAME OVER', { font: "65px", align: "center" }).setDepth(2).setOrigin(0.5, 0);
        gameScene.add.text( boardX + GAMEOVER_BOARD.WIDTH / 2, boardY + 180,
            gameManager.currentScore, { font: "65px", align: "center" }).setDepth(2).setOrigin(0.5, 0);
        gameScene.add.text( boardX + GAMEOVER_BOARD.WIDTH / 2, boardY + 270,
            gameManager.highScore, { font: "45px", align: "center" }).setDepth(2).setOrigin(0.5, 0);
            
        const BTNS_X = boardX + GAMEOVER_BOARD.WIDTH / 2 - BUTTON_SIZE.WIDTH /2
        const BTNS_Y = (boardY + GAMEOVER_BOARD.HEIGHT) - 220;
        
        //Button Reset
        this.add.rectangle(BTNS_X, BTNS_Y, BUTTON_SIZE.WIDTH, BUTTON_SIZE.HEIGHT, 
            this.bgColor, 0.3).setDepth(2).setOrigin(0, 0);
        const buttonReset = this.add.image(BTNS_X, BTNS_Y ,'buttonReset').setDepth(1).setOrigin(0, 0);
        buttonReset.setInteractive({ useHandCursor: true });
        buttonReset.on('pointerup', () => this.scene.start('GameScene'));
        //Button Menu
        this.add.rectangle(BTNS_X, BTNS_Y + 100, BUTTON_SIZE.WIDTH, BUTTON_SIZE.HEIGHT, 
            this.bgColor, 0.3).setDepth(2).setOrigin(0, 0);
        const buttonMainMenu = this.add.image(BTNS_X, BTNS_Y + 100,'buttonMenu').setDepth(1).setOrigin(0, 0);
        buttonMainMenu.setInteractive({ useHandCursor: true });
        buttonMainMenu.on('pointerup', () => this.scene.start('MenuScene'));
    }

    private createFrameAndWalls() {
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.add.image(0, 0, 'frame').setOrigin(0, 0);

        this.add.image(HALF_SCREEN.WIDTH - 110, BACKGROUND.HEIGHT - 230, 'ballFrame').setOrigin(0, 0);
        this.add.image(HALF_SCREEN.WIDTH - 270, BACKGROUND.HEIGHT - 210, 'ballNextFrame').setOrigin(0, 0);
        
        this.add.rectangle(0, 0, BACKGROUND.WIDTH, BACKGROUND.HEIGHT, 
            parseInt(this.bgColor), 0.3).setOrigin(0,0);
        aimArrow = this.add.image(HALF_SCREEN.WIDTH,
            BACKGROUND.HEIGHT - 100, 'aimArrow').setOrigin(0, 0.5);
        aimArrow.angle = ARROW_IMAGE.INITIAL_ANGLE;
        this.leftWall = this.add.rectangle(0, 0, WALL.WIDTH, BACKGROUND.HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.leftWall);
        this.rightWall = this.add.rectangle(BACKGROUND.WIDTH - WALL.WIDTH, 0, 
            WALL.WIDTH, BACKGROUND.HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.rightWall);
        this.topWall = this.add.rectangle(0, 0, 
            BACKGROUND.WIDTH, WALL.TOP_HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.topWall);
    }

    public pieceCollision() {
        const self = this;
        let control = true;
        // collider trigger for every in contact piece, used the variable control to make
        //sure the addPlayerPieceToGrid is only called for the first contacted piece
        this.currentPieceCollider = this.physics.add.collider(player.getCurrentPiece(), 
            piecesGroup, (playerPiece, gridPiece) => {
                if (player.getCurrentPiece() === playerPiece && control ) {
                    control = false;
                    grid.addPlayerPieceToGrid(playerPiece as Piece, () => {
                        self.refreshCollision();
                    });
                }
            });

        let controlTop = true;
        this.physics.add.collider(player.getCurrentPiece(), this.topWall, (playerPiece: Piece) => {
            if(controlTop) {
                if (player.getCurrentPiece() === playerPiece && controlTop ) {
                    controlTop = false;
                    grid.addPlayerPieceToGrid(playerPiece as Piece, () => {
                        self.refreshCollision();
                    });
                }
            }
        })
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
            this.input.keyboard.on('keydown-SPACE', () => { 
                player.shootPiece()
            });
        }
    }
    
}