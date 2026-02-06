import Phaser from 'phaser';
import { GameMode } from '../types/GameMode';
import { isMobileDevice } from '../utils/device';

interface ModeOption {
  label: string;
  mode: GameMode;
  desc: string;
}

export class HomeScene extends Phaser.Scene {
  private options: ModeOption[] = [
    { label: '单人模式', mode: 'single', desc: '1名玩家闯关' },
    { label: '双人模式', mode: 'coop', desc: '2名玩家并肩作战' },
  ];
  private isMobileLayout = false;
  private selectedIndex = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private hintText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HomeScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.isMobileLayout = isMobileDevice(this.sys.game.device, width, height);
    if (this.isMobileLayout) {
      this.options = [{ label: '单人模式', mode: 'single', desc: '手机端仅支持1名玩家闯关' }];
      this.selectedIndex = 0;
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1b2a, 0.96);
    this.add.rectangle(width / 2, 92, 420, 88, 0x1b263b, 0.75).setStrokeStyle(2, 0x5bc0be, 0.7);

    this.add
      .text(width / 2, 76, 'Super Grotto Escape', {
        fontSize: this.isMobileLayout ? '30px' : '34px',
        color: '#e0fbfc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 110, this.isMobileLayout ? '点击开始单人闯关' : '选择游玩模式', {
        fontSize: this.isMobileLayout ? '15px' : '16px',
        color: '#cdeef5',
      })
      .setOrigin(0.5);

    this.createModeOptions(width / 2, this.isMobileLayout ? 194 : 180);
    this.createControlsHint(width / 2, height - (this.isMobileLayout ? 28 : 42));
    this.refreshSelection();

    this.input.keyboard?.on('keydown-UP', () => this.changeSelection(-1));
    this.input.keyboard?.on('keydown-W', () => this.changeSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.changeSelection(1));
    this.input.keyboard?.on('keydown-S', () => this.changeSelection(1));
    this.input.keyboard?.on('keydown-ONE', () => this.startGame('single'));
    if (!this.isMobileLayout) {
      this.input.keyboard?.on('keydown-TWO', () => this.startGame('coop'));
    }
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame(this.options[this.selectedIndex].mode));
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame(this.options[this.selectedIndex].mode));
  }

  private createModeOptions(centerX: number, startY: number): void {
    this.options.forEach((option, index) => {
      const optionY = startY + index * 72;
      const text = this.add
        .text(centerX, optionY, option.label, {
          fontSize: this.isMobileLayout ? '28px' : '30px',
          color: '#d9e6f2',
          backgroundColor: '#23395d',
          padding: { x: this.isMobileLayout ? 26 : 20, y: this.isMobileLayout ? 12 : 10 },
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(centerX, optionY + 28, option.desc, {
          fontSize: this.isMobileLayout ? '13px' : '14px',
          color: '#9ec4dd',
        })
        .setOrigin(0.5);

      text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.selectedIndex = index;
        this.refreshSelection();
      });
      text.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.startGame(option.mode);
      });

      this.optionTexts.push(text);
    });
  }

  private createControlsHint(centerX: number, y: number): void {
    const hint = this.isMobileLayout
      ? '手机端仅单人模式，点击按钮直接开始'
      : '方向键/WASD 选择  Enter确认  或直接按 1/2';
    this.hintText = this.add
      .text(centerX, y, hint, {
        fontSize: this.isMobileLayout ? '13px' : '14px',
        color: '#89a7c2',
      })
      .setOrigin(0.5);
  }

  private changeSelection(step: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + step, 0, this.options.length);
    this.refreshSelection();
  }

  private refreshSelection(): void {
    this.optionTexts.forEach((text, index) => {
      if (index === this.selectedIndex) {
        text.setStyle({
          color: '#0d1b2a',
          backgroundColor: '#7ad3ff',
        });
        return;
      }

      text.setStyle({
        color: '#d9e6f2',
        backgroundColor: '#23395d',
      });
    });

    const selected = this.options[this.selectedIndex];
    this.hintText?.setText(
      this.isMobileLayout
        ? `当前: ${selected.label} | 点击按钮开始`
        : `当前: ${selected.label} | Enter开始`
    );
  }

  private startGame(mode: GameMode): void {
    this.scene.start('GameScene', { mode: this.isMobileLayout ? 'single' : mode });
  }
}
