import Phaser from 'phaser';
import { GameMode } from '../types/GameMode';

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
  private selectedIndex = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private hintText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HomeScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1b2a, 0.96);
    this.add.rectangle(width / 2, 92, 420, 88, 0x1b263b, 0.75).setStrokeStyle(2, 0x5bc0be, 0.7);

    this.add
      .text(width / 2, 76, 'Super Grotto Escape', {
        fontSize: '34px',
        color: '#e0fbfc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 110, '选择游玩模式', {
        fontSize: '16px',
        color: '#cdeef5',
      })
      .setOrigin(0.5);

    this.createModeOptions(width / 2, 180);
    this.createControlsHint(width / 2, height - 42);
    this.refreshSelection();

    this.input.keyboard?.on('keydown-UP', () => this.changeSelection(-1));
    this.input.keyboard?.on('keydown-W', () => this.changeSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.changeSelection(1));
    this.input.keyboard?.on('keydown-S', () => this.changeSelection(1));
    this.input.keyboard?.on('keydown-ONE', () => this.startGame('single'));
    this.input.keyboard?.on('keydown-TWO', () => this.startGame('coop'));
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame(this.options[this.selectedIndex].mode));
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame(this.options[this.selectedIndex].mode));
  }

  private createModeOptions(centerX: number, startY: number): void {
    this.options.forEach((option, index) => {
      const optionY = startY + index * 72;
      const text = this.add
        .text(centerX, optionY, option.label, {
          fontSize: '30px',
          color: '#d9e6f2',
          backgroundColor: '#23395d',
          padding: { x: 20, y: 10 },
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(centerX, optionY + 28, option.desc, {
          fontSize: '14px',
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
    this.hintText = this.add
      .text(centerX, y, '方向键/WASD 选择  Enter确认  或直接按 1/2', {
        fontSize: '14px',
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
    this.hintText?.setText(`当前: ${selected.label} | Enter开始`);
  }

  private startGame(mode: GameMode): void {
    this.scene.start('GameScene', { mode });
  }
}
