# Super Grotto Escape 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个可运行的Roguelike平台动作游戏MVP，包含玩家控制、3种敌人、房间系统和基础升级。

**Architecture:** 使用Phaser 3场景驱动架构。BootScene加载资源，GameScene处理核心玩法，通过RoomManager管理房间切换。实体类（Player、Enemy）封装游戏对象逻辑。

**Tech Stack:** Phaser 3.80+, TypeScript 5.x, Vite 5.x

---

## Phase 1: 项目初始化

### Task 1: 创建Vite + Phaser + TypeScript项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`

**Step 1: 初始化npm项目并安装依赖**

```bash
cd /mnt/d/wsl_projects/ClaudeGame
npm init -y
npm install phaser@3.80.1
npm install -D typescript vite @types/node
```

**Step 2: 创建TypeScript配置**

创建 `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

**Step 3: 创建Vite配置**

创建 `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

**Step 4: 创建HTML入口**

创建 `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Grotto Escape</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1a1a2e;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    canvas { image-rendering: pixelated; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 5: 创建主入口文件**

创建 `src/main.ts`:
```typescript
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 384,
  backgroundColor: '#1a1a2e',
  parent: document.body,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [],
};

const game = new Phaser.Game(config);

console.log('Super Grotto Escape initialized!', game);
```

**Step 6: 更新package.json脚本**

修改 `package.json` 添加scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

**Step 7: 验证项目运行**

Run: `npm run dev`
Expected: 浏览器打开显示深蓝色背景画布，控制台显示"Super Grotto Escape initialized!"

**Step 8: 提交**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/main.ts
git commit -m "feat: 初始化Phaser 3 + TypeScript + Vite项目"
```

---

### Task 2: 复制游戏资源到项目

**Files:**
- Create: `public/assets/sprites/player/` (复制玩家精灵表)
- Create: `public/assets/sprites/enemies/` (复制敌人精灵表)
- Create: `public/assets/tilemaps/` (复制tileset)
- Create: `public/assets/backgrounds/` (复制背景图层)

**Step 1: 创建资源目录结构**

```bash
mkdir -p public/assets/sprites/player
mkdir -p public/assets/sprites/enemies/slime
mkdir -p public/assets/sprites/enemies/bat
mkdir -p public/assets/sprites/enemies/skeleton
mkdir -p public/assets/sprites/enemies/ghost
mkdir -p public/assets/tilemaps
mkdir -p public/assets/backgrounds
mkdir -p public/assets/props
```

**Step 2: 复制玩家精灵表**

```bash
cp "Super Grotto Escape Files/Assets/Characters/Player/spritesheets/"*.png public/assets/sprites/player/
```

**Step 3: 复制敌人精灵表**

```bash
cp "Super Grotto Escape Files/Assets/Characters/Enemies/Slime/spritesheet.png" public/assets/sprites/enemies/slime/
cp "Super Grotto Escape Files/Assets/Characters/Enemies/Bat/Spritesheet.png" public/assets/sprites/enemies/bat/spritesheet.png
cp "Super Grotto Escape Files/Assets/Characters/Enemies/Skeleton/Spritesheets/"*.png public/assets/sprites/enemies/skeleton/
cp "Super Grotto Escape Files/Assets/Characters/Enemies/Ghost/Spritesheets/"*.png public/assets/sprites/enemies/ghost/
```

**Step 4: 复制环境资源**

```bash
cp "Super Grotto Escape Files/Assets/Environment/Layers/tileset.png" public/assets/tilemaps/
cp "Super Grotto Escape Files/Assets/Environment/Layers/back.png" public/assets/backgrounds/
cp "Super Grotto Escape Files/Assets/Environment/Layers/far.png" public/assets/backgrounds/
cp "Super Grotto Escape Files/Assets/Environment/Layers/middle.png" public/assets/backgrounds/
```

**Step 5: 验证资源复制成功**

Run: `ls -la public/assets/sprites/player/`
Expected: 显示player-idle.png, player-run.png等文件

**Step 6: 提交**

```bash
git add public/assets/
git commit -m "assets: 添加游戏精灵和环境资源"
```

---

### Task 3: 创建BootScene资源加载

**Files:**
- Create: `src/scenes/BootScene.ts`
- Modify: `src/main.ts`

**Step 1: 创建场景目录**

```bash
mkdir -p src/scenes
```

**Step 2: 创建BootScene**

