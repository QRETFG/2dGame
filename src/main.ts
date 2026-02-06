import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const BASE_GAME_WIDTH = 640;
const BASE_GAME_HEIGHT = 384;
const MOBILE_CONTROL_PANEL_HEIGHT = 112;

const isLikelyMobileClient = (): boolean => {
  const touchCapable = navigator.maxTouchPoints > 1;
  const mobileAgent = /Android|webOS|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shortestEdge = Math.min(window.innerWidth, window.innerHeight);
  return mobileAgent || (touchCapable && shortestEdge <= 1024);
};

const isMobileClient = isLikelyMobileClient();
const gameHeight = isMobileClient ? BASE_GAME_HEIGHT + MOBILE_CONTROL_PANEL_HEIGHT : BASE_GAME_HEIGHT;

const rotateLockElement = document.getElementById('rotate-lock');
const updateOrientationMask = (): void => {
  const shouldBlock = isMobileClient && window.matchMedia('(orientation: portrait)').matches;
  rotateLockElement?.classList.toggle('visible', shouldBlock);
  document.body.classList.toggle('portrait-locked', shouldBlock);
};

const requestLandscapeLock = async (): Promise<void> => {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: string) => Promise<void>;
  };
  if (!isMobileClient || !orientation?.lock) {
    return;
  }

  try {
    await orientation.lock('landscape');
  } catch {
    // Ignore: many browsers only allow orientation lock in fullscreen or installed PWA.
  }
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: BASE_GAME_WIDTH,
  height: gameHeight,
  backgroundColor: '#1a1a2e',
  parent: document.body,
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

updateOrientationMask();
void requestLandscapeLock();
window.addEventListener('resize', updateOrientationMask);
window.addEventListener('orientationchange', updateOrientationMask);
window.addEventListener('pointerdown', () => {
  void requestLandscapeLock();
}, { once: true });

new Phaser.Game(config);
