import React, { useState } from 'react';
import { User, Sword, Shield, Heart, Sparkles, Zap, Crown, Flame } from 'lucide-react';
import { Character, Stats } from '../types/game';
import { AVAILABLE_SKILLS } from '../data/skills';
import { STARTING_ITEMS } from '../data/items';

interface CharacterCreationProps {
  onCharacterCreated: (character: Character) => void;
}

type Race = 'human' | 'elf' | 'dwarf' | 'orc' | 'tiefling';
type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'paladin' | 'ranger';

const RACES = {
  human: {
    name: 'Człowiek',
    description: 'Wszechstronni i zdeterminowani',
    bonuses: { strength: 2, dexterity: 2, endurance: 2, luck: 2 },
    special: 'Determinacja - ignoruje śmiertelne obrażenia raz na walkę',
    icon: <User className="w-6 h-6" />
  },
  elf: {
    name: 'Elf',
    description: 'Zwinni i magicznie uzdolnieni',
    bonuses: { strength: 0, dexterity: 4, endurance: -2, luck: 2 },
    special: 'Łuk Elficki - zwiększony zasięg ataków dystansowych',
    icon: <Zap className="w-6 h-6" />
  },
  dwarf: {
    name: 'Krasnolud',
    description: 'Wytrzymali i odporni',
    bonuses: { strength: 2, dexterity: -2, endurance: 4, luck: 0 },
    special: 'Gniew Berserka - obrażenia rosną ze spadkiem HP',
    icon: <Shield className="w-6 h-6" />
  },
  orc: {
    name: 'Ork',
    description: 'Silni i dzicy wojownicy',
    bonuses: { strength: 3, dexterity: 0, endurance: 3, luck: -2 },
    special: 'Krwawy Szał - zabójstwa przywracają HP i MP',
    icon: <Sword className="w-6 h-6" />
  },
  tiefling: {
    name: 'Tiefling',
    description: 'Inteligentni i charyzmatyczni',
    bonuses: { strength: 0, dexterity: 2, endurance: -2, luck: 4 },
    special: 'Pakt Demoniczny - wymiana HP na MP (2:1)',
    icon: <Flame className="w-6 h-6" />
  }
};

