import React, { useState } from 'react';
import { CharacterCreation } from './components/CharacterCreation';
import { DungeonExploration } from './components/DungeonExploration';
import { Combat } from './components/Combat';
import { LevelUp } from './components/LevelUp';
import { ItemSelection } from './components/ItemSelection';
import { CharacterSheet } from './components/CharacterSheet';
import { Character, Enemy, GameState, Item } from './types/game';
import { User, RotateCcw, Trophy, Heart } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>('character-creation');
  const [player, setPlayer] = useState<Character | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [dungeonLevel, setDungeonLevel] = useState(1);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);

  const handleCharacterCreated = (character: Character) => {
    setPlayer(character);
    setGameState('exploration');
  };

  const handleCombatStart = (enemy: Enemy) => {
    setCurrentEnemy(enemy);
    setGameState('combat');
  };

  const handleCombatEnd = (victory: boolean, updatedPlayer: Character) => {
    setPlayer(updatedPlayer);
    
    if (victory) {
      if (updatedPlayer.experience >= updatedPlayer.experienceToNext) {
        setGameState('level-up');
      } else {
        const shouldOfferItem = Math.random() < 0.3;
        if (shouldOfferItem) {
          setGameState('item-selection');
        } else {
          setGameState('exploration');
        }
      }
    } else {
      setGameState('defeat');
    }
  };

  const handleLevelUpComplete = (updatedPlayer: Character) => {
    setPlayer(updatedPlayer);
    
    const shouldOfferItem = Math.random() < 0.4;
    if (shouldOfferItem) {
      setGameState('item-selection');
    } else {
      setGameState('exploration');
    }
  };

  const handleItemSelected = (item: Item | null) => {
    if (!player) return;
    
    let updatedPlayer = { ...player };
    
    if (item) {
      updatedPlayer.inventory.push(item);
      
      if (!updatedPlayer.equipment[item.type]) {
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
      }
    }
    
    setPlayer(updatedPlayer);
    setGameState('exploration');
  };

  const handleDungeonComplete = () => {
    setDungeonLevel(prev => prev + 1);
    
    if (player) {
      const updatedPlayer = { ...player };
      const levelBonus = dungeonLevel * 50;
      updatedPlayer.experience += levelBonus;
      
      setPlayer(updatedPlayer);
      
      if (updatedPlayer.experience >= updatedPlayer.experienceToNext) {
        setGameState('level-up');
      } else {
        setGameState('exploration');
      }
    } else {
      setGameState('exploration');
    }
  };

  const handlePlayerUpdate = (updatedPlayer: Character) => {
    setPlayer(updatedPlayer);
  };

  const resetGame = () => {
    setGameState('character-creation');
    setPlayer(null);
    setCurrentEnemy(null);
    setDungeonLevel(1);
    setShowCharacterSheet(false);
  };

  const renderEndGame = (isVictory: boolean) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700 text-center">
        <div className="mb-6">
          <div className={`inline-flex p-4 rounded-full mb-4 ${isVictory ? 'bg-green-500' : 'bg-red-500'}`}>
            {isVictory ? <Trophy className="w-8 h-8 text-white" /> : <Heart className="w-8 h-8 text-white" />}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
            {isVictory ? 'Zwycięstwo!' : 'Koniec Gry'}
          </h1>
          <p className="text-gray-400 mb-4">
            {isVictory 
              ? `${player?.name} triumfuje w Arena Nexus!` 
              : `${player?.name} pada pokonany w podziemiach...`
            }
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">Statystyki Przygody</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Osiągnięty poziom:</span>
                <span className="text-white">{player?.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Poziom podziemi:</span>
                <span className="text-white">{dungeonLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Doświadczenie:</span>
                <span className="text-white">{player?.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Zebrane przedmioty:</span>
                <span className="text-white">{player?.inventory.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Odblokowane umiejętności:</span>
                <span className="text-white">{player?.skills.filter(s => s.unlocked).length || 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Nowa Przygoda</span>
        </button>
      </div>
    </div>
  );

  switch (gameState) {
    case 'character-creation':
      return <CharacterCreation onCharacterCreated={handleCharacterCreated} />;
    
    case 'exploration':
      return player ? (
        <div>
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowCharacterSheet(true)}
              className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border border-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Postać</span>
            </button>
          </div>
          <DungeonExploration 
            player={player}
            dungeonLevel={dungeonLevel}
            onCombatStart={handleCombatStart}
            onDungeonComplete={handleDungeonComplete}
            onPlayerUpdate={handlePlayerUpdate}
          />
          {showCharacterSheet && (
            <CharacterSheet 
              player={player} 
              onClose={() => setShowCharacterSheet(false)}
              onPlayerUpdate={handlePlayerUpdate}
            />
          )}
        </div>
      ) : null;
    
    case 'combat':
      return player && currentEnemy ? (
        <Combat 
          player={player} 
          enemy={currentEnemy} 
          onCombatEnd={handleCombatEnd} 
        />
      ) : null;
    
    case 'level-up':
      return player ? (
        <LevelUp 
          player={player} 
          onLevelUpComplete={handleLevelUpComplete} 
        />
      ) : null;
    
    case 'item-selection':
      return <ItemSelection onItemSelected={handleItemSelected} />;
    
    case 'defeat':
      return renderEndGame(false);
    
    case 'victory':
      return renderEndGame(true);
    
    default:
      return <CharacterCreation onCharacterCreated={handleCharacterCreated} />;
  }
}

export default App;