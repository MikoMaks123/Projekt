import { Skill } from '../types/game';

export const AVAILABLE_SKILLS: Skill[] = [
  {
    id: 'power_strike',
    name: 'Mocne Uderzenie',
    description: 'Zadaje 150% normalnych obrażeń',
    type: 'offensive',
    manaCost: 15,
    cooldown: 2,
    currentCooldown: 0,
    unlocked: true,
    requiredLevel: 1,
    effect: { damageMultiplier: 1.5 }
  },
  {
    id: 'critical_strike',
    name: 'Atak Krytyczny',
    description: 'Zwiększa szansę na trafienie krytyczne o 50%',
    type: 'offensive',
    manaCost: 20,
    cooldown: 3,
    currentCooldown: 0,
    unlocked: false,
    requiredLevel: 3,
    effect: { critBonus: 50, damageMultiplier: 1.2 }
  },
  {
    id: 'berserker_rage',
    name: 'Szał Berserka',
    description: 'Zwiększa obrażenia o 75% na 3 tury',
    type: 'offensive',
    manaCost: 30,
    cooldown: 5,
    currentCooldown: 0,
    unlocked: false,
    requiredLevel: 7,
    effect: { damageMultiplier: 1.75, duration: 3 }
  },

  {
    id: 'dodge',
    name: 'Unik',
    description: 'Zwiększa szansę na unik o 40% na następną turę',
    type: 'defensive',
    manaCost: 10,
    cooldown: 2,
    currentCooldown: 0,
    unlocked: true,
    requiredLevel: 1,
    effect: { dodgeBonus: 40, duration: 1 }
  },
  {
    id: 'energy_shield',
    name: 'Tarcza Energetyczna',
    description: 'Tworzy tarczę absorbującą następne obrażenia',
    type: 'defensive',
    manaCost: 25,
    cooldown: 4,
    currentCooldown: 0,
    unlocked: false,
    requiredLevel: 4,
    effect: { shield: 50, duration: 3 }
  },
  {
    id: 'iron_skin',
    name: 'Żelazna Skóra',
    description: 'Redukuje wszystkie obrażenia o 30% na 4 tury',
    type: 'defensive',
    manaCost: 35,
    cooldown: 6,
    currentCooldown: 0,
    unlocked: false,
    requiredLevel: 8,
    effect: { duration: 4 }
  },

  {
    id: 'heal',
    name: 'Leczenie',
    description: 'Przywraca 40% maksymalnych punktów życia',
    type: 'support',
    manaCost: 20,
    cooldown: 3,
    currentCooldown: 0,
    unlocked: true,
    requiredLevel: 1,
    effect: { healPercent: 0.4 }
  },
  {
    id: 'mana_regeneration',
    name: 'Regeneracja Many',
    description: 'Przywraca 50 punktów many',
    type: 'support',
    manaCost: 0,
    cooldown: 4,
    currentCooldown: 0,
    unlocked: false,
    requiredLevel: 2,
    effect: { heal: 50 }
  },
  {
    id: 'meditation',
    name: 'Medytacja',
    description: 'Przywraca zdrowie i manę przez 3 tury',
    type: 'support',
    manaCost: 15,
    cooldown: 5,
    currentCooldown: 0,
    unlocked: false,
    requiredLevel: 6,
    effect: { healPercent: 0.15, duration: 3 }
  }
];