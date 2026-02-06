import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Slime } from '../entities/enemies/Slime';
import { Bat } from '../entities/enemies/Bat';
import { Enemy } from '../entities/enemies/Enemy';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 添加背景
    this.add.image(320, 192, 'bg-back').setScrollFactor(0);
    this.add.image(320, 192, 'bg-far').setScrollFactor(0.25);
    this.add.image(320, 192, 'bg-middle').setScrollFactor(0.5);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 创建地面
    const ground = this.add.rectangle(320, 370, 640, 28, 0x4a4a4a);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    // 创建平台
    const platform1 = this.add.rectangle(200, 280, 120, 16, 0x4a4a4a);
    this.physics.add.existing(platform1, true);
    this.platforms.add(platform1);

    const platform2 = this.add.rectangle(450, 200, 120, 16, 0x4a4a4a);
    this.physics.add.existing(platform2, true);
    this.platforms.add(platform2);

    // 创建玩家
    this.player = new Player(this, 100, 300);
    this.physics.add.collider(this.player, this.platforms);

    // 创建敌人组
    this.enemies = this.add.group();

    // 添加Slime敌人
    const slime1 = new Slime(this, 400, 300);
    slime1.setPlayer(this.player);
    this.enemies.add(slime1);

    const slime2 = new Slime(this, 500, 300);
    slime2.setPlayer(this.player);
    this.enemies.add(slime2);

    // 添加Bat敌人
    const bat1 = new Bat(this, 300, 100);
    bat1.setPlayer(this.player);
    this.enemies.add(bat1);

    // 敌人与平台碰撞
    this.physics.add.collider(this.enemies, this.platforms);

    // 玩家攻击与敌人碰撞
    this.physics.add.overlap(
      this.player.getMeleeHitbox(),
      this.enemies,
      this.handlePlayerAttack,
      undefined,
      this
    );

    // 玩家与敌人碰撞
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyCollision,
      undefined,
      this
    );

    // 监听敌人死亡事件
    this.events.on('enemyDied', this.onEnemyDied, this);

    // 添加提示文字
    this.add.text(320, 30, 'WASD移动 | 空格跳跃 | J攻击', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
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

  private onEnemyDied(_x: number, _y: number, coins: number): void {
    console.log(`敌人死亡! 掉落 ${coins} 金币`);
    // TODO: 生成金币拾取物
  }

  update(): void {
    this.player.update();

    // 更新所有敌人
    this.enemies.getChildren().forEach((enemy) => {
      (enemy as Enemy).update();
    });
  }
}
