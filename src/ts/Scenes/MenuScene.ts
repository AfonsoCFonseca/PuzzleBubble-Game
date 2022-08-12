import 'phaser';
import { BACKGROUND, HALF_SCREEN } from '../Utils/gameValues';

export default class MenuScene extends Phaser.Scene {

    private bgColor;

    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.bgColor = "0x" + Math.floor(Math.random()*16777215).toString(16);
        this.add.rectangle(0, 0, BACKGROUND.WIDTH, BACKGROUND.HEIGHT, 
            parseInt(this.bgColor), 0.3).setOrigin(0,0);
        this.add.image(HALF_SCREEN.WIDTH - 375, 250, 'logo').setDepth(1).setOrigin(0, 0);

        this.add.text(HALF_SCREEN.WIDTH - 280, HALF_SCREEN.HEIGHT + 400, 'Press any key to start', { font: 'bold 50px Geneva', color: 'black'}).setDepth(1);

        this.input.on('pointerup', () => {
            this.scene.start('GameScene', { color: this.bgColor});
        }, this);
    }
}