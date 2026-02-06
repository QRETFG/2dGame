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
