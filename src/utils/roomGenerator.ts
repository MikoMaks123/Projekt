import { Enemy, Item } from '../types/game';
import { ENEMY_POOL } from '../data/enemies';
import { ITEM_POOL } from '../data/items';

export interface RoomEventType {
  type: 'combat' | 'treasure' | 'rest' | 'puzzle' | 'merchant' | 'boss' | 'story' | 'moral_choice' | 'portal' | 'training' | 'trap' | 'hidden' | 'shrine' | 'library' | 'forge' | 'garden' | 'prison' | 'laboratory' | 'arena' | 'vault';
  title: string;
  description: string;
  choices: EventChoice[];
  enemy?: Enemy;
  uniqueId: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface EventChoice {
  text: string;
  result: EventResult;
  statRequirement?: {
    stat: 'strength' | 'dexterity' | 'endurance' | 'luck';
    value: number;
  };
  keyRequirement?: number;
  hint?: string;
  uniqueOutcome?: boolean;
}

export interface EventResult {
  type?: 'combat' | 'reward' | 'story';
  experience?: number;
  health?: number;
  mana?: number;
  item?: Item;
  keys?: number;
  reputation?: number;
  storyFlag?: string;
  statBonus?: { [key: string]: number };
  description?: string;
  enemy?: Enemy;
  permanentBonus?: { [key: string]: number };
  curse?: string;
  blessing?: string;
}

let usedRoomIds: Set<string> = new Set();
let roomVariationCounter: { [key: string]: number } = {};

export const resetRoomHistory = () => {
  usedRoomIds.clear();
  roomVariationCounter = {};
};

export const generateRoomEvent = (
  doorType: string, 
  dungeonLevel: number, 
  reputation: number, 
  storyFlags: string[]
): RoomEventType => {
  
  let event: RoomEventType;
  
  switch (doorType) {
    case 'combat':
      event = generateUniqueCombatEvent(dungeonLevel, reputation);
      break;
    case 'treasure':
      event = generateUniqueTreasureEvent(dungeonLevel, reputation);
      break;
    case 'rest':
      event = generateUniqueRestEvent(dungeonLevel, storyFlags);
      break;
    case 'merchant':
      event = generateUniqueMerchantEvent(dungeonLevel, reputation);
      break;
    case 'puzzle':
      event = generateUniquePuzzleEvent(dungeonLevel, storyFlags);
      break;
    case 'story':
      event = generateUniqueStoryEvent(dungeonLevel, storyFlags);
      break;
    case 'moral_choice':
      event = generateUniqueMoralEvent(dungeonLevel, reputation);
      break;
    case 'training':
      event = generateUniqueTrainingEvent(dungeonLevel);
      break;
    case 'portal':
      event = generateUniquePortalEvent(dungeonLevel);
      break;
    case 'boss':
      event = generateUniqueBossEvent(dungeonLevel);
      break;
    case 'hidden':
      event = generateUniqueHiddenEvent(dungeonLevel, reputation);
      break;
    default:
      event = generateSpecialRoomEvent(dungeonLevel, reputation, storyFlags);
  }

  usedRoomIds.add(event.uniqueId);
  
  return event;
};

const generateUniqueCombatEvent = (level: number, reputation: number): RoomEventType => {
  const variations = [
    {
      id: 'ambush_chamber',
      title: 'Sala Zasadzki',
      description: 'Wchodzisz do pozornie pustej sali, gdy nagle z ukrycia wyskakują przeciwnicy!',
      rarity: 'common' as const,
      specialMechanic: 'ambush'
    },
    {
      id: 'gladiator_pit',
      title: 'Arena Gladiatorów',
      description: 'Znajdujesz się w starożytnej arenie. Przeciwnik czeka na ciebie w centrum, a tłum duchów dopinguje.',
      rarity: 'uncommon' as const,
      specialMechanic: 'arena'
    },
    {
      id: 'cursed_battlefield',
      title: 'Przeklęte Pole Bitwy',
      description: 'Sala pełna jest kości i zbroi. Nekromantyczne energie ożywiają dawnych wojowników.',
      rarity: 'rare' as const,
      specialMechanic: 'cursed'
    },
    {
      id: 'champions_duel',
      title: 'Pojedynek Mistrzów',
      description: 'Stoisz przed legendarnym wojownikiem, który wyzwał cię na honorowy pojedynek.',
      rarity: 'legendary' as const,
      specialMechanic: 'duel'
    },
    {
      id: 'beast_den',
      title: 'Legowisko Bestii',
      description: 'Wchodzisz do jaskini pełnej kości. Czerwone oczy błyszczą w ciemności.',
      rarity: 'common' as const,
      specialMechanic: 'beast'
    },
    {
      id: 'ritual_chamber',
      title: 'Komnata Rytuału',
      description: 'Kultyści przerwali swój mroczny rytuał i zwracają się przeciwko tobie.',
      rarity: 'uncommon' as const,
      specialMechanic: 'ritual'
    }
  ];

  const availableVariations = variations.filter(v => !usedRoomIds.has(v.id));
  const selectedVariation = availableVariations.length > 0 
    ? availableVariations[Math.floor(Math.random() * availableVariations.length)]
    : variations[Math.floor(Math.random() * variations.length)];

  const availableEnemies = ENEMY_POOL.filter(enemy => 
    enemy.level <= level + 2 && enemy.level >= Math.max(1, level - 1)
  );
  
  const baseEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
  
  let enemyModifier = 1;
  let specialAbility = '';
  
  switch (selectedVariation.specialMechanic) {
    case 'ambush':
      enemyModifier = 0.8;
      specialAbility = 'Pierwszy atak przeciwnika zadaje podwójne obrażenia';
      break;
    case 'arena':
      enemyModifier = 1.2;
      specialAbility = 'Tłum dopinguje - zwiększone doświadczenie za zwycięstwo';
      break;
    case 'cursed':
      enemyModifier = 1.1;
      specialAbility = 'Przeklęcie - regeneruje się co turę';
      break;
    case 'duel':
      enemyModifier = 1.5;
      specialAbility = 'Honorowy pojedynek - zwiększone nagrody';
      break;
    case 'beast':
      enemyModifier = 0.9;
      specialAbility = 'Dzika bestia - nieprzewidywalne ataki';
      break;
    case 'ritual':
      enemyModifier = 1.3;
      specialAbility = 'Mroczna magia - może rzucać zaklęcia';
      break;
  }

  const scaledEnemy: Enemy = {
    ...baseEnemy,
    name: `${selectedVariation.specialMechanic === 'duel' ? 'Mistrz' : ''} ${baseEnemy.name}`,
    level: Math.floor(baseEnemy.level * enemyModifier) + Math.floor(level / 3),
    health: Math.floor(baseEnemy.maxHealth * enemyModifier) + (level * 15),
    maxHealth: Math.floor(baseEnemy.maxHealth * enemyModifier) + (level * 15),
    stats: {
      strength: Math.floor(baseEnemy.stats.strength * enemyModifier) + Math.floor(level / 2),
      dexterity: Math.floor(baseEnemy.stats.dexterity * enemyModifier) + Math.floor(level / 3),
      endurance: Math.floor(baseEnemy.stats.endurance * enemyModifier) + Math.floor(level / 2),
      luck: Math.floor(baseEnemy.stats.luck * enemyModifier) + Math.floor(level / 4)
    },
    experienceReward: Math.floor(baseEnemy.experienceReward * enemyModifier * 1.5) + (level * 20),
    skills: baseEnemy.skills.map(skill => ({ ...skill, currentCooldown: 0 }))
  };

  const choices: EventChoice[] = [
    {
      text: 'Zaatakuj bezpośrednio',
      result: { type: 'combat', enemy: scaledEnemy }
    }
  ];

  switch (selectedVariation.specialMechanic) {
    case 'ambush':
      choices.push({
        text: 'Wycofaj się i przygotuj obronę',
        result: { 
          type: 'combat', 
          enemy: { ...scaledEnemy, stats: { ...scaledEnemy.stats, strength: scaledEnemy.stats.strength - 2 } },
          description: 'Unikasz zasadzki i zyskujesz przewagę!'
        },
        statRequirement: { stat: 'dexterity', value: 8 + level }
      });
      break;
    case 'arena':
      choices.push({
        text: 'Pozdrow tłum przed walką',
        result: { 
          type: 'combat', 
          enemy: scaledEnemy,
          experience: 50,
          description: 'Tłum cię uwielbia! Dodatkowe doświadczenie!'
        },
        statRequirement: { stat: 'luck', value: 6 + level }
      });
      break;
    case 'duel':
      choices.push({
        text: 'Zaproponuj honorowe zasady',
        result: { 
          type: 'combat', 
          enemy: scaledEnemy,
          experience: 100,
          reputation: 2,
          description: 'Honorowy pojedynek przynosi wielką chwałę!'
        },
        statRequirement: { stat: 'strength', value: 10 + level }
      });
      break;
  }

  choices.push({
    text: 'Spróbuj ominąć walkę',
    result: { 
      experience: 10,
      description: 'Udało ci się przejść niezauważenie.'
    },
    statRequirement: { stat: 'dexterity', value: 12 + level }
  });

  return {
    type: 'combat',
    title: selectedVariation.title,
    description: `${selectedVariation.description} ${specialAbility ? `\n\n🔥 Specjalna mechanika: ${specialAbility}` : ''}`,
    choices,
    uniqueId: selectedVariation.id,
    rarity: selectedVariation.rarity
  };
};

const generateUniqueTreasureEvent = (level: number, reputation: number): RoomEventType => {
  const variations = [
    {
      id: 'dragon_hoard',
      title: 'Skarb Smoka',
      description: 'Znajdujesz legendarny skarb smoka, ale jest strzeżony przez magiczne pułapki.',
      rarity: 'legendary' as const,
      itemQuality: 'legendary'
    },
    {
      id: 'thieves_cache',
      title: 'Kryjówka Złodziei',
      description: 'Odkrywasz sekretną kryjówkę złodziei pełną skradzionych skarbów.',
      rarity: 'uncommon' as const,
      itemQuality: 'rare'
    },
    {
      id: 'ancient_vault',
      title: 'Starożytny Skarbiec',
      description: 'Masywne drzwi skarbca stoją otworem, ukazując bogactwa dawnej cywilizacji.',
      rarity: 'rare' as const,
      itemQuality: 'epic'
    },
    {
      id: 'cursed_treasure',
      title: 'Przeklęty Skarb',
      description: 'Złoto i klejnoty błyszczą kusząco, ale czujesz złowrogą aurę.',
      rarity: 'uncommon' as const,
      itemQuality: 'rare',
      hasCurse: true
    },
    {
      id: 'pirates_chest',
      title: 'Skrzynia Piratów',
      description: 'Stara skrzynia piracka z mapą skarbów i złotem.',
      rarity: 'common' as const,
      itemQuality: 'common'
    },
    {
      id: 'royal_treasury',
      title: 'Królewska Skarbnica',
      description: 'Prywatna skarbnica królewska z koroną i berłem.',
      rarity: 'legendary' as const,
      itemQuality: 'legendary'
    }
  ];

  const availableVariations = variations.filter(v => !usedRoomIds.has(v.id));
  const selectedVariation = availableVariations.length > 0 
    ? availableVariations[Math.floor(Math.random() * availableVariations.length)]
    : variations[Math.floor(Math.random() * variations.length)];

  const treasureItems = ITEM_POOL.filter(item => {
    switch (selectedVariation.itemQuality) {
      case 'legendary': return item.rarity === 'legendary' || item.rarity === 'epic';
      case 'epic': return item.rarity === 'epic' || item.rarity === 'rare';
      case 'rare': return item.rarity === 'rare' || item.rarity === 'common';
      default: return item.rarity === 'common';
    }
  });
  
  const randomItem = treasureItems[Math.floor(Math.random() * treasureItems.length)];
  const bonusItem = treasureItems[Math.floor(Math.random() * treasureItems.length)];

  const choices: EventChoice[] = [];

  choices.push({
    text: 'Ostrożnie przeszukaj skarbiec',
    result: { 
      item: randomItem,
      experience: 30 + level * 5,
      keys: selectedVariation.rarity === 'legendary' ? 3 : 1,
      description: 'Twoja ostrożność zostaje nagrodzona!'
    },
    statRequirement: { stat: 'dexterity', value: 6 + level }
  });

  if (selectedVariation.rarity === 'legendary') {
    choices.push({
      text: 'Weź wszystko co możesz',
      result: { 
        item: randomItem,
        experience: 50 + level * 8,
        keys: 5,
        permanentBonus: { luck: 1 },
        description: 'Zdobywasz niesamowite bogactwa i trwały bonus do szczęścia!'
      },
      statRequirement: { stat: 'strength', value: 12 + level }
    });
  }

  if (selectedVariation.hasCurse) {
    choices.push({
      text: 'Weź skarb ignorując przeklęcie',
      result: { 
        item: bonusItem,
        experience: 40,
        curse: 'cursed_gold',
        description: 'Zdobywasz skarb, ale przeklęcie cię dotyka...'
      }
    });
    
    choices.push({
      text: 'Spróbuj zdjąć przeklęcie',
      result: { 
        item: randomItem,
        experience: 60,
        blessing: 'purified_treasure',
        description: 'Udało ci się oczyścić skarb z przeklęcia!'
      },
      statRequirement: { stat: 'luck', value: 15 + level }
    });
  } else {
    choices.push({
      text: 'Siłą wyłam wszystko',
      result: { 
        item: randomItem,
        health: -15,
        keys: 2,
        description: 'Pułapki się uruchomiły, ale zdobyłeś skarb!'
      },
      statRequirement: { stat: 'strength', value: 8 + level }
    });
  }

  choices.push({
    text: 'Weź tylko to co potrzebne',
    result: { 
      keys: 2 + Math.floor(level / 2),
      experience: 20,
      reputation: 1,
      description: 'Twoja powściągliwość zostanie zapamiętana.'
    }
  });

  return {
    type: 'treasure',
    title: selectedVariation.title,
    description: selectedVariation.description,
    choices,
    uniqueId: selectedVariation.id,
    rarity: selectedVariation.rarity
  };
};

const generateUniqueRestEvent = (level: number, storyFlags: string[]): RoomEventType => {
  const variations = [
    {
      id: 'sacred_shrine',
      title: 'Święta Świątynia',
      description: 'Znajdujesz starożytną świątynię z ołtarzem emanującym świętą energią.',
      rarity: 'rare' as const,
      healingPower: 1.5
    },
    {
      id: 'natural_spring',
      title: 'Naturalne Źródło',
      description: 'Krystalicznie czysta woda tryska z podziemnego źródła.',
      rarity: 'common' as const,
      healingPower: 1.2
    },
    {
      id: 'meditation_garden',
      title: 'Ogród Medytacji',
      description: 'Podziemny ogród pełen świecących roślin i spokojnej energii.',
      rarity: 'uncommon' as const,
      healingPower: 1.3,
      manaBonus: true
    },
    {
      id: 'phoenix_nest',
      title: 'Gniazdo Feniksa',
      description: 'Opuszczone gniazdo feniksa wciąż emanuje regeneracyjną mocą.',
      rarity: 'legendary' as const,
      healingPower: 2.0,
      resurrection: true
    },
    {
      id: 'hermit_hut',
      title: 'Chata Pustelnika',
      description: 'Mały domek pustelnika z ciepłym ogniskiem i ziołami.',
      rarity: 'common' as const,
      healingPower: 1.1,
      wisdom: true
    },
    {
      id: 'crystal_cave',
      title: 'Kryształowa Jaskinia',
      description: 'Jaskinia pełna świecących kryształów przywracających energię.',
      rarity: 'rare' as const,
      healingPower: 1.4,
      manaBonus: true
    }
  ];

  const availableVariations = variations.filter(v => !usedRoomIds.has(v.id));
  const selectedVariation = availableVariations.length > 0 
    ? availableVariations[Math.floor(Math.random() * availableVariations.length)]
    : variations[Math.floor(Math.random() * variations.length)];

  const baseHealing = Math.floor((30 + level * 5) * selectedVariation.healingPower);
  const baseMana = Math.floor((20 + level * 3) * (selectedVariation.manaBonus ? 1.5 : 1));

  const choices: EventChoice[] = [
    {
      text: 'Odpocznij i zregeneruj siły',
      result: { 
        health: baseHealing,
        mana: baseMana,
        experience: 15 + level * 2,
        description: 'Czujesz się całkowicie odświeżony!'
      }
    }
  ];

  if (selectedVariation.wisdom) {
    choices.push({
      text: 'Porozmawiaj z pustelnikiem',
      result: { 
        experience: 40 + level * 3,
        storyFlag: 'hermit_wisdom',
        health: Math.floor(baseHealing * 0.7),
        description: 'Pustelnik dzieli się cenną mądrością.'
      }
    });
  }

  if (selectedVariation.resurrection) {
    choices.push({
      text: 'Skorzystaj z mocy feniksa',
      result: { 
        health: 999,
        mana: 999,
        permanentBonus: { endurance: 1 },
        experience: 100,
        description: 'Moc feniksa całkowicie cię odnawia i wzmacnia!'
      },
      statRequirement: { stat: 'luck', value: 15 + level }
    });
  }

  if (selectedVariation.manaBonus) {
    choices.push({
      text: 'Medytuj wśród kryształów/roślin',
      result: { 
        mana: Math.floor(baseMana * 1.5),
        experience: 25,
        permanentBonus: { luck: 1 },
        description: 'Twój umysł staje się jaśniejszy i bardziej szczęśliwy.'
      },
      statRequirement: { stat: 'luck', value: 8 + level }
    });
  }

  choices.push({
    text: 'Przeszukaj okolice',
    result: { 
      keys: 1 + Math.floor(level / 3),
      experience: 10,
      health: Math.floor(baseHealing * 0.5),
      description: 'Znajdujesz ukryte skarby.'
    },
    statRequirement: { stat: 'dexterity', value: 6 + level }
  });

  return {
    type: 'rest',
    title: selectedVariation.title,
    description: selectedVariation.description,
    choices,
    uniqueId: selectedVariation.id,
    rarity: selectedVariation.rarity
  };
};

const generateSpecialRoomEvent = (level: number, reputation: number, storyFlags: string[]): RoomEventType => {
  const specialRooms = [
    {
      id: 'time_chamber',
      title: 'Komnata Czasu',
      description: 'Czas płynie tu inaczej. Możesz przyspieszyć swój rozwój.',
      rarity: 'legendary' as const,
      type: 'training' as const
    },
    {
      id: 'soul_forge',
      title: 'Kuźnia Dusz',
      description: 'Starożytna kuźnia pozwala przekuć doświadczenia w moc.',
      rarity: 'rare' as const,
      type: 'forge' as const
    },
    {
      id: 'memory_library',
      title: 'Biblioteka Wspomnień',
      description: 'Księgi zawierają wspomnienia dawnych bohaterów.',
      rarity: 'uncommon' as const,
      type: 'library' as const
    },
    {
      id: 'nightmare_prison',
      title: 'Więzienie Koszmarów',
      description: 'Uwięzione koszmary oferują moc w zamian za wolność.',
      rarity: 'rare' as const,
      type: 'prison' as const
    },
    {
      id: 'alchemist_lab',
      title: 'Laboratorium Alchemika',
      description: 'Opuszczone laboratorium pełne magicznych mikstur.',
      rarity: 'uncommon' as const,
      type: 'laboratory' as const
    }
  ];

  const availableRooms = specialRooms.filter(room => !usedRoomIds.has(room.id));
  const selectedRoom = availableRooms.length > 0 
    ? availableRooms[Math.floor(Math.random() * availableRooms.length)]
    : specialRooms[Math.floor(Math.random() * specialRooms.length)];

  let choices: EventChoice[] = [];

  switch (selectedRoom.type) {
    case 'training':
      choices = [
        {
          text: 'Trenuj w przyspieszonym czasie',
          result: { 
            permanentBonus: { strength: 1, dexterity: 1 },
            experience: 100,
            description: 'Czas pozwala ci osiągnąć mistrzostwo!'
          },
          statRequirement: { stat: 'endurance', value: 12 + level }
        },
        {
          text: 'Medytuj nad naturą czasu',
          result: { 
            permanentBonus: { luck: 2 },
            experience: 80,
            description: 'Rozumiesz głębsze prawdy o czasie.'
          },
          statRequirement: { stat: 'luck', value: 10 + level }
        }
      ];
      break;

    case 'forge':
      choices = [
        {
          text: 'Przekuj swoje doświadczenia',
          result: { 
            experience: -50,
            permanentBonus: { strength: 2 },
            description: 'Tracisz doświadczenie, ale zyskujesz trwałą siłę!'
          }
        },
        {
          text: 'Ulepszaj swój ekwipunek',
          result: { 
            experience: 50,
            keys: 3,
            description: 'Twój ekwipunek staje się potężniejszy!'
          },
          keyRequirement: 2
        }
      ];
      break;

    case 'library':
      choices = [
        {
          text: 'Studiuj starożytną wiedzę',
          result: { 
            experience: 150,
            storyFlag: 'ancient_knowledge',
            description: 'Zdobywasz bezcenną wiedzę!'
          },
          statRequirement: { stat: 'luck', value: 8 + level }
        },
        {
          text: 'Poszukaj map i sekretów',
          result: { 
            keys: 4,
            experience: 60,
            description: 'Znajdujesz mapy prowadzące do skarbów!'
          },
          statRequirement: { stat: 'dexterity', value: 10 + level }
        }
      ];
      break;

    case 'prison':
      choices = [
        {
          text: 'Uwolnij koszmary za moc',
          result: { 
            permanentBonus: { strength: 3 },
            curse: 'nightmare_whispers',
            description: 'Zyskujesz moc, ale koszmary cię nawiedzają...'
          }
        },
        {
          text: 'Spróbuj kontrolować koszmary',
          result: { 
            permanentBonus: { luck: 2, dexterity: 1 },
            experience: 120,
            description: 'Udaje ci się okiełznać moc koszmarów!'
          },
          statRequirement: { stat: 'luck', value: 15 + level }
        }
      ];
      break;

    case 'laboratory':
      choices = [
        {
          text: 'Wypij tajemniczą miksturę',
          result: { 
            health: Math.random() > 0.5 ? 50 : -20,
            mana: Math.random() > 0.5 ? 30 : -10,
            experience: 40,
            description: 'Efekty są nieprzewidywalne!'
          }
        },
        {
          text: 'Przeanalizuj składniki',
          result: { 
            experience: 80,
            keys: 2,
            storyFlag: 'alchemy_knowledge',
            description: 'Uczysz się tajników alchemii!'
          },
          statRequirement: { stat: 'luck', value: 12 + level }
        }
      ];
      break;
  }

  choices.push({
    text: 'Opuść to miejsce',
    result: { 
      experience: 10,
      description: 'Czasem mądrość polega na powstrzymaniu się.'
    }
  });

  return {
    type: selectedRoom.type,
    title: selectedRoom.title,
    description: selectedRoom.description,
    choices,
    uniqueId: selectedRoom.id,
    rarity: selectedRoom.rarity
  };
};

const generateUniqueMerchantEvent = (level: number, reputation: number): RoomEventType => {
  const merchantTypes = [
    { id: 'shadow_dealer', title: 'Handlarz Cieni', rarity: 'rare' as const },
    { id: 'fairy_merchant', title: 'Wróżka Handlarka', rarity: 'uncommon' as const },
    { id: 'demon_trader', title: 'Demoniczny Kupiec', rarity: 'legendary' as const },
    { id: 'ghost_vendor', title: 'Duchowy Sprzedawca', rarity: 'uncommon' as const }
  ];

  const available = merchantTypes.filter(m => !usedRoomIds.has(m.id));
  const selected = available.length > 0 ? available[0] : merchantTypes[0];

  return {
    type: 'merchant',
    title: selected.title,
    description: `Spotykasz ${selected.title.toLowerCase()}a oferującego unikalne towary...`,
    choices: [
      {
        text: 'Handluj',
        result: { keys: -2, experience: 30, description: 'Udany handel!' },
        keyRequirement: 2
      }
    ],
    uniqueId: selected.id,
    rarity: selected.rarity
  };
};

const generateUniquePuzzleEvent = (level: number, storyFlags: string[]): RoomEventType => {
  const puzzleTypes = [
    { id: 'riddle_sphinx', title: 'Zagadka Sfinksa', rarity: 'legendary' as const },
    { id: 'crystal_puzzle', title: 'Kryształowa Łamigłówka', rarity: 'rare' as const },
    { id: 'ancient_mechanism', title: 'Starożytny Mechanizm', rarity: 'uncommon' as const }
  ];

  const available = puzzleTypes.filter(p => !usedRoomIds.has(p.id));
  const selected = available.length > 0 ? available[0] : puzzleTypes[0];

  return {
    type: 'puzzle',
    title: selected.title,
    description: `Stoisz przed ${selected.title.toLowerCase()}...`,
    choices: [
      {
        text: 'Rozwiąż zagadkę',
        result: { experience: 100, keys: 3, description: 'Twoja mądrość zostaje nagrodzona!' },
        statRequirement: { stat: 'luck', value: 10 + level }
      }
    ],
    uniqueId: selected.id,
    rarity: selected.rarity
  };
};

const generateUniqueStoryEvent = (level: number, storyFlags: string[]): RoomEventType => {
  const storyTypes = [
    { id: 'ancient_mural', title: 'Starożytny Mural', rarity: 'uncommon' as const },
    { id: 'prophetic_vision', title: 'Prorocza Wizja', rarity: 'rare' as const },
    { id: 'time_echo', title: 'Echo Przeszłości', rarity: 'legendary' as const }
  ];

  const available = storyTypes.filter(s => !usedRoomIds.has(s.id));
  const selected = available.length > 0 ? available[0] : storyTypes[0];

  return {
    type: 'story',
    title: selected.title,
    description: `Odkrywasz ${selected.title.toLowerCase()}...`,
    choices: [
      {
        text: 'Wysłuchaj historii',
        result: { experience: 50, storyFlag: selected.id, description: 'Zdobywasz cenną wiedzę!' }
      }
    ],
    uniqueId: selected.id,
    rarity: selected.rarity
  };
};

const generateUniqueMoralEvent = (level: number, reputation: number): RoomEventType => {
  const moralTypes = [
    { id: 'dying_knight', title: 'Umierający Rycerz', rarity: 'uncommon' as const },
    { id: 'cursed_child', title: 'Przeklęte Dziecko', rarity: 'rare' as const },
    { id: 'fallen_angel', title: 'Upadły Anioł', rarity: 'legendary' as const }
  ];

  const available = moralTypes.filter(m => !usedRoomIds.has(m.id));
  const selected = available.length > 0 ? available[0] : moralTypes[0];

  return {
    type: 'moral_choice',
    title: selected.title,
    description: `Spotykasz ${selected.title.toLowerCase()}a...`,
    choices: [
      {
        text: 'Pomóż',
        result: { reputation: 3, experience: 40, description: 'Twoja dobroć zostanie zapamiętana.' }
      },
      {
        text: 'Ignoruj',
        result: { experience: 10, description: 'Idziesz dalej.' }
      }
    ],
    uniqueId: selected.id,
    rarity: selected.rarity
  };
};

const generateUniqueTrainingEvent = (level: number): RoomEventType => {
  const trainingTypes = [
    { id: 'masters_dojo', title: 'Dojo Mistrza', rarity: 'rare' as const },
    { id: 'elemental_chamber', title: 'Komnata Żywiołów', rarity: 'legendary' as const }
  ];

  const available = trainingTypes.filter(t => !usedRoomIds.has(t.id));
  const selected = available.length > 0 ? available[0] : trainingTypes[0];

  return {
    type: 'training',
    title: selected.title,
    description: `Znajdujesz ${selected.title.toLowerCase()}...`,
    choices: [
      {
        text: 'Trenuj',
        result: { statBonus: { strength: 1 }, experience: 30, description: 'Stajesz się silniejszy!' }
      }
    ],
    uniqueId: selected.id,
    rarity: selected.rarity
  };
};

const generateUniquePortalEvent = (level: number): RoomEventType => {
  return {
    type: 'portal',
    title: 'Magiczny Portal',
    description: 'Wirujący portal prowadzi w nieznane...',
    choices: [
      {
        text: 'Wskocz',
        result: { experience: 50, description: 'Podróżujesz przez wymiary!' }
      }
    ],
    uniqueId: `portal_${level}_${Math.random()}`,
    rarity: 'rare'
  };
};

const generateUniqueBossEvent = (level: number): RoomEventType => {
  return {
    type: 'boss',
    title: 'Strażnik Poziomu',
    description: 'Potężny boss blokuje drogę...',
    choices: [
      {
        text: 'Walcz',
        result: { type: 'combat', description: 'Rozpoczyna się epicki pojedynek!' }
      }
    ],
    uniqueId: `boss_${level}`,
    rarity: 'legendary'
  };
};

const generateUniqueHiddenEvent = (level: number, reputation: number): RoomEventType => {
  return {
    type: 'hidden',
    title: 'Ukryta Komnata',
    description: 'Twoja percepcja odkrywa sekretne przejście...',
    choices: [
      {
        text: 'Eksploruj',
        result: { keys: 3, experience: 60, description: 'Znajdujesz niesamowite skarby!' }
      }
    ],
    uniqueId: `hidden_${level}_${reputation}`,
    rarity: 'rare'
  };
};