import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;

  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;

  private coins = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.createHealthBar();
    this.createCoinsDisplay();
  }

  private createHealthBar(): void {
    // 血条背景
    const bgBar = this.scene.add.graphics();
    bgBar.fillStyle(0x333333, 1);
    bgBar.fillRect(10, 10, 150, 20);
    bgBar.setScrollFactor(0);
    bgBar.setDepth(100);

    // 血条
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(101);

    // 血量文字
    this.healthText = this.scene.add.text(85, 12, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.healthText.setOrigin(0.5, 0);
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(102);

    this.updateHealthBar();
  }

  private createCoinsDisplay(): void {
    // 金币图标（简单矩形）
    const coinIcon = this.scene.add.graphics();
    coinIcon.fillStyle(0xffd700, 1);
    coinIcon.fillCircle(185, 20, 8);
    coinIcon.setScrollFactor(0);
    coinIcon.setDepth(100);

    // 金币数量
    this.coinsText = this.scene.add.text(200, 12, '0', {
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

    // 金币增加动画
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

  private updateHealthBar(): void {
    const health = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    const percentage = health / maxHealth;

    this.healthBar.clear();

    // 根据血量变色
    let color = 0x00ff00;
    if (percentage < 0.3) {
      color = 0xff0000;
    } else if (percentage < 0.6) {
      color = 0xffff00;
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(12, 12, 146 * percentage, 16);

    this.healthText.setText(`${health}/${maxHealth}`);
  }

  update(): void {
    this.updateHealthBar();
  }
}
