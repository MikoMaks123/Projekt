import { Enemy, Skill } from '../types/game';

export const ENEMY_POOL: Enemy[] = [
  {
    name: 'Goblin Wojownik',
    level: 1,
    health: 60,
    maxHealth: 60,
    stats: { strength: 8, dexterity: 6, endurance: 5, luck: 3 },
    skills: [
      {
        id: 'goblin_slash',
        name: 'Cięcie Goblina',
        description: 'Szybki atak',
        type: 'offensive',
        manaCost: 10,
        cooldown: 2,
        currentCooldown: 0,
        unlocked: true,
        requiredLevel: 1,
        effect: { damageMultiplier: 1.2 }
      }
    ],
    experienceReward: 25,
    itemDrops: []
  },
  {
    name: 'Ork Berserker',
    level: 3,
    health: 100,
    maxHealth: 100,
    stats: { strength: 12, dexterity: 4, endurance: 10, luck: 2 },
    skills: [
      {
        id: 'orc_rage',
        name: 'Szał Orka',
        description: 'Zwiększa obrażenia',
        type: 'offensive',
        manaCost: 15,
        cooldown: 3,
        currentCooldown: 0,
        unlocked: true,
        requiredLevel: 1,
        effect: { damageMultiplier: 1.5, duration: 2 }
      }
    ],
    experienceReward: 50,
    itemDrops: []
  },
  {
    name: 'Szkieletowy Rycerz',
    level: 5,
    health: 120,
    maxHealth: 120,
    stats: { strength: 10, dexterity: 8, endurance: 12, luck: 5 },
    skills: [
      {
        id: 'bone_shield',
        name: 'Kostna Tarcza',
        description: 'Tworzy tarczę ochronną',
        type: 'defensive',
        manaCost: 20,
        cooldown: 4,
        currentCooldown: 0,
        unlocked: true,
        requiredLevel: 1,
        effect: { shield: 30, duration: 2 }
      }
    ],
    experienceReward: 75,
    itemDrops: []
  },
  {
    name: 'Mroczny Mag',
    level: 7,
    health: 90,
    maxHealth: 90,
    stats: { strength: 6, dexterity: 12, endurance: 8, luck: 8 },
    skills: [
      {
        id: 'dark_bolt',
        name: 'Mroczny Pocisk',
        description: 'Magiczny atak',
        type: 'offensive',
        manaCost: 25,
        cooldown: 2,
        currentCooldown: 0,
        unlocked: true,
        requiredLevel: 1,
        effect: { damage: 35 }
      }
    ],
    experienceReward: 100,
    itemDrops: []
  },
  {
    name: 'Smok Młody',
    level: 10,
    health: 200,
    maxHealth: 200,
    stats: { strength: 18, dexterity: 10, endurance: 16, luck: 12 },
    skills: [
      {
        id: 'dragon_breath',
        name: 'Oddech Smoka',
        description: 'Płomienny atak',
        type: 'offensive',
        manaCost: 30,
        cooldown: 3,
        currentCooldown: 0,
        unlocked: true,
        requiredLevel: 1,
        effect: { damage: 50, damageMultiplier: 1.3 }
      }
    ],
    experienceReward: 150,
    itemDrops: []
  }
];