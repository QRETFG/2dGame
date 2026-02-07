import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { LayoutMetrics } from './layout';

interface PlayerHealthUi {
  player: Player;
  bgBar: Phaser.GameObjects.Graphics;
  healthBar: Phaser.GameObjects.Graphics;
  healthText: Phaser.GameObjects.Text;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class HUD {
  private scene: Phaser.Scene;
  private players: Player[];

  private playerHealthUis: PlayerHealthUi[] = [];
  private coinsText!: Phaser.GameObjects.Text;
  private coinIcon!: Phaser.GameObjects.Graphics;
  private isCompact = false;
  private coins = 0;

  constructor(scene: Phaser.Scene, players: Player | Player[]) {
    this.scene = scene;
    this.players = Array.isArray(players) ? players : [players];

    this.createHealthBars();
    this.createCoinsDisplay();
    this.setLayout({
      width: this.scene.scale.width,
      height: this.scene.scale.height,
      displayWidth: this.scene.scale.displaySize.width,
      displayHeight: this.scene.scale.displaySize.height,
      displayScale: 1,
      worldPerCssPixel: 1,
      isMobile: false,
      isPortrait: false,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
      playfieldRect: { x: 0, y: 0, width: this.scene.scale.width, height: this.scene.scale.height },
      hud: { topY: 10, leftX: 10, compact: false },
      controls: {
        panelTop: 0,
        panelBottom: 0,
        panelHeight: 0,
        movementY: 0,
        actionTopY: 0,
        actionBottomY: 0,
        moveLeftX: 0,
        moveRightX: 0,
        attackX: 0,
        jumpX: 0,
        blockX: 0,
        switchWeaponX: 0,
        interactX: 0,
        interactY: 0,
        shop1X: 0,
        shop2X: 0,
        shop3X: 0,
        shopY: 0,
        hintY: 0,
        mainButtonRadius: 0,
        shopButtonRadius: 0,
      },
    });
  }

  private createHealthBars(): void {
    this.players.forEach((player) => {
      const bgBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
      const healthBar = this.scene.add.graphics().setScrollFactor(0).setDepth(101);
      const healthText = this.scene.add
        .text(0, 0, '', {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(102);

      this.playerHealthUis.push({
        player,
        bgBar,
        healthBar,
        healthText,
        x: 0,
        y: 0,
        width: 150,
        height: 20,
      });
    });

    this.updateHealthBars();
  }

  private createCoinsDisplay(): void {
    this.coinIcon = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.coinsText = this.scene.add
      .text(0, 0, '0', {
        fontSize: '16px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  setLayout(metrics: LayoutMetrics): void {
    const totalPlayers = this.players.length;
    this.isCompact = metrics.hud.compact;
    const barWidth = totalPlayers > 1
      ? (this.isCompact ? 114 : 132)
      : (this.isCompact ? 132 : 150);
    const barHeight = this.isCompact ? 18 : 20;
    const gap = this.isCompact ? 10 : 16;
    const y = metrics.hud.topY;
    const baseX = metrics.hud.leftX;
    const fontSize = totalPlayers > 1
      ? (this.isCompact ? '11px' : '12px')
      : (this.isCompact ? '12px' : '14px');

    this.playerHealthUis.forEach((ui, index) => {
      const x = baseX + index * (barWidth + gap);
      ui.x = x;
      ui.y = y;
      ui.width = barWidth;
      ui.height = barHeight;

      ui.bgBar.clear();
      ui.bgBar.fillStyle(0x333333, 1);
      ui.bgBar.fillRect(x, y, barWidth, barHeight);
      ui.healthText.setStyle({ fontSize });
      ui.healthText.setPosition(x + barWidth / 2, y + 1);
    });

    const coinX = metrics.width - (this.isCompact ? 58 : 72);
    const coinY = y + barHeight / 2;
    this.coinIcon.clear();
    this.coinIcon.fillStyle(0xffd700, 1);
    this.coinIcon.fillCircle(coinX, coinY, this.isCompact ? 7 : 8);
    this.coinsText.setPosition(coinX + 12, y + (this.isCompact ? -1 : -2));
    this.coinsText.setStyle({ fontSize: this.isCompact ? '14px' : '16px' });
    this.updateHealthBars();
  }

  addCoins(amount: number): void {
    this.coins += amount;
    this.coinsText.setText(this.coins.toString());

    this.scene.tweens.add({
      targets: this.coinsText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  getCoins(): number {
    return this.coins;
  }

  spendCoins(amount: number): boolean {
    if (this.coins < amount) {
      return false;
    }

    this.coins -= amount;
    this.coinsText.setText(this.coins.toString());
    return true;
  }

  private updateHealthBars(): void {
    this.playerHealthUis.forEach((ui) => {
      const health = ui.player.getHealth();
      const maxHealth = ui.player.getMaxHealth();
      const percentage = Phaser.Math.Clamp(health / Math.max(1, maxHealth), 0, 1);

      ui.healthBar.clear();

      let color = 0x00ff00;
      if (percentage < 0.3) {
        color = 0xff0000;
      } else if (percentage < 0.6) {
        color = 0xffff00;
      }

      ui.healthBar.fillStyle(color, 1);
      ui.healthBar.fillRect(ui.x + 2, ui.y + 2, (ui.width - 4) * percentage, ui.height - 4);
      ui.healthText.setText(`${ui.player.getPlayerLabel()}: ${health}/${maxHealth}`);
    });
  }

  update(): void {
    this.updateHealthBars();
  }
}
