import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '../components/EmptyState';
import { PurchaseDataDisplay } from '../components/PurchaseDataDisplay';
import { GeneratedImagesGrid } from '../components/GeneratedImagesGrid';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { Sidebar } from '../components/Sidebar';
import amazon from '../config/amazon.json';
import wayfair from '../config/wayfair.json';
import officedepot from '../config/officedepot.json';
import goodreads from '../config/goodreads.json';
import type { BrandConfig } from '../modules/Config';
import type { PurchaseHistory } from '../modules/DataTransformSchema';
import type { ImageData } from '../components/GeneratedImagesGrid';
import { filterUniqueOrders } from '../utils';

const amazonConfig = amazon as BrandConfig;
const wayfairConfig = wayfair as BrandConfig;
const officedepotConfig = officedepot as BrandConfig;
const goodreadsConfig = goodreads as BrandConfig;

const BRANDS: Array<BrandConfig> = [
  amazonConfig,
  officedepotConfig,
  wayfairConfig,
  goodreadsConfig,
];

// Sample data for demo purposes
const sampleOrders: PurchaseHistory[] = [
  {
    order_id: 'demo-001',
    brand: 'Amazon',
    order_date: new Date('2024-01-15'),
    order_total: '$89.97',
    product_names: [
      'Wireless Bluetooth Headphones',
      'Coffee Mug Set (4-pack)',
      'Desk Organizer with Drawers',
    ],
    image_urls: ['/headphone.jpg', '/mug.jpg', '/organizer.jpg'],
  },
  {
    order_id: 'demo-003',
    brand: 'Office Depot',
    order_date: new Date('2024-01-08'),
    order_total: '$34.99',
    product_names: [
      'Notebook Set (3-pack)',
      'Blue Gel Pens (12-pack)',
      'Sticky Notes Variety Pack',
    ],
    image_urls: ['/notebook.jpg', '/pen.jpg', '/sticky-notes.avif'],
  },
];

export function DataPotrait() {
  const [orders, setOrders] = useState<PurchaseHistory[]>([]);
  const [connectedBrands, setConnectedBrands] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState('Female');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedImageStyle, setSelectedImageStyle] = useState('realistic');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const [generatedImages, setGeneratedImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);

  const handleSuccessConnect = (brandName: string, data: PurchaseHistory[]) => {
    setConnectedBrands((prev) => [...prev, brandName]);
    setOrders((prev) => {
      const combined = [...prev, ...data];
      return filterUniqueOrders(combined);
    });
  };
  const toggleOrderExpansion = (orderId: string, productName: string) => {
    const newExpanded = new Set(expandedOrders);
    const key = `${orderId}__${productName}`;
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedOrders(newExpanded);
  };

  const loadSampleData = () => {
    setOrders(sampleOrders);
    setConnectedBrands(['Amazon', 'Office Depot']);
  };

  const clearData = () => {
    setOrders([]);
    setConnectedBrands([]);
    setExpandedOrders(new Set());
  };

  const generatePortrait = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/getgather/generate-portrait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageStyle: selectedImageStyle,
          gender: selectedGender,
          traits: selectedTraits,
          model: 'gemini',
          purchaseData: orders,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.image) {
        // Create image object with metadata
        const imageData = {
          url: `${data.image.url}?t=${Date.now()}`, // Add timestamp to prevent caching
          model: data.model || 'gemini',
          provider: data.provider || 'unknown',
          timestamp: data.timestamp || new Date().toISOString(),
          filename: data.image.filename || 'unknown',
          style: selectedImageStyle,
        };

        setGeneratedImages((prev) => [
          imageData,
          ...prev.slice(0, 11), // Keep only the latest 12 images
        ]);

        // Close sidebar on mobile after successful generation
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      } else {
        throw new Error(data.message || 'Failed to generate portrait');
      }
    } catch (error: unknown) {
      alert('Failed to generate portrait. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Header with Hamburger Menu - Only visible on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        {/* Top Header Bar */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Data Portrait</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area (Left) - Independent scroll */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-16 lg:pt-4">
          {/* Empty State - Show when no data is connected */}
          {connectedBrands.length === 0 && (
            <EmptyState
              onLoadSampleData={loadSampleData}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}

          {/* Purchase Data Display */}
          <PurchaseDataDisplay
            orders={orders}
            connectedBrands={connectedBrands}
            expandedOrders={expandedOrders}
            onToggleOrderExpansion={toggleOrderExpansion}
            onClearData={clearData}
          />

          {/* Generated Images Grid - Only show if we have connected brands */}
          {connectedBrands.length > 0 && (
            <GeneratedImagesGrid
              generatedImages={generatedImages}
              isGenerating={isGenerating}
              selectedImageStyle={selectedImageStyle}
              onImageClick={setSelectedImagePreview}
            />
          )}
        </div>
      </div>

      {/* Floating Action Button - Bottom */}
      {connectedBrands.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 lg:hidden">
          <Button
            onClick={generatePortrait}
            disabled={isGenerating}
            size="lg"
            className="px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">✨</span>
            {isGenerating ? 'Generating...' : 'Generate Data Portrait'}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        brands={BRANDS}
        connectedBrands={connectedBrands}
        selectedGender={selectedGender}
        selectedTraits={selectedTraits}
        selectedImageStyle={selectedImageStyle}
        isGenerating={isGenerating}
        onSuccessConnect={handleSuccessConnect}
        onGenderChange={setSelectedGender}
        onTraitsChange={setSelectedTraits}
        onImageStyleChange={setSelectedImageStyle}
        onGeneratePortrait={generatePortrait}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={selectedImagePreview}
        onClose={() => setSelectedImagePreview(null)}
      />
    </div>
  );
}
