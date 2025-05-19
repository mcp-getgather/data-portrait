import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { IMAGE_STYLES, STYLE_CATEGORIES } from '../modules/ImageStyle';

type ImageStyleSelectorProps = {
  selectedImageStyle: string;
  onImageStyleChange: (styleId: string) => void;
};

export function ImageStyleSelector({
  selectedImageStyle,
  onImageStyleChange,
}: ImageStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedStyle = IMAGE_STYLES.find((s) => s.id === selectedImageStyle);

  const getDisplayText = () => {
    return selectedStyle?.name || 'Select style';
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Image Style</h2>

      {/* Popover Trigger and Content */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              {selectedStyle && (
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedStyle.gradient} flex items-center justify-center text-xs`}
                >
                  {selectedStyle.preview}
                </div>
              )}
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
          {/* Style Options by Category */}
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(STYLE_CATEGORIES).map(
              ([categoryKey, category], index) => {
                const categoryStyles = IMAGE_STYLES.filter(
                  (s) => s.category === categoryKey
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

                    {/* Category Styles */}
                    <div className="pr-2 py-1">
                      {categoryStyles.map((style) => {
                        const isSelected = selectedImageStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            onClick={() => {
                              onImageStyleChange(style.id);
                              setIsOpen(false);
                            }}
                            className={`w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-all duration-150 rounded-md mx-1 my-1 ${
                              isSelected
                                ? 'bg-blue-50 rounded-full ring-blue-200'
                                : ''
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center text-xs flex-shrink-0`}
                            >
                              {style.preview}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">
                                {style.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {style.description}
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

      {/* Style Description */}
      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          {selectedStyle ? (
            <>
              <span className="font-medium">{selectedStyle.name}:</span>{' '}
              {selectedStyle.description}
            </>
          ) : (
            'Select a style to customize your portrait appearance'
          )}
        </p>
      </div>
    </div>
  );
}
