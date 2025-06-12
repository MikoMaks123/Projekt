import React, { useState, useEffect } from 'react';
import { Sword, Shield, Heart, Zap, Target, Dices, Star, Package } from 'lucide-react';
import { Character, Enemy, CombatState, ActionType, Skill } from '../types/game';

interface CombatProps {
  player: Character;
  enemy: Enemy;
  onCombatEnd: (victory: boolean, updatedPlayer: Character) => void;
}

export const Combat: React.FC<CombatProps> = ({ player, enemy, onCombatEnd }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Character>({ ...player });
  const [currentEnemy, setCurrentEnemy] = useState<Enemy>({ ...enemy });
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatLog, setCombatLog] = useState<string[]>([
    `${player.name} (poziom ${player.level}) staje do walki z ${enemy.name} (poziom ${enemy.level})!`
  ]);
  const [combatState, setCombatState] = useState<CombatState>({
    playerEffects: [],
    enemyEffects: [],
    turn: 1
  });

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-6), message]);
  };

  const calculateDamage = (attacker: Character | Enemy, isPlayer: boolean, skillMultiplier = 1): number => {
    const baseAttack = attacker.stats.strength + (isPlayer ? getEquipmentBonus('damage_bonus') : 0);
    const baseDamage = Math.max(1, (baseAttack * skillMultiplier) + Math.floor(attacker.stats.luck / 4));
    
    const variance = Math.random() * 0.4 + 0.8;
    let damage = Math.floor(baseDamage * variance);

    const critChance = Math.floor(attacker.stats.dexterity / 3) + Math.floor(attacker.stats.luck / 4) + 
                      (isPlayer ? getEquipmentBonus('crit_chance') : 0);
    
    if (Math.random() * 100 < critChance) {
      damage = Math.floor(damage * 1.5);
      addToCombatLog(`💥 Trafienie krytyczne! (+50% obrażeń)`);
    }

    return damage;
  };

  const calculateDodgeChance = (defender: Character | Enemy, isPlayer: boolean): number => {
    const baseDodge = Math.floor(defender.stats.dexterity / 2) + Math.floor(defender.stats.luck / 6);
    const equipmentBonus = isPlayer ? getEquipmentBonus('dodge_chance') : 0;
    const effectBonus = isPlayer ? 
      combatState.playerEffects.find(e => e.type === 'dodge_boost')?.value || 0 :
      combatState.enemyEffects.find(e => e.type === 'dodge_boost')?.value || 0;
    
    return Math.min(75, baseDodge + equipmentBonus + effectBonus);
  };

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

  const playerAction = (action: ActionType, skillId?: string) => {
    if (!isPlayerTurn) return;

    let newPlayer = { ...currentPlayer };
    let newEnemy = { ...currentEnemy };
    let logMessage = '';

    switch (action) {
      case 'attack':
        const dodgeChance = calculateDodgeChance(currentEnemy, false);
        if (Math.random() * 100 < dodgeChance) {
          logMessage = `${currentEnemy.name} unika ataku ${newPlayer.name}!`;
        } else {
          const damage = calculateDamage(newPlayer, true);
          const shieldEffect = combatState.enemyEffects.find(e => e.type === 'shield');
          
          if (shieldEffect && shieldEffect.value > 0) {
            const blockedDamage = Math.min(damage, shieldEffect.value);
            shieldEffect.value -= blockedDamage;
            const remainingDamage = damage - blockedDamage;
            newEnemy.health = Math.max(0, newEnemy.health - remainingDamage);
            logMessage = `${newPlayer.name} atakuje! Tarcza blokuje ${blockedDamage} obrażeń, ${remainingDamage} przebija się!`;
          } else {
            newEnemy.health = Math.max(0, newEnemy.health - damage);
            logMessage = `${newPlayer.name} atakuje i zadaje ${damage} obrażeń!`;
          }
        }
        break;

      case 'skill':
        if (!skillId) return;
        const skill = newPlayer.skills.find(s => s.id === skillId);
        if (!skill || skill.currentCooldown > 0 || newPlayer.mana < skill.manaCost) return;

        newPlayer.mana -= skill.manaCost;
        skill.currentCooldown = skill.cooldown;

        switch (skill.type) {
          case 'offensive':
            const skillDodgeChance = calculateDodgeChance(currentEnemy, false);
            if (Math.random() * 100 < skillDodgeChance) {
              logMessage = `${currentEnemy.name} unika ${skill.name}!`;
            } else {
              const skillDamage = skill.effect.damage || 
                                calculateDamage(newPlayer, true, skill.effect.damageMultiplier || 1);
              newEnemy.health = Math.max(0, newEnemy.health - skillDamage);
              logMessage = `${newPlayer.name} używa ${skill.name} i zadaje ${skillDamage} obrażeń!`;
            }
            break;

          case 'defensive':
            if (skill.effect.shield) {
              setCombatState(prev => ({
                ...prev,
                playerEffects: [...prev.playerEffects.filter(e => e.type !== 'shield'), {
                  type: 'shield',
                  value: skill.effect.shield!,
                  duration: skill.effect.duration || 1,
                  description: `Tarcza (${skill.effect.shield} PŻ)`
                }]
              }));
            }
            if (skill.effect.dodgeBonus) {
              setCombatState(prev => ({
                ...prev,
                playerEffects: [...prev.playerEffects.filter(e => e.type !== 'dodge_boost'), {
                  type: 'dodge_boost',
                  value: skill.effect.dodgeBonus!,
                  duration: skill.effect.duration || 1,
                  description: `Zwiększony unik (+${skill.effect.dodgeBonus}%)`
                }]
              }));
            }
            logMessage = `${newPlayer.name} używa ${skill.name}!`;
            break;

          case 'support':
            if (skill.effect.healPercent) {
              const healAmount = Math.floor(newPlayer.maxHealth * skill.effect.healPercent);
              newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + healAmount);
              logMessage = `${newPlayer.name} używa ${skill.name} i odzyskuje ${healAmount} PŻ!`;
            }
            if (skill.effect.heal) {
              newPlayer.mana = Math.min(newPlayer.maxMana, newPlayer.mana + skill.effect.heal);
              logMessage = `${newPlayer.name} używa ${skill.name} i odzyskuje ${skill.effect.heal} PM!`;
            }
            break;
        }
        break;

      case 'defend':
        setCombatState(prev => ({
          ...prev,
          playerEffects: [...prev.playerEffects.filter(e => e.type !== 'dodge_boost'), {
            type: 'dodge_boost',
            value: 25,
            duration: 1,
            description: 'Postawa obronna (+25% unik)'
          }]
        }));
        logMessage = `${newPlayer.name} przyjmuje postawę obronną!`;
        break;
    }

    setCurrentPlayer(newPlayer);
    setCurrentEnemy(newEnemy);
    addToCombatLog(logMessage);

    if (newEnemy.health <= 0) {
      const baseExp = currentEnemy.experienceReward;
      const levelBonus = Math.floor(baseExp * 0.1 * newPlayer.level);
      const luckBonus = Math.floor(Math.random() * newPlayer.stats.luck);
      const expGained = baseExp + levelBonus + luckBonus;
      
      newPlayer.experience += expGained;
      addToCombatLog(`${newPlayer.name} zdobywa ${expGained} doświadczenia!`);
      
      setTimeout(() => onCombatEnd(true, newPlayer), 2000);
      return;
    }

    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && currentEnemy.health > 0 && currentPlayer.health > 0) {
      const timer = setTimeout(() => {
        let newPlayer = { ...currentPlayer };
        let newEnemy = { ...currentEnemy };
        let logMessage = '';

        const healthPercent = currentEnemy.health / currentEnemy.maxHealth;
        const actions = ['attack'];
        
        if (currentEnemy.skills.length > 0 && Math.random() < 0.4) {
          actions.push('skill');
        }
        if (healthPercent < 0.3 && Math.random() < 0.6) {
          actions.push('defend');
        }

        const action = actions[Math.floor(Math.random() * actions.length)];

        switch (action) {
          case 'attack':
            const dodgeChance = calculateDodgeChance(currentPlayer, true);
            if (Math.random() * 100 < dodgeChance) {
              logMessage = `${currentPlayer.name} unika ataku ${currentEnemy.name}!`;
            } else {
              const damage = calculateDamage(currentEnemy, false);
              const shieldEffect = combatState.playerEffects.find(e => e.type === 'shield');
              
              if (shieldEffect && shieldEffect.value > 0) {
                const blockedDamage = Math.min(damage, shieldEffect.value);
                shieldEffect.value -= blockedDamage;
                const remainingDamage = damage - blockedDamage;
                newPlayer.health = Math.max(0, newPlayer.health - remainingDamage);
                logMessage = `${currentEnemy.name} atakuje! Tarcza blokuje ${blockedDamage} obrażeń, ${remainingDamage} przebija się!`;
              } else {
                newPlayer.health = Math.max(0, newPlayer.health - damage);
                logMessage = `${currentEnemy.name} atakuje i zadaje ${damage} obrażeń!`;
              }
            }
            break;

          case 'skill':
            const availableSkills = currentEnemy.skills.filter(s => s.currentCooldown === 0);
            if (availableSkills.length > 0) {
              const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
              skill.currentCooldown = skill.cooldown;
              
              if (skill.effect.damage || skill.effect.damageMultiplier) {
                const skillDamage = skill.effect.damage || 
                                  calculateDamage(currentEnemy, false, skill.effect.damageMultiplier || 1);
                newPlayer.health = Math.max(0, newPlayer.health - skillDamage);
                logMessage = `${currentEnemy.name} używa ${skill.name} i zadaje ${skillDamage} obrażeń!`;
              }
            } else {
              logMessage = `${currentEnemy.name} przygotowuje się do ataku!`;
            }
            break;

          case 'defend':
            logMessage = `${currentEnemy.name} przyjmuje postawę obronną!`;
            break;
        }

        setCurrentPlayer(newPlayer);
        setCurrentEnemy(newEnemy);
        addToCombatLog(logMessage);

        if (newPlayer.health <= 0) {
          setTimeout(() => onCombatEnd(false, newPlayer), 2000);
          return;
        }

        newPlayer.mana = Math.min(newPlayer.maxMana, newPlayer.mana + Math.floor(newPlayer.maxMana * 0.1));
        newPlayer.skills.forEach(skill => {
          if (skill.currentCooldown > 0) skill.currentCooldown--;
        });

        newEnemy.skills.forEach(skill => {
          if (skill.currentCooldown > 0) skill.currentCooldown--;
        });

        setCombatState(prev => ({
          ...prev,
          turn: prev.turn + 1,
          playerEffects: prev.playerEffects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0),
          enemyEffects: prev.enemyEffects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0)
        }));

        setCurrentPlayer(newPlayer);
        setIsPlayerTurn(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, currentEnemy, currentPlayer, combatState]);

  const getHealthPercentage = (current: number, max: number) => (current / max) * 100;
  const getManaPercentage = (current: number, max: number) => (current / max) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Arena Nexus - Walka</h1>
          <div className="flex justify-center items-center space-x-2">
            <Sword className="w-6 h-6 text-yellow-500" />
            <span className="text-gray-400">Tura {combatState.turn}</span>
            <Sword className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentPlayer.name}</h2>
                <p className="text-gray-400 text-sm">Poziom {currentPlayer.level}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Życie</span>
                  <span>{currentPlayer.health}/{currentPlayer.maxHealth}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getHealthPercentage(currentPlayer.health, currentPlayer.maxHealth)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Mana</span>
                  <span>{currentPlayer.mana}/{currentPlayer.maxMana}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getManaPercentage(currentPlayer.mana, currentPlayer.maxMana)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <div className="text-gray-400">Siła</div>
                  <div className="text-white font-bold">{currentPlayer.stats.strength + getEquipmentBonus('stat_bonus')}</div>
                </div>
                <div>
                  <div className="text-gray-400">Zręczność</div>
                  <div className="text-white font-bold">{currentPlayer.stats.dexterity}</div>
                </div>
                <div>
                  <div className="text-gray-400">Wytrzymałość</div>
                  <div className="text-white font-bold">{currentPlayer.stats.endurance}</div>
                </div>
                <div>
                  <div className="text-gray-400">Szczęście</div>
                  <div className="text-white font-bold">{currentPlayer.stats.luck}</div>
                </div>
              </div>

              {combatState.playerEffects.length > 0 && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">Aktywne efekty:</div>
                  {combatState.playerEffects.map((effect, index) => (
                    <div key={index} className="text-xs text-green-400 bg-green-500/10 rounded px-2 py-1 mb-1">
                      {effect.description} ({effect.duration} tur)
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="text-gray-400 text-sm mb-2">Ekwipunek:</div>
                <div className="space-y-1">
                  {Object.entries(currentPlayer.equipment).map(([slot, item]) => (
                    item && (
                      <div key={slot} className="text-xs text-yellow-400 bg-yellow-500/10 rounded px-2 py-1">
                        <Package className="w-3 h-3 inline mr-1" />
                        {item.name}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-500" />
              Log Walki
            </h2>
            
            <div className="space-y-2 h-64 overflow-y-auto mb-6">
              {combatLog.map((log, index) => (
                <div key={index} className="text-gray-300 text-sm p-3 bg-gray-700/50 rounded">
                  {log}
                </div>
              ))}
            </div>
            
            {isPlayerTurn && currentPlayer.health > 0 && (
              <div className="space-y-3">
                <div className="text-yellow-400 font-semibold text-center mb-3">
                  🗡️ Twoja tura!
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => playerAction('attack')}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Sword className="w-4 h-4" />
                    <span>Atak Podstawowy</span>
                  </button>
                  
                  <button
                    onClick={() => playerAction('defend')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Obrona</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Umiejętności:</div>
                  {currentPlayer.skills.filter(s => s.unlocked).map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => playerAction('skill', skill.id)}
                      disabled={skill.currentCooldown > 0 || currentPlayer.mana < skill.manaCost}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-between px-4"
                    >
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>{skill.name}</span>
                      </div>
                      <div className="text-xs">
                        {skill.currentCooldown > 0 ? `${skill.currentCooldown} tur` : `${skill.manaCost} PM`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!isPlayerTurn && currentEnemy.health > 0 && (
              <div className="text-center">
                <div className="text-red-400 font-semibold">⚔️ Tura przeciwnika...</div>
                <div className="flex justify-center mt-2">
                  <Dices className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-red-500 p-2 rounded-full mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentEnemy.name}</h2>
                <p className="text-gray-400 text-sm">Poziom {currentEnemy.level}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Życie</span>
                  <span>{currentEnemy.health}/{currentEnemy.maxHealth}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getHealthPercentage(currentEnemy.health, currentEnemy.maxHealth)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <div className="text-gray-400">Siła</div>
                  <div className="text-white font-bold">{currentEnemy.stats.strength}</div>
                </div>
                <div>
                  <div className="text-gray-400">Zręczność</div>
                  <div className="text-white font-bold">{currentEnemy.stats.dexterity}</div>
                </div>
                <div>
                  <div className="text-gray-400">Wytrzymałość</div>
                  <div className="text-white font-bold">{currentEnemy.stats.endurance}</div>
                </div>
                <div>
                  <div className="text-gray-400">Szczęście</div>
                  <div className="text-white font-bold">{currentEnemy.stats.luck}</div>
                </div>
              </div>

              {currentEnemy.skills.length > 0 && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">Umiejętności:</div>
                  {currentEnemy.skills.map((skill, index) => (
                    <div key={index} className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 mb-1">
                      {skill.name}
                      {skill.currentCooldown > 0 && ` (${skill.currentCooldown} tur)`}
                    </div>
                  ))}
                </div>
              )}

              {combatState.enemyEffects.length > 0 && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">Aktywne efekty:</div>
                  {combatState.enemyEffects.map((effect, index) => (
                    <div key={index} className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 mb-1">
                      {effect.description} ({effect.duration} tur)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};