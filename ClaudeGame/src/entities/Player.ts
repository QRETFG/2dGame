import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private attackKey!: Phaser.Input.Keyboard.Key;

  private readonly SPEED = 200;
  private readonly JUMP_VELOCITY = -400;

  private isAttacking = false;
  private attackCooldown = false;
  private health = 100;
  private maxHealth = 100;
  private attackDamage = 10;

  // 攻击碰撞区域
  private meleeHitbox!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(16, 24);
    this.setOffset(8, 8);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    }

    // 创建近战攻击碰撞区域（默认不可见）
    this.meleeHitbox = scene.add.rectangle(x + 20, y, 24, 24, 0xff0000, 0.3);
    scene.physics.add.existing(this.meleeHitbox, false);
    (this.meleeHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.meleeHitbox.setVisible(false);

    this.play('player-idle-anim');

    // 监听动画完成
    this.on('animationcomplete', this.onAnimationComplete, this);
  }

  private onAnimationComplete(animation: Phaser.Animations.Animation): void {
    if (animation.key === 'player-shoot-anim') {
      this.isAttacking = false;
    }
  }

  getMeleeHitbox(): Phaser.GameObjects.Rectangle {
    return this.meleeHitbox;
  }

  getAttackDamage(): number {
    return this.attackDamage;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
  }

  private performMeleeAttack(): void {
    if (this.attackCooldown) return;

    this.isAttacking = true;
    this.attackCooldown = true;

    // 显示攻击区域
    this.meleeHitbox.setVisible(true);

    // 更新攻击区域位置
    const offsetX = this.flipX ? -30 : 30;
    this.meleeHitbox.setPosition(this.x + offsetX, this.y);

    // 播放攻击动画
    this.play('player-shoot-anim', true);

    // 延迟隐藏攻击区域
    this.scene.time.delayedCall(150, () => {
      this.meleeHitbox.setVisible(false);
    });

    // 攻击冷却
    this.scene.time.delayedCall(400, () => {
      this.attackCooldown = false;
      this.isAttacking = false;
    });
  }

  update(): void {
    const onGround = this.body?.blocked.down ?? false;

    // 更新攻击区域位置跟随玩家
    const offsetX = this.flipX ? -30 : 30;
    this.meleeHitbox.setPosition(this.x + offsetX, this.y);

    // 攻击输入
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.performMeleeAttack();
    }

    // 攻击中不能移动（可选）
    if (this.isAttacking) return;

    // 水平移动
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.setVelocityX(-this.SPEED);
      this.setFlipX(true);
      if (onGround) {
        this.play('player-run-anim', true);
      }
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.setVelocityX(this.SPEED);
      this.setFlipX(false);
      if (onGround) {
        this.play('player-run-anim', true);
      }
    } else {
      this.setVelocityX(0);
      if (onGround) {
        this.play('player-idle-anim', true);
      }
    }

    // 跳跃
    if ((this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space.isDown) && onGround) {
      this.setVelocityY(this.JUMP_VELOCITY);
      this.play('player-jump-anim', true);
    }
  }
}
