import Phaser from 'phaser';

export type PlayerControlPreset = 'p1' | 'p2';

export interface PlayerOptions {
  controlPreset?: PlayerControlPreset;
  tintColor?: number;
  label?: string;
}

interface PlayerControls {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key[];
  attack: Phaser.Input.Keyboard.Key[];
  switchWeapon: Phaser.Input.Keyboard.Key[];
  block: Phaser.Input.Keyboard.Key[];
}

export interface ExternalControlState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  switchWeapon: boolean;
  block: boolean;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private controls!: PlayerControls;

  private readonly SPEED = 200;
  private readonly JUMP_VELOCITY = -400;
  private readonly MAX_JUMPS = 2;

  private isAttacking = false;
  private attackCooldown = false;
  private meleeDamageActive = false;
  private hasGun = false;
  private hasShield = false;
  private combatMode: 'melee' | 'ranged' = 'melee';
  private level = 1;
  private jumpCount = 0;
  private knockbackUntil = 0;
  private health = 100;
  private maxHealth = 100;
  private attackDamage = 10;
  private rangedDamage = 30;
  private isBlockingDamage = false;
  private readonly SHIELD_DAMAGE_REDUCTION = 0.8;
  private invincibleUntil = 0;
  private invincibleAura!: Phaser.GameObjects.Container;
  private invincibleAuraTween?: Phaser.Tweens.Tween;
  private readonly baseTintColor?: number;
  private readonly playerLabel: string;

  // 攻击碰撞区域
  private meleeHitbox!: Phaser.GameObjects.Rectangle;
  private shieldVisual!: Phaser.GameObjects.Container;
  private externalInputState: ExternalControlState = Player.createEmptyExternalControlState();
  private previousExternalInputState: ExternalControlState = Player.createEmptyExternalControlState();

  constructor(scene: Phaser.Scene, x: number, y: number, options: PlayerOptions = {}) {
    super(scene, x, y, 'player-idle');

    this.baseTintColor = options.tintColor;
    this.playerLabel = options.label ?? (options.controlPreset === 'p2' ? 'P2' : 'P1');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(16, 24);
    this.setOffset(8, 8);

    this.setupControls(options.controlPreset ?? 'p1');

    // 创建近战攻击碰撞区域（默认不可见）
    this.meleeHitbox = scene.add.rectangle(x + 20, y, 24, 24, 0xff0000, 0.3);
    scene.physics.add.existing(this.meleeHitbox, false);
    (this.meleeHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.meleeHitbox.setVisible(false);
    this.shieldVisual = this.createShieldVisual(x, y);
    this.invincibleAura = this.createInvincibleAura(x, y);

    this.play('player-idle-anim');
    this.applyBaseTint();

    // 监听动画完成
    this.on('animationcomplete', this.onAnimationComplete, this);
  }

  private setupControls(preset: PlayerControlPreset): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable');
    }

    if (preset === 'p2') {
      this.controls = {
        left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        jump: [
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO),
        ],
        attack: [
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA),
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE),
        ],
        switchWeapon: [
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD),
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO),
        ],
        block: [
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH),
          keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE),
        ],
      };
      return;
    }

    this.controls = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ],
      attack: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)],
      switchWeapon: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)],
      block: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)],
    };
  }

  private onAnimationComplete(animation: Phaser.Animations.Animation): void {
    if (animation.key === 'player-shoot-anim') {
      this.isAttacking = false;
    }
  }

  private createShieldVisual(x: number, y: number): Phaser.GameObjects.Container {
    const shieldBody = this.scene.add
      .rectangle(0, 0, 13, 18, 0x4f7dd6, 0.82)
      .setStrokeStyle(2, 0xd6e7ff, 1);
    const shieldCore = this.scene.add.rectangle(-1, 2, 6, 8, 0x1e3564, 0.92);
    const shieldRim = this.scene.add.rectangle(0, -8, 4, 3, 0xbfd5ff, 0.9);

    return this.scene.add
      .container(x, y, [shieldBody, shieldCore, shieldRim])
      .setDepth(21)
      .setVisible(false);
  }

  private createInvincibleAura(x: number, y: number): Phaser.GameObjects.Container {
    const outer = this.scene.add.ellipse(0, 0, 36, 48, 0x9ee7ff, 0.22).setStrokeStyle(2, 0xb9f2ff, 0.7);
    const inner = this.scene.add.ellipse(0, 0, 24, 32, 0x7bc9ff, 0.16);

    return this.scene.add
      .container(x, y, [outer, inner])
      .setDepth(19)
      .setVisible(false);
  }

  private applyBaseTint(): void {
    if (this.baseTintColor === undefined) {
      this.clearTint();
      return;
    }

    this.setTint(this.baseTintColor);
  }

  private updateShieldVisual(): void {
    const shouldShowShield = this.hasShield && this.isBlockingDamage;
    this.shieldVisual.setVisible(shouldShowShield);
    if (!shouldShowShield) {
      return;
    }

    const direction = this.flipX ? -1 : 1;
    this.shieldVisual.setPosition(this.x + direction * 12, this.y + 1);
    this.shieldVisual.setScale(this.flipX ? -1 : 1, 1);
  }

  private updateInvincibleAura(): void {
    const active = this.isInvincible();
    this.invincibleAura.setVisible(active);
    if (!active) {
      this.clearInvincibleVisualState();
      return;
    }

    this.invincibleAura.setPosition(this.x, this.y - 2);
  }

  private static createEmptyExternalControlState(): ExternalControlState {
    return {
      left: false,
      right: false,
      jump: false,
      attack: false,
      switchWeapon: false,
      block: false,
    };
  }

  getMeleeHitbox(): Phaser.GameObjects.Rectangle {
    return this.meleeHitbox;
  }

  getAttackDamage(): number {
    return this.attackDamage;
  }

  isMeleeDamageActive(): boolean {
    return this.meleeDamageActive;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getPlayerLabel(): string {
    return this.playerLabel;
  }

  hasRangedWeapon(): boolean {
    return this.hasGun;
  }

  hasShieldItem(): boolean {
    return this.hasShield;
  }

  isBlocking(): boolean {
    return this.isBlockingDamage;
  }

  isInvincible(): boolean {
    return this.scene.time.now < this.invincibleUntil;
  }

  getCombatMode(): 'melee' | 'ranged' {
    return this.combatMode;
  }

  getLevel(): number {
    return this.level;
  }

  setExternalInputState(input: Partial<ExternalControlState> | undefined): void {
    this.externalInputState = {
      left: !!input?.left,
      right: !!input?.right,
      jump: !!input?.jump,
      attack: !!input?.attack,
      switchWeapon: !!input?.switchWeapon,
      block: !!input?.block,
    };
  }

  unlockRangedWeapon(): void {
    this.hasGun = true;
  }

  unlockShield(): void {
    this.hasShield = true;
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  levelUp(maxHealthBonus: number = 25): void {
    this.level += 1;
    this.maxHealth += Math.max(0, Math.round(maxHealthBonus));
  }

  activateInvincibility(durationMs: number = 1000): void {
    const now = this.scene.time.now;
    this.invincibleUntil = Math.max(this.invincibleUntil, now + Math.max(0, Math.round(durationMs)));

    if (this.invincibleAuraTween?.isPlaying()) {
      return;
    }

    this.invincibleAura.setAlpha(1);
    this.invincibleAuraTween = this.scene.tweens.add({
      targets: this.invincibleAura,
      alpha: 0.42,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 170,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  takeDamage(amount: number): number {
    if (this.health <= 0 || this.isInvincible()) {
      return 0;
    }

    const incomingDamage = Math.max(0, Math.round(amount));
    if (incomingDamage <= 0) {
      return 0;
    }

    const finalDamage = this.isBlockingDamage
      ? Math.max(1, Math.floor(incomingDamage * (1 - this.SHIELD_DAMAGE_REDUCTION)))
      : incomingDamage;

    this.health = Math.max(0, this.health - finalDamage);
    this.setTint(this.isBlockingDamage ? 0x6aa8ff : 0xff0000);
    this.scene.time.delayedCall(200, () => {
      if (!this.active) {
        return;
      }
      this.applyBaseTint();
    });

    return finalDamage;
  }

  private clearInvincibleVisualState(): void {
    if (this.invincibleAuraTween) {
      this.invincibleAuraTween.stop();
      this.invincibleAuraTween = undefined;
    }

    this.invincibleAura.setScale(1).setAlpha(1);
  }

  applyKnockback(forceX: number, forceY: number): void {
    this.setVelocity(forceX, forceY);
    this.knockbackUntil = this.scene.time.now + 180;
  }

  destroy(fromScene?: boolean): void {
    this.meleeHitbox?.destroy();
    this.shieldVisual?.destroy();
    this.clearInvincibleVisualState();
    this.invincibleAura?.destroy();
    super.destroy(fromScene);
  }

  private isAnyKeyJustDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  private isAnyKeyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((key) => key.isDown);
  }

  private isVirtualActionJustPressed(key: keyof ExternalControlState): boolean {
    return this.externalInputState[key] && !this.previousExternalInputState[key];
  }

  private isJumpPressed(): boolean {
    return this.isAnyKeyJustDown(this.controls.jump) || this.isVirtualActionJustPressed('jump');
  }

  private isAttackPressed(): boolean {
    return this.isAnyKeyJustDown(this.controls.attack) || this.isVirtualActionJustPressed('attack');
  }

  private isSwitchWeaponPressed(): boolean {
    return this.isAnyKeyJustDown(this.controls.switchWeapon) || this.isVirtualActionJustPressed('switchWeapon');
  }

  private isBlockDown(): boolean {
    return this.isAnyKeyDown(this.controls.block) || this.externalInputState.block;
  }

  private isMoveLeftDown(): boolean {
    return this.controls.left.isDown || this.externalInputState.left;
  }

  private isMoveRightDown(): boolean {
    return this.controls.right.isDown || this.externalInputState.right;
  }

  private commitExternalInputFrame(): void {
    this.previousExternalInputState = { ...this.externalInputState };
  }

  private performMeleeAttack(): void {
    if (this.attackCooldown) return;

    this.isAttacking = true;
    this.attackCooldown = true;
    this.meleeDamageActive = true;

    // 更新攻击区域位置
    const offsetX = this.flipX ? -30 : 30;
    this.meleeHitbox.setPosition(this.x + offsetX, this.y);

    // 播放攻击动画
    this.play('player-shoot-anim', true);
    this.playAttackEffect();

    // 攻击判定窗口
    this.scene.time.delayedCall(150, () => {
      this.meleeDamageActive = false;
    });

    // 攻击冷却
    this.scene.time.delayedCall(400, () => {
      this.attackCooldown = false;
      this.isAttacking = false;
    });
  }

  private performRangedAttack(): void {
    if (this.attackCooldown || !this.hasGun) return;

    const direction = this.flipX ? -1 : 1;

    this.isAttacking = true;
    this.attackCooldown = true;
    this.meleeDamageActive = false;
    this.play('player-shoot-anim', true);

    this.scene.events.emit('playerShootProjectile', {
      x: this.x + direction * 20,
      y: this.y - 2,
      direction,
      damage: this.rangedDamage,
    });

    this.scene.time.delayedCall(120, () => {
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(260, () => {
      this.attackCooldown = false;
    });
  }

  private toggleCombatMode(): void {
    if (!this.hasGun) return;

    this.combatMode = this.combatMode === 'melee' ? 'ranged' : 'melee';
    this.scene.events.emit('weaponModeChanged', this.combatMode);
  }

  private playAttackEffect(): void {
    const offsetX = this.flipX ? -24 : 24;
    const effect = this.scene.add
      .sprite(this.x + offsetX, this.y, 'attack-hit')
      .setDepth(20)
      .setFlipX(this.flipX);

    effect.play('attack-hit-anim');
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      effect.destroy();
    });
  }

  update(): void {
    try {
      const onGround = this.body?.blocked.down ?? false;
      if (onGround) {
        this.jumpCount = 0;
      }

      // 更新攻击区域位置跟随玩家
      const offsetX = this.flipX ? -30 : 30;
      this.meleeHitbox.setPosition(this.x + offsetX, this.y);
      this.isBlockingDamage = this.hasShield && this.isBlockDown();
      this.updateShieldVisual();
      this.updateInvincibleAura();

      if (this.health <= 0) {
        this.setVelocity(0, 0);
        this.meleeDamageActive = false;
        this.isAttacking = false;
        return;
      }

      if (this.scene.time.now < this.knockbackUntil) {
        return;
      }

      // 攻击输入
      if (!this.isBlockingDamage && this.isAttackPressed()) {
        if (this.combatMode === 'ranged') {
          this.performRangedAttack();
        } else {
          this.performMeleeAttack();
        }
      }

      if (this.isSwitchWeaponPressed()) {
        this.toggleCombatMode();
      }

      // 攻击中不能移动（可选）
      if (this.isAttacking) return;

      // 水平移动
      const moveSpeedFactor = this.isBlockingDamage ? 0.58 : 1;
      if (this.isMoveLeftDown()) {
        this.setVelocityX(-this.SPEED * moveSpeedFactor);
        this.setFlipX(true);
        if (onGround) {
          this.play('player-run-anim', true);
        }
      } else if (this.isMoveRightDown()) {
        this.setVelocityX(this.SPEED * moveSpeedFactor);
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

      // 跳跃（二段跳）
      if (this.isJumpPressed() && this.jumpCount < this.MAX_JUMPS) {
        this.setVelocityY(this.JUMP_VELOCITY);
        this.jumpCount += 1;
        this.play('player-jump-anim', true);
      }
    } finally {
      this.commitExternalInputFrame();
    }
  }
}
