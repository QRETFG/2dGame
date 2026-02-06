import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { HUD } from '../ui/HUD';
import { ALL_ENEMY_TYPES, RoomManager } from '../systems/RoomManager';
import { EnemyType } from '../types/Room';
import { GameMode } from '../types/GameMode';

interface PlayerProjectilePayload {
  x: number;
  y: number;
  direction: number;
  damage: number;
}

export class GameScene extends Phaser.Scene {
  private readonly TOTAL_LEVELS = 5;
  private readonly ENEMY_CONTACT_DAMAGE = 10;
  private readonly GUN_COST = 80;
  private readonly POTION_COST = 30;
  private readonly SHIELD_COST = 65;
  private readonly POTION_HEAL = 35;
  private readonly LEVEL_UP_MAX_HEALTH_BONUS = 25;
  private readonly SHOP_OFFSET_FROM_PORTAL_X = 92;
  private readonly SHOP_PANEL_X = 320;
  private readonly SHOP_PANEL_Y = 88;

  private gameMode: GameMode = 'single';
  private players: Player[] = [];
  private player!: Player;
  private hud!: HUD;
  private roomManager!: RoomManager;
  private currentRoomIndex: number = 0;
  private levelEnemyPlan: EnemyType[][] = [];
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private bgm?: Phaser.Sound.BaseSound;
  private nextRoomPortal?: Phaser.Physics.Arcade.Sprite;
  private portalOverlaps: Phaser.Physics.Arcade.Collider[] = [];
  private shopTerminal?: Phaser.Physics.Arcade.Image;
  private shopPromptText?: Phaser.GameObjects.Text;
  private shopPanelText?: Phaser.GameObjects.Text;
  private shopInfoText?: Phaser.GameObjects.Text;
  private shopGunIcon?: Phaser.GameObjects.Sprite;
  private shopPotionIcon?: Phaser.GameObjects.Image;
  private shopShieldIcon?: Phaser.GameObjects.Container;
  private keyInteract!: Phaser.Input.Keyboard.Key;
  private keyBuyGun!: Phaser.Input.Keyboard.Key;
  private keyBuyPotion!: Phaser.Input.Keyboard.Key;
  private keyBuyShield!: Phaser.Input.Keyboard.Key;
  private isNearShop = false;
  private shopOpen = false;
  private collisionsReady = false;
  private roomClearHandled = false;
  private isChangingRoom = false;
  private levelProgressText?: Phaser.GameObjects.Text;
  private enemyContactCooldownUntil = new Map<Player, number>();
  private gameOverHandled = false;
  private hitSfxCooldownUntil = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { mode?: GameMode }): void {
    this.gameMode = data?.mode ?? 'single';
  }

  create(): void {
    this.collisionsReady = false;
    this.roomClearHandled = false;
    this.isChangingRoom = false;
    this.isNearShop = false;
    this.shopOpen = false;
    this.enemyContactCooldownUntil.clear();
    this.gameOverHandled = false;

    // 添加铺满屏幕的多层背景
    this.createParallaxBackground();
    this.startBackgroundMusic();

    // 创建房间管理器
    this.roomManager = new RoomManager(this);

    // 创建玩家
    this.players = this.createPlayers();
    this.player = this.players[0];
    this.roomManager.setPlayers(this.players);

    // 加载初始房间
    this.currentRoomIndex = 0;
    this.levelEnemyPlan = this.generateLevelEnemyPlan();
    this.roomManager.loadProceduralRoom(this.currentRoomIndex, this.levelEnemyPlan[this.currentRoomIndex]);

    // 玩家远程弹道组
    this.playerBullets = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // 创建商店UI（终端在每关清怪后再生成）
    this.createShopTexts();

    // 设置碰撞
    this.setupCollisions();

    // 创建HUD
    this.hud = new HUD(this, this.players);

    // 监听敌人死亡事件
    this.events.off('enemyDied', this.onEnemyDied, this);
    this.events.on('enemyDied', this.onEnemyDied, this);

    // 监听玩家死亡事件
    this.events.off('playerDied', this.onPlayerDied, this);
    this.events.on('playerDied', this.onPlayerDied, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.stopBackgroundMusic, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.stopBackgroundMusic, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.clearNextRoomPortal, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.clearNextRoomPortal, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroyShop, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.destroyShop, this);
    this.events.off('playerShootProjectile', this.spawnPlayerBullet, this);
    this.events.on('playerShootProjectile', this.spawnPlayerBullet, this);
    this.events.off('weaponModeChanged', this.onWeaponModeChanged, this);
    this.events.on('weaponModeChanged', this.onWeaponModeChanged, this);

    this.keyInteract = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyBuyGun = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.keyBuyPotion = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.keyBuyShield = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 添加提示文字
    this.add.text(320, 30, 'P1: WASD移动 空格跳跃 J攻击 L切换 K格挡 | E商店', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(100);
    if (this.gameMode === 'coop') {
      this.add
        .text(320, 48, 'P2: ←→移动 ↑跳跃 <攻击 >切换 ?格挡', {
          fontSize: '13px',
          color: '#9ed6ff',
        })
        .setOrigin(0.5)
        .setDepth(100);
    }
    this.levelProgressText = this.add.text(548, 58, '', {
      fontSize: '14px',
      color: '#9df59d',
      backgroundColor: '#102010',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(130);
    this.updateLevelProgressText();

    this.tryHandleRoomClearState();
  }

  private createPlayers(): Player[] {
    const p1 = new Player(this, 100, 300, {
      controlPreset: 'p1',
      label: 'P1',
    });

    if (this.gameMode !== 'coop') {
      return [p1];
    }

    const p2 = new Player(this, 136, 300, {
      controlPreset: 'p2',
      tintColor: 0x92d6ff,
      label: 'P2',
    });

    return [p1, p2];
  }

  private createParallaxBackground(): void {
    this.addCoverBackground('bg-back', 0, -30);
    this.addCoverBackground('bg-far', 0.25, -20);
    this.addCoverBackground('bg-middle', 0.5, -10);
  }

  private addCoverBackground(textureKey: string, scrollFactor: number, depth: number): void {
    const camera = this.cameras.main;
    const sourceImage = this.textures.get(textureKey).getSourceImage() as { width: number; height: number };
    const scale = Math.max(camera.width / sourceImage.width, camera.height / sourceImage.height);

    this.add
      .image(camera.midPoint.x, camera.midPoint.y, textureKey)
      .setOrigin(0.5)
      .setScrollFactor(scrollFactor)
      .setDepth(depth)
      .setScale(scale);
  }

  private startBackgroundMusic(): void {
    if (this.bgm?.isPlaying) {
      return;
    }

    this.bgm = this.sound.add('bgm-main', {
      loop: true,
      volume: 0.35,
    });
    this.bgm.play();
  }

  private stopBackgroundMusic(): void {
    if (!this.bgm) {
      return;
    }

    this.bgm.stop();
    this.bgm.destroy();
    this.bgm = undefined;
  }

  private setupCollisions(): void {
    if (this.collisionsReady) {
      return;
    }

    this.collisionsReady = true;
    const platforms = this.roomManager.getPlatforms();
    const enemies = this.roomManager.getEnemies();

    // 玩家与平台碰撞
    this.players.forEach((player) => {
      this.physics.add.collider(player, platforms);
    });

    // 敌人与平台碰撞
    this.physics.add.collider(enemies, platforms);

    this.players.forEach((player) => {
      // 玩家攻击与敌人碰撞
      this.physics.add.overlap(
        player.getMeleeHitbox(),
        enemies,
        this.handlePlayerAttack,
        undefined,
        this
      );

      // 玩家与敌人碰撞
      this.physics.add.overlap(
        player,
        enemies,
        this.handleEnemyCollision,
        undefined,
        this
      );
    });

    this.physics.add.overlap(
      this.playerBullets,
      enemies,
      this.handleBulletHitEnemy,
      undefined,
      this
    );

    this.physics.add.collider(this.playerBullets, platforms, this.handleBulletHitPlatform, undefined, this);
  }

  private handlePlayerAttack(
    hitboxObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    const attacker = this.resolvePlayerByHitbox(hitboxObj);
    if (!attacker) {
      return;
    }

    if (attacker.isMeleeDamageActive()) {
      enemy.takeDamage(attacker.getAttackDamage());
      this.playHitSfx();
    }
  }

  private handleEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    if (!this.players.includes(player) || player.getHealth() <= 0) {
      return;
    }

    const cooldownUntil = this.enemyContactCooldownUntil.get(player) ?? 0;
    if (this.time.now < cooldownUntil) {
      return;
    }

    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    const actualDamage = player.takeDamage(this.ENEMY_CONTACT_DAMAGE);
    if (actualDamage <= 0) {
      return;
    }

    const isBlocking = player.isBlocking();
    const pushDirection = player.x < enemy.x ? -1 : 1;
    player.applyKnockback(pushDirection * (isBlocking ? 120 : 260), isBlocking ? -140 : -230);
    this.enemyContactCooldownUntil.set(player, this.time.now + 450);
  }

  private onEnemyDied(x: number, y: number, coins: number): void {
    this.hud.addCoins(coins);

    // 显示金币数字
    const coinText = this.add.text(x, y - 20, `+${coins}`, {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: coinText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => coinText.destroy(),
    });

    this.tryHandleRoomClearState();
  }

  private tryHandleRoomClearState(): void {
    if (!this.roomManager.isRoomCleared() || this.roomClearHandled) {
      return;
    }

    this.roomClearHandled = true;
    this.showRoomClearedMessage();

    if (this.currentRoomIndex < this.TOTAL_LEVELS - 1) {
      this.spawnNextRoomPortal();
      this.spawnShopTerminalNearPortal();
    }
  }

  private showRoomClearedMessage(): void {
    if (this.currentRoomIndex < this.TOTAL_LEVELS - 1) {
      const msg = this.add.text(320, 192, '房间已清空! 进入传送门前往下一关', {
        fontSize: '20px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setDepth(200);

      this.tweens.add({
        targets: msg,
        alpha: 0,
        duration: 3000,
        delay: 2000,
        onComplete: () => msg.destroy(),
      });
    } else {
      // 最后一个房间清空，游戏胜利
      this.time.delayedCall(1000, () => {
        this.scene.start('GameOverScene', { victory: true, mode: this.gameMode });
      });
    }
  }

  private onPlayerDied(): void {
    this.closeShop();
    this.clearShopTerminal();
    this.clearNextRoomPortal();
    this.scene.start('GameOverScene', { victory: false, mode: this.gameMode });
  }

  private spawnNextRoomPortal(): void {
    if (this.nextRoomPortal) {
      return;
    }

    const room = this.roomManager.getCurrentRoom();
    if (!room) {
      return;
    }

    const portalX = (room.width - 1.5) * 32;
    const portalY = (room.height - 2) * 32;

    this.nextRoomPortal = this.physics.add.sprite(portalX, portalY, 'portal-1');
    this.nextRoomPortal
      .setScale(2)
      .setDepth(15)
      .setImmovable(true)
      .play('portal-idle-anim');

    const portalBody = this.nextRoomPortal.body as Phaser.Physics.Arcade.Body;
    portalBody.setAllowGravity(false);
    portalBody.setVelocity(0, 0);

    this.tweens.add({
      targets: this.nextRoomPortal,
      y: portalY - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.portalOverlaps = this.players.map((player) =>
      this.physics.add.overlap(player, this.nextRoomPortal!, this.enterNextRoom, undefined, this)
    );
  }

  private clearNextRoomPortal(): void {
    this.portalOverlaps.forEach((overlap) => overlap.destroy());
    this.portalOverlaps = [];

    if (this.nextRoomPortal) {
      this.nextRoomPortal.destroy();
      this.nextRoomPortal = undefined;
    }
  }

  private enterNextRoom(): void {
    if (this.isChangingRoom) {
      return;
    }

    // 只有当房间清空且不是最后一个房间时才能进入下一房间
    if (this.roomManager.isRoomCleared() && this.currentRoomIndex < this.TOTAL_LEVELS - 1) {
      this.isChangingRoom = true;
      this.currentRoomIndex++;
      this.players.forEach((player) => player.levelUp(this.LEVEL_UP_MAX_HEALTH_BONUS));
      this.showLevelUpText();
      this.roomClearHandled = false;
      this.closeShop();
      this.clearShopTerminal();
      this.clearNextRoomPortal();
      this.roomManager.loadProceduralRoom(this.currentRoomIndex, this.levelEnemyPlan[this.currentRoomIndex]);
      this.players.forEach((player) => player.activateInvincibility(1000));
      this.updateLevelProgressText();
      this.time.delayedCall(100, () => {
        this.isChangingRoom = false;
        this.tryHandleRoomClearState();
      });
    }
  }

  private showLevelUpText(): void {
    const levelRef = this.players[0];
    const text = this.add
      .text(
        320,
        72,
        `${this.gameMode === 'coop' ? '全员' : '玩家'}升级 Lv.${levelRef.getLevel()}  最大生命 +${this.LEVEL_UP_MAX_HEALTH_BONUS}`,
        {
          fontSize: '18px',
          color: '#9df59d',
          backgroundColor: '#102010',
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setDepth(210)
      .setScrollFactor(0);

    this.tweens.add({
      targets: text,
      y: 56,
      alpha: 0,
      duration: 1700,
      ease: 'Sine.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  private handleBulletHitEnemy(
    firstObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    secondObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = this.resolveBulletObject(firstObj, secondObj);
    const enemy = this.resolveEnemyObject(firstObj, secondObj);

    if (!bullet || !enemy) {
      return;
    }

    if (!bullet.active || enemy.isDying()) {
      return;
    }

    const damage = bullet.getData('damage') as number;

    // 先禁用子弹避免同一帧重复触发碰撞，再结算伤害
    bullet.disableBody(true, true);
    enemy.takeDamage(damage || 1);
    this.playHitSfx(1.1);
    bullet.destroy();
  }

  private handleBulletHitPlatform(
    firstObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    secondObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = this.resolveBulletObject(firstObj, secondObj);
    if (!bullet) {
      return;
    }

    bullet.disableBody(true, true);
    bullet.destroy();
  }

  private spawnPlayerBullet(payload: PlayerProjectilePayload): void {
    const bullet = this.playerBullets.create(payload.x, payload.y, 'bullet-shot') as Phaser.Physics.Arcade.Sprite;
    bullet
      .setDepth(16)
      .setScale(1)
      .setFlipX(payload.direction < 0)
      .play('bullet-shot-anim');
    bullet.setData('isPlayerBullet', true);
    bullet.setData('damage', payload.damage);
    bullet.setVelocityX(payload.direction * 430);
    bullet.setVelocityY(0);

    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(10, 10, true);

    this.time.delayedCall(900, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }

  private resolveEnemyObject(
    firstObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    secondObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): Enemy | undefined {
    if (firstObj instanceof Enemy) {
      return firstObj;
    }

    if (secondObj instanceof Enemy) {
      return secondObj;
    }

    return undefined;
  }

  private resolveBulletObject(
    firstObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    secondObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): Phaser.Physics.Arcade.Sprite | undefined {
    const first = firstObj as Phaser.Physics.Arcade.Sprite;
    const second = secondObj as Phaser.Physics.Arcade.Sprite;

    if (first.getData && first.getData('isPlayerBullet')) {
      return first;
    }

    if (second.getData && second.getData('isPlayerBullet')) {
      return second;
    }

    return undefined;
  }

  private resolvePlayerByHitbox(
    hitboxObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): Player | undefined {
    return this.players.find((player) => player.getMeleeHitbox() === hitboxObj);
  }

  private getPrimaryPlayer(): Player {
    return this.players.find((player) => player.getHealth() > 0) ?? this.player;
  }

  private createShopTexts(): void {
    this.shopPanelText = this.add.text(this.SHOP_PANEL_X, this.SHOP_PANEL_Y, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 6 },
      align: 'left',
    });
    this.shopPanelText.setOrigin(0.5, 0).setScrollFactor(0).setDepth(130).setVisible(false);

    this.shopInfoText = this.add.text(this.SHOP_PANEL_X, 176, '', {
      fontSize: '13px',
      color: '#ffd166',
      backgroundColor: '#1c1c1c',
      padding: { x: 8, y: 4 },
    });
    this.shopInfoText.setOrigin(0.5, 0).setScrollFactor(0).setDepth(130).setVisible(false);

    this.shopGunIcon = this.add.sprite(242, 97, 'bullet-shot', 0);
    this.shopGunIcon.setScale(1.4).setScrollFactor(0).setDepth(131).setVisible(false);

    this.shopPotionIcon = this.add.image(242, 122, 'shop-potion');
    this.shopPotionIcon.setScale(0.9).setScrollFactor(0).setDepth(131).setVisible(false);

    const shieldBody = this.add
      .rectangle(0, 0, 14, 16, 0x4b78d8, 1)
      .setStrokeStyle(2, 0xbcd3ff, 1);
    const shieldCore = this.add.rectangle(0, 2, 6, 6, 0x153465, 0.95);
    this.shopShieldIcon = this.add.container(242, 147, [shieldBody, shieldCore]);
    this.shopShieldIcon.setScale(1.05).setScrollFactor(0).setDepth(131).setVisible(false);
    this.layoutShopUi();
  }

  private spawnShopTerminalNearPortal(): void {
    if (this.shopTerminal || !this.nextRoomPortal) {
      return;
    }

    const room = this.roomManager.getCurrentRoom();
    if (!room) {
      return;
    }

    const terminalX = this.nextRoomPortal.x - this.SHOP_OFFSET_FROM_PORTAL_X;
    this.shopTerminal = this.physics.add.image(terminalX, 0, 'shop-terminal').setScale(2).setDepth(16);
    this.shopTerminal.setImmovable(true);

    const groundTopY = (room.height - 1) * 32;
    const terminalY = groundTopY - this.shopTerminal.displayHeight / 2 + 1;
    this.shopTerminal.setPosition(terminalX, terminalY);

    const body = this.shopTerminal.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    body.setSize(this.shopTerminal.displayWidth, this.shopTerminal.displayHeight, true);

    this.shopPromptText = this.add.text(terminalX, terminalY - this.shopTerminal.displayHeight / 2 - 12, '商店 [E]', {
      fontSize: '13px',
      color: '#8be9fd',
      backgroundColor: '#102028',
      padding: { x: 7, y: 3 },
    }).setOrigin(0.5).setDepth(131);
  }

  private clearShopTerminal(): void {
    this.shopTerminal?.destroy();
    this.shopTerminal = undefined;
    this.shopPromptText?.destroy();
    this.shopPromptText = undefined;
    this.isNearShop = false;
  }

  private updateShopState(): void {
    if (!this.shopTerminal) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.getPrimaryPlayer().x,
      this.getPrimaryPlayer().y,
      this.shopTerminal.x,
      this.shopTerminal.y
    );
    const nearShop = distance <= 70;
    if (!nearShop && this.shopOpen) {
      this.closeShop();
    }

    this.isNearShop = nearShop;

    if (this.isNearShop && Phaser.Input.Keyboard.JustDown(this.keyInteract)) {
      this.shopOpen ? this.closeShop() : this.openShop();
    }

    if (!this.shopOpen || !this.isNearShop) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyBuyGun)) {
      this.buyGun();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyBuyPotion)) {
      this.buyPotion();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyBuyShield)) {
      this.buyShield();
    }
  }

  private openShop(): void {
    this.shopOpen = true;
    this.renderShopPanel();
    this.shopPanelText?.setVisible(true);
    this.shopInfoText?.setVisible(true).setText('按1/2/3购买，按E关闭商店');
    this.shopGunIcon?.setVisible(true).play('bullet-shot-anim');
    this.shopPotionIcon?.setVisible(true);
    this.shopShieldIcon?.setVisible(true);
  }

  private closeShop(): void {
    this.shopOpen = false;
    this.shopPanelText?.setVisible(false);
    this.shopInfoText?.setVisible(false);
    this.shopGunIcon?.setVisible(false).stop();
    this.shopPotionIcon?.setVisible(false);
    this.shopShieldIcon?.setVisible(false);
  }

  private renderShopPanel(): void {
    if (!this.shopPanelText) {
      return;
    }

    const shopPlayer = this.getPrimaryPlayer();
    const gunLine = shopPlayer.hasRangedWeapon()
      ? `1. 远程枪械 [已购买]`
      : `1. 远程枪械 ${this.GUN_COST} 金币`;
    const potionLine = `2. 生命药水 ${this.POTION_COST} 金币 (+${this.POTION_HEAL}HP)`;
    const shieldLine = shopPlayer.hasShieldItem()
      ? '3. 守护盾牌 [已购买]'
      : `3. 守护盾牌 ${this.SHIELD_COST} 金币`;
    const modeLine = `当前武器: ${shopPlayer.getCombatMode() === 'ranged' ? '远程' : '近战'}`;
    const guardLine = `格挡状态: ${shopPlayer.hasShieldItem() ? 'K按住可减伤' : '未解锁'}`;

    this.shopPanelText.setText(`${gunLine}\n${potionLine}\n${shieldLine}\n${modeLine}\n${guardLine}`);
    this.layoutShopUi();
  }

  private layoutShopUi(): void {
    if (!this.shopPanelText) {
      return;
    }

    const panelLeftX = this.shopPanelText.x - this.shopPanelText.width / 2;
    const iconX = panelLeftX - 12;
    const lineTopY = this.shopPanelText.y + 10;
    const lineGap = 24;

    this.shopGunIcon?.setPosition(iconX, lineTopY);
    this.shopPotionIcon?.setPosition(iconX, lineTopY + lineGap);
    this.shopShieldIcon?.setPosition(iconX, lineTopY + lineGap * 2);

    this.shopInfoText?.setPosition(this.shopPanelText.x, this.shopPanelText.y + this.shopPanelText.height + 8);
  }

  private buyGun(): void {
    const shopPlayer = this.getPrimaryPlayer();
    if (shopPlayer.hasRangedWeapon()) {
      this.showShopInfo('枪械已拥有');
      return;
    }

    if (!this.hud.spendCoins(this.GUN_COST)) {
      this.showShopInfo('金币不足，无法购买枪械', '#ff8a80');
      return;
    }

    this.players.forEach((player) => player.unlockRangedWeapon());
    this.renderShopPanel();
    this.showShopInfo('购买成功：已解锁枪械，按L切换武器');
  }

  private buyPotion(): void {
    const healTargets = this.gameMode === 'coop' ? this.players : [this.getPrimaryPlayer()];
    const hasAnyMissingHealth = healTargets.some((player) => player.getHealth() < player.getMaxHealth());
    if (!hasAnyMissingHealth) {
      this.showShopInfo('生命值已满');
      return;
    }

    if (!this.hud.spendCoins(this.POTION_COST)) {
      this.showShopInfo('金币不足，无法购买药水', '#ff8a80');
      return;
    }

    healTargets.forEach((player) => {
      player.heal(this.POTION_HEAL);
    });
    this.renderShopPanel();
    this.showShopInfo(this.gameMode === 'coop'
      ? `全员恢复 ${this.POTION_HEAL} 点生命`
      : `恢复 ${this.POTION_HEAL} 点生命`);
  }

  private buyShield(): void {
    const shopPlayer = this.getPrimaryPlayer();
    if (shopPlayer.hasShieldItem()) {
      this.showShopInfo('盾牌已拥有');
      return;
    }

    if (!this.hud.spendCoins(this.SHIELD_COST)) {
      this.showShopInfo('金币不足，无法购买盾牌', '#ff8a80');
      return;
    }

    this.players.forEach((player) => player.unlockShield());
    this.renderShopPanel();
    this.showShopInfo('购买成功：按住K可格挡伤害');
  }

  private showShopInfo(message: string, color: string = '#ffd166'): void {
    if (!this.shopInfoText) {
      return;
    }

    this.shopInfoText.setVisible(true).setColor(color).setText(message);
  }

  private onWeaponModeChanged(mode: 'melee' | 'ranged'): void {
    if (!this.shopOpen) {
      return;
    }

    const modeLabel = mode === 'ranged' ? '远程' : '近战';
    this.renderShopPanel();
    this.showShopInfo(`切换到${modeLabel}武器`);
  }

  private destroyShop(): void {
    this.clearShopTerminal();
    this.shopPanelText?.destroy();
    this.shopPanelText = undefined;
    this.shopInfoText?.destroy();
    this.shopInfoText = undefined;
    this.shopGunIcon?.destroy();
    this.shopGunIcon = undefined;
    this.shopPotionIcon?.destroy();
    this.shopPotionIcon = undefined;
    this.shopShieldIcon?.destroy();
    this.shopShieldIcon = undefined;
  }

  private playHitSfx(pitchMultiplier: number = 1): void {
    const nowMs = this.time.now;
    if (nowMs < this.hitSfxCooldownUntil) {
      return;
    }
    this.hitSfxCooldownUntil = nowMs + 35;

    const manager = this.sound as unknown as { context?: AudioContext };
    const audioContext = manager.context;
    if (!audioContext) {
      return;
    }

    const startAt = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(240 * pitchMultiplier, startAt);
    osc.frequency.exponentialRampToValueAtTime(105 * pitchMultiplier, startAt + 0.08);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.07, startAt + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.09);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(startAt);
    osc.stop(startAt + 0.095);
  }

  private updateLevelProgressText(): void {
    this.levelProgressText?.setText(`第 ${this.currentRoomIndex + 1}/${this.TOTAL_LEVELS} 关`);
  }

  private generateLevelEnemyPlan(): EnemyType[][] {
    const plans = Array.from({ length: this.TOTAL_LEVELS }, () => [] as EnemyType[]);
    const bossLevelIndex = this.TOTAL_LEVELS - 1;
    const regularLevelIndexes = Array.from({ length: bossLevelIndex }, (_, index) => index);
    const fixedEnemyCounts = [6, 7, 8, 9];
    const shuffledTypes = Phaser.Utils.Array.Shuffle([...ALL_ENEMY_TYPES]);

    // 前4关覆盖全部普通怪物素材
    shuffledTypes.forEach((enemyType, index) => {
      const levelIndex = regularLevelIndexes[index % regularLevelIndexes.length];
      plans[levelIndex].push(enemyType);
    });

    regularLevelIndexes.forEach((levelIndex) => {
      const plan = plans[levelIndex];
      const targetCount = fixedEnemyCounts[levelIndex];
      while (plan.length < targetCount) {
        plan.push(Phaser.Utils.Array.GetRandom(ALL_ENEMY_TYPES));
      }

      // 保证每关至少2种怪物类型
      while (new Set(plan).size < 2) {
        const replacementIndex = Phaser.Math.Between(0, plan.length - 1);
        const current = plan[replacementIndex];
        const replacementPool = ALL_ENEMY_TYPES.filter((type) => type !== current);
        plan[replacementIndex] = Phaser.Utils.Array.GetRandom(replacementPool);
      }

      Phaser.Utils.Array.Shuffle(plan);
    });

    plans[bossLevelIndex] = ['fusion-boss'];
    return plans;
  }

  update(): void {
    this.players.forEach((player) => player.update());
    this.hud.update();

    // 更新所有敌人
    this.roomManager.getEnemies().getChildren().forEach((enemy) => {
      (enemy as Enemy).update();
    });

    this.updateShopState();
    this.tryHandleRoomClearState();

    // 检查玩家是否全灭
    const allDefeated = this.players.every((player) => player.getHealth() <= 0);
    if (allDefeated && !this.gameOverHandled) {
      this.gameOverHandled = true;
      this.events.emit('playerDied');
    }
  }
}
