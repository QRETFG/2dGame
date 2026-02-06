import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const FUSION_BOSS_CONFIG: EnemyConfig = {
  health: 520,
  damage: 28,
  speed: 96,
  detectionRange: 360,
  attackRange: 100,
  coinDrop: { min: 120, max: 180 },
};

export class FusionBoss extends Enemy {
  private dashCooldown = false;
  private volleyCooldown = false;
  private phaseCooldown = false;
  private leapCooldown = false;
  private armorTimer = 2400;
  private armorDuration = 0;
  private armorActive = false;
  private enraged = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'mini-demon', FUSION_BOSS_CONFIG);

    this.setScale(2.25);
    this.setSize(74, 58);
    this.setOffset(-13, -5);
    this.setDepth(18);
    this.play('mini-demon-anim');
  }

  protected getHealthBarWidth(): number {
    return 150;
  }

  protected getHealthBarHeight(): number {
    return 16;
  }

  takeDamage(amount: number): void {
    const adjustedDamage = this.armorActive ? Math.max(1, Math.floor(amount * 0.4)) : amount;
    super.takeDamage(adjustedDamage);
  }

  updateBehavior(): void {
    const delta = this.scene.game.loop.delta;
    const onGround = this.body?.blocked.down ?? false;

    this.enraged = this.getHealth() <= Math.floor(this.config.health * 0.5);
    this.updateArmorState(delta);
    this.updateAuraTint();

    if (!this.player) {
      this.setVelocityX(0);
      return;
    }

    const distance = this.getDistanceToPlayer();
    const direction = this.player.x < this.x ? -1 : 1;

    if (!this.canSeePlayer()) {
      this.setVelocityX(this.config.speed * 0.35 * this.patrolDirection);
      this.setFlipX(this.patrolDirection < 0);
      this.patrolTimer += delta;
      if (this.patrolTimer > 1300) {
        this.patrolTimer = 0;
        this.patrolDirection *= -1;
      }
      return;
    }

    if (distance > 95 && distance < 280 && !this.dashCooldown) {
      this.performDash(direction);
      return;
    }

    if (distance < 320 && !this.volleyCooldown) {
      this.fireMixedVolley(direction);
    }

    if (distance < 180 && !this.phaseCooldown) {
      this.performPhaseShift(direction);
      return;
    }

    if (distance < this.config.attackRange + 25 && onGround && !this.leapCooldown) {
      this.performLeapSlam(direction);
      return;
    }

    const chaseSpeed = this.config.speed * (this.enraged ? 1.25 : 0.9);
    this.setVelocityX(chaseSpeed * direction);
    this.setFlipX(direction < 0);
  }

  private updateArmorState(delta: number): void {
    if (this.armorActive) {
      this.armorDuration -= delta;
      if (this.armorDuration <= 0) {
        this.armorActive = false;
      }
      return;
    }

    this.armorTimer -= delta;
    if (this.armorTimer <= 0) {
      this.armorActive = true;
      this.armorDuration = this.enraged ? 2200 : 1700;
      this.armorTimer = this.enraged ? 3400 : 4600;
    }
  }

  private updateAuraTint(): void {
    if (this.armorActive) {
      this.setTint(0x69dcff);
      return;
    }

    if (this.enraged) {
      this.setTint(0xff9366);
      return;
    }

    this.clearTint();
  }

  private performDash(direction: number): void {
    this.dashCooldown = true;
    this.setFlipX(direction < 0);
    this.setVelocityX(this.config.speed * (this.enraged ? 4.2 : 3.5) * direction);
    this.setVelocityY(-80);

    this.scene.time.delayedCall(320, () => {
      if (!this.active) {
        return;
      }
      this.setVelocityX(0);
    });

    this.scene.time.delayedCall(this.enraged ? 2200 : 3200, () => {
      this.dashCooldown = false;
    });
  }

  private fireMixedVolley(direction: number): void {
    this.volleyCooldown = true;
    const speed = this.enraged ? 320 : 260;
    const verticalSpeeds = [-120, -60, 0, 60, 120];

    verticalSpeeds.forEach((vy, index) => {
      this.spawnBossProjectile(
        direction * 36,
        -26 + index * 7,
        direction * (speed + index * 8),
        vy,
        0xff8e5a + index * 900,
        this.config.damage + 6
      );
    });

    this.scene.time.delayedCall(this.enraged ? 1800 : 2600, () => {
      this.volleyCooldown = false;
    });
  }

  private performPhaseShift(direction: number): void {
    if (!this.player) {
      return;
    }

    this.phaseCooldown = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.checkCollision.none = true;
    this.setAlpha(0.45);

    const offsetX = Phaser.Math.Between(90, 140) * direction;
    const targetX = Phaser.Math.Clamp(this.player.x + offsetX, 90, this.scene.scale.width - 90);
    const targetY = Phaser.Math.Clamp(this.player.y + Phaser.Math.Between(-40, 16), 60, this.scene.scale.height - 80);

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 210,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!this.active) {
          return;
        }

        body.checkCollision.none = false;
        this.setAlpha(1);
      },
    });

    this.scene.time.delayedCall(this.enraged ? 2600 : 3600, () => {
      this.phaseCooldown = false;
    });
  }

  private performLeapSlam(direction: number): void {
    this.leapCooldown = true;

    this.setVelocityX(direction * (this.enraged ? 290 : 245));
    this.setVelocityY(this.enraged ? -470 : -420);

    this.scene.time.delayedCall(620, () => {
      if (!this.active) {
        return;
      }
      this.createShockwave(direction);
    });

    this.scene.time.delayedCall(this.enraged ? 2300 : 3300, () => {
      this.leapCooldown = false;
    });
  }

  private createShockwave(direction: number): void {
    const waveZone = this.scene.add.zone(this.x + direction * 16, this.y + 14, 175, 60);
    this.scene.physics.add.existing(waveZone);

    const waveBody = waveZone.body as Phaser.Physics.Arcade.Body;
    waveBody.setAllowGravity(false);
    waveBody.setImmovable(true);

    const waveVisual = this.scene.add
      .ellipse(this.x + direction * 8, this.y + 14, 176, 52, 0xffb066, 0.26)
      .setDepth(17);

    this.addOverlapWithPlayers(
      waveZone as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      (player) => {
        if (!waveZone.active) {
          return;
        }

        const dealt = player.takeDamage(this.config.damage + 8);
        if (dealt > 0) {
          player.applyKnockback(direction * 270, -190);
        }
        waveZone.destroy();
      }
    );

    this.scene.tweens.add({
      targets: waveVisual,
      alpha: 0,
      scaleX: 1.22,
      scaleY: 1.22,
      duration: 220,
      onComplete: () => waveVisual.destroy(),
    });

    this.scene.time.delayedCall(180, () => {
      if (waveZone.active) {
        waveZone.destroy();
      }
    });
  }

  private spawnBossProjectile(
    offsetX: number,
    offsetY: number,
    velocityX: number,
    velocityY: number,
    color: number,
    damage: number
  ): void {
    const projectile = this.scene.add.circle(this.x + offsetX, this.y + offsetY, 7, color);
    this.scene.physics.add.existing(projectile);

    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(velocityX, velocityY);

    this.addOverlapWithPlayers(
      projectile as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      (player) => {
        if (!projectile.active) {
          return;
        }

        const dealt = player.takeDamage(damage);
        if (dealt > 0) {
          player.applyKnockback(velocityX > 0 ? 210 : -210, -150);
        }
        projectile.destroy();
      }
    );

    this.scene.time.delayedCall(2600, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }
}
