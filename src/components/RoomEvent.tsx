import React, { useState } from 'react';
import { Character } from '../types/game';
import { RoomEventType } from '../utils/roomGenerator';
import { 
  Sword, Package, Heart, Zap, User, HelpCircle, 
  Flame, Shield, Star, Scroll, Key, Coins
} from 'lucide-react';

interface RoomEventProps {
  event: RoomEventType;
  player: Character;
  playerKeys: number;
  reputation: number;
  onEventComplete: (result: any) => void;
}

export const RoomEvent: React.FC<RoomEventProps> = ({
  event,
  player,
  playerKeys,
  reputation,
  onEventComplete
}) => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [eventResult, setEventResult] = useState<any>(null);

  const getEventIcon = () => {
    switch (event.type) {
      case 'combat': return <Sword className="w-12 h-12 text-red-400" />;
      case 'treasure': return <Package className="w-12 h-12 text-yellow-400" />;
      case 'rest': return <Heart className="w-12 h-12 text-green-400" />;
      case 'merchant': return <Coins className="w-12 h-12 text-blue-400" />;
      case 'puzzle': return <HelpCircle className="w-12 h-12 text-purple-400" />;
      case 'story': return <Scroll className="w-12 h-12 text-blue-400" />;
      case 'moral_choice': return <Star className="w-12 h-12 text-yellow-400" />;
      case 'training': return <Shield className="w-12 h-12 text-green-400" />;
      case 'portal': return <Zap className="w-12 h-12 text-purple-400" />;
      case 'trap': return <Flame className="w-12 h-12 text-red-400" />;
      default: return <HelpCircle className="w-12 h-12 text-gray-400" />;
    }
  };

  const handleChoice = (choiceIndex: number) => {
    const choice = event.choices[choiceIndex];
    let result: any = { ...choice.result };

    if (choice.statRequirement) {
      const playerStat = player.stats[choice.statRequirement.stat as keyof typeof player.stats];
      if (playerStat >= choice.statRequirement.value) {
        if (result.experience) result.experience = Math.floor(result.experience * 1.5);
        if (result.health) result.health = Math.floor(result.health * 1.2);
        result.success = true;
      } else {
        result.experience = Math.floor((result.experience || 0) * 0.5);
        result.health = Math.floor((result.health || 0) * 0.5);
        result.success = false;
      }
    }

    if (reputation > 10 && result.experience) {
      result.experience = Math.floor(result.experience * 1.2);
    } else if (reputation < -10 && result.health) {
      result.health = Math.floor(result.health * 0.8);
    }

    setEventResult(result);
    setShowResult(true);
  };

  const completeEvent = () => {
    onEventComplete(eventResult);
  };

  if (showResult) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {eventResult.success !== undefined ? (
              eventResult.success ? (
                <div className="bg-green-500 p-4 rounded-full">
                  <Star className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="bg-red-500 p-4 rounded-full">
                  <Flame className="w-8 h-8 text-white" />
                </div>
              )
            ) : (
              <div className="bg-blue-500 p-4 rounded-full">
                {getEventIcon()}
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {eventResult.success === true ? 'Sukces!' : 
             eventResult.success === false ? 'Porażka!' : 'Wydarzenie Zakończone'}
          </h2>
          
          <p className="text-gray-300 mb-6">
            {eventResult.description || event.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {eventResult.experience && (
              <div className="bg-green-500/20 rounded p-3">
                <Star className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-green-400 font-bold">+{eventResult.experience}</div>
                <div className="text-gray-400 text-xs">Doświadczenie</div>
              </div>
            )}
            
            {eventResult.health && (
              <div className="bg-red-500/20 rounded p-3">
                <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <div className="text-red-400 font-bold">+{eventResult.health}</div>
                <div className="text-gray-400 text-xs">Życie</div>
              </div>
            )}
            
            {eventResult.mana && (
              <div className="bg-blue-500/20 rounded p-3">
                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <div className="text-blue-400 font-bold">+{eventResult.mana}</div>
                <div className="text-gray-400 text-xs">Mana</div>
              </div>
            )}
            
            {eventResult.keys && (
              <div className="bg-yellow-500/20 rounded p-3">
                <Key className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-yellow-400 font-bold">+{eventResult.keys}</div>
                <div className="text-gray-400 text-xs">Klucze</div>
              </div>
            )}
          </div>

          {eventResult.item && (
            <div className="bg-purple-500/20 rounded-lg p-4 mb-6">
              <Package className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-purple-400 font-bold">Znaleziono przedmiot!</div>
              <div className="text-white">{eventResult.item.name}</div>
              <div className="text-gray-400 text-sm">{eventResult.item.description}</div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={completeEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Kontynuuj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-600 p-4 rounded-full">
            {getEventIcon()}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">{event.title}</h2>
        <p className="text-gray-300 mb-6">{event.description}</p>
      </div>

      <div className="space-y-4">
        {event.choices.map((choice, index) => {
          const canChoose = !choice.keyRequirement || playerKeys >= choice.keyRequirement;
          const hasStatRequirement = choice.statRequirement;
          const meetsStatRequirement = hasStatRequirement ? 
            player.stats[choice.statRequirement!.stat as keyof typeof player.stats] >= choice.statRequirement!.value : true;

          return (
            <button
              key={index}
              onClick={() => canChoose && handleChoice(index)}
              disabled={!canChoose}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                canChoose 
                  ? 'border-gray-600 hover:border-yellow-400 bg-gray-700 hover:bg-gray-600' 
                  : 'border-red-600 bg-red-500/10 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-white font-semibold mb-2">{choice.text}</div>
                  
                  {hasStatRequirement && (
                    <div className={`text-sm mb-2 ${meetsStatRequirement ? 'text-green-400' : 'text-red-400'}`}>
                      Wymaga: {choice.statRequirement!.stat} ≥ {choice.statRequirement!.value}
                      {meetsStatRequirement ? ' ✓' : ' ✗'}
                    </div>
                  )}
                  
                  {choice.keyRequirement && (
                    <div className={`text-sm mb-2 ${canChoose ? 'text-yellow-400' : 'text-red-400'}`}>
                      Wymaga: {choice.keyRequirement} kluczy
                      {canChoose ? ' ✓' : ' ✗'}
                    </div>
                  )}
                  
                  {choice.hint && (
                    <div className="text-blue-300 text-sm italic">
                      Podpowiedź: {choice.hint}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {choice.statRequirement && (
                    <div className={`w-3 h-3 rounded-full ${meetsStatRequirement ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-700 rounded p-2">
          <div className="text-white font-bold">{player.stats.strength}</div>
          <div className="text-gray-400 text-xs">Siła</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-white font-bold">{player.stats.dexterity}</div>
          <div className="text-gray-400 text-xs">Zręczność</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-white font-bold">{player.stats.endurance}</div>
          <div className="text-gray-400 text-xs">Wytrzymałość</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-white font-bold">{player.stats.luck}</div>
          <div className="text-gray-400 text-xs">Szczęście</div>
        </div>
      </div>
    </div>
  );
};