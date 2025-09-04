import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { BrandConfig } from '../modules/Config';
import type { PurchaseHistory } from '../modules/DataTransformSchema';
import { transformData } from '../modules/DataTransformSchema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DataSourceProps {
  onSuccessConnect: (data: PurchaseHistory[]) => void;
  disabled?: boolean;
  brandConfig: BrandConfig;
  isConnected?: boolean;
}

const mcpGetPurchaseHistory = async (brandConfig: BrandConfig) => {
  const response = await fetch(`/getgather/purchase-history/${brandConfig.brand_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  var purchaseHistory: PurchaseHistory[] = [];

  if (data.content) {
    const transformedData = transformData(data.content, brandConfig.dataTransform);
    purchaseHistory = transformedData.map(item => ({
      brand: brandConfig.brand_name,
      order_date: item.order_date as Date || null,
      order_total: item.order_total as string,
      order_id: item.order_id as string,
      product_names: item.product_names as string[],
      image_urls: item.image_urls as string[]
    }));
  }

  return {
    linkId: data.link_id,
    hostedLinkURL: data.hosted_link_url,
    purchaseHistory: purchaseHistory,
  };
};

const mcpPollForAuthCompletion = async (linkId: string) => {
  for (let attempts = 0; attempts < 120; attempts++) {
    const response = await fetch(`/getgather/mcp-poll/${linkId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Auth completed
    const data = await response.json();
    if (data.auth_completed) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Authentication not completed after polling timeout');
};



export function DataSource({
  onSuccessConnect,
  disabled,
  brandConfig,
  isConnected,
}: DataSourceProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
        const result = await mcpGetPurchaseHistory(brandConfig);

        // got nothing
        if (!result.linkId && !result.hostedLinkURL && result.purchaseHistory.length == 0) {
          throw new Error('No data received from MCP service');
        }

        // If we already have purchase history, use it directly
        if (result.purchaseHistory && result.purchaseHistory.length > 0) {
          onSuccessConnect(result.purchaseHistory);
          return;
        }
       
        // Open hosted link in pop up window for authentication
        window.open(
          result.hostedLinkURL,
          '_blank',
          'width=500,height=600,menubar=no,toolbar=no,location=no,status=no'
        );
          
        // Wait until auth successful
        await mcpPollForAuthCompletion(result.linkId);

        // Fetch purchase history after authentication
        const updatedResult = await mcpGetPurchaseHistory(brandConfig);
        onSuccessConnect(updatedResult.purchaseHistory);
    } catch (error) {
      console.error('Failed to create hosted link:', error);
    } finally {
      setIsLoading(false);
    }
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
          ) : isLoading ? (
            <div className="flex items-center gap-1 text-xs text-gray-600 px-2 py-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting...
            </div>
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

    </>
  );
}