const CLASSES = {
  warrior: {
    name: 'Wojownik',
    description: 'Mistrz walki wręcz i obrony',
    primaryStats: ['strength', 'endurance'],
    startingSkill: 'power_strike',
    icon: <Sword className="w-6 h-6" />
  },
  mage: {
    name: 'Mag',
    description: 'Władca magii i zaklęć',
    primaryStats: ['luck', 'endurance'],
    startingSkill: 'heal',
    icon: <Sparkles className="w-6 h-6" />
  },
  rogue: {
    name: 'Łotrzyk',
    description: 'Zwinny i precyzyjny',
    primaryStats: ['dexterity', 'luck'],
    startingSkill: 'dodge',
    icon: <Zap className="w-6 h-6" />
  },
  paladin: {
    name: 'Paladyn',
    description: 'Święty wojownik',
    primaryStats: ['strength', 'luck'],
    startingSkill: 'heal',
    icon: <Crown className="w-6 h-6" />
  },
  ranger: {
    name: 'Ranger',
    description: 'Łowca i tropiciel',
    primaryStats: ['dexterity', 'endurance'],
    startingSkill: 'dodge',
    icon: <Heart className="w-6 h-6" />
  }
};

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated }) => {
  const [characterName, setCharacterName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race>('human');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [availablePoints, setAvailablePoints] = useState(10);
  const [stats, setStats] = useState<Stats>({ strength: 5, dexterity: 5, endurance: 5, luck: 5 });

  const adjustStat = (stat: keyof Stats, change: number) => {
    const newValue = stats[stat] + change;
    if (newValue >= 1 && newValue <= 20) {
      const pointChange = -change;
      if (availablePoints + pointChange >= 0) {
        setStats(prev => ({ ...prev, [stat]: newValue }));
        setAvailablePoints(prev => prev + pointChange);
      }
    }
  };

  const getFinalStats = (): Stats => {
    const raceBonus = RACES[selectedRace].bonuses;
    return {
      strength: Math.max(1, stats.strength + raceBonus.strength),
      dexterity: Math.max(1, stats.dexterity + raceBonus.dexterity),
      endurance: Math.max(1, stats.endurance + raceBonus.endurance),
      luck: Math.max(1, stats.luck + raceBonus.luck)
    };
  };

  const createCharacter = () => {
    if (!characterName.trim() || availablePoints > 0) return;

    const finalStats = getFinalStats();
    const classData = CLASSES[selectedClass];
    const startingSkill = AVAILABLE_SKILLS.find(skill => skill.id === classData.startingSkill)!;
    const startingItem = STARTING_ITEMS[Math.floor(Math.random() * STARTING_ITEMS.length)];

    const character: Character = {
      name: characterName,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      health: 50 + (finalStats.endurance * 10),
      maxHealth: 50 + (finalStats.endurance * 10),
      mana: 30 + (finalStats.endurance * 5),
      maxMana: 30 + (finalStats.endurance * 5),
      stats: finalStats,
      availableStatPoints: 0,
      skills: [{ ...startingSkill, unlocked: true }],
      availableSkillPoints: 0,
      equipment: {
        [startingItem.type]: startingItem
      },
      inventory: [startingItem]
    };

    onCharacterCreated(character);
  };

  const finalStats = getFinalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-6xl w-full border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Stwórz Swojego Bohatera</h1>
          <p className="text-gray-400">Rozpocznij swoją przygodę w Arena Nexus!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Imię Bohatera</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                placeholder="Wprowadź imię..."
              />
            </div>

            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Rasa</label>
              <div className="space-y-2">
                {Object.entries(RACES).map(([key, race]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRace(key as Race)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedRace === key
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-600 bg-gray-700 hover:border-yellow-400'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="text-yellow-400 mr-2">{race.icon}</div>
                      <div className="text-white font-semibold">{race.name}</div>
                    </div>
                    <div className="text-gray-300 text-sm mb-1">{race.description}</div>
                    <div className="text-green-400 text-xs">{race.special}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-yellow-400 font-semibold mb-3">Klasa</label>
              <div className="space-y-2">
                {Object.entries(CLASSES).map(([key, charClass]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedClass(key as CharacterClass)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedClass === key
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-600 bg-gray-700 hover:border-yellow-400'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="text-yellow-400 mr-2">{charClass.icon}</div>
                      <div className="text-white font-semibold">{charClass.name}</div>
                    </div>
                    <div className="text-gray-300 text-sm">{charClass.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-yellow-400 font-semibold">Statystyki</label>
                <span className="text-white bg-gray-700 px-3 py-1 rounded-full text-sm">
                  Punkty: {availablePoints}
                </span>
              </div>
              
              <div className="space-y-3">
                {Object.entries(stats).map(([stat, value]) => {
                  const raceBonus = RACES[selectedRace].bonuses[stat as keyof Stats];
                  const finalValue = Math.max(1, value + raceBonus);
                  
                  return (
                    <div key={stat} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-semibold capitalize">
                          {stat === 'strength' ? 'Siła' : 
                           stat === 'dexterity' ? 'Zręczność' : 
                           stat === 'endurance' ? 'Wytrzymałość' : 'Szczęście'}
                        </div>
                        <div className="text-xl font-bold text-yellow-400">
                          {value}
                          {raceBonus !== 0 && (
                            <span className={`text-sm ml-1 ${raceBonus > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({raceBonus > 0 ? '+' : ''}{raceBonus})
                            </span>
                          )}
                          <span className="text-white text-sm ml-2">= {finalValue}</span>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => adjustStat(stat as keyof Stats, -1)}
                          disabled={value <= 1}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors duration-200"
                        >
                          -
                        </button>
                        <button
                          onClick={() => adjustStat(stat as keyof Stats, 1)}
                          disabled={value >= 20 || availablePoints <= 0}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4 text-center">Podgląd Postaci</h3>
              
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {characterName || 'Twój Bohater'}
                </div>
                <div className="text-gray-300">
                  {RACES[selectedRace].name} {CLASSES[selectedClass].name}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Punkty Życia:</span>
                  <span className="text-white font-bold">{50 + (finalStats.endurance * 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Punkty Many:</span>
                  <span className="text-white font-bold">{30 + (finalStats.endurance * 5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Obrażenia Bazowe:</span>
                  <span className="text-white font-bold">{10 + finalStats.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Szansa na Unik:</span>
                  <span className="text-white font-bold">{Math.floor(finalStats.dexterity / 2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Szansa na Krytyk:</span>
                  <span className="text-white font-bold">{Math.floor(finalStats.dexterity / 3) + Math.floor(finalStats.luck / 4)}%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-600 rounded">
                <div className="text-green-400 text-sm font-semibold mb-1">Zdolność rasowa:</div>
                <div className="text-green-300 text-xs">{RACES[selectedRace].special}</div>
              </div>

              <div className="mt-3 p-3 bg-gray-600 rounded">
                <div className="text-blue-400 text-sm font-semibold mb-1">Startowa umiejętność:</div>
                <div className="text-blue-300 text-xs">
                  {AVAILABLE_SKILLS.find(s => s.id === CLASSES[selectedClass].startingSkill)?.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={createCharacter}
            disabled={!characterName.trim() || availablePoints > 0}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {availablePoints > 0 ? `Rozdaj pozostałe punkty (${availablePoints})` : 'Rozpocznij Przygodę w Arena Nexus!'}
          </button>
        </div>
      </div>
    </div>
  );
};