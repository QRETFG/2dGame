import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { isLikelyMobileClient } from './utils/device';

const BASE_GAME_WIDTH = 640;
const BASE_GAME_HEIGHT = 384;
const isMobileClient = isLikelyMobileClient();
const gameRoot = document.getElementById('game-root');
if (!gameRoot) {
  throw new Error('Missing #game-root element');
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: BASE_GAME_WIDTH,
  height: BASE_GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  parent: gameRoot,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, HomeScene, GameScene, GameOverScene],
};

const game = new Phaser.Game(config);
const refreshScale = (): void => {
  game.scale.refresh();
};

window.addEventListener('resize', refreshScale);
window.addEventListener('orientationchange', refreshScale);
window.visualViewport?.addEventListener('resize', refreshScale);

if (isMobileClient) {
  document.body.classList.add('mobile-client');
}
