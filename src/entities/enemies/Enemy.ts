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
  protected player: Player | null = null;
  protected patrolDirection = 1;
  protected patrolTimer = 0;
  protected attackCooldown = false;
  protected isDead = false;

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

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  setPlayer(player: Player): void {
    this.player = player;
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

    this.health -= amount;

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

  protected canSeePlayer(): boolean {
    return this.getDistanceToPlayer() <= this.config.detectionRange;
  }

  protected canAttackPlayer(): boolean {
    return this.getDistanceToPlayer() <= this.config.attackRange;
  }

  // 子类实现具体行为
  abstract updateBehavior(): void;

  update(): void {
    if (this.isDead) return;
    this.updateBehavior();
  }
}
