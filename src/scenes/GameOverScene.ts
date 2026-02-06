import Phaser from 'phaser';
import { GameMode } from '../types/GameMode';

export class GameOverScene extends Phaser.Scene {
  private isVictory: boolean = false;
  private gameMode: GameMode = 'single';

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { victory?: boolean; mode?: GameMode }): void {
    this.isVictory = data.victory || false;
    this.gameMode = data.mode || 'single';
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 背景
    this.add.rectangle(centerX, centerY, 640, 384, 0x000000, 0.8);

    // 标题
    const title = this.isVictory ? '胜利!' : '游戏结束';
    const titleColor = this.isVictory ? '#ffd700' : '#ff4444';

    this.add.text(centerX, centerY - 50, title, {
      fontSize: '48px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 提示文字
    this.add.text(centerX, centerY + 30, '按 R 重新开始', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 70, '按 ESC 返回主菜单', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // 键盘输入
    this.input.keyboard?.on('keydown-R', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('HomeScene');
    });
  }
}
