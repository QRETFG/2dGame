import Phaser from 'phaser';
import { GameMode } from '../types/GameMode';
import { isMobileDevice } from '../utils/device';

interface ModeOption {
  label: string;
  mode: GameMode;
  desc: string;
}

export class HomeScene extends Phaser.Scene {
  private readonly defaultOptions: ModeOption[] = [
    { label: '单人模式', mode: 'single', desc: '1名玩家闯关' },
    { label: '双人模式', mode: 'coop', desc: '2名玩家并肩作战' },
  ];

  private options: ModeOption[] = [];
  private isMobileLayout = false;
  private selectedIndex = 0;
  private backgroundRect?: Phaser.GameObjects.Rectangle;
  private headerRect?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;
  private subtitleText?: Phaser.GameObjects.Text;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private optionDescTexts: Phaser.GameObjects.Text[] = [];
  private hintText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HomeScene' });
  }

  create(): void {
    this.isMobileLayout = isMobileDevice();
    this.options = this.isMobileLayout
      ? [{ label: '单人模式', mode: 'single', desc: '手机端仅支持1名玩家闯关' }]
      : [...this.defaultOptions];
    this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex, 0, this.options.length - 1);

    this.backgroundRect = this.add.rectangle(0, 0, 0, 0, 0x0d1b2a, 0.96).setOrigin(0);
    this.headerRect = this.add.rectangle(0, 0, 0, 0, 0x1b263b, 0.75).setStrokeStyle(2, 0x5bc0be, 0.7);
    this.titleText = this.add.text(0, 0, 'Super Grotto Escape', {
      fontSize: '34px',
      color: '#e0fbfc',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.subtitleText = this.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#cdeef5',
    }).setOrigin(0.5);

    this.createModeOptions();
    this.hintText = this.add.text(0, 0, '', {
      fontSize: '14px',
      color: '#89a7c2',
    }).setOrigin(0.5);

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

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });

    this.layoutScene();
    this.refreshSelection();
  }

  private createModeOptions(): void {
    this.options.forEach((option, index) => {
      const text = this.add
        .text(0, 0, option.label, {
          fontSize: '30px',
          color: '#d9e6f2',
          backgroundColor: '#23395d',
          padding: { x: 20, y: 10 },
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const desc = this.add
        .text(0, 0, option.desc, {
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
      this.optionDescTexts.push(desc);
    });
  }

  private handleResize(): void {
    this.layoutScene();
  }

  private layoutScene(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const shortestEdge = Math.min(width, height);
    const compact = shortestEdge < 420;

    this.backgroundRect?.setSize(width, height).setPosition(0, 0);

    const headerWidth = Phaser.Math.Clamp(width * 0.72, 280, 460);
    const headerHeight = compact ? 82 : 88;
    const headerY = compact ? 84 : 92;
    this.headerRect?.setPosition(width / 2, headerY).setSize(headerWidth, headerHeight);

    this.titleText?.setPosition(width / 2, headerY - 16).setStyle({
      fontSize: this.isMobileLayout ? (compact ? '27px' : '30px') : (compact ? '30px' : '34px'),
    });

    this.subtitleText?.setPosition(width / 2, headerY + 16).setText(
      this.isMobileLayout ? '点击开始单人闯关' : '选择游玩模式'
    ).setStyle({
      fontSize: compact ? '14px' : '16px',
    });

    const optionBaseY = this.isMobileLayout ? height * 0.50 : height * 0.47;
    const optionGap = compact ? 64 : 72;
    this.optionTexts.forEach((text, index) => {
      const optionY = optionBaseY + index * optionGap;
      text.setPosition(width / 2, optionY).setStyle({
        fontSize: this.isMobileLayout ? (compact ? '24px' : '28px') : (compact ? '27px' : '30px'),
        padding: { x: compact ? 16 : 22, y: compact ? 8 : 10 },
      });
      this.optionDescTexts[index]?.setPosition(width / 2, optionY + (compact ? 23 : 28)).setStyle({
        fontSize: compact ? '12px' : '14px',
      });
    });

    this.hintText?.setPosition(width / 2, height - (compact ? 22 : 32)).setStyle({
      fontSize: compact ? '12px' : '14px',
    });
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
