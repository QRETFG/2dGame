import Phaser from 'phaser';
import { GameMode } from '../types/GameMode';
import { isMobileDevice } from '../utils/device';

export class GameOverScene extends Phaser.Scene {
  private isVictory: boolean = false;
  private gameMode: GameMode = 'single';
  private isMobileLayout = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { victory?: boolean; mode?: GameMode }): void {
    this.isVictory = data.victory || false;
    this.gameMode = data.mode || 'single';
    this.isMobileLayout = isMobileDevice(this.sys.game.device, this.scale.width, this.scale.height);
    if (this.isMobileLayout) {
      this.gameMode = 'single';
    }
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 背景
    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);

    // 标题
    const title = this.isVictory ? '胜利!' : '游戏结束';
    const titleColor = this.isVictory ? '#ffd700' : '#ff4444';

    this.add.text(centerX, centerY - 50, title, {
      fontSize: this.isMobileLayout ? '42px' : '48px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 提示文字
    this.add.text(centerX, centerY + 30, this.isMobileLayout ? '点击下方按钮继续' : '按 R 重新开始', {
      fontSize: this.isMobileLayout ? '20px' : '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 70, this.isMobileLayout ? '手机端仅单人模式' : '按 ESC 返回主菜单', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    if (this.isMobileLayout) {
      this.createMobileButtons(centerX, centerY + 122);
    }

    // 键盘输入
    this.input.keyboard?.on('keydown-R', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('HomeScene');
    });
  }

  private createMobileButtons(centerX: number, y: number): void {
    const createButton = (x: number, label: string): Phaser.GameObjects.Text => {
      return this.add
        .text(x, y, label, {
          fontSize: '20px',
          color: '#e9f7ff',
          backgroundColor: '#1f4f70',
          padding: { x: 16, y: 8 },
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    };

    const restartButton = createButton(centerX - 80, '重新开始');
    restartButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start('GameScene', { mode: 'single' });
    });

    const homeButton = createButton(centerX + 80, '主菜单');
    homeButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start('HomeScene');
    });
  }
}