创建 `src/scenes/BootScene.ts`:
```typescript
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 显示加载进度
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 加载玩家精灵表
    this.load.spritesheet('player-idle', 'assets/sprites/player/player-idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('player-run', 'assets/sprites/player/player-run.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('player-jump', 'assets/sprites/player/player-jump.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 加载敌人精灵表
    this.load.spritesheet('slime', 'assets/sprites/enemies/slime/spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 加载tileset
    this.load.image('tileset', 'assets/tilemaps/tileset.png');

    // 加载背景
    this.load.image('bg-back', 'assets/backgrounds/back.png');
    this.load.image('bg-far', 'assets/backgrounds/far.png');
    this.load.image('bg-middle', 'assets/backgrounds/middle.png');
  }

  create(): void {
    console.log('Assets loaded successfully!');

    // 创建玩家动画
    this.anims.create({
      key: 'player-idle-anim',
      frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-run-anim',
      frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-jump-anim',
      frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: 0,
    });

    // 创建敌人动画
    this.anims.create({
      key: 'slime-anim',
      frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    // 切换到游戏场景
    this.scene.start('GameScene');
  }
}
```

**Step 3: 创建临时GameScene**

创建 `src/scenes/GameScene.ts`:
```typescript
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 添加背景
    this.add.image(320, 192, 'bg-back').setScrollFactor(0);

    // 添加测试精灵
    const player = this.add.sprite(320, 200, 'player-idle');
    player.play('player-idle-anim');

    const slime = this.add.sprite(400, 200, 'slime');
    slime.play('slime-anim');

    // 添加提示文字
    this.add.text(320, 50, 'Super Grotto Escape - MVP', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(320, 350, '按任意键继续开发...', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);
  }
}
```

**Step 4: 更新main.ts注册场景**

修改 `src/main.ts`:
```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 384,
  backgroundColor: '#1a1a2e',
  parent: document.body,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene],
};

new Phaser.Game(config);
```

**Step 5: 验证资源加载和动画**

Run: `npm run dev`
Expected:
- 显示加载进度条
- 加载完成后显示背景图
- 玩家和史莱姆精灵播放动画

**Step 6: 提交**

```bash
git add src/scenes/ src/main.ts
git commit -m "feat: 添加BootScene资源加载和基础动画"
```

---

## Phase 2: 玩家系统

### Task 4: 创建Player类基础移动

**Files:**
- Create: `src/entities/Player.ts`
- Modify: `src/scenes/GameScene.ts`

**Step 1: 创建实体目录**

```bash
mkdir -p src/entities
```

**Step 2: 创建Player类**

创建 `src/entities/Player.ts`:
```typescript
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
```

**Step 3: 更新GameScene使用Player类**

修改 `src/scenes/GameScene.ts`:
```typescript
import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

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

    // 创建地面（临时使用矩形）
    const ground = this.add.rectangle(320, 370, 640, 28, 0x4a4a4a);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    // 创建一些平台
    const platform1 = this.add.rectangle(200, 280, 120, 16, 0x4a4a4a);
    this.physics.add.existing(platform1, true);
    this.platforms.add(platform1);

    const platform2 = this.add.rectangle(450, 200, 120, 16, 0x4a4a4a);
    this.physics.add.existing(platform2, true);
    this.platforms.add(platform2);

    // 创建玩家
    this.player = new Player(this, 100, 300);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 添加提示文字
    this.add.text(320, 30, 'WASD/方向键移动，空格跳跃', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  update(): void {
    this.player.update();
  }
}
```

**Step 4: 验证玩家移动**

Run: `npm run dev`
Expected:
- 玩家可以左右移动
- 玩家可以跳跃
- 动画根据状态切换
- 玩家与平台碰撞

**Step 5: 提交**

```bash
git add src/entities/Player.ts src/scenes/GameScene.ts
git commit -m "feat: 添加Player类基础移动和跳跃"
```

---

### Task 5: 添加玩家攻击系统

**Files:**
- Modify: `src/entities/Player.ts`
- Modify: `src/scenes/BootScene.ts`

**Step 1: 更新BootScene加载攻击精灵表**

在 `src/scenes/BootScene.ts` 的preload方法中添加:
```typescript
// 在现有加载后添加
this.load.spritesheet('player-shoot', 'assets/sprites/player/player-shoot.png', {
  frameWidth: 32,
  frameHeight: 32,
});
```

在create方法中添加动画:
```typescript
this.anims.create({
  key: 'player-shoot-anim',
  frames: this.anims.generateFrameNumbers('player-shoot', { start: 0, end: 2 }),
  frameRate: 12,
  repeat: 0,
});
```

**Step 2: 更新Player类添加攻击**

修改 `src/entities/Player.ts`，添加攻击相关代码:
```typescript
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
  private shootKey!: Phaser.Input.Keyboard.Key;

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
      this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
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
```

**Step 3: 验证攻击系统**

Run: `npm run dev`
Expected:
- 按J键显示红色攻击区域
- 播放攻击动画
- 攻击有冷却时间

**Step 4: 提交**

```bash
git add src/entities/Player.ts src/scenes/BootScene.ts
git commit -m "feat: 添加玩家近战攻击系统"
```

---

## Phase 3: 敌人系统

### Task 6: 创建Enemy基类

**Files:**
- Create: `src/entities/enemies/Enemy.ts`

**Step 1: 创建敌人目录**

```bash
mkdir -p src/entities/enemies
```

**Step 2: 创建Enemy基类**

