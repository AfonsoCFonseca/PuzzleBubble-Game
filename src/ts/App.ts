import GameScene from './Scenes/GameScene'
import MenuScene from './Scenes/MenuScene'
import 'phaser'
import { debugLogs } from './Utils/gameValues';
import ShakePositionPlugin from 'phaser3-rex-plugins/plugins/shakeposition-plugin.js';


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
    global: [{
        key: 'rexShakePosition',
        plugin: ShakePositionPlugin,
        start: true
    }],
    scene: [GameScene, MenuScene]
};

export const game = new Phaser.Game(config);