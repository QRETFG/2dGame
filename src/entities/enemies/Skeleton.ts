import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const SKELETON_CONFIG: EnemyConfig = {
  health: 50,
  damage: 20,
  speed: 80,
  detectionRange: 180,
  attackRange: 100,
  coinDrop: { min: 15, max: 25 },
};

export class Skeleton extends Enemy {
  private throwCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'skeleton-idle', SKELETON_CONFIG);

    this.setSize(16, 28);
    this.setOffset(8, 4);

    this.play('skeleton-idle-anim');
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
    }
  }

  private handleIdle(): void {
    this.setVelocityX(0);
    this.play('skeleton-idle-anim', true);

    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 1500) {
      this.patrolTimer = 0;
      this.currentState = 'patrol';
      this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
    }

    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handlePatrol(): void {
    this.setVelocityX(this.config.speed * this.patrolDirection * 0.5);
    this.setFlipX(this.patrolDirection < 0);
    this.play('skeleton-walk-anim', true);

    if (this.body?.blocked.left || this.body?.blocked.right) {
      this.patrolDirection *= -1;
    }

    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 2500) {
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

    // 在攻击范围内停下来攻击
    if (this.canAttackPlayer() && !this.throwCooldown) {
      this.currentState = 'attack';
      return;
    }

    // 追逐
    this.setVelocityX(this.config.speed * direction);
    this.setFlipX(direction < 0);
    this.play('skeleton-walk-anim', true);

    if (!this.canSeePlayer()) {
      this.currentState = 'idle';
    }
  }

  private handleAttack(): void {
    if (!this.player || this.throwCooldown) {
      this.currentState = 'chase';
      return;
    }

    this.throwCooldown = true;
    this.setVelocityX(0);
    this.play('skeleton-idle-anim', true);

    // 投掷骨头
    const direction = this.player.x < this.x ? -1 : 1;
    this.setFlipX(direction < 0);

    // 创建投射物
    this.throwBone(direction);

    // 冷却
    this.scene.time.delayedCall(1500, () => {
      this.throwCooldown = false;
      this.currentState = 'chase';
    });
  }

  private throwBone(direction: number): void {
    // 创建简单的骨头投射物
    const bone = this.scene.add.rectangle(
      this.x + direction * 20,
      this.y - 5,
      12,
      6,
      0xffffff
    );

    this.scene.physics.add.existing(bone);
    const boneBody = bone.body as Phaser.Physics.Arcade.Body;
    boneBody.setAllowGravity(false);
    boneBody.setVelocity(direction * 200, 0);

    // 旋转动画
    this.scene.tweens.add({
      targets: bone,
      rotation: direction * Math.PI * 4,
      duration: 1000,
    });

    // 检测与玩家碰撞
    this.addOverlapWithPlayers(
      bone as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      (player) => {
        const dealt = player.takeDamage(this.config.damage);
        if (dealt > 0) {
          bone.destroy();
        }
      }
    );

    // 超时销毁
    this.scene.time.delayedCall(2000, () => {
      if (bone.active) bone.destroy();
    });
  }
}
