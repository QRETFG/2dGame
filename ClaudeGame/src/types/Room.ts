export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'platform';
}

export type EnemyType =
  | 'slime'
  | 'bat'
  | 'skeleton'
  | 'crab'
  | 'crystal-snail'
  | 'fly-eye'
  | 'ghost'
  | 'lizard'
  | 'mini-demon'
  | 'fusion-boss';

export interface EnemySpawn {
  x: number;
  y: number;
  type: EnemyType;
}

export interface RoomData {
  id: string;
  type: 'start' | 'combat' | 'treasure' | 'shop' | 'boss' | 'procedural';
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