创建 `src/entities/enemies/Enemy.ts`:
```typescript
import Phaser from 'phaser';
import { Player } from '../Player';

export interface EnemyConfig {
  health: number;
  damage: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  coinDrop: { min: number; max: number };
}

export type EnemyState = 'idle' | 'patrol' | 'chase' | 'attack' | 'cooldown' | 'dead';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected config: EnemyConfig;
  protected currentState: EnemyState = 'idle';
  protected health: number;
  protected player: Player | null = null;
  protected patrolDirection = 1;
  protected patrolTimer = 0;
  protected attackCooldown = false;
  protected isDead = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: EnemyConfig
  ) {
    super(scene, x, y, texture);

    this.config = config;
    this.health = config.health;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  getHealth(): number {
    return this.health;
  }

  getDamage(): number {
    return this.config.damage;
  }

  isDying(): boolean {
    return this.isDead;
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;

    this.health -= amount;

    // 受击闪烁
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // 击退效果
    const knockbackDir = this.player && this.player.x < this.x ? 1 : -1;
    this.setVelocityX(knockbackDir * 100);

    if (this.health <= 0) {
      this.die();
    }
  }

  protected die(): void {
    this.isDead = true;
    this.currentState = 'dead';

    // 掉落金币
    const coinAmount = Phaser.Math.Between(
      this.config.coinDrop.min,
      this.config.coinDrop.max
    );

    // 发送事件通知掉落
    this.scene.events.emit('enemyDied', this.x, this.y, coinAmount);

    // 死亡动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  protected getDistanceToPlayer(): number {
    if (!this.player) return Infinity;
    return Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
  }

  protected canSeePlayer(): boolean {
    return this.getDistanceToPlayer() <= this.config.detectionRange;
  }

  protected canAttackPlayer(): boolean {
    return this.getDistanceToPlayer() <= this.config.attackRange;
  }

  // 子类实现具体行为
  abstract updateBehavior(): void;

  update(): void {
    if (this.isDead) return;
    this.updateBehavior();
  }
}
```

**Step 3: 验证编译**

Run: `npm run dev`
Expected: 无编译错误

**Step 4: 提交**

```bash
git add src/entities/enemies/Enemy.ts
git commit -m "feat: 添加Enemy敌人基类"
```

---

### Task 7: 创建Slime敌人

**Files:**
- Create: `src/entities/enemies/Slime.ts`
- Modify: `src/scenes/GameScene.ts`

**Step 1: 创建Slime类**

创建 `src/entities/enemies/Slime.ts`:
```typescript
import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const SLIME_CONFIG: EnemyConfig = {
  health: 30,
  damage: 10,
  speed: 60,
  detectionRange: 150,
  attackRange: 40,
  coinDrop: { min: 5, max: 10 },
};

export class Slime extends Enemy {
  private jumpCooldown = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'slime', SLIME_CONFIG);

    this.setSize(20, 16);
    this.setOffset(6, 16);

    this.play('slime-anim');
  }

  updateBehavior(): void {
    const onGround = this.body?.blocked.down ?? false;

    switch (this.currentState) {
      case 'idle':
        this.handleIdle();
        break;
      case 'patrol':
        this.handlePatrol(onGround);
        break;
      case 'chase':
        this.handleChase(onGround);
        break;
      case 'attack':
        this.handleAttack(onGround);
        break;
    }
  }

  private handleIdle(): void {
    this.setVelocityX(0);

    // 随机开始巡逻
    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 2000) {
      this.patrolTimer = 0;
      this.currentState = 'patrol';
      this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
    }

    // 检测玩家
    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handlePatrol(onGround: boolean): void {
    // 巡逻移动
    this.setVelocityX(this.config.speed * this.patrolDirection * 0.5);
    this.setFlipX(this.patrolDirection < 0);

    // 碰墙转向
    if (this.body?.blocked.left || this.body?.blocked.right) {
      this.patrolDirection *= -1;
    }

    // 巡逻时间结束
    this.patrolTimer += this.scene.game.loop.delta;
    if (this.patrolTimer > 3000) {
      this.patrolTimer = 0;
      this.currentState = 'idle';
    }

    // 检测玩家
    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handleChase(onGround: boolean): void {
    if (!this.player) {
      this.currentState = 'idle';
      return;
    }

    // 朝玩家移动
    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.config.speed * direction);
    this.setFlipX(direction < 0);

    // 跳跃攻击
    if (this.canAttackPlayer() && onGround && !this.jumpCooldown) {
      this.currentState = 'attack';
    }

    // 失去目标
    if (!this.canSeePlayer()) {
      this.currentState = 'idle';
    }
  }

  private handleAttack(onGround: boolean): void {
    if (!this.player || this.jumpCooldown) {
      this.currentState = 'chase';
      return;
    }

    // 跳跃攻击
    if (onGround) {
      this.jumpCooldown = true;

      const direction = this.player.x < this.x ? -1 : 1;
      this.setVelocity(direction * 150, -300);

      this.scene.time.delayedCall(1000, () => {
        this.jumpCooldown = false;
        this.currentState = 'chase';
      });
    }
  }
}
```

