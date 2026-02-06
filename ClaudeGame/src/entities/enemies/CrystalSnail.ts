import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const CRYSTAL_SNAIL_CONFIG: EnemyConfig = {
  health: 70,
  damage: 18,
  speed: 52,
  detectionRange: 165,
  attackRange: 130,
  coinDrop: { min: 12, max: 20 },
};

export class CrystalSnail extends Enemy {
  private isHidden = false;
  private hiddenTimer = 0;
  private behaviorTimer = 0;
  private spitCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'crystal-snail', CRYSTAL_SNAIL_CONFIG);

    this.setSize(30, 24);
    this.setOffset(8, 33);
    this.play('crystal-snail-anim');
  }

  takeDamage(amount: number): void {
    const reduced = this.isHidden ? Math.max(1, Math.floor(amount * 0.35)) : amount;
    super.takeDamage(reduced);
  }

  updateBehavior(): void {
    if (this.isHidden) {
      this.handleHidden();
      return;
    }

    this.handleMove();
  }

  private handleMove(): void {
    if (!this.player) {
      this.setVelocityX(0);
      return;
    }

    this.behaviorTimer += this.scene.game.loop.delta;

    const direction = this.player.x < this.x ? -1 : 1;
    const speedFactor = this.canSeePlayer() ? 0.6 : 0.35;
    this.setVelocityX(this.config.speed * speedFactor * direction);
    this.setFlipX(direction < 0);

    if (this.canAttackPlayer() && !this.spitCooldown) {
      this.spitCrystal(direction);
    }

    if (this.behaviorTimer > 2200) {
      this.enterHideState();
    }
  }

  private handleHidden(): void {
    this.setVelocityX(0);
    this.hiddenTimer += this.scene.game.loop.delta;

    if (this.hiddenTimer > 1800 || !this.canSeePlayer()) {
      this.exitHideState();
    }
  }

  private enterHideState(): void {
    this.isHidden = true;
    this.hiddenTimer = 0;
    this.behaviorTimer = 0;
    this.setTint(0x7ad6ff);
  }

  private exitHideState(): void {
    this.isHidden = false;
    this.hiddenTimer = 0;
    this.clearTint();
  }

  private spitCrystal(direction: number): void {
    this.spitCooldown = true;

    const shard = this.scene.add.rectangle(this.x + direction * 16, this.y - 8, 10, 6, 0x9be9ff);
    this.scene.physics.add.existing(shard);

    const body = shard.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(direction * 220, 0);

    this.addOverlapWithPlayers(
      shard as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      (player) => {
        if (!shard.active) {
          return;
        }

        const damage = player.takeDamage(this.config.damage + 3);
        if (damage > 0) {
          player.applyKnockback(direction * 170, -120);
        }
        shard.destroy();
      }
    );

    this.scene.time.delayedCall(2000, () => {
      if (shard.active) {
        shard.destroy();
      }
    });

    this.scene.time.delayedCall(1400, () => {
      this.spitCooldown = false;
    });
  }
}
