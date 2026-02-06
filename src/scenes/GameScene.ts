import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 添加背景
    this.add.image(320, 192, 'bg-back').setScrollFactor(0);
    this.add.image(320, 192, 'bg-far').setScrollFactor(0.25);
    this.add.image(320, 192, 'bg-middle').setScrollFactor(0.5);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 创建地面（临时使用矩形）
    const ground = this.add.rectangle(320, 370, 640, 28, 0x4a4a4a);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    // 创建一些平台
    const platform1 = this.add.rectangle(200, 280, 120, 16, 0x4a4a4a);
    this.physics.add.existing(platform1, true);
    this.platforms.add(platform1);

    const platform2 = this.add.rectangle(450, 200, 120, 16, 0x4a4a4a);
    this.physics.add.existing(platform2, true);
    this.platforms.add(platform2);

    // 创建玩家
    this.player = new Player(this, 100, 300);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 添加提示文字
    this.add.text(320, 30, 'WASD/方向键移动，空格跳跃', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  update(): void {
    this.player.update();
  }
}