**Step 2: 更新GameScene添加Slime**

修改 `src/scenes/GameScene.ts`:
```typescript
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Slime } from '../entities/enemies/Slime';
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
    hitbox: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
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
    playerObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ): void {
    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    this.player.takeDamage(enemy.getDamage());
  }

  private onEnemyDied(x: number, y: number, coins: number): void {
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
```

**Step 3: 验证Slime敌人**

Run: `npm run dev`
Expected:
- Slime显示并播放动画
- Slime巡逻和追逐玩家
- 按J攻击可以伤害Slime
- Slime死亡时有动画效果

**Step 4: 提交**

```bash
git add src/entities/enemies/Slime.ts src/scenes/GameScene.ts
git commit -m "feat: 添加Slime敌人AI和战斗交互"
```

---

### Task 8: 创建Bat敌人

**Files:**
- Create: `src/entities/enemies/Bat.ts`
- Modify: `src/scenes/BootScene.ts`
- Modify: `src/scenes/GameScene.ts`

**Step 1: 更新BootScene加载Bat资源**

在 `src/scenes/BootScene.ts` preload中添加:
```typescript
this.load.spritesheet('bat', 'assets/sprites/enemies/bat/spritesheet.png', {
  frameWidth: 32,
  frameHeight: 32,
});
```

在create中添加动画:
```typescript
this.anims.create({
  key: 'bat-anim',
  frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 4 }),
  frameRate: 8,
  repeat: -1,
});
```

**Step 2: 创建Bat类**

创建 `src/entities/enemies/Bat.ts`:
```typescript
import Phaser from 'phaser';
import { Enemy, EnemyConfig } from './Enemy';

const BAT_CONFIG: EnemyConfig = {
  health: 20,
  damage: 15,
  speed: 100,
  detectionRange: 200,
  attackRange: 30,
  coinDrop: { min: 8, max: 12 },
};

export class Bat extends Enemy {
  private hoverY: number;
  private hoverOffset = 0;
  private diveCooldown = false;
  private originalY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bat', BAT_CONFIG);

    this.setSize(20, 16);
    this.setOffset(6, 8);

    // 飞行敌人不受重力影响
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.hoverY = y;
    this.originalY = y;

    this.play('bat-anim');
  }

  updateBehavior(): void {
    switch (this.currentState) {
      case 'idle':
        this.handleIdle();
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
    // 悬停效果
    this.hoverOffset += 0.05;
    const hoverY = this.hoverY + Math.sin(this.hoverOffset) * 10;
    this.setY(hoverY);
    this.setVelocity(0, 0);

    // 检测玩家
    if (this.canSeePlayer()) {
      this.currentState = 'chase';
    }
  }

  private handleChase(): void {
    if (!this.player) {
      this.currentState = 'idle';
      return;
    }

    // 朝玩家方向飞行
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    const vx = Math.cos(angle) * this.config.speed * 0.7;
    const vy = Math.sin(angle) * this.config.speed * 0.7;

    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);

    // 进入攻击范围时俯冲
    if (this.canAttackPlayer() && !this.diveCooldown) {
      this.currentState = 'attack';
    }

    // 失去目标
    if (!this.canSeePlayer()) {
      this.hoverY = this.y;
      this.currentState = 'idle';
    }
  }

  private handleAttack(): void {
    if (!this.player || this.diveCooldown) {
      this.currentState = 'chase';
      return;
    }

    this.diveCooldown = true;

    // 俯冲攻击
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    const diveSpeed = this.config.speed * 2;

    this.setVelocity(
      Math.cos(angle) * diveSpeed,
      Math.sin(angle) * diveSpeed
    );

    // 俯冲后返回
    this.scene.time.delayedCall(500, () => {
      this.hoverY = this.originalY;
      this.currentState = 'idle';

      // 返回原位置
      this.scene.tweens.add({
        targets: this,
        y: this.originalY,
        duration: 800,
        ease: 'Quad.easeOut',
      });
    });

    // 冷却
    this.scene.time.delayedCall(2000, () => {
      this.diveCooldown = false;
    });
  }
}
```

**Step 3: 更新GameScene添加Bat**

在 `src/scenes/GameScene.ts` 中添加import和敌人:
```typescript
import { Bat } from '../entities/enemies/Bat';

// 在create方法中，添加Slime后面添加:
const bat1 = new Bat(this, 300, 100);
bat1.setPlayer(this.player);
this.enemies.add(bat1);
```

**Step 4: 验证Bat敌人**

Run: `npm run dev`
Expected:
- Bat悬浮在空中
- 发现玩家后追逐
- 靠近时俯冲攻击

**Step 5: 提交**

```bash
git add src/entities/enemies/Bat.ts src/scenes/BootScene.ts src/scenes/GameScene.ts
git commit -m "feat: 添加Bat飞行敌人"
```

