import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const GHOST_CONFIG: EnemyConfig = {
  health: 46,
  damage: 16,
  speed: 102,
  detectionRange: 240,
  attackRange: 64,
  coinDrop: { min: 12, max: 20 },
};

export class Ghost extends Enemy {
  private driftAngle = 0;
  private phaseShiftCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ghost', GHOST_CONFIG);

    this.setSize(18, 22);
    this.setOffset(7, 7);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.play('ghost-anim');
  }

  updateBehavior(): void {
    if (!this.player) {
      this.idleDrift();
      return;
    }

    if (!this.canSeePlayer()) {
      this.idleDrift();
      return;
    }

    if (this.canAttackPlayer() && !this.phaseShiftCooldown) {
      this.phaseShift();
      return;
    }

    this.spectralChase();
  }

  private idleDrift(): void {
    this.driftAngle += 0.03;
    const vx = Math.cos(this.driftAngle) * 38;
    const vy = Math.sin(this.driftAngle * 0.9) * 28;
    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);
  }

  private spectralChase(): void {
    if (!this.player) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y - 8);
    const vx = Math.cos(angle) * this.config.speed * 0.7;
    const vy = Math.sin(angle) * this.config.speed * 0.7;

    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);
  }

  private phaseShift(): void {
    if (!this.player) {
      return;
    }

    this.phaseShiftCooldown = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.checkCollision.none = true;

    this.setAlpha(0.45);
    this.setTint(0xaa88ff);

    const offsetX = Phaser.Math.Between(56, 92) * (this.player.x < this.x ? -1 : 1);
    const targetX = Phaser.Math.Clamp(this.player.x + offsetX, 32, this.scene.scale.width - 32);
    const targetY = Phaser.Math.Clamp(this.player.y + Phaser.Math.Between(-24, 32), 48, this.scene.scale.height - 48);

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 180,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!this.active) {
          return;
        }

        body.checkCollision.none = false;
        this.setAlpha(1);
        this.clearTint();
      },
    });

    this.scene.time.delayedCall(1600, () => {
      this.phaseShiftCooldown = false;
    });
  }
}
