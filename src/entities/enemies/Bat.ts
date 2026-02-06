import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const BAT_CONFIG: EnemyConfig = {
  health: 20,
  damage: 15,
  speed: 100,
  detectionRange: 200,
  attackRange: 30,
  coinDrop: { min: 8, max: 12 },
};

export class Bat extends Enemy {
  private hoverY: number;
  private hoverOffset = 0;
  private diveCooldown = false;
  private originalY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bat', BAT_CONFIG);

    this.setSize(20, 16);
    this.setOffset(6, 8);

    // 飞行敌人不受重力影响
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.hoverY = y;
    this.originalY = y;

    this.play('bat-anim');
  }

  updateBehavior(): void {
    switch (this.currentState) {
      case 'idle':
        this.handleIdle();
        break;
      case 'chase':
        this.handleChase();
        break;
      case 'attack':
        this.handleAttack();
        break;
    }
  }

  private handleIdle(): void {
    // 悬停效果
    this.hoverOffset += 0.05;
    const hoverY = this.hoverY + Math.sin(this.hoverOffset) * 10;
    this.setY(hoverY);
    this.setVelocity(0, 0);

    // 检测玩家
    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handleChase(): void {
    if (!this.player) {
      this.currentState = 'idle';
      return;
    }

    // 朝玩家方向飞行
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    const vx = Math.cos(angle) * this.config.speed * 0.7;
    const vy = Math.sin(angle) * this.config.speed * 0.7;

    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);

    // 进入攻击范围时俯冲
    if (this.canAttackPlayer() && !this.diveCooldown) {
      this.currentState = 'attack';
    }

    // 失去目标
    if (!this.canSeePlayer()) {
      this.hoverY = this.y;
      this.currentState = 'idle';
    }
  }

  private handleAttack(): void {
    if (!this.player || this.diveCooldown) {
      this.currentState = 'chase';
      return;
    }

    this.diveCooldown = true;

    // 俯冲攻击
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    const diveSpeed = this.config.speed * 2;

    this.setVelocity(
      Math.cos(angle) * diveSpeed,
      Math.sin(angle) * diveSpeed
    );

    // 俯冲后返回
    this.scene.time.delayedCall(500, () => {
      this.hoverY = this.originalY;
      this.currentState = 'idle';

      // 返回原位置
      this.scene.tweens.add({
        targets: this,
        y: this.originalY,
        duration: 800,
        ease: 'Quad.easeOut',
      });
    });

    // 冷却
    this.scene.time.delayedCall(2000, () => {
      this.diveCooldown = false;
    });
  }
}
