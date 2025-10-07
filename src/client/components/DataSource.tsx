import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { BrandConfig } from '../modules/Config.js';
import type { PurchaseHistory } from '../modules/DataTransformSchema.js';
import { transformData } from '../modules/DataTransformSchema.js';
import { Button } from '@/components/ui/button.js';
import { Badge } from '@/components/ui/badge.js';

interface DataSourceProps {
  onSuccessConnect: (data: PurchaseHistory[]) => void;
  disabled?: boolean;
  brandConfig: BrandConfig;
  isConnected?: boolean;
}

const getPurchaseHistoryDetail = async (
  brandConfig: BrandConfig,
  orderId: string
) => {
  const response = await fetch(
    `/getgather/purchase-history-details/${brandConfig.brand_id}/${orderId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.content) {
    const transformedData = transformData(
      data.content,
      brandConfig.dataTransform
    );
    return transformedData.map((item) => ({
      product_name: item.product_name as string,
      image_url: item.image_url as string,
    }));
  }

  return [];
};

const getPurchaseHistory = async (brandConfig: BrandConfig) => {
  const response = await fetch(
    `/getgather/purchase-history/${brandConfig.brand_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  let purchaseHistory: PurchaseHistory[] = [];

  if (data.content) {
    const transformedData = transformData(
      data.content,
      brandConfig.dataTransform
    );
    purchaseHistory = transformedData.map((item) => ({
      brand: brandConfig.brand_name,
      order_date: (item.order_date as Date) || null,
      order_total: item.order_total as string,
      order_id: item.order_id as string,
      product_names: item.product_names as string[],
      image_urls: item.image_urls as string[],
    }));

    // Get detailed data for wayfair brand only for now
    if (
      brandConfig.brand_name.toLowerCase() === 'wayfair' &&
      purchaseHistory.length > 0
    ) {
      for (let i = 0; i < purchaseHistory.length; i++) {
        const order = purchaseHistory[i];
        try {
          const detailData = await getPurchaseHistoryDetail(
            brandConfig,
            order.order_id
          );
          purchaseHistory[i] = {
            ...order,
            product_names: detailData.map((item) => item.product_name),
            image_urls: detailData.map((item) => item.image_url),
          };
        } catch (error) {
          console.error(
            `Failed to get details for order ${order.order_id}:`,
            error
          );
        }
      }
    }
  }

  return {
    linkId: data.link_id,
    hostedLinkURL: data.hosted_link_url,
    purchaseHistory: purchaseHistory,
  };
};

const pollForAuthCompletion = async (linkId: string) => {
  const response = await fetch(`/getgather/mcp-poll/${linkId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.auth_completed) {
    return true;
  }

  throw new Error('Sign in failed or timed out');
};

export function DataSource({
  onSuccessConnect,
  disabled,
  brandConfig,
  isConnected,
}: DataSourceProps) {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoadingMessage('Connecting...');
    try {
      const result = await getPurchaseHistory(brandConfig);

      // got nothing
      if (
        !result.linkId &&
        !result.hostedLinkURL &&
        result.purchaseHistory.length == 0
      ) {
        throw new Error('No data received from MCP service');
      }

      // If we already have purchase history, use it directly
      if (result.purchaseHistory && result.purchaseHistory.length > 0) {
        onSuccessConnect(result.purchaseHistory);
        return;
      }

      setLoadingMessage('Signing in...');
      // Open hosted link in pop up window for authentication
      window.open(
        result.hostedLinkURL,
        '_blank',
        'width=500,height=600,menubar=no,toolbar=no,location=no,status=no'
      );

      // Wait until auth successful
      while (true) {
        try {
          const authCompleted = await pollForAuthCompletion(result.linkId);
          if (authCompleted) {
            break;
          }
        } catch (error) {
          console.error('Failed to poll for auth completion:', error);
        }
      }

      setLoadingMessage('Loading...');
      // Fetch purchase history after authentication
      const updatedResult = await getPurchaseHistory(brandConfig);
      onSuccessConnect(updatedResult.purchaseHistory);
    } catch (error) {
      console.error('Failed to create hosted link:', error);
    } finally {
      setLoadingMessage(null);
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
          ) : loadingMessage ? (
            <div className="flex items-center gap-1 text-xs text-gray-600 px-2 py-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {loadingMessage}
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
