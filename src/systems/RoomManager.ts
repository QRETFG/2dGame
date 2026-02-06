import Phaser from 'phaser';
import { RoomData, Platform, EnemySpawn, EnemyType } from '../types/Room';
import { Player } from '../entities/Player';
import { Slime } from '../entities/enemies/Slime';
import { Bat } from '../entities/enemies/Bat';
import { Skeleton } from '../entities/enemies/Skeleton';
import { Enemy } from '../entities/enemies/Enemy';
import { Crab } from '../entities/enemies/Crab';
import { CrystalSnail } from '../entities/enemies/CrystalSnail';
import { FlyEye } from '../entities/enemies/FlyEye';
import { Ghost } from '../entities/enemies/Ghost';
import { Lizard } from '../entities/enemies/Lizard';
import { MiniDemon } from '../entities/enemies/MiniDemon';
import { FusionBoss } from '../entities/enemies/FusionBoss';

const TILE_SIZE = 32;
const ROOM_WIDTH = 20;
const ROOM_HEIGHT = 12;

export const ALL_ENEMY_TYPES: EnemyType[] = [
  'slime',
  'bat',
  'skeleton',
  'crab',
  'crystal-snail',
  'fly-eye',
  'ghost',
  'lizard',
  'mini-demon',
];

export class RoomManager {
  private scene: Phaser.Scene;
  private currentRoom: RoomData | null = null;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private platformVisuals: Phaser.GameObjects.Image[] = [];
  private enemies: Phaser.GameObjects.Group;
  private players: Player[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.platforms = scene.physics.add.staticGroup();
    this.enemies = scene.add.group();
  }

  setPlayers(players: Player[]): void {
    this.players = players;
  }

  getPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    return this.platforms;
  }

  getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }

  loadProceduralRoom(levelIndex: number, levelEnemies: EnemyType[]): void {
    const isBossLevel = levelEnemies.includes('fusion-boss');
    const roomData = isBossLevel
      ? this.createBossRoom(levelIndex)
      : this.createProceduralRoom(levelIndex, levelEnemies);

    this.clearRoom();
    this.currentRoom = roomData;

    this.createPlatforms(roomData.platforms);
    this.spawnEnemies(roomData.spawns);

    this.players.forEach((player, index) => {
      const spawnOffset = index * 28;
      player.setPosition(
        roomData.playerSpawn.x * TILE_SIZE + TILE_SIZE / 2 + spawnOffset,
        roomData.playerSpawn.y * TILE_SIZE
      );
    });
  }

  private createProceduralRoom(levelIndex: number, levelEnemies: EnemyType[]): RoomData {
    const platforms = this.generateRandomPlatforms();
    const spawns = this.generateEnemySpawns(platforms, levelEnemies);

    return {
      id: `level-${levelIndex + 1}`,
      type: 'procedural',
      width: ROOM_WIDTH,
      height: ROOM_HEIGHT,
      exits: { right: true },
      platforms,
      spawns,
      playerSpawn: { x: 2, y: 9 },
    };
  }

  private createBossRoom(levelIndex: number): RoomData {
    return {
      id: `level-${levelIndex + 1}-boss`,
      type: 'boss',
      width: ROOM_WIDTH,
      height: ROOM_HEIGHT,
      exits: { right: false },
      platforms: [
        { x: 0, y: 11, width: ROOM_WIDTH, height: 1, type: 'ground' },
        { x: 5, y: 8, width: 4, height: 1, type: 'platform' },
        { x: 11, y: 8, width: 4, height: 1, type: 'platform' },
        { x: 8, y: 6, width: 4, height: 1, type: 'platform' },
      ],
      spawns: [{ x: 13, y: 10, type: 'fusion-boss' }],
      playerSpawn: { x: 2, y: 9 },
    };
  }

  private generateRandomPlatforms(): Platform[] {
    const platforms: Platform[] = [
      { x: 0, y: 11, width: ROOM_WIDTH, height: 1, type: 'ground' },
    ];

    const extraPlatformCount = Phaser.Math.Between(4, 7);
    let attempts = 0;

    while (platforms.length < extraPlatformCount + 1 && attempts < 120) {
      attempts += 1;
      const width = Phaser.Math.Between(2, 5);
      const x = Phaser.Math.Between(1, ROOM_WIDTH - width - 1);
      const y = Phaser.Math.Between(4, 9);

      const isOverlapping = platforms.some((platform) => {
        if (platform.type === 'ground') {
          return false;
        }

        const overlapsX = x <= platform.x + platform.width && x + width >= platform.x;
        const nearY = Math.abs(y - platform.y) <= 1;
        return overlapsX && nearY;
      });

      if (isOverlapping) {
        continue;
      }

      platforms.push({ x, y, width, height: 1, type: 'platform' });
    }

    return platforms;
  }

  private generateEnemySpawns(platforms: Platform[], levelEnemies: EnemyType[]): EnemySpawn[] {
    const groundPositions = this.collectGroundSpawnPositions(platforms);
    const usedPositionKeys = new Set<string>();

    return levelEnemies.map((enemyType) => {
      const isFlying = enemyType === 'bat' || enemyType === 'fly-eye' || enemyType === 'ghost';

      let spawnX = 5;
      let spawnY = 9;

      if (isFlying) {
        for (let i = 0; i < 24; i++) {
          const candidateX = Phaser.Math.Between(5, ROOM_WIDTH - 2);
          const candidateY = Phaser.Math.Between(2, 8);
          const key = `${candidateX},${candidateY}`;
          if (!usedPositionKeys.has(key)) {
            spawnX = candidateX;
            spawnY = candidateY;
            usedPositionKeys.add(key);
            break;
          }
        }
      } else if (groundPositions.length > 0) {
        for (let i = 0; i < 24; i++) {
          const candidate = Phaser.Utils.Array.GetRandom(groundPositions);
          const key = `${candidate.x},${candidate.y}`;
          if (!usedPositionKeys.has(key) && candidate.x >= 4) {
            spawnX = candidate.x;
            spawnY = candidate.y;
            usedPositionKeys.add(key);
            break;
          }
        }
      }

      return { x: spawnX, y: spawnY, type: enemyType };
    });
  }

  private collectGroundSpawnPositions(platforms: Platform[]): Array<{ x: number; y: number }> {
    const candidates: Array<{ x: number; y: number }> = [];

    platforms.forEach((platform) => {
      for (let x = platform.x; x < platform.x + platform.width; x++) {
        candidates.push({ x, y: platform.y - 1 });
      }
    });

    return candidates;
  }

  private clearRoom(): void {
    this.platforms.clear(true, true);
    this.platformVisuals.forEach((visual) => visual.destroy());
    this.platformVisuals = [];
    this.enemies.clear(true, true);
  }

  private createPlatforms(platformData: Platform[]): void {
    const sourceImage = this.scene.textures
      .get('platform-floating')
      .getSourceImage() as { width: number; height: number };
    const visualWidth = sourceImage.width;
    const visualHeight = sourceImage.height;

    platformData.forEach((platform) => {
      const x = platform.x * TILE_SIZE;
      const y = platform.y * TILE_SIZE;
      const width = platform.width * TILE_SIZE;
      const height = platform.height * TILE_SIZE;

      const collider = this.scene.add.zone(x + width / 2, y + height / 2, width, height);
      this.scene.physics.add.existing(collider, true);
      this.platforms.add(collider);

      const repeatCount = Math.max(1, Math.ceil(width / visualWidth));
      for (let i = 0; i < repeatCount; i++) {
        const visual = this.scene.add
          .image(x + visualWidth / 2 + i * visualWidth, y + visualHeight / 2, 'platform-floating')
          .setOrigin(0.5)
          .setDisplaySize(visualWidth, visualHeight)
          .setDepth(-5);
        this.platformVisuals.push(visual);
      }
    });
  }

  private spawnEnemies(spawns: EnemySpawn[]): void {
    if (this.players.length === 0) {
      return;
    }

    spawns.forEach((spawn) => {
      const x = spawn.x * TILE_SIZE + TILE_SIZE / 2;
      const y = spawn.y * TILE_SIZE;

      const enemy = this.createEnemyByType(spawn.type, x, y);
      if (!enemy) {
        return;
      }

      enemy.setPlayers(this.players);
      this.enemies.add(enemy);
    });
  }

  private createEnemyByType(type: EnemyType, x: number, y: number): Enemy | undefined {
    switch (type) {
      case 'slime':
        return new Slime(this.scene, x, y);
      case 'bat':
        return new Bat(this.scene, x, y);
      case 'skeleton':
        return new Skeleton(this.scene, x, y);
      case 'crab':
        return new Crab(this.scene, x, y);
      case 'crystal-snail':
        return new CrystalSnail(this.scene, x, y);
      case 'fly-eye':
        return new FlyEye(this.scene, x, y);
      case 'ghost':
        return new Ghost(this.scene, x, y);
      case 'lizard':
        return new Lizard(this.scene, x, y);
      case 'mini-demon':
        return new MiniDemon(this.scene, x, y);
      case 'fusion-boss':
        return new FusionBoss(this.scene, x, y);
      default:
        return undefined;
    }
  }

  isRoomCleared(): boolean {
    return this.enemies.getLength() === 0;
  }

  getCurrentRoom(): RoomData | null {
    return this.currentRoom;
  }
}
