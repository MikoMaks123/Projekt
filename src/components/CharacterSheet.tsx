import React, { useState } from 'react';
import { User, Sword, Shield, Heart, Star, Package, X, TrendingUp, Zap } from 'lucide-react';
import { Character, Item } from '../types/game';

interface CharacterSheetProps {
  player: Character;
  onClose: () => void;
  onPlayerUpdate?: (player: Character) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ player, onClose, onPlayerUpdate }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Character>({ ...player });

  const getEquipmentBonus = (effectType: string): number => {
    let bonus = 0;
    Object.values(currentPlayer.equipment).forEach(item => {
      if (item) {
        item.effects.forEach(effect => {
          if (effect.type === effectType) {
            bonus += effect.value;
          }
        });
      }
    });
    return bonus;
  };

  const getTotalStat = (baseStat: number, statName: string): number => {
    let total = baseStat;
    Object.values(currentPlayer.equipment).forEach(item => {
      if (item && item.stats[statName as keyof typeof item.stats]) {
        total += item.stats[statName as keyof typeof item.stats] || 0;
      }
    });
    return total;
  };

  const getProgressToNext = (): number => {
    return (currentPlayer.experience / currentPlayer.experienceToNext) * 100;
  };

  const equipItem = (item: Item) => {
    const updatedPlayer = { ...currentPlayer };
    
    const currentEquipped = updatedPlayer.equipment[item.type];
    if (currentEquipped) {
      Object.entries(currentEquipped.stats).forEach(([stat, value]) => {
        if (stat in updatedPlayer.stats) {
          updatedPlayer.stats[stat as keyof typeof updatedPlayer.stats] -= value || 0;
        }
      });
      
      if (currentEquipped.stats.endurance) {
        const healthBonus = currentEquipped.stats.endurance * 10;
        const manaBonus = currentEquipped.stats.endurance * 5;
        updatedPlayer.maxHealth -= healthBonus;
        updatedPlayer.maxMana -= manaBonus;
        updatedPlayer.health = Math.min(updatedPlayer.health, updatedPlayer.maxHealth);
        updatedPlayer.mana = Math.min(updatedPlayer.mana, updatedPlayer.maxMana);
      }
    }
    
    updatedPlayer.equipment[item.type] = item;
    
    Object.entries(item.stats).forEach(([stat, value]) => {
      if (stat in updatedPlayer.stats) {
        updatedPlayer.stats[stat as keyof typeof updatedPlayer.stats] += value || 0;
      }
    });
    
    if (item.stats.endurance) {
      const healthBonus = item.stats.endurance * 10;
      const manaBonus = item.stats.endurance * 5;
      updatedPlayer.maxHealth += healthBonus;
      updatedPlayer.maxMana += manaBonus;
      updatedPlayer.health += healthBonus;
      updatedPlayer.mana += manaBonus;
    }
    
    setCurrentPlayer(updatedPlayer);
    if (onPlayerUpdate) {
      onPlayerUpdate(updatedPlayer);
    }
  };

  const unequipItem = (itemType: string) => {
    const updatedPlayer = { ...currentPlayer };
    const item = updatedPlayer.equipment[itemType as keyof typeof updatedPlayer.equipment];
    
    if (item) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (stat in updatedPlayer.stats) {
          updatedPlayer.stats[stat as keyof typeof updatedPlayer.stats] -= value || 0;
        }
      });
      
      if (item.stats.endurance) {
        const healthBonus = item.stats.endurance * 10;
        const manaBonus = item.stats.endurance * 5;
        updatedPlayer.maxHealth -= healthBonus;
        updatedPlayer.maxMana -= manaBonus;
        updatedPlayer.health = Math.min(updatedPlayer.health, updatedPlayer.maxHealth);
        updatedPlayer.mana = Math.min(updatedPlayer.mana, updatedPlayer.maxMana);
      }
      
      delete updatedPlayer.equipment[itemType as keyof typeof updatedPlayer.equipment];
      
      setCurrentPlayer(updatedPlayer);
      if (onPlayerUpdate) {
        onPlayerUpdate(updatedPlayer);
      }
    }
  };

  const canLevelUp = currentPlayer.experience >= currentPlayer.experienceToNext;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{currentPlayer.name}</h1>
              <p className="text-gray-400">Poziom {currentPlayer.level} Bohater</p>
              {canLevelUp && (
                <p className="text-yellow-400 text-sm font-semibold animate-pulse">
                  ⭐ Gotowy do awansu!
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Postęp
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Doświadczenie</span>
                    <span>{currentPlayer.experience}/{currentPlayer.experienceToNext}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        canLevelUp ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, getProgressToNext())}%` }}
                    />
                  </div>
                  {canLevelUp && (
                    <div className="text-yellow-400 text-xs mt-1 font-semibold">
                      Możesz awansować!
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Punkty statystyk:</span>
                    <div className="text-white font-bold">{currentPlayer.availableStatPoints}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Punkty umiejętności:</span>
                    <div className="text-white font-bold">{currentPlayer.availableSkillPoints}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Statystyki
              </h2>
              <div className="space-y-3">
                {Object.entries(currentPlayer.stats).map(([stat, value]) => {
                  const totalValue = getTotalStat(value, stat);
                  const bonus = totalValue - value;
                  
                  return (
                    <div key={stat} className="flex justify-between items-center">
                      <span className="text-gray-300 capitalize">
                        {stat === 'strength' ? 'Siła' : 
                         stat === 'dexterity' ? 'Zręczność' : 
                         stat === 'endurance' ? 'Wytrzymałość' : 'Szczęście'}
                      </span>
                      <div className="text-white font-bold">
                        {value}
                        {bonus > 0 && <span className="text-green-400"> (+{bonus})</span>}
                        {bonus < 0 && <span className="text-red-400"> ({bonus})</span>}
                        <span className="text-yellow-400 ml-1">= {totalValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Zasoby
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Punkty Życia</span>
                    <span>{currentPlayer.health}/{currentPlayer.maxHealth}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(currentPlayer.health / currentPlayer.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Punkty Many</span>
                    <span>{currentPlayer.mana}/{currentPlayer.maxMana}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(currentPlayer.mana / currentPlayer.maxMana) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Bonusy z Ekwipunku</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bonus do obrażeń:</span>
                  <span className="text-green-400">+{getEquipmentBonus('damage_bonus')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Szansa na unik:</span>
                  <span className="text-blue-400">+{getEquipmentBonus('dodge_chance')}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Szansa na krytyk:</span>
                  <span className="text-yellow-400">+{getEquipmentBonus('crit_chance')}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bonus do leczenia:</span>
                  <span className="text-purple-400">+{getEquipmentBonus('heal_bonus')}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Sword className="w-5 h-5 mr-2 text-orange-500" />
                Umiejętności
              </h2>
              <div className="space-y-3">
                {currentPlayer.skills.filter(skill => skill.unlocked).map((skill) => (
                  <div key={skill.id} className="bg-gray-600 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{skill.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        skill.type === 'offensive' ? 'bg-red-500/20 text-red-400' :
                        skill.type === 'defensive' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {skill.type === 'offensive' ? 'Ofensywna' :
                         skill.type === 'defensive' ? 'Defensywna' : 'Wsparcie'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{skill.description}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Koszt many: {skill.manaCost}</span>
                      <span>Cooldown: {skill.cooldown} tur</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-500" />
                Ekwipunek
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-3">Założone:</h3>
                  <div className="space-y-3">
                    {['weapon', 'armor', 'accessory'].map((slot) => {
                      const item = currentPlayer.equipment[slot as keyof typeof currentPlayer.equipment];
                      return (
                        <div key={slot} className="bg-gray-600 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm capitalize flex items-center">
                              {slot === 'weapon' && <Sword className="w-4 h-4 mr-1" />}
                              {slot === 'armor' && <Shield className="w-4 h-4 mr-1" />}
                              {slot === 'accessory' && <Star className="w-4 h-4 mr-1" />}
                              {slot === 'weapon' ? 'Broń' : 
                               slot === 'armor' ? 'Zbroja' : 'Akcesorium'}:
                            </span>
                            {item && (
                              <button
                                onClick={() => unequipItem(slot)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Zdejmij
                              </button>
                            )}
                          </div>
                          {item ? (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-semibold ${
                                  item.rarity === 'legendary' ? 'text-yellow-400' :
                                  item.rarity === 'epic' ? 'text-purple-400' :
                                  item.rarity === 'rare' ? 'text-blue-400' : 'text-white'
                                }`}>
                                  {item.name}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                                  item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                  item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {item.rarity === 'legendary' ? 'Legendarny' :
                                   item.rarity === 'epic' ? 'Epicki' :
                                   item.rarity === 'rare' ? 'Rzadki' : 'Zwykły'}
                                </span>
                              </div>
                              <p className="text-gray-300 text-xs mb-2">{item.description}</p>
                              
                              {Object.entries(item.stats).length > 0 && (
                                <div className="mb-2">
                                  {Object.entries(item.stats).map(([stat, value]) => (
                                    <div key={stat} className="text-green-400 text-xs">
                                      +{value} {stat === 'strength' ? 'Siła' : 
                                               stat === 'dexterity' ? 'Zręczność' : 
                                               stat === 'endurance' ? 'Wytrzymałość' : 'Szczęście'}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {item.effects.length > 0 && (
                                <div>
                                  {item.effects.map((effect, index) => (
                                    <div key={index} className="text-blue-400 text-xs">
                                      {effect.description}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic text-sm">Brak</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Inwentarz ({currentPlayer.inventory.length}):</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentPlayer.inventory.length === 0 ? (
                      <div className="text-gray-400 text-sm text-center py-4">
                        Inwentarz jest pusty
                      </div>
                    ) : (
                      currentPlayer.inventory.map((item, index) => {
                        const isEquipped = currentPlayer.equipment[item.type] === item;
                        return (
                          <div key={index} className={`bg-gray-600 rounded p-2 ${isEquipped ? 'ring-2 ring-yellow-500' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-sm ${
                                item.rarity === 'legendary' ? 'text-yellow-400' :
                                item.rarity === 'epic' ? 'text-purple-400' :
                                item.rarity === 'rare' ? 'text-blue-400' : 'text-white'
                              }`}>
                                {item.name}
                                {isEquipped && <span className="text-yellow-400 ml-1">✓</span>}
                              </span>
                              <div className="flex space-x-1">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                                  item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                  item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {item.rarity === 'legendary' ? 'Leg' :
                                   item.rarity === 'epic' ? 'Epic' :
                                   item.rarity === 'rare' ? 'Rzad' : 'Zwy'}
                                </span>
                                {!isEquipped && (
                                  <button
                                    onClick={() => equipItem(item)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors duration-200"
                                  >
                                    Załóż
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-300 text-xs mb-1">{item.description}</p>
                            
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.stats).map(([stat, value]) => (
                                <span key={stat} className="text-green-400 text-xs bg-green-500/20 px-1 rounded">
                                  +{value} {stat.slice(0, 3)}
                                </span>
                              ))}
                              {item.effects.map((effect, effectIndex) => (
                                <span key={effectIndex} className="text-blue-400 text-xs bg-blue-500/20 px-1 rounded">
                                  {effect.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};