---

### Task 9: 创建Skeleton敌人

**Files:**
- Create: `src/entities/enemies/Skeleton.ts`
- Modify: `src/scenes/BootScene.ts`
- Modify: `src/scenes/GameScene.ts`

**Step 1: 更新BootScene加载Skeleton资源**

在 `src/scenes/BootScene.ts` preload中添加:
```typescript
this.load.spritesheet('skeleton-idle', 'assets/sprites/enemies/skeleton/skeleton-idle.png', {
  frameWidth: 32,
  frameHeight: 32,
});
this.load.spritesheet('skeleton-walk', 'assets/sprites/enemies/skeleton/skeleton-walk.png', {
  frameWidth: 32,
  frameHeight: 32,
});
```

在create中添加动画:
```typescript
this.anims.create({
  key: 'skeleton-idle-anim',
  frames: this.anims.generateFrameNumbers('skeleton-idle', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});

this.anims.create({
  key: 'skeleton-walk-anim',
  frames: this.anims.generateFrameNumbers('skeleton-walk', { start: 0, end: 3 }),
  frameRate: 8,
  repeat: -1,
});
```

**Step 2: 创建Skeleton类**

创建 `src/entities/enemies/Skeleton.ts`:
```typescript
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
    const onGround = this.body?.blocked.down ?? false;

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

    const distance = this.getDistanceToPlayer();
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
    if (this.player) {
      this.scene.physics.add.overlap(bone, this.player, () => {
        this.player!.takeDamage(this.config.damage);
        bone.destroy();
      });
    }

    // 超时销毁
    this.scene.time.delayedCall(2000, () => {
      if (bone.active) bone.destroy();
    });
  }
}
```

**Step 3: 更新GameScene添加Skeleton**

在 `src/scenes/GameScene.ts` 中添加:
```typescript
import { Skeleton } from '../entities/enemies/Skeleton';

// 在create方法中添加:
const skeleton = new Skeleton(this, 550, 300);
skeleton.setPlayer(this.player);
this.enemies.add(skeleton);
```

**Step 4: 验证Skeleton敌人**

Run: `npm run dev`
Expected:
- Skeleton巡逻行走
- 发现玩家后追逐
- 在攻击范围内投掷骨头
- 骨头击中玩家造成伤害

**Step 5: 提交**

```bash
git add src/entities/enemies/Skeleton.ts src/scenes/BootScene.ts src/scenes/GameScene.ts
git commit -m "feat: 添加Skeleton远程敌人"
```

---

## Phase 4: UI系统

### Task 10: 创建游戏HUD

**Files:**
- Create: `src/ui/HUD.ts`
- Modify: `src/scenes/GameScene.ts`

**Step 1: 创建UI目录**

```bash
mkdir -p src/ui
```

**Step 2: 创建HUD类**

创建 `src/ui/HUD.ts`:
```typescript
import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;

  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;

  private coins = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.createHealthBar();
    this.createCoinsDisplay();
  }

  private createHealthBar(): void {
    // 血条背景
    const bgBar = this.scene.add.graphics();
    bgBar.fillStyle(0x333333, 1);
    bgBar.fillRect(10, 10, 150, 20);
    bgBar.setScrollFactor(0);
    bgBar.setDepth(100);

    // 血条
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(101);

    // 血量文字
    this.healthText = this.scene.add.text(85, 12, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.healthText.setOrigin(0.5, 0);
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(102);

    this.updateHealthBar();
  }

  private createCoinsDisplay(): void {
    // 金币图标（简单矩形）
    const coinIcon = this.scene.add.graphics();
    coinIcon.fillStyle(0xffd700, 1);
    coinIcon.fillCircle(185, 20, 8);
    coinIcon.setScrollFactor(0);
    coinIcon.setDepth(100);

    // 金币数量
    this.coinsText = this.scene.add.text(200, 12, '0', {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    this.coinsText.setScrollFactor(0);
    this.coinsText.setDepth(100);
  }

  addCoins(amount: number): void {
    this.coins += amount;
    this.coinsText.setText(this.coins.toString());

    // 金币增加动画
    this.scene.tweens.add({
      targets: this.coinsText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  getCoins(): number {
    return this.coins;
  }

  private updateHealthBar(): void {
    const health = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    const percentage = health / maxHealth;

    this.healthBar.clear();

    // 根据血量变色
    let color = 0x00ff00;
    if (percentage < 0.3) {
      color = 0xff0000;
    } else if (percentage < 0.6) {
      color = 0xffff00;
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(12, 12, 146 * percentage, 16);

    this.healthText.setText(`${health}/${maxHealth}`);
  }

  update(): void {
    this.updateHealthBar();
  }
}
```

**Step 3: 更新GameScene使用HUD**

