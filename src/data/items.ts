import { Item } from '../types/game';

export const STARTING_ITEMS: Item[] = [
  {
    id: 'rusty_sword',
    name: 'Zardzewiały Miecz',
    type: 'weapon',
    rarity: 'common',
    stats: { strength: 3 },
    effects: [],
    description: 'Stary miecz, ale wciąż ostry'
  },
  {
    id: 'leather_armor',
    name: 'Skórzana Zbroja',
    type: 'armor',
    rarity: 'common',
    stats: { endurance: 2 },
    effects: [{ type: 'dodge_chance', value: 5, description: '+5% szansy na unik' }],
    description: 'Podstawowa ochrona dla początkujących wojowników'
  },
  {
    id: 'lucky_charm',
    name: 'Amulet Szczęścia',
    type: 'accessory',
    rarity: 'common',
    stats: { luck: 4 },
    effects: [],
    description: 'Zwiększa szczęście w walce'
  }
];

export const ITEM_POOL: Item[] = [
  {
    id: 'iron_sword',
    name: 'Żelazny Miecz',
    type: 'weapon',
    rarity: 'common',
    stats: { strength: 5 },
    effects: [],
    description: 'Solidny miecz z dobrej stali'
  },
  {
    id: 'silver_blade',
    name: 'Srebrne Ostrze',
    type: 'weapon',
    rarity: 'rare',
    stats: { strength: 8, dexterity: 2 },
    effects: [{ type: 'crit_chance', value: 10, description: '+10% szansy na krytyk' }],
    description: 'Elegancka broń z magicznymi właściwościami'
  },
  {
    id: 'flame_sword',
    name: 'Płomienny Miecz',
    type: 'weapon',
    rarity: 'epic',
    stats: { strength: 12 },
    effects: [{ type: 'damage_bonus', value: 15, description: '+15 obrażeń od ognia' }],
    description: 'Miecz płonący wiecznym ogniem'
  },
  {
    id: 'dragon_slayer',
    name: 'Smoczy Pogromca',
    type: 'weapon',
    rarity: 'legendary',
    stats: { strength: 18, dexterity: 5 },
    effects: [
      { type: 'crit_chance', value: 20, description: '+20% szansy na krytyk' },
      { type: 'damage_bonus', value: 25, description: '+25 obrażeń' }
    ],
    description: 'Legendarna broń wykuta z kości smoka'
  },

  {
    id: 'chain_mail',
    name: 'Kolczuga',
    type: 'armor',
    rarity: 'common',
    stats: { endurance: 4 },
    effects: [],
    description: 'Solidna ochrona z metalowych ogniw'
  },
  {
    id: 'plate_armor',
    name: 'Płytowa Zbroja',
    type: 'armor',
    rarity: 'rare',
    stats: { endurance: 7, strength: 2 },
    effects: [{ type: 'dodge_chance', value: -5, description: '-5% szansy na unik (ciężka)' }],
    description: 'Ciężka zbroja zapewniająca doskonałą ochronę'
  },
  {
    id: 'mithril_armor',
    name: 'Mithrylowa Zbroja',
    type: 'armor',
    rarity: 'epic',
    stats: { endurance: 10, dexterity: 3 },
    effects: [{ type: 'dodge_chance', value: 10, description: '+10% szansy na unik' }],
    description: 'Lekka i wytrzymała zbroja z mithrilu'
  },
  {
    id: 'dragon_scale_armor',
    name: 'Zbroja z Łusek Smoka',
    type: 'armor',
    rarity: 'legendary',
    stats: { endurance: 15, strength: 3, dexterity: 3 },
    effects: [
      { type: 'dodge_chance', value: 15, description: '+15% szansy na unik' },
      { type: 'damage_bonus', value: 10, description: '+10 obrażeń' }
    ],
    description: 'Zbroja wykuta z łusek pradawnego smoka'
  },

  {
    id: 'power_ring',
    name: 'Pierścień Mocy',
    type: 'accessory',
    rarity: 'rare',
    stats: { strength: 6 },
    effects: [],
    description: 'Pierścień zwiększający siłę fizyczną'
  },
  {
    id: 'agility_amulet',
    name: 'Amulet Zwinności',
    type: 'accessory',
    rarity: 'rare',
    stats: { dexterity: 6 },
    effects: [{ type: 'dodge_chance', value: 12, description: '+12% szansy na unik' }],
    description: 'Amulet zwiększający zwinność i refleks'
  },
  {
    id: 'vitality_pendant',
    name: 'Wisiorek Witalności',
    type: 'accessory',
    rarity: 'epic',
    stats: { endurance: 8 },
    effects: [{ type: 'heal_bonus', value: 20, description: '+20% skuteczności leczenia' }],
    description: 'Wisiorek wzmacniający siły życiowe'
  },
  {
    id: 'fortune_talisman',
    name: 'Talizman Fortuny',
    type: 'accessory',
    rarity: 'legendary',
    stats: { luck: 12, dexterity: 4 },
    effects: [
      { type: 'crit_chance', value: 15, description: '+15% szansy na krytyk' },
      { type: 'dodge_chance', value: 10, description: '+10% szansy na unik' }
    ],
    description: 'Pradawny talizman przynoszący szczęście'
  }
];

export const CONSUMABLE_ITEMS: Item[] = [
  {
    id: 'health_potion',
    name: 'Mikstura Zdrowia',
    type: 'consumable',
    rarity: 'common',
    stats: {},
    effects: [{ type: 'heal_bonus', value: 50, description: 'Przywraca 50 PŻ' }],
    description: 'Przywraca punkty życia'
  },
  {
    id: 'mana_potion',
    name: 'Mikstura Many',
    type: 'consumable',
    rarity: 'common',
    stats: {},
    effects: [{ type: 'heal_bonus', value: 30, description: 'Przywraca 30 PM' }],
    description: 'Przywraca punkty many'
  }
];