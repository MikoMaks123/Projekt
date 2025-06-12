export interface Character {
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stats: Stats;
  availableStatPoints: number;
  skills: Skill[];
  availableSkillPoints: number;
  equipment: Equipment;
  inventory: Item[];
}

export interface Stats {
  strength: number;
  dexterity: number;
  endurance: number;
  luck: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'offensive' | 'defensive' | 'support';
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  unlocked: boolean;
  requiredLevel: number;
  effect: SkillEffect;
}

export interface SkillEffect {
  damage?: number;
  damageMultiplier?: number;
  heal?: number;
  healPercent?: number;
  shield?: number;
  dodgeBonus?: number;
  critBonus?: number;
  duration?: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: Partial<Stats>;
  effects: ItemEffect[];
  description: string;
  equipped?: boolean;
}

export interface ItemEffect {
  type: 'stat_bonus' | 'dodge_chance' | 'crit_chance' | 'damage_bonus' | 'heal_bonus';
  value: number;
  description: string;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface Enemy {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  stats: Stats;
  skills: Skill[];
  experienceReward: number;
  itemDrops: Item[];
}

export interface CombatState {
  playerEffects: CombatEffect[];
  enemyEffects: CombatEffect[];
  turn: number;
}

export interface CombatEffect {
  type: 'shield' | 'dodge_boost' | 'crit_boost' | 'damage_boost';
  value: number;
  duration: number;
  description: string;
}

export type GameState = 'character-creation' | 'exploration' | 'combat' | 'victory' | 'defeat' | 'level-up' | 'item-selection' | 'character-sheet';
export type ActionType = 'attack' | 'skill' | 'defend' | 'item';