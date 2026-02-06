import Phaser from 'phaser';
import { Player } from '../entities/Player';

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

  private coins = 0;

  constructor(scene: Phaser.Scene, players: Player | Player[]) {
    this.scene = scene;
    this.players = Array.isArray(players) ? players : [players];

    this.createHealthBars();
    this.createCoinsDisplay();
  }

  private createHealthBars(): void {
    const totalPlayers = this.players.length;
    const barWidth = totalPlayers > 1 ? 132 : 150;

    this.players.forEach((player, index) => {
      const x = 10 + index * (barWidth + 16);
      const y = 10;
      const height = 20;

      const bgBar = this.scene.add.graphics();
      bgBar.fillStyle(0x333333, 1);
      bgBar.fillRect(x, y, barWidth, height);
      bgBar.setScrollFactor(0).setDepth(100);

      const healthBar = this.scene.add.graphics();
      healthBar.setScrollFactor(0).setDepth(101);

      const label = player.getPlayerLabel();
      const healthText = this.scene.add.text(x + barWidth / 2, y + 2, `${label}:`, {
        fontSize: totalPlayers > 1 ? '12px' : '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      healthText.setOrigin(0.5, 0).setScrollFactor(0).setDepth(102);

      this.playerHealthUis.push({
        player,
        bgBar,
        healthBar,
        healthText,
        x,
        y,
        width: barWidth,
        height,
      });
    });

    this.updateHealthBars();
  }

  private createCoinsDisplay(): void {
    const totalPlayers = this.players.length;
    const coinX = totalPlayers > 1 ? 306 : 185;
    const textX = totalPlayers > 1 ? 321 : 200;

    const coinIcon = this.scene.add.graphics();
    coinIcon.fillStyle(0xffd700, 1);
    coinIcon.fillCircle(coinX, 20, 8);
    coinIcon.setScrollFactor(0);
    coinIcon.setDepth(100);

    this.coinsText = this.scene.add.text(textX, 12, '0', {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    this.coinsText.setScrollFactor(0);
    this.coinsText.setDepth(100);
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
