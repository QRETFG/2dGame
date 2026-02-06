import Phaser from 'phaser';
import { Player } from '../Player';

export interface EnemyConfig {
  health: number;
  damage: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  coinDrop: { min: number; max: number };
}

export type EnemyState = 'idle' | 'patrol' | 'chase' | 'attack' | 'cooldown' | 'dead';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected config: EnemyConfig;
  protected currentState: EnemyState = 'idle';
  protected health: number;
  protected maxHealth: number;
  protected player: Player | null = null;
  protected players: Player[] = [];
  protected patrolDirection = 1;
  protected patrolTimer = 0;
  protected attackCooldown = false;
  protected isDead = false;
  private healthBarBg?: Phaser.GameObjects.Rectangle;
  private healthBarFill?: Phaser.GameObjects.Rectangle;
  private healthBarBgWidth = 30;
  private healthBarBgHeight = 5;
  private healthBarFillWidth = 28;
  private healthBarFillHeight = 3;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: EnemyConfig
  ) {
    super(scene, x, y, texture);

    this.config = config;
    this.health = config.health;
    this.maxHealth = config.health;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.createHealthBar();
  }

  setPlayer(player: Player): void {
    this.setPlayers([player]);
  }

  setPlayers(players: Player[]): void {
    this.players = players;
    this.updateTargetPlayer();
  }

  getHealth(): number {
    return this.health;
  }

  getDamage(): number {
    return this.config.damage;
  }

  isDying(): boolean {
    return this.isDead;
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;

    const finalDamage = Math.max(0, Math.round(amount));
    if (finalDamage <= 0) {
      return;
    }

    this.health = Math.max(0, this.health - finalDamage);
    this.showDamageText(finalDamage);
    this.refreshHealthBar();

    // 受击闪烁
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // 击退效果
    const knockbackDir = this.player && this.player.x < this.x ? 1 : -1;
    this.setVelocityX(knockbackDir * 100);

    if (this.health <= 0) {
      this.die();
    }
  }

  protected die(): void {
    this.isDead = true;
    this.currentState = 'dead';
    this.clearHealthBar();

    // 掉落金币
    const coinAmount = Phaser.Math.Between(
      this.config.coinDrop.min,
      this.config.coinDrop.max
    );

    // 发送事件通知掉落
    this.scene.events.emit('enemyDied', this.x, this.y, coinAmount);

    // 死亡动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  protected getDistanceToPlayer(): number {
    if (!this.player) return Infinity;
    return Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
  }

  protected getAlivePlayers(): Player[] {
    return this.players.filter((player) => player.active && player.getHealth() > 0);
  }

  protected addOverlapWithPlayers(
    source: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    onHit: (player: Player) => void
  ): void {
    this.getAlivePlayers().forEach((player) => {
      this.scene.physics.add.overlap(source, player, () => {
        if (!source.active || !player.active || player.getHealth() <= 0) {
          return;
        }
        onHit(player);
      });
    });
  }

  protected canSeePlayer(): boolean {
    return this.getDistanceToPlayer() <= this.config.detectionRange;
  }

  protected canAttackPlayer(): boolean {
    return this.getDistanceToPlayer() <= this.config.attackRange;
  }

  protected getHealthBarWidth(): number {
    return 30;
  }

  protected getHealthBarHeight(): number {
    return 5;
  }

  // 子类实现具体行为
  abstract updateBehavior(): void;

  update(): void {
    if (this.isDead) return;
    this.updateTargetPlayer();
    this.updateHealthBarPosition();
    this.updateBehavior();
  }

  destroy(fromScene?: boolean): void {
    this.clearHealthBar();
    super.destroy(fromScene);
  }

  private createHealthBar(): void {
    this.healthBarBgWidth = this.getHealthBarWidth();
    this.healthBarBgHeight = this.getHealthBarHeight();
    this.healthBarFillWidth = Math.max(1, this.healthBarBgWidth - 2);
    this.healthBarFillHeight = Math.max(1, this.healthBarBgHeight - 2);

    const yOffset = this.getHealthBarYOffset();
    this.healthBarBg = this.scene.add
      .rectangle(this.x, this.y - yOffset, this.healthBarBgWidth, this.healthBarBgHeight, 0x1f1f1f, 0.85)
      .setDepth(22)
      .setOrigin(0.5, 0.5);

    this.healthBarFill = this.scene.add
      .rectangle(this.x, this.y - yOffset, this.healthBarFillWidth, this.healthBarFillHeight, 0x2ee66b, 1)
      .setDepth(23)
      .setOrigin(0.5, 0.5);
  }

  private refreshHealthBar(): void {
    if (!this.healthBarFill) {
      return;
    }

    const ratio = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    const width = Math.max(1, this.healthBarFillWidth * ratio);
    this.healthBarFill.setDisplaySize(width, this.healthBarFillHeight);
  }

  private updateHealthBarPosition(): void {
    if (!this.healthBarBg || !this.healthBarFill) {
      return;
    }

    const yOffset = this.getHealthBarYOffset();
    this.healthBarBg.setPosition(this.x, this.y - yOffset);
    this.healthBarFill.setPosition(
      this.x - (this.healthBarFillWidth - this.healthBarFill.displayWidth) / 2,
      this.y - yOffset
    );
  }

  private getHealthBarYOffset(): number {
    const visualHeight = this.displayHeight || 24;
    return visualHeight * 0.65;
  }

  private clearHealthBar(): void {
    this.healthBarBg?.destroy();
    this.healthBarBg = undefined;
    this.healthBarFill?.destroy();
    this.healthBarFill = undefined;
  }

  private showDamageText(amount: number): void {
    const damageText = this.scene.add
      .text(this.x, this.y - this.getHealthBarYOffset() - 10, `-${amount}`, {
        fontSize: '14px',
        color: '#ff5c5c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 22,
      alpha: 0,
      duration: 420,
      ease: 'Quad.easeOut',
      onComplete: () => damageText.destroy(),
    });
  }

  private updateTargetPlayer(): void {
    const alivePlayers = this.getAlivePlayers();
    if (alivePlayers.length === 0) {
      this.player = null;
      return;
    }

    this.player = alivePlayers.reduce((nearest, current) => {
      const nearestDistance = Phaser.Math.Distance.Between(this.x, this.y, nearest.x, nearest.y);
      const currentDistance = Phaser.Math.Distance.Between(this.x, this.y, current.x, current.y);
      return currentDistance < nearestDistance ? current : nearest;
    }, alivePlayers[0]);
  }
}
