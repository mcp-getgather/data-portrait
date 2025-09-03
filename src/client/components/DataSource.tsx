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

const createHostedLink = async (brandId: string) => {
  const response = await fetch('/getgather/link/create', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brand_id: brandId
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return {
    linkId: data.link_id,
    hostedLinkUrl: data.hosted_link_url
  };
};

const pollForProfileId = async (linkId: string) => {
  let profileId;
  let attempts = 0;
  const maxAttempts = 120; // 2 minute max

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`/getgather/link/status/${linkId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const linkStatus = await response.json();
        if (linkStatus.status === 'completed') {
          profileId = linkStatus.profile_id;
          break;
        }
      }
    } catch (error) {
      console.log('Polling attempt failed:', error);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!profileId) {
    throw new Error('Profile ID not available after polling');
  }

  return profileId;
};

const getPurchaseHistory = async (brandConfig: BrandConfig, profileId: string) => {
  const response = await fetch(`/getgather/auth/${brandConfig.brand_id}`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile_id: profileId,
      extract: true,
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const auth = await response.json();

  // Transform the response data
  const transformedData = transformData(auth["extract_result"], brandConfig.dataTransform);
  
  // Convert the transformed data to PurchaseHistory format
  const purchaseHistory: PurchaseHistory[] = transformedData.map(item => ({
    brand: brandConfig.brand_name,
    order_date: item.order_date as Date || null,
    order_total: item.order_total as string,
    order_id: item.order_id as string,
    product_names: item.product_names as string[],
    image_urls: item.image_urls as string[]
  }));

  return purchaseHistory;
};


const mcpGetPurchaseHistory = async (brandConfig: BrandConfig) => {
  // TODO: open hosted link
  const response = await fetch(`/getgather/purchase-history/${brandConfig.brand_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const auth = await response.json();

  // Transform the response data
  const transformedData = transformData(auth, brandConfig.dataTransform);
  
  // Convert the transformed data to PurchaseHistory format
  const purchaseHistory: PurchaseHistory[] = transformedData.map(item => ({
    brand: brandConfig.brand_name,
    order_date: item.order_date as Date || null,
    order_total: item.order_total as string,
    order_id: item.order_id as string,
    product_names: item.product_names as string[],
    image_urls: item.image_urls as string[]
  }));

  return purchaseHistory;
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
      const { linkId, hostedLinkUrl } = await createHostedLink(brandConfig.brand_id);
      
      // Open hosted link in pop up window
      window.open(
        hostedLinkUrl,
        '_blank',
        'width=500,height=600,menubar=no,toolbar=no,location=no,status=no'
      );
      
      const profileId = await pollForProfileId(linkId);
      const purchaseHistory = await getPurchaseHistory(brandConfig, profileId);
      onSuccessConnect(purchaseHistory);
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
