import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ImagePreviewModalProps = {
  imageUrl: string | null;
  onClose: () => void;
};

export function ImagePreviewModal({
  imageUrl,
  onClose,
}: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-2"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Generated portrait preview"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Download button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `data-portrait-${Date.now()}.png`;
            link.click();
          }}
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </Button>

        {/* Image info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
          Generated Data Portrait • Click to download
        </div>
      </div>
    </div>
  );
}
