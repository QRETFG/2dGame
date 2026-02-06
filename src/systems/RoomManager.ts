import Phaser from 'phaser';
import { RoomData, Platform, EnemySpawn } from '../types/Room';
import { Player } from '../entities/Player';
import { Slime } from '../entities/enemies/Slime';
import { Bat } from '../entities/enemies/Bat';
import { Skeleton } from '../entities/enemies/Skeleton';
import { Enemy } from '../entities/enemies/Enemy';

// 导入房间数据
import roomStart from '../data/rooms/room-start.json';
import roomCombat1 from '../data/rooms/room-combat-1.json';
import roomCombat2 from '../data/rooms/room-combat-2.json';
import roomBoss from '../data/rooms/room-boss.json';

const TILE_SIZE = 32;

export class RoomManager {
  private scene: Phaser.Scene;
  private currentRoom: RoomData | null = null;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private enemies: Phaser.GameObjects.Group;
  private player: Player | null = null;

  private roomTemplates: Map<string, RoomData> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.platforms = scene.physics.add.staticGroup();
    this.enemies = scene.add.group();

    // 注册房间模板
    this.roomTemplates.set('room-start', roomStart as RoomData);
    this.roomTemplates.set('room-combat-1', roomCombat1 as RoomData);
    this.roomTemplates.set('room-combat-2', roomCombat2 as RoomData);
    this.roomTemplates.set('room-boss', roomBoss as RoomData);
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  getPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    return this.platforms;
  }

  getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }

  loadRoom(roomId: string): void {
    const roomData = this.roomTemplates.get(roomId);
    if (!roomData) {
      console.error(`Room not found: ${roomId}`);
      return;
    }

    this.clearRoom();
    this.currentRoom = roomData;

    // 创建平台
    this.createPlatforms(roomData.platforms);

    // 生成敌人
    this.spawnEnemies(roomData.spawns);

    // 设置玩家位置
    if (this.player) {
      this.player.setPosition(
        roomData.playerSpawn.x * TILE_SIZE + TILE_SIZE / 2,
        roomData.playerSpawn.y * TILE_SIZE
      );
    }
  }

  private clearRoom(): void {
    // 清除平台
    this.platforms.clear(true, true);

    // 清除敌人
    this.enemies.clear(true, true);
  }

  private createPlatforms(platformData: Platform[]): void {
    platformData.forEach((p) => {
      const x = p.x * TILE_SIZE + (p.width * TILE_SIZE) / 2;
      const y = p.y * TILE_SIZE + (p.height * TILE_SIZE) / 2;
      const width = p.width * TILE_SIZE;
      const height = p.height * TILE_SIZE;

      const color = p.type === 'ground' ? 0x4a4a4a : 0x6a6a6a;
      const platform = this.scene.add.rectangle(x, y, width, height, color);
      this.scene.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });
  }

  private spawnEnemies(spawns: EnemySpawn[]): void {
    if (!this.player) return;

    spawns.forEach((spawn) => {
      const x = spawn.x * TILE_SIZE + TILE_SIZE / 2;
      const y = spawn.y * TILE_SIZE;

      let enemy: Enemy;

      switch (spawn.type) {
        case 'slime':
          enemy = new Slime(this.scene, x, y);
          break;
        case 'bat':
          enemy = new Bat(this.scene, x, y);
          break;
        case 'skeleton':
          enemy = new Skeleton(this.scene, x, y);
          break;
        default:
          return;
      }

      enemy.setPlayer(this.player!);
      this.enemies.add(enemy);
    });
  }

  isRoomCleared(): boolean {
    return this.enemies.getLength() === 0;
  }

  getCurrentRoom(): RoomData | null {
    return this.currentRoom;
  }
}
