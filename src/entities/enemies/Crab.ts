import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const CRAB_CONFIG: EnemyConfig = {
  health: 42,
  damage: 14,
  speed: 78,
  detectionRange: 170,
  attackRange: 46,
  coinDrop: { min: 10, max: 16 },
};

export class Crab extends Enemy {
  private dashCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'crab-walk', CRAB_CONFIG);

    this.setSize(24, 18);
    this.setOffset(4, 14);
    this.play('crab-walk-anim');
  }

  updateBehavior(): void {
    switch (this.currentState) {
      case 'idle':
        this.handleIdle();
        break;
      case 'patrol':
        this.handlePatrol();
        break;
      case 'chase':
        this.handleChase();
        break;
      case 'attack':
        this.handleAttack();
        break;
      default:
        this.currentState = 'idle';
        break;
    }
  }

  private handleIdle(): void {
    this.setVelocityX(0);
    this.play('crab-idle-anim', true);

    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 900) {
      this.patrolTimer = 0;
      this.currentState = 'patrol';
    }

    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handlePatrol(): void {
    this.play('crab-walk-anim', true);
    this.setVelocityX(this.config.speed * 0.55 * this.patrolDirection);
    this.setFlipX(this.patrolDirection < 0);

    if (this.body?.blocked.left || this.body?.blocked.right) {
      this.patrolDirection *= -1;
    }

    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 2200) {
      this.patrolTimer = 0;
      this.currentState = 'idle';
    }

    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handleChase(): void {
    if (!this.player) {
      this.currentState = 'idle';
      return;
    }

    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.config.speed * direction);
    this.setFlipX(direction < 0);
    this.play('crab-walk-anim', true);

    if (this.canAttackPlayer() && !this.dashCooldown) {
      this.currentState = 'attack';
      return;
    }

    if (!this.canSeePlayer()) {
      this.currentState = 'patrol';
    }
  }

  private handleAttack(): void {
    if (!this.player || this.dashCooldown) {
      this.currentState = 'chase';
      return;
    }

    this.dashCooldown = true;
    const direction = this.player.x < this.x ? -1 : 1;
    this.setFlipX(direction < 0);
    this.setVelocityX(this.config.speed * 3.2 * direction);

    this.scene.time.delayedCall(280, () => {
      if (!this.active) {
        return;
      }

      this.setVelocityX(0);
      this.currentState = 'chase';
    });

    this.scene.time.delayedCall(1200, () => {
      this.dashCooldown = false;
    });
  }
}
