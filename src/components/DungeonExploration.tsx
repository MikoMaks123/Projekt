import React, { useState, useEffect } from 'react';
import { Character, Item, Enemy } from '../types/game';
import { DoorChoice } from './DoorChoice';
import { RoomEvent } from './RoomEvent';
import { generateRoomEvent, resetRoomHistory, RoomEventType } from '../utils/roomGenerator';
import { Heart, Map, Compass, Key, Star, Scroll, Crown, Zap, Skull } from 'lucide-react';

interface DungeonExplorationProps {
  player: Character;
  dungeonLevel: number;
  onCombatStart: (enemy: Enemy) => void;
  onDungeonComplete: () => void;
  onPlayerUpdate: (player: Character) => void;
}

interface GameState {
  phase: 'door-choice' | 'room-event' | 'boss-fight';
  roomsExplored: number;
  currentEvent?: RoomEventType;
  playerKeys: number;
  reputation: number;
  storyFlags: string[];
  markedDoors: { [key: string]: string };
  discoveredRooms: string[];
  curses: string[];
  blessings: string[];
}

export const DungeonExploration: React.FC<DungeonExplorationProps> = ({
  player,
  dungeonLevel,
  onCombatStart,
  onDungeonComplete,
  onPlayerUpdate
}) => {
  const [currentPlayer, setCurrentPlayer] = useState<Character>({ ...player });
  const [gameState, setGameState] = useState<GameState>({
    phase: 'door-choice',
    roomsExplored: 0,
    playerKeys: 0,
    reputation: 0,
    storyFlags: [],
    markedDoors: {},
    discoveredRooms: [],
    curses: [],
    blessings: []
  });
  const [message, setMessage] = useState(`Witaj w podziemiach poziomu ${dungeonLevel}! Każdy pokój kryje unikalne wyzwania.`);

  useEffect(() => {
    resetRoomHistory();
  }, [dungeonLevel]);

  useEffect(() => {
    setCurrentPlayer({ ...player });
  }, [player]);

  const handleDoorChoice = (doorIndex: number, doorType: string) => {
    const event = generateRoomEvent(doorType, dungeonLevel, gameState.reputation, gameState.storyFlags);
    
    setGameState(prev => ({
      ...prev,
      phase: 'room-event',
      currentEvent: event,
      roomsExplored: prev.roomsExplored + 1,
      discoveredRooms: [...prev.discoveredRooms, event.uniqueId]
    }));
    
    const doorNames = ['lewe', 'środkowe', 'prawe'];
    const rarityColors = {
      common: '⚪',
      uncommon: '🟢', 
      rare: '🔵',
      legendary: '🟡'
    };
    
    setMessage(`Wchodzisz przez ${doorNames[doorIndex]} drzwi... ${rarityColors[event.rarity]} ${event.title}`);
  };

  const handleRoomEventComplete = (result: any) => {
    let updatedPlayer = { ...currentPlayer };
    let newGameState = { ...gameState };
    let newMessage = '';

    if (result.type === 'combat') {
      onCombatStart(result.enemy);
      return;
    }

    if (result.experience) {
      updatedPlayer.experience += result.experience;
      newMessage += `Zdobyto ${result.experience} doświadczenia! `;
    }

    if (result.health) {
      if (result.health === 999) {
        updatedPlayer.health = updatedPlayer.maxHealth;
        newMessage += `Życie całkowicie przywrócone! `;
      } else {
        updatedPlayer.health = Math.min(updatedPlayer.maxHealth, updatedPlayer.health + result.health);
        newMessage += `${result.health > 0 ? 'Przywrócono' : 'Utracono'} ${Math.abs(result.health)} punktów życia! `;
      }
    }

    if (result.mana) {
      if (result.mana === 999) {
        updatedPlayer.mana = updatedPlayer.maxMana;
        newMessage += `Mana całkowicie przywrócona! `;
      } else {
        updatedPlayer.mana = Math.min(updatedPlayer.maxMana, updatedPlayer.mana + result.mana);
        newMessage += `${result.mana > 0 ? 'Przywrócono' : 'Utracono'} ${Math.abs(result.mana)} punktów many! `;
      }
    }

    if (result.item) {
      updatedPlayer.inventory.push(result.item);
      newMessage += `Znaleziono: ${result.item.name}! `;
    }

    if (result.keys) {
      newGameState.playerKeys = Math.max(0, newGameState.playerKeys + result.keys);
      newMessage += `${result.keys > 0 ? 'Znaleziono' : 'Utracono'} ${Math.abs(result.keys)} kluczy! `;
    }

    if (result.reputation) {
      newGameState.reputation += result.reputation;
      newMessage += `Reputacja ${result.reputation > 0 ? 'wzrosła' : 'spadła'} o ${Math.abs(result.reputation)}! `;
    }

    if (result.storyFlag) {
      newGameState.storyFlags.push(result.storyFlag);
      newMessage += `Odkryto nową historię! `;
    }

    if (result.permanentBonus) {
      Object.entries(result.permanentBonus).forEach(([stat, value]) => {
        if (stat in updatedPlayer.stats) {
          updatedPlayer.stats[stat as keyof typeof updatedPlayer.stats] += value as number;
          newMessage += `Trwały bonus: +${value} ${stat}! `;
        }
      });
    }

    if (result.statBonus) {
      Object.entries(result.statBonus).forEach(([stat, value]) => {
        if (stat in updatedPlayer.stats) {
          updatedPlayer.stats[stat as keyof typeof updatedPlayer.stats] += value as number;
          newMessage += `Bonus do statystyk: +${value} ${stat}! `;
        }
      });
    }

    if (result.curse) {
      newGameState.curses.push(result.curse);
      newMessage += `💀 Dotknięto przeklęciem: ${result.curse}! `;
    }

    if (result.blessing) {
      newGameState.blessings.push(result.blessing);
      newMessage += `✨ Otrzymano błogosławieństwo: ${result.blessing}! `;
    }

    if (newGameState.roomsExplored > 0 && newGameState.roomsExplored % 5 === 0) {
      newGameState.phase = 'boss-fight';
      newMessage += '💀 Czujesz potężną obecność... Boss czeka!';
    } else {
      newGameState.phase = 'door-choice';
      newMessage += 'Przed tobą pojawiają się nowe, unikalne drzwi...';
    }

    setCurrentPlayer(updatedPlayer);
    onPlayerUpdate(updatedPlayer);
    setGameState(newGameState);
    setMessage(newMessage);
  };

  const handleBossFight = () => {
    const bossEvent = generateRoomEvent('boss', dungeonLevel, gameState.reputation, gameState.storyFlags);
    if (bossEvent.enemy) {
      onCombatStart(bossEvent.enemy);
    }
  };

  const handleBossDefeated = () => {
    if (gameState.roomsExplored >= 10 + dungeonLevel * 2) {
      const expReward = dungeonLevel * 100;
      const updatedPlayer = { ...currentPlayer };
      updatedPlayer.experience += expReward;
      
      setCurrentPlayer(updatedPlayer);
      onPlayerUpdate(updatedPlayer);
      setMessage(`🏆 Poziom ${dungeonLevel} ukończony! Zdobyto ${expReward} doświadczenia.`);
      
      setTimeout(() => {
        onDungeonComplete();
      }, 2000);
    } else {
      setGameState(prev => ({
        ...prev,
        phase: 'door-choice'
      }));
      setMessage('💪 Boss pokonany! Kontynuuj eksplorację unikalnych pokoi...');
    }
  };

  const renderCurrentPhase = () => {
    switch (gameState.phase) {
      case 'door-choice':
        return (
          <DoorChoice
            dungeonLevel={dungeonLevel}
            roomsExplored={gameState.roomsExplored}
            playerKeys={gameState.playerKeys}
            reputation={gameState.reputation}
            storyFlags={gameState.storyFlags}
            markedDoors={gameState.markedDoors}
            discoveredRooms={gameState.discoveredRooms}
            onDoorChoice={handleDoorChoice}
            onMarkDoor={(doorIndex, mark) => {
              setGameState(prev => ({
                ...prev,
                markedDoors: { ...prev.markedDoors, [`${prev.roomsExplored}_${doorIndex}`]: mark }
              }));
            }}
          />
        );
      
      case 'room-event':
        return gameState.currentEvent ? (
          <RoomEvent
            event={gameState.currentEvent}
            player={currentPlayer}
            playerKeys={gameState.playerKeys}
            reputation={gameState.reputation}
            onEventComplete={handleRoomEventComplete}
          />
        ) : null;
      
      case 'boss-fight':
        return (
          <div className="bg-gray-800 rounded-lg p-6 border border-red-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-400 mb-4">💀 BOSS FIGHT 💀</h2>
              <p className="text-gray-300 mb-6">
                Potężny strażnik tego poziomu blokuje ci drogę. To będzie legendarna walka!
              </p>
              <button
                onClick={handleBossFight}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                🗡️ Rozpocznij Epicką Walkę!
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Arena Nexus</h1>
          <div className="flex justify-center items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-1">
              <Map className="w-4 h-4" />
              <span>Poziom {dungeonLevel}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Compass className="w-4 h-4" />
              <span>Pokój {gameState.roomsExplored + 1}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Crown className="w-4 h-4" />
              <span>{gameState.discoveredRooms.length} unikalnych</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              {currentPlayer.name}
            </h2>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Życie</span>
                  <span>{currentPlayer.health}/{currentPlayer.maxHealth}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPlayer.health / currentPlayer.maxHealth) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Mana</span>
                  <span>{currentPlayer.mana}/{currentPlayer.maxMana}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPlayer.mana / currentPlayer.maxMana) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Doświadczenie</span>
                  <span>{currentPlayer.experience}/{currentPlayer.experienceToNext}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPlayer.experience / currentPlayer.experienceToNext) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <div className="text-gray-400">Poziom</div>
                  <div className="text-white font-bold">{currentPlayer.level}</div>
                </div>
                <div>
                  <div className="text-gray-400">Pokoje</div>
                  <div className="text-white font-bold">{gameState.roomsExplored}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-700 rounded p-2">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-gray-300 text-sm">Klucze</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{gameState.playerKeys}</span>
                </div>
                
                <div className="flex items-center justify-between bg-gray-700 rounded p-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-gray-300 text-sm">Reputacja</span>
                  </div>
                  <span className={`font-bold ${gameState.reputation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {gameState.reputation}
                  </span>
                </div>

                {gameState.storyFlags.length > 0 && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="flex items-center mb-1">
                      <Scroll className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-gray-300 text-sm">Odkrycia</span>
                    </div>
                    <div className="text-xs text-blue-300">
                      {gameState.storyFlags.length} tajemnic odkrytych
                    </div>
                  </div>
                )}

                {gameState.blessings.length > 0 && (
                  <div className="bg-green-500/20 rounded p-2">
                    <div className="flex items-center mb-1">
                      <Zap className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-400 text-sm">Błogosławieństwa</span>
                    </div>
                    <div className="text-xs text-green-300">
                      {gameState.blessings.length} aktywnych
                    </div>
                  </div>
                )}

                {gameState.curses.length > 0 && (
                  <div className="bg-red-500/20 rounded p-2">
                    <div className="flex items-center mb-1">
                      <Skull className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-400 text-sm">Przeklęcia</span>
                    </div>
                    <div className="text-xs text-red-300">
                      {gameState.curses.length} aktywnych
                    </div>
                  </div>
                )}
              </div>

              {gameState.discoveredRooms.length > 0 && (
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-300 text-sm mb-2">Odkryte pokoje:</div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {gameState.discoveredRooms.slice(-5).map((roomId, index) => (
                      <div key={index} className="text-xs text-gray-400">
                        • {roomId.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-3">
            {renderCurrentPhase()}
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-white text-center">{message}</div>
        </div>

        <div className="mt-4 bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Postęp poziomu</span>
            <span className="text-white text-sm">
              {gameState.roomsExplored}/{10 + dungeonLevel * 2} pokoi
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(gameState.roomsExplored / (10 + dungeonLevel * 2)) * 100}%` 
              }}
            />
          </div>
          
          <div className="mt-2 flex justify-center space-x-4 text-xs">
            <span className="text-gray-400">⚪ Zwykły</span>
            <span className="text-green-400">🟢 Niezwykły</span>
            <span className="text-blue-400">🔵 Rzadki</span>
            <span className="text-yellow-400">🟡 Legendarny</span>
          </div>
        </div>
      </div>
    </div>
  );
};