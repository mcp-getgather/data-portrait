import { useState } from 'react';
import { SignInDialog } from './SignInDialog';
import type { BrandConfig } from '../modules/Config';
import type { PurchaseHistory } from '../modules/DataTransformSchema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { settings } from '../config';

interface DataSourceProps {
  onSuccessConnect: (data: PurchaseHistory[]) => void;
  disabled?: boolean;
  brandConfig: BrandConfig;
  isConnected?: boolean;
}

export function DataSource({
  onSuccessConnect,
  disabled,
  brandConfig,
  isConnected,
}: DataSourceProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = () => {
    if (settings.USE_HOSTED_LINK) {
      console.warn(
        'DEBUGPRINT[480]: DataSource.tsx:25 (after if (settings.USE_HOSTED_LINK) )'
      );
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleSuccessConnect = (data: PurchaseHistory[]) => {
    setIsDialogOpen(false);
    onSuccessConnect(data);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between w-20 h-32 p-3 space-y-1">
        {/* Logo - Fixed size container */}
        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
          <img
            src={brandConfig.logo_url}
            alt={`${brandConfig.brand_name} logo`}
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Brand Name - Fixed height container */}
        <div className="text-center h-9 flex flex-col justify-center flex-shrink-0">
          <h3 className="text-xs font-medium text-gray-900 leading-tight line-clamp-2">
            {brandConfig.brand_name}
          </h3>
          {brandConfig.is_mandatory && (
            <span className="text-xs text-gray-500 leading-tight">
              Required
            </span>
          )}
        </div>

        {/* Connect Button - Fixed height */}
        <div className="flex-shrink-0">
          {isConnected ? (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Connected
            </Badge>
          ) : (
            <Button
              disabled={disabled}
              onClick={handleConnect}
              size="sm"
              variant="outline"
              className="text-xs px-3 py-1 h-7"
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      <SignInDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccessConnect={handleSuccessConnect}
        brandConfig={brandConfig}
      />
    </>
  );
}
