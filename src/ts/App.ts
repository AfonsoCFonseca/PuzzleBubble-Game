import GameScene from './Scenes/GameScene'
import MenuScene from './Scenes/MenuScene'
import 'phaser'
import { debugLogs } from './Utils/gameValues';

export const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1250,
        height: 1720,
        backgroundColor: '#000000'
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: debugLogs
        }
    },
    scene: [GameScene, MenuScene]
};

export const game = new Phaser.Game(config);