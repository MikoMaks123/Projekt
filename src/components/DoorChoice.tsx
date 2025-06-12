import React, { useState } from 'react';
import { Sword, Package, Skull, Key, Lock, Eye, MapPin, HelpCircle, Star, Crown, Zap } from 'lucide-react';

interface Door {
  type: 'combat' | 'treasure' | 'danger' | 'mystery' | 'rest' | 'merchant' | 'puzzle' | 'story' | 'boss' | 'training';
  symbol?: string;
  ancientText?: string;
  isLocked?: boolean;
  keyRequired?: number;
  hint?: string;
  marked?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  uniqueHint?: string;
}

interface DoorChoiceProps {
  dungeonLevel: number;
  roomsExplored: number;
  playerKeys: number;
  reputation: number;
  storyFlags: string[];
  markedDoors: { [key: string]: string };
  discoveredRooms: string[];
  onDoorChoice: (doorIndex: number, doorType: string) => void;
  onMarkDoor: (doorIndex: number, mark: string) => void;
}

export const DoorChoice: React.FC<DoorChoiceProps> = ({
  dungeonLevel,
  roomsExplored,
  playerKeys,
  reputation,
  storyFlags,
  markedDoors,
  discoveredRooms,
  onDoorChoice,
  onMarkDoor
}) => {
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [showMarkDialog, setShowMarkDialog] = useState<number | null>(null);
  const [markText, setMarkText] = useState('');

  const [doors] = useState<Door[]>(() => generateUniqueDoors(dungeonLevel, roomsExplored, reputation, storyFlags, discoveredRooms));

  const getDoorIcon = (door: Door) => {
    if (door.symbol) {
      switch (door.symbol) {
        case 'sword': return <Sword className="w-8 h-8 text-red-400" />;
        case 'treasure': return <Package className="w-8 h-8 text-yellow-400" />;
        case 'skull': return <Skull className="w-8 h-8 text-gray-400" />;
        case 'star': return <Star className="w-8 h-8 text-purple-400" />;
        case 'crown': return <Crown className="w-8 h-8 text-yellow-400" />;
        case 'zap': return <Zap className="w-8 h-8 text-blue-400" />;
        default: return <HelpCircle className="w-8 h-8 text-gray-400" />;
      }
    }
    return <HelpCircle className="w-8 h-8 text-gray-400" />;
  };

  const getDoorDescription = (door: Door) => {
    if (door.ancientText) {
      return `Starożytny napis: "${door.ancientText}"`;
    }
    if (door.symbol) {
      switch (door.symbol) {
        case 'sword': return 'Symbol miecza - walka czeka';
        case 'treasure': return 'Symbol skarbu - bogactwa ukryte';
        case 'skull': return 'Symbol czaszki - śmiertelne niebezpieczeństwo';
        case 'star': return 'Symbol gwiazdy - magiczne moce';
        case 'crown': return 'Symbol korony - władza i chwała';
        case 'zap': return 'Symbol błyskawicy - energia i moc';
        default: return 'Nieznany symbol';
      }
    }
    return 'Zwykłe, nieoznakowane drzwi';
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/5';
      case 'uncommon': return 'border-green-500 bg-green-500/5';
      case 'rare': return 'border-blue-500 bg-blue-500/5';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/5';
      default: return 'border-gray-600 bg-gray-700';
    }
  };

  const getRarityText = (rarity?: string) => {
    switch (rarity) {
      case 'common': return '⚪ Zwykły';
      case 'uncommon': return '🟢 Niezwykły';
      case 'rare': return '🔵 Rzadki';
      case 'legendary': return '🟡 Legendarny';
      default: return '';
    }
  };

  const canOpenDoor = (door: Door) => {
    if (door.isLocked && door.keyRequired) {
      return playerKeys >= door.keyRequired;
    }
    return true;
  };

  const handleDoorClick = (index: number) => {
    const door = doors[index];
    
    if (!canOpenDoor(door)) {
      return;
    }

    setSelectedDoor(index);
  };

  const confirmChoice = () => {
    if (selectedDoor !== null) {
      onDoorChoice(selectedDoor, doors[selectedDoor].type);
    }
  };

  const handleMarkDoor = (index: number) => {
    if (markText.trim()) {
      onMarkDoor(index, markText.trim());
      setMarkText('');
      setShowMarkDialog(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Wybierz Unikalne Drzwi</h2>
        <p className="text-gray-400">
          Każde drzwi prowadzi do unikalnego pokoju. Nie ma dwóch takich samych!
        </p>
        <div className="mt-2 text-sm text-purple-400">
          Odkryte unikalne pokoje: {discoveredRooms.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {doors.map((door, index) => {
          const isSelected = selectedDoor === index;
          const canOpen = canOpenDoor(door);
          const doorKey = `${roomsExplored}_${index}`;
          const mark = markedDoors[doorKey];

          return (
            <div
              key={index}
              className={`relative rounded-lg p-6 border-2 transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-yellow-500 bg-yellow-500/10 transform scale-105' 
                  : canOpen 
                    ? `${getRarityColor(door.rarity)} hover:border-yellow-400 hover:transform hover:scale-102` 
                    : 'border-red-600 bg-red-500/10 cursor-not-allowed'
              }`}
              onClick={() => canOpen && handleDoorClick(index)}
            >
              {mark && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {mark}
                </div>
              )}

              {door.rarity && (
                <div className="absolute top-2 left-2 text-xs">
                  {getRarityText(door.rarity)}
                </div>
              )}

              {door.isLocked && (
                <div className="absolute top-8 left-2">
                  <Lock className={`w-5 h-5 ${canOpen ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full transition-all duration-200 ${
                    canOpen ? 'bg-gray-600' : 'bg-red-900'
                  } ${isSelected ? 'ring-4 ring-yellow-500' : ''}`}>
                    {getDoorIcon(door)}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  Drzwi {index === 0 ? 'Lewe' : index === 1 ? 'Środkowe' : 'Prawe'}
                </h3>

                <p className="text-gray-300 text-sm mb-3">
                  {getDoorDescription(door)}
                </p>

                {door.hint && (
                  <p className="text-blue-300 text-xs mb-3 italic">
                    💡 {door.hint}
                  </p>
                )}

                {door.uniqueHint && (
                  <p className="text-purple-300 text-xs mb-3 font-semibold">
                    ✨ {door.uniqueHint}
                  </p>
                )}

                {door.isLocked && (
                  <div className="text-center mb-3">
                    <div className={`text-sm ${canOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {canOpen 
                        ? `🔓 Możesz otworzyć (${door.keyRequired} kluczy)`
                        : `🔒 Potrzebujesz ${door.keyRequired} kluczy`
                      }
                    </div>
                  </div>
                )}

                {canOpen && (
                  <div className="flex justify-center space-x-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMarkDialog(index);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors duration-200"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Oznacz</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {Math.random() < 0.15 && roomsExplored > 3 && (
        <div className="bg-gray-700 rounded-lg p-4 border border-purple-500 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">🟡 Legendarny Sekret Odkryty!</span>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Twoja percepcja pozwala ci dostrzec ukryte drzwi prowadzące do legendarnej komnaty...
          </p>
          <button
            onClick={() => onDoorChoice(3, 'hidden')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200 transform hover:scale-105"
          >
            ✨ Wejdź przez Legendarne Przejście
          </button>
        </div>
      )}

      {selectedDoor !== null && (
        <div className="text-center bg-gray-700 rounded-lg p-4">
          <p className="text-yellow-400 mb-4 font-semibold">
            Wybrano: {selectedDoor === 0 ? 'Lewe' : selectedDoor === 1 ? 'Środkowe' : 'Prawe'} drzwi
            {doors[selectedDoor].rarity && (
              <span className="ml-2">{getRarityText(doors[selectedDoor].rarity)}</span>
            )}
          </p>
          <div className="space-x-4">
            <button
              onClick={confirmChoice}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-all duration-200 transform hover:scale-105"
            >
              ⚔️ Potwierdź Wybór
            </button>
            <button
              onClick={() => setSelectedDoor(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {showMarkDialog !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Oznacz Drzwi</h3>
            <input
              type="text"
              value={markText}
              onChange={(e) => setMarkText(e.target.value)}
              placeholder="Wpisz oznaczenie..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleMarkDoor(showMarkDialog)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Oznacz
              </button>
              <button
                onClick={() => {
                  setShowMarkDialog(null);
                  setMarkText('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="bg-gray-700 rounded p-3">
          <Key className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-white font-bold">{playerKeys}</div>
          <div className="text-gray-400 text-xs">Klucze</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-white font-bold">{Object.keys(markedDoors).length}</div>
          <div className="text-gray-400 text-xs">Oznaczenia</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <Eye className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-white font-bold">{roomsExplored}</div>
          <div className="text-gray-400 text-xs">Pokoje</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className={`w-5 h-5 mx-auto mb-1 rounded-full ${reputation >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <div className="text-white font-bold">{reputation}</div>
          <div className="text-gray-400 text-xs">Reputacja</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <Crown className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-white font-bold">{discoveredRooms.length}</div>
          <div className="text-gray-400 text-xs">Unikalne</div>
        </div>
      </div>
    </div>
  );
};

function generateUniqueDoors(
  level: number, 
  roomsExplored: number, 
  reputation: number, 
  storyFlags: string[], 
  discoveredRooms: string[]
): Door[] {
  const doors: Door[] = [];
  
  const uniqueRoomTypes = [
    { type: 'combat', rarity: 'common', symbols: ['sword'], hints: ['Słyszysz brzęk metalu', 'Czujesz zapach krwi'] },
    { type: 'treasure', rarity: 'uncommon', symbols: ['treasure'], hints: ['Błysk złota', 'Zapach starożytnych monet'] },
    { type: 'rest', rarity: 'rare', symbols: ['star'], hints: ['Ciepłe światło', 'Pokojowa aura'] },
    { type: 'merchant', rarity: 'uncommon', symbols: ['crown'], hints: ['Dźwięk monet', 'Zapach egzotycznych przypraw'] },
    { type: 'puzzle', rarity: 'rare', symbols: ['zap'], hints: ['Magiczne wibracje', 'Starożytne runy świecą'] },
    { type: 'story', rarity: 'uncommon', symbols: [], hints: ['Szepty przeszłości', 'Echo dawnych czasów'] },
    { type: 'training', rarity: 'rare', symbols: ['sword'], hints: ['Energia mocy', 'Aura mistrzostwa'] },
    { type: 'moral_choice', rarity: 'uncommon', symbols: [], hints: ['Ciężar decyzji', 'Moralne rozterki'] }
  ];

  if (level >= 5) {
    uniqueRoomTypes.push(
      { type: 'portal', rarity: 'legendary', symbols: ['zap'], hints: ['Przestrzeń się wykrzywia', 'Wymiary się mieszają'] }
    );
  }

  for (let i = 0; i < 3; i++) {
    const availableTypes = uniqueRoomTypes.filter(rt => 
      Math.random() < (rt.rarity === 'legendary' ? 0.1 : rt.rarity === 'rare' ? 0.3 : 0.6)
    );
    
    const selectedType = availableTypes.length > 0 
      ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
      : uniqueRoomTypes[Math.floor(Math.random() * uniqueRoomTypes.length)];

    const door: Door = {
      type: selectedType.type as any,
      rarity: selectedType.rarity as any
    };

    if (Math.random() < 0.5 && selectedType.symbols.length > 0) {
      door.symbol = selectedType.symbols[Math.floor(Math.random() * selectedType.symbols.length)];
    }
    
    else if (Math.random() < 0.3) {
      const ancientTexts = [
        'Audentes Fortuna Iuvat', 'Memento Mori', 'Veni Vidi Vici',
        'Per Aspera Ad Astra', 'Carpe Diem', 'Alea Iacta Est',
        'Fortuna Caeca Est', 'Vita Brevis Ars Longa'
      ];
      door.ancientText = ancientTexts[Math.floor(Math.random() * ancientTexts.length)];
    }

    const lockChance = door.rarity === 'legendary' ? 0.5 : door.rarity === 'rare' ? 0.3 : 0.1;
    if (level >= 2 && Math.random() < lockChance) {
      door.isLocked = true;
      door.keyRequired = door.rarity === 'legendary' ? 3 : door.rarity === 'rare' ? 2 : 1;
    }

    if (Math.random() < 0.4 && selectedType.hints.length > 0) {
      door.hint = selectedType.hints[Math.floor(Math.random() * selectedType.hints.length)];
    }

    if (door.rarity === 'rare' || door.rarity === 'legendary') {
      const uniqueHints = [
        'To miejsce emanuje niezwykłą mocą...',
        'Czujesz, że to coś wyjątkowego...',
        'Starożytna magia przepływa przez te drzwi...',
        'To może być odkrycie życia...'
      ];
      if (Math.random() < 0.7) {
        door.uniqueHint = uniqueHints[Math.floor(Math.random() * uniqueHints.length)];
      }
    }

    doors.push(door);
  }

  return doors;
}