修改 `src/scenes/GameScene.ts`，添加HUD:
```typescript
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.GameObjects.Group;
  private hud!: HUD;

  // ... 其他代码保持不变

  create(): void {
    // ... 现有代码 ...

    // 创建HUD（在最后）
    this.hud = new HUD(this, this.player);

    // 修改敌人死亡事件处理
    this.events.on('enemyDied', this.onEnemyDied, this);
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
  }

  update(): void {
    this.player.update();
    this.hud.update();

    this.enemies.getChildren().forEach((enemy) => {
      (enemy as Enemy).update();
    });
  }
}
```

**Step 4: 验证HUD**

Run: `npm run dev`
Expected:
- 左上角显示血条和血量数字
- 显示金币数量
- 击杀敌人时金币增加
- 受伤时血条变化

**Step 5: 提交**

```bash
git add src/ui/HUD.ts src/scenes/GameScene.ts
git commit -m "feat: 添加游戏HUD界面"
```

---

## Phase 5: 房间系统

### Task 11: 创建简单房间模板JSON

**Files:**
- Create: `src/data/rooms/room-start.json`
- Create: `src/data/rooms/room-combat-1.json`

**Step 1: 创建数据目录**

```bash
mkdir -p src/data/rooms
```

**Step 2: 创建起始房间**

创建 `src/data/rooms/room-start.json`:
```json
{
  "id": "room-start",
  "type": "start",
  "width": 20,
  "height": 12,
  "exits": {
    "right": true
  },
  "platforms": [
    { "x": 0, "y": 11, "width": 20, "height": 1, "type": "ground" },
    { "x": 8, "y": 8, "width": 4, "height": 1, "type": "platform" }
  ],
  "spawns": [],
  "playerSpawn": { "x": 2, "y": 9 }
}
```

**Step 3: 创建战斗房间**

创建 `src/data/rooms/room-combat-1.json`:
```json
{
  "id": "room-combat-1",
  "type": "combat",
  "width": 20,
  "height": 12,
  "exits": {
    "left": true,
    "right": true
  },
  "platforms": [
    { "x": 0, "y": 11, "width": 20, "height": 1, "type": "ground" },
    { "x": 3, "y": 8, "width": 4, "height": 1, "type": "platform" },
    { "x": 13, "y": 8, "width": 4, "height": 1, "type": "platform" },
    { "x": 8, "y": 5, "width": 4, "height": 1, "type": "platform" }
  ],
  "spawns": [
    { "x": 5, "y": 7, "type": "slime" },
    { "x": 15, "y": 7, "type": "slime" },
    { "x": 10, "y": 4, "type": "bat" }
  ],
  "playerSpawn": { "x": 2, "y": 9 }
}
```

**Step 4: 验证JSON格式**

Run: `cat src/data/rooms/room-start.json | python3 -m json.tool`
Expected: 格式化输出JSON无错误

**Step 5: 提交**

```bash
git add src/data/rooms/
git commit -m "data: 添加房间模板JSON"
```

---

### Task 12: 创建RoomManager

**Files:**
- Create: `src/systems/RoomManager.ts`
- Create: `src/types/Room.ts`

**Step 1: 创建系统和类型目录**

```bash
mkdir -p src/systems
mkdir -p src/types
```

**Step 2: 创建房间类型定义**

创建 `src/types/Room.ts`:
```typescript
export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'platform';
}

export interface EnemySpawn {
  x: number;
  y: number;
  type: 'slime' | 'bat' | 'skeleton';
}

export interface RoomData {
  id: string;
  type: 'start' | 'combat' | 'treasure' | 'shop' | 'boss';
  width: number;
  height: number;
  exits: {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
  };
  platforms: Platform[];
  spawns: EnemySpawn[];
  playerSpawn: { x: number; y: number };
}
```

**Step 3: 创建RoomManager**

创建 `src/systems/RoomManager.ts`:
```typescript
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

      enemy.setPlayer(this.player);
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
```

**Step 4: 验证编译**

Run: `npm run dev`
Expected: 无编译错误

**Step 5: 提交**

```bash
git add src/systems/RoomManager.ts src/types/Room.ts
git commit -m "feat: 添加RoomManager房间管理系统"
```

---

### Task 13: 集成RoomManager到GameScene

**Files:**
- Modify: `src/scenes/GameScene.ts`

**Step 1: 重构GameScene使用RoomManager**

