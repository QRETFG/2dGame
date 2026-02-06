import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 显示加载进度
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 加载玩家精灵表
    this.load.spritesheet('player-idle', 'assets/sprites/player/player-idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('player-run', 'assets/sprites/player/player-run.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('player-jump', 'assets/sprites/player/player-jump.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('player-shoot', 'assets/sprites/player/player-shoot.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 加载敌人精灵表
    this.load.spritesheet('slime', 'assets/sprites/enemies/slime/spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('bat', 'assets/sprites/enemies/bat/spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 加载tileset
    this.load.image('tileset', 'assets/tilemaps/tileset.png');

    // 加载背景
    this.load.image('bg-back', 'assets/backgrounds/back.png');
    this.load.image('bg-far', 'assets/backgrounds/far.png');
    this.load.image('bg-middle', 'assets/backgrounds/middle.png');
  }

  create(): void {
    console.log('Assets loaded successfully!');

    // 创建玩家动画
    this.anims.create({
      key: 'player-idle-anim',
      frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-run-anim',
      frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-jump-anim',
      frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: 'player-shoot-anim',
      frames: this.anims.generateFrameNumbers('player-shoot', { start: 0, end: 2 }),
      frameRate: 12,
      repeat: 0,
    });

    // 创建敌人动画
    this.anims.create({
      key: 'slime-anim',
      frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'bat-anim',
      frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 4 }),
      frameRate: 8,
      repeat: -1,
    });

    // 切换到游戏场景
    this.scene.start('GameScene');
  }
}
