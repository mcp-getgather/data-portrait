import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const TRAITS_OPTIONS = [
  {
    id: 'middle-eastern',
    name: 'Middle Eastern',
    description: 'Middle Eastern ethnicity',
    icon: '🌍',
    category: 'ethnicity',
  },
  {
    id: 'east-asian',
    name: 'East Asian',
    description: 'East Asian ethnicity',
    icon: '🌏',
    category: 'ethnicity',
  },
  {
    id: 'south-asian',
    name: 'South Asian',
    description: 'South Asian ethnicity',
    icon: '🌏',
    category: 'ethnicity',
  },
  {
    id: 'african',
    name: 'African',
    description: 'African ethnicity',
    icon: '🌍',
    category: 'ethnicity',
  },
  {
    id: 'hispanic-latino',
    name: 'Hispanic/Latino',
    description: 'Hispanic or Latino ethnicity',
    icon: '🌎',
    category: 'ethnicity',
  },
  {
    id: 'curly-black-hair',
    name: 'Curly Black Hair',
    description: 'Distinctive curly black hair',
    icon: '🌀',
    category: 'hair',
  },
  {
    id: 'straight-blonde-hair',
    name: 'Straight Blonde Hair',
    description: 'Straight blonde hair',
    icon: '💛',
    category: 'hair',
  },
  {
    id: 'wavy-brown-hair',
    name: 'Wavy Brown Hair',
    description: 'Wavy brown hair',
    icon: '🌊',
    category: 'hair',
  },
  {
    id: 'red-hair',
    name: 'Red Hair',
    description: 'Red or ginger hair',
    icon: '🔥',
    category: 'hair',
  },
  {
    id: 'glasses',
    name: 'Glasses',
    description: 'Wears glasses or spectacles',
    icon: '👓',
    category: 'features',
  },
  {
    id: 'beard',
    name: 'Beard',
    description: 'Has facial hair or beard',
    icon: '🧔',
    category: 'features',
  },
  {
    id: 'young-adult',
    name: 'Young Adult',
    description: 'Young adult appearance (20s-30s)',
    icon: '👶',
    category: 'age',
  },
  {
    id: 'middle-aged',
    name: 'Middle-aged',
    description: 'Middle-aged appearance (40s-50s)',
    icon: '👨',
    category: 'age',
  },
];

const CATEGORIES = {
  ethnicity: { name: 'Ethnicity', icon: '🌍' },
  hair: { name: 'Hair Style', icon: '💇' },
  features: { name: 'Features', icon: '👁️' },
  age: { name: 'Age Range', icon: '📅' },
};

type TraitsSelectorProps = {
  selectedTraits: string[];
  onTraitsChange: (traits: string[]) => void;
};

export function TraitsSelector({
  selectedTraits,
  onTraitsChange,
}: TraitsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTraitToggle = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      onTraitsChange(selectedTraits.filter((id) => id !== traitId));
    } else {
      onTraitsChange([...selectedTraits, traitId]);
    }
  };

  const clearAllTraits = () => {
    onTraitsChange([]);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedTraits.length === 0) return 'Select traits';
    if (selectedTraits.length === 1) {
      const trait = TRAITS_OPTIONS.find((t) => t.id === selectedTraits[0]);
      return trait?.name || '';
    }
    return `${selectedTraits.length} traits selected`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Additional Traits</h2>
        {selectedTraits.length > 0 && (
          <button
            onClick={clearAllTraits}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Traits Badges */}
      {selectedTraits.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedTraits.map((traitId) => {
            const trait = TRAITS_OPTIONS.find((t) => t.id === traitId);
            return trait ? (
              <Badge key={traitId} variant="secondary" className="gap-1">
                <span>{trait.icon}</span>
                <span>{trait.name}</span>
                <button
                  onClick={() => handleTraitToggle(traitId)}
                  className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center"
                >
                  ×
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Popover Trigger and Content */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center text-sm">
                {selectedTraits.length > 0 ? '✨' : '👤'}
              </div>
              <span className="font-medium">{getDisplayText()}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0 border-gray-200 shadow-lg"
          align="start"
          side="bottom"
          sideOffset={8}
        >
          {/* Trait Options by Category */}
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(CATEGORIES).map(
              ([categoryKey, category], index) => {
                const categoryTraits = TRAITS_OPTIONS.filter(
                  (t) => t.category === categoryKey
                );

                return (
                  <div key={categoryKey}>
                    {/* Category Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {category.name}
                        </span>
                      </div>
                    </div>

                    {/* Category Traits */}
                    <div className="pr-2 py-1">
                      {categoryTraits.map((trait) => {
                        const isSelected = selectedTraits.includes(trait.id);
                        return (
                          <button
                            key={trait.id}
                            onClick={() => handleTraitToggle(trait.id)}
                            className={`w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-all duration-150 rounded-md mx-1 my-1 ${
                              isSelected
                                ? 'bg-blue-50 rounded-full ring-blue-200'
                                : ''
                            }`}
                          >
                            <div className="w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                              {trait.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">
                                {trait.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {trait.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="ml-auto">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Traits Description */}
      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          {selectedTraits.length === 0 ? (
            'Select traits to customize your portrait appearance'
          ) : selectedTraits.length === 1 ? (
            <>
              <span className="font-medium">
                {TRAITS_OPTIONS.find((t) => t.id === selectedTraits[0])?.name}:
              </span>{' '}
              {
                TRAITS_OPTIONS.find((t) => t.id === selectedTraits[0])
                  ?.description
              }
            </>
          ) : (
            `${selectedTraits.length} traits selected for personalized appearance`
          )}
        </p>
      </div>
    </div>
  );
}