修改 `src/scenes/GameScene.ts`:
```typescript
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { HUD } from '../ui/HUD';
import { RoomManager } from '../systems/RoomManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private hud!: HUD;
  private roomManager!: RoomManager;
  private roomCleared = false;
  private roomClearedText!: Phaser.GameObjects.Text;

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

    // 加载起始房间
    this.roomManager.loadRoom('room-start');

    // 设置碰撞
    this.physics.add.collider(this.player, this.roomManager.getPlatforms());
    this.physics.add.collider(this.roomManager.getEnemies(), this.roomManager.getPlatforms());

    // 玩家攻击与敌人碰撞
    this.physics.add.overlap(
      this.player.getMeleeHitbox(),
      this.roomManager.getEnemies(),
      this.handlePlayerAttack,
      undefined,
      this
    );

    // 玩家与敌人碰撞
    this.physics.add.overlap(
      this.player,
      this.roomManager.getEnemies(),
      this.handleEnemyCollision,
      undefined,
      this
    );

    // 创建HUD
    this.hud = new HUD(this, this.player);

    // 监听敌人死亡事件
    this.events.on('enemyDied', this.onEnemyDied, this);

    // 房间清空提示
    this.roomClearedText = this.add.text(320, 192, '房间已清空！按E进入下一房间', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // 添加提示文字
    this.add.text(320, 30, 'WASD移动 | 空格跳跃 | J攻击 | E进入下一房间', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(100);

    // 添加下一房间按键
    this.input.keyboard?.addKey('E').on('down', () => {
      if (this.roomCleared) {
        this.loadNextRoom();
      }
    });
  }

  private handlePlayerAttack(
    hitbox: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ): void {
    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    const hitboxRect = hitbox as Phaser.GameObjects.Rectangle;
    if (hitboxRect.visible) {
      enemy.takeDamage(this.player.getAttackDamage());
    }
  }

  private handleEnemyCollision(
    playerObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ): void {
    const enemy = enemyObj as Enemy;
    if (enemy.isDying()) return;

    this.player.takeDamage(enemy.getDamage());
  }

  private onEnemyDied(x: number, y: number, coins: number): void {
    this.hud.addCoins(coins);

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
  }

  private loadNextRoom(): void {
    this.roomCleared = false;
    this.roomClearedText.setVisible(false);

    // 简单切换到战斗房间
    const currentRoom = this.roomManager.getCurrentRoom();
    if (currentRoom?.id === 'room-start') {
      this.roomManager.loadRoom('room-combat-1');

      // 重新设置碰撞
      this.physics.add.collider(this.player, this.roomManager.getPlatforms());
      this.physics.add.collider(this.roomManager.getEnemies(), this.roomManager.getPlatforms());

      this.physics.add.overlap(
        this.player.getMeleeHitbox(),
        this.roomManager.getEnemies(),
        this.handlePlayerAttack,
        undefined,
        this
      );

      this.physics.add.overlap(
        this.player,
        this.roomManager.getEnemies(),
        this.handleEnemyCollision,
        undefined,
        this
      );
    }
  }

  update(): void {
    this.player.update();
    this.hud.update();

    // 更新敌人
    this.roomManager.getEnemies().getChildren().forEach((enemy) => {
      (enemy as Enemy).update();
    });

    // 检查房间是否清空
    if (!this.roomCleared && this.roomManager.isRoomCleared()) {
      const currentRoom = this.roomManager.getCurrentRoom();
      if (currentRoom?.type === 'combat') {
        this.roomCleared = true;
        this.roomClearedText.setVisible(true);
      } else if (currentRoom?.type === 'start') {
        // 起始房间直接可以进入下一房间
        this.roomCleared = true;
        this.roomClearedText.setText('按E进入下一房间').setVisible(true);
      }
    }

    // 检查玩家死亡
    if (this.player.getHealth() <= 0) {
      this.scene.start('GameOverScene', { coins: this.hud.getCoins() });
    }
  }
}
```

**Step 2: 创建GameOverScene**

创建 `src/scenes/GameOverScene.ts`:
```typescript
import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { coins: number }): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    this.add.text(width / 2, height / 2 - 60, '游戏结束', {
      fontSize: '48px',
      color: '#ff0000',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, `获得金币: ${data.coins || 0}`, {
      fontSize: '24px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const restartButton = this.add.text(width / 2, height / 2 + 60, '按空格重新开始', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
```

**Step 3: 更新main.ts注册GameOverScene**

修改 `src/main.ts`:
```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 384,
  backgroundColor: '#1a1a2e',
  parent: document.body,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
```

**Step 4: 验证房间系统**

Run: `npm run dev`
Expected:
- 游戏从起始房间开始
- 按E进入战斗房间
- 战斗房间有敌人
- 清空敌人后可进入下一房间
- 玩家死亡后显示GameOver界面

**Step 5: 提交**

```bash
git add src/scenes/GameScene.ts src/scenes/GameOverScene.ts src/main.ts
git commit -m "feat: 集成RoomManager和GameOver场景"
```

---

## Phase 6: 收尾

### Task 14: 添加更多房间和完善体验

**Files:**
- Create: `src/data/rooms/room-combat-2.json`
- Modify: `src/systems/RoomManager.ts`
- Modify: `src/scenes/GameScene.ts`

**Step 1: 创建更多战斗房间**

