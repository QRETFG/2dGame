import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const FLY_EYE_CONFIG: EnemyConfig = {
  health: 30,
  damage: 12,
  speed: 100,
  detectionRange: 220,
  attackRange: 52,
  coinDrop: { min: 8, max: 14 },
};

export class FlyEye extends Enemy {
  private hoverBaseY: number;
  private hoverTimer = 0;
  private orbitAngle = 0;
  private stingCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'fly-eye', FLY_EYE_CONFIG);

    this.setSize(22, 20);
    this.setOffset(12, 14);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.hoverBaseY = y;
    this.play('fly-eye-anim');
  }

  updateBehavior(): void {
    if (!this.player) {
      this.hoverIdle();
      return;
    }

    if (!this.canSeePlayer()) {
      this.hoverIdle();
      return;
    }

    if (this.canAttackPlayer() && !this.stingCooldown) {
      this.stingDash();
      return;
    }

    this.orbitAroundPlayer();
  }

  private hoverIdle(): void {
    this.hoverTimer += 0.05;
    this.setVelocity(0, 0);
    this.setY(this.hoverBaseY + Math.sin(this.hoverTimer) * 10);
  }

  private orbitAroundPlayer(): void {
    if (!this.player) {
      return;
    }

    this.orbitAngle += 0.045;
    const radiusX = 64;
    const radiusY = 34;

    const targetX = this.player.x + Math.cos(this.orbitAngle) * radiusX;
    const targetY = this.player.y - 20 + Math.sin(this.orbitAngle) * radiusY;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const vx = Math.cos(angle) * this.config.speed;
    const vy = Math.sin(angle) * this.config.speed;

    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);
  }

  private stingDash(): void {
    if (!this.player) {
      return;
    }

    this.stingCooldown = true;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    this.setVelocity(Math.cos(angle) * this.config.speed * 2.5, Math.sin(angle) * this.config.speed * 2.5);
    this.setTint(0xffcc66);

    this.scene.time.delayedCall(260, () => {
      if (!this.active) {
        return;
      }

      this.clearTint();
    });

    this.scene.time.delayedCall(1350, () => {
      this.stingCooldown = false;
    });
  }
}
