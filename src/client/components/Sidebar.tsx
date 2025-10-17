import { X } from 'lucide-react';
import { Button } from '@/components/ui/button.js';
import { DataConnectors } from './DataConnectors.js';
import { GenderSelector } from './GenderSelector.js';
import { TraitsSelector } from './TraitsSelector.js';
import { ImageStyleSelector } from './ImageStyleSelector.js';
import type { BrandConfig } from '../modules/Config.js';
import type { PurchaseHistory } from '../modules/DataTransformSchema.js';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandConfig[];
  connectedBrands: string[];
  selectedGender: string;
  selectedTraits: string[];
  selectedImageStyle: string;
  isGenerating: boolean;
  onSuccessConnect: (brandName: string, data: PurchaseHistory[]) => void;
  onGenderChange: (genderId: string) => void;
  onTraitsChange: (traits: string[]) => void;
  onImageStyleChange: (styleId: string) => void;
  onGeneratePortrait: () => void;
};

export function Sidebar({
  isOpen,
  onClose,
  brands,
  connectedBrands,
  selectedGender,
  selectedTraits,
  selectedImageStyle,
  isGenerating,
  onSuccessConnect,
  onGenderChange,
  onTraitsChange,
  onImageStyleChange,
  onGeneratePortrait,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Right Sidebar - Responsive */}
      <aside
        className={`
        fixed lg:static top-0 right-0 h-screen w-[400px] max-w-[90vw] 
        bg-white border-l border-gray-200 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Sidebar Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Data Portrait</h1>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DataConnectors
            brands={brands}
            connectedBrands={connectedBrands}
            onSuccessConnect={onSuccessConnect}
          />

          <GenderSelector
            selectedGender={selectedGender}
            onGenderChange={onGenderChange}
          />

          <ImageStyleSelector
            selectedImageStyle={selectedImageStyle}
            onImageStyleChange={onImageStyleChange}
          />

          <TraitsSelector
            selectedTraits={selectedTraits}
            onTraitsChange={onTraitsChange}
          />
        </div>

        {/* Sidebar Footer - Simple */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100">
          <Button
            onClick={onGeneratePortrait}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                {connectedBrands.length > 0
                  ? '✨ Generate Data Portrait'
                  : '✨ Generate'}
              </>
            )}
          </Button>
          {connectedBrands.length > 0 && !isGenerating && (
            <p className="text-xs text-green-600 text-center mt-2">
              Powered by live shopping data from {connectedBrands.length}{' '}
              connected{' '}
              {connectedBrands.length === 1 ? 'retailer' : 'retailers'}!
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
