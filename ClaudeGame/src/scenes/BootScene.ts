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
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('skeleton-idle', 'assets/sprites/enemies/skeleton/skeleton-idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('skeleton-walk', 'assets/sprites/enemies/skeleton/skeleton-walk.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('crab-idle', 'assets/sprites/enemies/crab/crab-idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('crab-walk', 'assets/sprites/enemies/crab/crab-walk.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('crystal-snail', 'assets/sprites/enemies/crystal-snail/move.png', {
      frameWidth: 48,
      frameHeight: 59,
    });
    this.load.spritesheet('fly-eye', 'assets/sprites/enemies/fly-eye/fly-eye.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('ghost', 'assets/sprites/enemies/ghost/ghost.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('lizard-move', 'assets/sprites/enemies/lizard/lizard-move.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('mini-demon', 'assets/sprites/enemies/mini-demon/run.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    // 加载tileset
    this.load.image('tileset', 'assets/tilemaps/tileset.png');

    // 加载背景
    this.load.image('bg-back', 'assets/backgrounds/back.png');
    this.load.image('bg-far', 'assets/backgrounds/far.png');
    this.load.image('bg-middle', 'assets/backgrounds/middle.png');

    // 加载平台素材与背景音乐
    this.load.image('platform-floating', 'assets/props/floating-platform.png');
    this.load.audio('bgm-main', ['assets/audio/bgm-main.ogg', 'assets/audio/bgm-main.wav']);

    // 加载攻击特效与传送门素材
    this.load.spritesheet('attack-hit', 'assets/fx/player-shoot-hit.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('bullet-shot', 'assets/weapons/bullet-shot.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image('shop-terminal', 'assets/shop/shop-terminal.png');
    this.load.image('shop-potion', 'assets/shop/potion.png');
    this.load.image('portal-1', 'assets/portal/force-field1.png');
    this.load.image('portal-2', 'assets/portal/force-field2.png');
    this.load.image('portal-3', 'assets/portal/force-field3.png');
    this.load.image('portal-4', 'assets/portal/force-field4.png');
    this.load.image('portal-5', 'assets/portal/force-field5.png');
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
      frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 4 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'bat-anim',
      frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 4 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'skeleton-idle-anim',
      frames: this.anims.generateFrameNumbers('skeleton-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'skeleton-walk-anim',
      frames: this.anims.generateFrameNumbers('skeleton-walk', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'crab-idle-anim',
      frames: this.anims.generateFrameNumbers('crab-idle', { start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1,
    });

    this.anims.create({
      key: 'crab-walk-anim',
      frames: this.anims.generateFrameNumbers('crab-walk', { start: 0, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'crystal-snail-anim',
      frames: this.anims.generateFrameNumbers('crystal-snail', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'fly-eye-anim',
      frames: this.anims.generateFrameNumbers('fly-eye', { start: 0, end: 3 }),
      frameRate: 9,
      repeat: -1,
    });

    this.anims.create({
      key: 'ghost-anim',
      frames: this.anims.generateFrameNumbers('ghost', { start: 0, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });

    this.anims.create({
      key: 'lizard-anim',
      frames: this.anims.generateFrameNumbers('lizard-move', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'mini-demon-anim',
      frames: this.anims.generateFrameNumbers('mini-demon', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    if (!this.anims.exists('attack-hit-anim')) {
      this.anims.create({
        key: 'attack-hit-anim',
        frames: this.anims.generateFrameNumbers('attack-hit', { start: 0, end: 3 }),
        frameRate: 20,
        repeat: 0,
      });
    }

    if (!this.anims.exists('bullet-shot-anim')) {
      this.anims.create({
        key: 'bullet-shot-anim',
        frames: this.anims.generateFrameNumbers('bullet-shot', { start: 0, end: 3 }),
        frameRate: 18,
        repeat: -1,
      });
    }

    if (!this.anims.exists('portal-idle-anim')) {
      this.anims.create({
        key: 'portal-idle-anim',
        frames: [
          { key: 'portal-1' },
          { key: 'portal-2' },
          { key: 'portal-3' },
          { key: 'portal-4' },
          { key: 'portal-5' },
          { key: 'portal-4' },
          { key: 'portal-3' },
          { key: 'portal-2' },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }

    // 切换到游戏场景
    this.scene.start('GameScene');
  }
}
