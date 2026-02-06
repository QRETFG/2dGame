import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const SLIME_CONFIG: EnemyConfig = {
  health: 30,
  damage: 10,
  speed: 60,
  detectionRange: 150,
  attackRange: 40,
  coinDrop: { min: 5, max: 10 },
};

export class Slime extends Enemy {
  private jumpCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'slime', SLIME_CONFIG);

    this.setSize(20, 16);
    this.setOffset(6, 16);

    this.play('slime-anim');
  }

  updateBehavior(): void {
    const onGround = this.body?.blocked.down ?? false;

    switch (this.currentState) {
      case 'idle':
        this.handleIdle();
        break;
      case 'patrol':
        this.handlePatrol(onGround);
        break;
      case 'chase':
        this.handleChase(onGround);
        break;
      case 'attack':
        this.handleAttack(onGround);
        break;
    }
  }

  private handleIdle(): void {
    this.setVelocityX(0);

    // 随机开始巡逻
    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 2000) {
      this.patrolTimer = 0;
      this.currentState = 'patrol';
      this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
    }

    // 检测玩家
    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handlePatrol(_onGround: boolean): void {
    // 巡逻移动
    this.setVelocityX(this.config.speed * this.patrolDirection * 0.5);
    this.setFlipX(this.patrolDirection < 0);

    // 碰墙转向
    if (this.body?.blocked.left || this.body?.blocked.right) {
      this.patrolDirection *= -1;
    }

    // 巡逻时间结束
    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 3000) {
      this.patrolTimer = 0;
      this.currentState = 'idle';
    }

    // 检测玩家
    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handleChase(onGround: boolean): void {
    if (!this.player) {
      this.currentState = 'idle';
      return;
    }

    // 朝玩家移动
    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.config.speed * direction);
    this.setFlipX(direction < 0);

    // 跳跃攻击
    if (this.canAttackPlayer() && onGround && !this.jumpCooldown) {
      this.currentState = 'attack';
    }

    // 失去目标
    if (!this.canSeePlayer()) {
      this.currentState = 'idle';
    }
  }

  private handleAttack(onGround: boolean): void {
    if (!this.player || this.jumpCooldown) {
      this.currentState = 'chase';
      return;
    }

    // 跳跃攻击
    if (onGround) {
      this.jumpCooldown = true;

      const direction = this.player.x < this.x ? -1 : 1;
      this.setVelocity(direction * 150, -300);

      this.scene.time.delayedCall(1000, () => {
        this.jumpCooldown = false;
        this.currentState = 'chase';
      });
    }
  }
}
