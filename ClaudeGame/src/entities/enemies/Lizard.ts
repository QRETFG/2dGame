import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const LIZARD_CONFIG: EnemyConfig = {
  health: 50,
  damage: 17,
  speed: 80,
  detectionRange: 190,
  attackRange: 140,
  coinDrop: { min: 10, max: 18 },
};

export class Lizard extends Enemy {
  private fireCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'lizard-move', LIZARD_CONFIG);

    this.setSize(18, 22);
    this.setOffset(7, 8);
    this.play('lizard-anim');
  }

  updateBehavior(): void {
    if (!this.player) {
      this.setVelocityX(0);
      return;
    }

    const direction = this.player.x < this.x ? -1 : 1;
    const distance = this.getDistanceToPlayer();

    if (this.canSeePlayer() && distance > this.config.attackRange) {
      this.setVelocityX(this.config.speed * direction);
      this.setFlipX(direction < 0);
      return;
    }

    this.setVelocityX(0);
    this.setFlipX(direction < 0);

    if (this.canSeePlayer() && !this.fireCooldown) {
      this.shootFireball(direction);
      return;
    }

    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 1700) {
      this.patrolTimer = 0;
      this.patrolDirection *= -1;
    }

    if (!this.canSeePlayer()) {
      this.setVelocityX(this.config.speed * 0.35 * this.patrolDirection);
      this.setFlipX(this.patrolDirection < 0);
    }
  }

  private shootFireball(direction: number): void {
    this.fireCooldown = true;

    const fireball = this.scene.add.circle(this.x + direction * 15, this.y - 9, 5, 0xff8f3f);
    this.scene.physics.add.existing(fireball);

    const body = fireball.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(direction * 250, -20);

    this.addOverlapWithPlayers(
      fireball as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      (player) => {
        if (!fireball.active) {
          return;
        }

        const damage = player.takeDamage(this.config.damage + 4);
        if (damage > 0) {
          player.applyKnockback(direction * 190, -140);
        }
        fireball.destroy();
      }
    );

    this.scene.time.delayedCall(2200, () => {
      if (fireball.active) {
        fireball.destroy();
      }
    });

    this.scene.time.delayedCall(1500, () => {
      this.fireCooldown = false;
    });
  }
}
