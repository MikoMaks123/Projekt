import React from 'react';
import { Package, Star, Zap, Shield, Heart } from 'lucide-react';
import { Item } from '../types/game';
import { ITEM_POOL } from '../data/items';

interface ItemSelectionProps {
  onItemSelected: (item: Item | null) => void;
}

export const ItemSelection: React.FC<ItemSelectionProps> = ({ onItemSelected }) => {
  const [availableItems] = React.useState(() => {
    const shuffled = [...ITEM_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Zwykły';
      case 'rare': return 'Rzadki';
      case 'epic': return 'Epicki';
      case 'legendary': return 'Legendarny';
      default: return 'Zwykły';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Zap className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'accessory': return <Star className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-4xl w-full border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Wybierz Nagrodę</h1>
          <p className="text-gray-400">Wybierz jeden przedmiot jako nagrodę za zwycięstwo!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {availableItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onItemSelected(item)}
              className={`p-6 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${getRarityColor(item.rarity)} hover:border-opacity-100`}
            >
              <div className="text-center mb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    item.rarity === 'legendary' ? 'bg-yellow-500' :
                    item.rarity === 'epic' ? 'bg-purple-500' :
                    item.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {getTypeIcon(item.type)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  item.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                  item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                  item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {getRarityText(item.rarity)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-300 text-sm">{item.description}</p>
                
                {Object.entries(item.stats).length > 0 && (
                  <div>
                    <div className="text-green-400 text-sm font-semibold mb-1">Bonusy do statystyk:</div>
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <div key={stat} className="text-green-300 text-xs">
                        +{value} {stat === 'strength' ? 'Siła' : 
                                 stat === 'dexterity' ? 'Zręczność' : 
                                 stat === 'endurance' ? 'Wytrzymałość' : ''}
                      </div>
                    ))}
                  </div>
                )}

                {item.effects.length > 0 && (
                  <div>
                    <div className="text-blue-400 text-sm font-semibold mb-1">Efekty specjalne:</div>
                    {item.effects.map((effect, effectIndex) => (
                      <div key={effectIndex} className="text-blue-300 text-xs">
                        {effect.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onItemSelected(null)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Pomiń nagrodę
          </button>
        </div>
      </div>
    </div>
  );
};