创建 `src/data/rooms/room-combat-2.json`:
```json
{
  "id": "room-combat-2",
  "type": "combat",
  "width": 20,
  "height": 12,
  "exits": {
    "left": true,
    "right": true
  },
  "platforms": [
    { "x": 0, "y": 11, "width": 8, "height": 1, "type": "ground" },
    { "x": 12, "y": 11, "width": 8, "height": 1, "type": "ground" },
    { "x": 5, "y": 8, "width": 3, "height": 1, "type": "platform" },
    { "x": 12, "y": 8, "width": 3, "height": 1, "type": "platform" },
    { "x": 8, "y": 5, "width": 4, "height": 1, "type": "platform" }
  ],
  "spawns": [
    { "x": 3, "y": 10, "type": "skeleton" },
    { "x": 17, "y": 10, "type": "slime" },
    { "x": 10, "y": 4, "type": "bat" }
  ],
  "playerSpawn": { "x": 2, "y": 9 }
}
```

**Step 2: 更新RoomManager添加房间序列**

修改 `src/systems/RoomManager.ts`，添加房间序列:
```typescript
import roomCombat2 from '../data/rooms/room-combat-2.json';

// 在constructor中添加:
this.roomTemplates.set('room-combat-2', roomCombat2 as RoomData);

// 添加房间序列
private roomSequence: string[] = ['room-start', 'room-combat-1', 'room-combat-2'];
private currentRoomIndex = 0;

getNextRoom(): string | null {
  this.currentRoomIndex++;
  if (this.currentRoomIndex >= this.roomSequence.length) {
    return null; // 通关
  }
  return this.roomSequence[this.currentRoomIndex];
}

resetProgress(): void {
  this.currentRoomIndex = 0;
}
```

**Step 3: 更新GameScene支持房间序列**

修改 `src/scenes/GameScene.ts` 中的loadNextRoom:
```typescript
private loadNextRoom(): void {
  const nextRoomId = this.roomManager.getNextRoom();

  if (!nextRoomId) {
    // 通关
    this.scene.start('GameOverScene', {
      coins: this.hud.getCoins(),
      victory: true
    });
    return;
  }

  this.roomCleared = false;
  this.roomClearedText.setVisible(false);

  // 过渡动画
  this.cameras.main.fade(300, 0, 0, 0);

  this.time.delayedCall(300, () => {
    this.roomManager.loadRoom(nextRoomId);

    // 重新设置碰撞
    this.physics.add.collider(this.player, this.roomManager.getPlatforms());
    this.physics.add.collider(this.roomManager.getEnemies(), this.roomManager.getPlatforms());

    this.physics.add.overlap(
      this.player.getMeleeHitbox(),
      this.roomManager.getEnemies(),
      this.handlePlayerAttack,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.roomManager.getEnemies(),
      this.handleEnemyCollision,
      undefined,
      this
    );

    this.cameras.main.fadeIn(300);
  });
}
```

**Step 4: 更新GameOverScene支持胜利**

修改 `src/scenes/GameOverScene.ts`:
```typescript
create(data: { coins: number; victory?: boolean }): void {
  const { width, height } = this.cameras.main;

  this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

  const title = data.victory ? '恭喜通关！' : '游戏结束';
  const titleColor = data.victory ? '#00ff00' : '#ff0000';

  this.add.text(width / 2, height / 2 - 60, title, {
    fontSize: '48px',
    color: titleColor,
  }).setOrigin(0.5);

  // ... 其余代码不变
}
```

**Step 5: 验证完整游戏流程**

Run: `npm run dev`
Expected:
- 起始房间 → 战斗房1 → 战斗房2 → 通关
- 房间切换有过渡动画
- 通关显示胜利界面

**Step 6: 提交**

```bash
git add src/data/rooms/room-combat-2.json src/systems/RoomManager.ts src/scenes/GameScene.ts src/scenes/GameOverScene.ts
git commit -m "feat: 完成房间序列和通关流程"
```

---

### Task 15: 最终验证和清理

**Step 1: 运行完整测试**

Run: `npm run build`
Expected: 构建成功无错误

**Step 2: 验证游戏功能清单**

- [ ] 玩家可以移动和跳跃
- [ ] 玩家可以攻击敌人
- [ ] 3种敌人有不同AI行为
- [ ] 房间切换正常工作
- [ ] HUD显示血量和金币
- [ ] 游戏结束/通关界面正常

**Step 3: 关闭调试模式**

确认 `src/main.ts` 中 physics.arcade.debug 为 false

**Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: Super Grotto Escape MVP完成"
```

---

## 验证命令汇总

| 阶段 | 验证命令 | 预期结果 |
|------|----------|----------|
| Task 1 | `npm run dev` | 显示空白画布 |
| Task 3 | `npm run dev` | 显示动画精灵 |
| Task 4 | `npm run dev` | 玩家可移动跳跃 |
| Task 5 | `npm run dev` | 按J显示攻击 |
| Task 7 | `npm run dev` | Slime追逐攻击 |
| Task 8 | `npm run dev` | Bat俯冲攻击 |
| Task 9 | `npm run dev` | Skeleton远程攻击 |
| Task 10 | `npm run dev` | HUD显示正常 |
| Task 13 | `npm run dev` | 房间切换正常 |
| Task 15 | `npm run build` | 构建成功 |
