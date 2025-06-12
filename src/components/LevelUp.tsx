import React, { useState } from 'react';
import { Star, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { Character, Stats } from '../types/game';
import { AVAILABLE_SKILLS } from '../data/skills';

interface LevelUpProps {
  player: Character;
  onLevelUpComplete: (updatedPlayer: Character) => void;
}

export const LevelUp: React.FC<LevelUpProps> = ({ player, onLevelUpComplete }) => {
  const [updatedPlayer, setUpdatedPlayer] = useState<Character>(() => {
    const newPlayer = { ...player };
    
    let levelsGained = 0;
    while (newPlayer.experience >= newPlayer.experienceToNext) {
      newPlayer.experience -= newPlayer.experienceToNext;
      newPlayer.level++;
      levelsGained++;
      
      newPlayer.experienceToNext = Math.floor(100 * Math.pow(1.2, newPlayer.level - 1));
      
      newPlayer.availableStatPoints += 3;
      newPlayer.availableSkillPoints += 1;
      
      newPlayer.stats.strength += 1;
      newPlayer.stats.dexterity += 1;
      newPlayer.stats.endurance += 1;
      newPlayer.stats.luck += 1;
      
      const healthIncrease = 15 + newPlayer.stats.endurance;
      const manaIncrease = 10 + Math.floor(newPlayer.stats.endurance / 2);
      
      newPlayer.maxHealth += healthIncrease;
      newPlayer.maxMana += manaIncrease;
      newPlayer.health = newPlayer.maxHealth;
      newPlayer.mana = newPlayer.maxMana;
    }

    AVAILABLE_SKILLS.forEach(skill => {
      if (skill.requiredLevel <= newPlayer.level && !newPlayer.skills.find(s => s.id === skill.id)) {
        newPlayer.skills.push({ ...skill, unlocked: false });
      }
    });

    return newPlayer;
  });

  const adjustStat = (stat: keyof Stats, change: number) => {
    if (updatedPlayer.availableStatPoints <= 0 && change > 0) return;
    if (change < 0 && updatedPlayer.stats[stat] <= player.stats[stat]) return;

    const newPlayer = { ...updatedPlayer };
    newPlayer.stats[stat] += change;
    newPlayer.availableStatPoints -= change;
    
    if (stat === 'endurance') {
      const healthIncrease = change * 10;
      const manaIncrease = change * 5;
      newPlayer.maxHealth += healthIncrease;
      newPlayer.maxMana += manaIncrease;
      newPlayer.health += healthIncrease;
      newPlayer.mana += manaIncrease;
    }
    
    setUpdatedPlayer(newPlayer);
  };

  const unlockSkill = (skillId: string) => {
    if (updatedPlayer.availableSkillPoints <= 0) return;

    const newPlayer = { ...updatedPlayer };
    const skill = newPlayer.skills.find(s => s.id === skillId);
    if (skill && !skill.unlocked) {
      skill.unlocked = true;
      newPlayer.availableSkillPoints--;
      setUpdatedPlayer(newPlayer);
    }
  };

  const completeLevelUp = () => {
    onLevelUpComplete(updatedPlayer);
  };

  const availableSkills = updatedPlayer.skills.filter(s => !s.unlocked && s.requiredLevel <= updatedPlayer.level);
  const levelsGained = updatedPlayer.level - player.level;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-5xl w-full border border-yellow-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full animate-pulse">
              <Star className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            {levelsGained > 1 ? `Wielokrotny Awans!` : 'Awans!'}
          </h1>
          <p className="text-gray-300">
            {player.name} {levelsGained > 1 ? `awansuje o ${levelsGained} poziomów` : `osiąga poziom ${updatedPlayer.level}`}!
          </p>
          {levelsGained > 1 && (
            <div className="mt-2 text-yellow-300 font-semibold">
              🎉 Niesamowity postęp! 🎉
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
                  Statystyki
                </h2>
                <span className="text-yellow-400 bg-gray-600 px-3 py-1 rounded-full text-sm">
                  Punkty: {updatedPlayer.availableStatPoints}
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(updatedPlayer.stats).map(([stat, value]) => {
                  const originalValue = player.stats[stat as keyof Stats];
                  const gainedFromLevel = value - originalValue;
                  
                  return (
                    <div key={stat} className="bg-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-white font-semibold capitalize">
                            {stat === 'strength' ? 'Siła' : 
                             stat === 'dexterity' ? 'Zręczność' : 
                             stat === 'endurance' ? 'Wytrzymałość' : 'Szczęście'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {stat === 'strength' ? 'Zwiększa obrażenia' :
                             stat === 'dexterity' ? 'Unik i krytyki' :
                             stat === 'endurance' ? 'Życie i mana' : 'Losowe wydarzenia'}
                          </div>
                          {gainedFromLevel > 0 && (
                            <div className="text-green-400 text-xs">
                              +{gainedFromLevel} z awansu
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => adjustStat(stat as keyof Stats, -1)}
                            disabled={value <= originalValue}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors duration-200"
                          >
                            -
                          </button>
                          <span className="text-2xl font-bold text-yellow-400 min-w-[3rem] text-center">
                            {value}
                          </span>
                          <button
                            onClick={() => adjustStat(stat as keyof Stats, 1)}
                            disabled={updatedPlayer.availableStatPoints <= 0}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-green-500" />
                Zmiany po Awansie
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Poziom:</span>
                  <span className="text-white font-bold">
                    {player.level} → {updatedPlayer.level}
                    {levelsGained > 1 && <span className="text-green-400 ml-1">(+{levelsGained})</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Maksymalne HP:</span>
                  <span className="text-white">
                    {player.maxHealth} → {updatedPlayer.maxHealth}
                    <span className="text-green-400 ml-1">(+{updatedPlayer.maxHealth - player.maxHealth})</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Maksymalna Mana:</span>
                  <span className="text-white">
                    {player.maxMana} → {updatedPlayer.maxMana}
                    <span className="text-green-400 ml-1">(+{updatedPlayer.maxMana - player.maxMana})</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Obrażenia Bazowe:</span>
                  <span className="text-white">{10 + updatedPlayer.stats.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Szansa na Unik:</span>
                  <span className="text-white">{Math.floor(updatedPlayer.stats.dexterity / 2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Szansa na Krytyk:</span>
                  <span className="text-white">{Math.floor(updatedPlayer.stats.dexterity / 3) + Math.floor(updatedPlayer.stats.luck / 4)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Nowe Umiejętności
                </h2>
                <span className="text-yellow-400 bg-gray-600 px-3 py-1 rounded-full text-sm">
                  Punkty: {updatedPlayer.availableSkillPoints}
                </span>
              </div>

              {availableSkills.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => unlockSkill(skill.id)}
                      disabled={updatedPlayer.availableSkillPoints <= 0}
                      className="w-full p-4 rounded-lg border-2 border-gray-600 hover:border-yellow-500 disabled:border-gray-600 disabled:cursor-not-allowed bg-gray-600 hover:bg-gray-500 disabled:bg-gray-600 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-semibold">{skill.name}</div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          skill.type === 'offensive' ? 'bg-red-500/20 text-red-400' :
                          skill.type === 'defensive' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {skill.type === 'offensive' ? 'Ofensywna' :
                           skill.type === 'defensive' ? 'Defensywna' : 'Wsparcie'}
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm mb-2">{skill.description}</div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Koszt many: {skill.manaCost}</span>
                        <span>Cooldown: {skill.cooldown} tur</span>
                        <span>Wymagany poziom: {skill.requiredLevel}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Brak nowych umiejętności do odblokowania na tym poziomie
                </div>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Twoje Umiejętności</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {updatedPlayer.skills.filter(s => s.unlocked).map((skill) => (
                  <div key={skill.id} className="bg-gray-600 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
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
                    <div className="text-gray-300 text-sm">{skill.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={completeLevelUp}
            disabled={updatedPlayer.availableStatPoints > 0 || updatedPlayer.availableSkillPoints > 0}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {(updatedPlayer.availableStatPoints > 0 || updatedPlayer.availableSkillPoints > 0) 
              ? 'Rozdaj wszystkie punkty aby kontynuować' 
              : 'Kontynuuj Przygodę w Arena Nexus!'}
          </button>
        </div>
      </div>
    </div>
  );
};