import 'phaser';
import GameManager from '../Game/GameManager';
import Player from '../Game/Player'
import Piece from '../Game/Piece'

import { ARROW_IMAGE, BACKGROUND, HALF_SCREEN, TILE, WALL } from '../Utils/gameValues';

export let gameScene: Phaser.Scene;

export let player: Player;
export let gameManager: GameManager;

export let wallGroup: Phaser.GameObjects.Group;

export let aimArrow: Phaser.GameObjects.Image;

export default class GameScene extends Phaser.Scene {

    private leftWall;
    private rightWall;

    constructor() {
        super('GameScene');
        gameScene = this;
    }

    preload() {

        this.load.image('frame', 'assets/frame.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('aimArrow', 'assets/longarrow-black.png');

        this.load.spritesheet('bubble_1', 'assets/bubble_1.png', {
            frameWidth: TILE.WIDTH,
            frameHeight: TILE.HEIGHT
        });

        wallGroup = this.add.group();
    }

    create() {
        const graphics = this.add.graphics({ lineStyle: { width: 5, color: 0x0000aa } });

        this.createFrameAndWalls();

        gameManager = new GameManager(graphics);
        player = new Player(gameManager);

        this.setKeys();
    }

    update() {
        gameManager.update();
    }

    private createFrameAndWalls() {
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        aimArrow = this.add.image(HALF_SCREEN.WIDTH - ARROW_IMAGE.WIDTH/2,
            BACKGROUND.HEIGHT - 100, 'aimArrow').setOrigin(0, 0);
        aimArrow.angle = ARROW_IMAGE.INITIAL_ANGLE;
        let randomColor = "0x" + Math.floor(Math.random()*16777215).toString(16);
        this.add.rectangle(0, 0, BACKGROUND.WIDTH, BACKGROUND.HEIGHT, 
            parseInt(randomColor), 0.3).setOrigin(0,0);;
        this.add.image(0, 0, 'frame').setOrigin(0, 0);
        this.leftWall = this.add.rectangle(0, 0, WALL.WIDTH, BACKGROUND.HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.leftWall);
        this.rightWall = this.add.rectangle(BACKGROUND.WIDTH - WALL.WIDTH, 0, 
            WALL.WIDTH, BACKGROUND.HEIGHT).setOrigin(0,0);
        gameScene.physics.add.existing(this.rightWall);

        wallGroup.addMultiple([this.leftWall, this.rightWall]);
    }

    private setKeys() {
        this.input.keyboard.on('keydown-Q', () => player.move('left'));
        this.input.keyboard.on('keydown-E', () => player.move('right'));
        this.input.keyboard.on('keydown-SPACE', () => player.shootPiece());
    }
}