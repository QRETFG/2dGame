import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { HUD } from '../ui/HUD';
import { RoomManager } from '../systems/RoomManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private hud!: HUD;
  private roomManager!: RoomManager;
  private currentRoomIndex: number = 0;
  private roomSequence: string[] = ['room-start', 'room-combat-1', 'room-combat-2', 'room-boss'];
  private keyE!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 添加背景
    this.add.image(320, 192, 'bg-back').setScrollFactor(0);
    this.add.image(320, 192, 'bg-far').setScrollFactor(0.25);
    this.add.image(320, 192, 'bg-middle').setScrollFactor(0.5);

    // 创建房间管理器
    this.roomManager = new RoomManager(this);

    // 创建玩家
    this.player = new Player(this, 100, 300);
    this.roomManager.setPlayer(this.player);

    // 加载初始房间
    this.currentRoomIndex = 0;
    this.roomManager.loadRoom(this.roomSequence[this.currentRoomIndex]);

    // 设置碰撞
    this.setupCollisions();

    // 创建HUD
    this.hud = new HUD(this, this.player);

    // 监听敌人死亡事件
    this.events.on('enemyDied', this.onEnemyDied, this);

    // 监听玩家死亡事件
    this.events.on('playerDied', this.onPlayerDied, this);

    // 添加E键用于切换房间
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // 添加提示文字
    this.add.text(320, 30, 'WASD移动 | 空格跳跃 | J攻击 | E进入下一房间', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(100);
  }

  private setupCollisions(): void {
    const platforms = this.roomManager.getPlatforms();
    const enemies = this.roomManager.getEnemies();

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, platforms);

    // 敌人与平台碰撞
    this.physics.add.collider(enemies, platforms);

    // 玩家攻击与敌人碰撞
    this.physics.add.overlap(
      this.player.getMeleeHitbox(),
      enemies,
      this.handlePlayerAttack,
      undefined,
      this
    );

    // 玩家与敌人碰撞
    this.physics.add.overlap(
      this.player,
      enemies,
      this.handleEnemyCollision,
      undefined,
      this
    );
  }

  private handlePlayerAttack(
    hitbox: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    // 只有当攻击区域可见时才造成伤害
    const hitboxRect = hitbox as Phaser.GameObjects.Rectangle;
    if (hitboxRect.visible) {
      enemy.takeDamage(this.player.getAttackDamage());
    }
  }

  private handleEnemyCollision(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    this.player.takeDamage(enemy.getDamage());
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

    // 检查是否清空房间
    if (this.roomManager.isRoomCleared()) {
      this.showRoomClearedMessage();
    }
  }

  private showRoomClearedMessage(): void {
    if (this.currentRoomIndex < this.roomSequence.length - 1) {
      const msg = this.add.text(320, 192, '房间已清空! 按E进入下一房间', {
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
        this.scene.start('GameOverScene', { victory: true });
      });
    }
  }

  private onPlayerDied(): void {
    this.scene.start('GameOverScene', { victory: false });
  }

  private tryNextRoom(): void {
    // 只有当房间清空且不是最后一个房间时才能进入下一房间
    if (this.roomManager.isRoomCleared() && this.currentRoomIndex < this.roomSequence.length - 1) {
      this.currentRoomIndex++;
      this.roomManager.loadRoom(this.roomSequence[this.currentRoomIndex]);

      // 重新设置碰撞
      this.setupCollisions();
    }
  }

  update(): void {
    this.player.update();
    this.hud.update();

    // 更新所有敌人
    this.roomManager.getEnemies().getChildren().forEach((enemy) => {
      (enemy as Enemy).update();
    });

    // 检查E键进入下一房间
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.tryNextRoom();
    }

    // 检查玩家是否死亡
    if (this.player.getHealth() <= 0) {
      this.events.emit('playerDied');
    }
  }
}
