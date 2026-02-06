import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 添加背景
    this.add.image(320, 192, 'bg-back').setScrollFactor(0);

    // 添加测试精灵
    const player = this.add.sprite(320, 200, 'player-idle');
    player.play('player-idle-anim');

    const slime = this.add.sprite(400, 200, 'slime');
    slime.play('slime-anim');

    // 添加提示文字
    this.add.text(320, 50, 'Super Grotto Escape - MVP', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(320, 350, '按任意键继续开发...', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);
  }
}
