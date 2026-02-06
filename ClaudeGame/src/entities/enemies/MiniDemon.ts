import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const MINI_DEMON_CONFIG: EnemyConfig = {
  health: 58,
  damage: 20,
  speed: 88,
  detectionRange: 205,
  attackRange: 52,
  coinDrop: { min: 13, max: 22 },
};

export class MiniDemon extends Enemy {
  private leapCooldown = false;
  private berserkTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'mini-demon', MINI_DEMON_CONFIG);

    this.setSize(24, 22);
    this.setOffset(11, 14);
    this.play('mini-demon-anim');
  }

  updateBehavior(): void {
    const onGround = this.body?.blocked.down ?? false;

    if (this.berserkTimer > 0) {
      this.berserkTimer -= this.scene.game.loop.delta;
      this.setTint(0xff8877);
    } else {
      this.clearTint();
    }

    if (!this.player) {
      this.setVelocityX(0);
      return;
    }

    if (!this.canSeePlayer()) {
      this.patrolTimer += this.scene.game.loop.delta;
      if (this.patrolTimer > 1700) {
        this.patrolTimer = 0;
        this.patrolDirection *= -1;
      }

      this.setVelocityX(this.config.speed * 0.45 * this.patrolDirection);
      this.setFlipX(this.patrolDirection < 0);
      return;
    }

    const direction = this.player.x < this.x ? -1 : 1;
    const berserkSpeedBonus = this.berserkTimer > 0 ? 1.45 : 1;

    this.berserkTimer = Math.max(this.berserkTimer, 1800);
    this.setVelocityX(this.config.speed * berserkSpeedBonus * direction);
    this.setFlipX(direction < 0);

    if (this.canAttackPlayer() && onGround && !this.leapCooldown) {
      this.leapCooldown = true;
      this.setVelocity(direction * 245, -330);

      this.scene.time.delayedCall(1250, () => {
        this.leapCooldown = false;
      });
    }
  }
}
