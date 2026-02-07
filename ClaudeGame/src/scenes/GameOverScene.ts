import Phaser from 'phaser';
import { GameMode } from '../types/GameMode';
import { isMobileDevice } from '../utils/device';

export class GameOverScene extends Phaser.Scene {
  private isVictory = false;
  private gameMode: GameMode = 'single';
  private isMobileLayout = false;
  private overlay?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;
  private actionHintText?: Phaser.GameObjects.Text;
  private modeHintText?: Phaser.GameObjects.Text;
  private restartButton?: Phaser.GameObjects.Text;
  private homeButton?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { victory?: boolean; mode?: GameMode }): void {
    this.isVictory = data.victory || false;
    this.gameMode = data.mode || 'single';
    this.isMobileLayout = isMobileDevice();
    if (this.isMobileLayout) {
      this.gameMode = 'single';
    }
  }

  create(): void {
    this.overlay = this.add.rectangle(0, 0, 0, 0, 0x000000, 0.8).setOrigin(0);
    this.titleText = this.add.text(0, 0, '', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.actionHintText = this.add.text(0, 0, '', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.modeHintText = this.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    if (this.isMobileLayout) {
      this.restartButton = this.createMobileButton('重新开始');
      this.restartButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.scene.start('GameScene', { mode: 'single' });
      });

      this.homeButton = this.createMobileButton('主菜单');
      this.homeButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.scene.start('HomeScene');
      });
    }

    this.input.keyboard?.on('keydown-R', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('HomeScene');
    });

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });

    this.layoutScene();
  }

  private createMobileButton(label: string): Phaser.GameObjects.Text {
    return this.add
      .text(0, 0, label, {
        fontSize: '20px',
        color: '#e9f7ff',
        backgroundColor: '#1f4f70',
        padding: { x: 16, y: 8 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
  }

  private handleResize(): void {
    this.layoutScene();
  }

  private layoutScene(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const compact = Math.min(width, height) < 420;
    const centerX = width / 2;
    const centerY = height / 2;
    const title = this.isVictory ? '胜利!' : '游戏结束';
    const titleColor = this.isVictory ? '#ffd700' : '#ff4444';

    this.overlay?.setSize(width, height).setPosition(0, 0);
    this.titleText?.setPosition(centerX, centerY - (compact ? 42 : 50)).setText(title).setStyle({
      fontSize: this.isMobileLayout ? (compact ? '36px' : '42px') : (compact ? '42px' : '48px'),
      color: titleColor,
    });

    this.actionHintText?.setPosition(centerX, centerY + (compact ? 20 : 30)).setText(
      this.isMobileLayout ? '点击下方按钮继续' : '按 R 重新开始'
    ).setStyle({
      fontSize: compact ? '18px' : (this.isMobileLayout ? '20px' : '24px'),
    });

    this.modeHintText?.setPosition(centerX, centerY + (compact ? 52 : 70)).setText(
      this.isMobileLayout ? '手机端仅单人模式' : '按 ESC 返回主菜单'
    ).setStyle({
      fontSize: compact ? '14px' : '16px',
    });

    if (!this.isMobileLayout) {
      return;
    }

    const buttonY = centerY + (compact ? 102 : 122);
    this.restartButton?.setPosition(centerX - (compact ? 72 : 80), buttonY).setStyle({
      fontSize: compact ? '18px' : '20px',
      padding: { x: compact ? 14 : 16, y: compact ? 7 : 8 },
    });
    this.homeButton?.setPosition(centerX + (compact ? 72 : 80), buttonY).setStyle({
      fontSize: compact ? '18px' : '20px',
      padding: { x: compact ? 14 : 16, y: compact ? 7 : 8 },
    });
  }
}
