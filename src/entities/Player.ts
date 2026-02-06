import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private readonly SPEED = 200;
  private readonly JUMP_VELOCITY = -400;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle');

    // 添加到场景
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 设置物理属性
    this.setCollideWorldBounds(true);
    this.setSize(16, 24);
    this.setOffset(8, 8);

    // 设置输入
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // 播放idle动画
    this.play('player-idle-anim');
  }

  update(): void {
    const onGround = this.body?.blocked.down ?? false;

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

    // 空中动画
    if (!onGround && this.body && this.body.velocity.y > 0) {
      // 下落时保持跳跃动画的最后一帧
    }
  }
}
